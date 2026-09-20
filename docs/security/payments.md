# NXTQR Payment Security & Cashfree Integration Trust Boundary

This document outlines the cryptographic trust model, webhook verification rules, idempotency framework, and state machine powering NXTQR's billing architecture.

---

## 1. The Cashfree Trust Boundary

The core principle of NXTQR payment processing is:

> **The browser redirect is never the billing authority.**

Visiting `/checkout/success` or receiving a client-side callback **never** activates a subscription or updates an organization's plan tier. The only authoritative path to grant entitlements is a verified server-to-server webhook from Cashfree.

```
+-------------------------------------------------------------+
| UNTRUSTED: Client Browser Checkout Redirect                 |
| User completes payment -> Redirected to /checkout/success   |
| Action: Show confirmation UI only. Entitlements UNCHANGED.  |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| AUTHORITATIVE: Cashfree Server Webhook Pipeline              |
| 1. Cashfree POSTs to /api/webhooks/cashfree                 |
| 2. Extract RAW UTF-8 request body bytes                     |
| 3. Compute HMAC-SHA256(timestamp + raw_body, secret)        |
| 4. Compare with 'x-webhook-signature'                       |
| 5. Check idempotency: provider_event_key in payment_events   |
| 6. Update subscription state & plan entitlements in D1      |
| 7. Record immutable audit event                             |
| 8. Return HTTP 200 OK                                       |
+-------------------------------------------------------------+
```

---

## 2. Raw Body Signature Verification

Cashfree webhook signatures verify the exact byte sequence sent over the wire.

### Invariant: Verify BEFORE JSON Parsing
- If a server parses the request body to JSON and re-serializes it with `JSON.stringify()`, key reordering and whitespace changes will invalidate the cryptographic signature.
- NXTQR consumes the stream with `await request.text()` directly, preserving byte fidelity.

```typescript
// Route: app/api/webhooks/cashfree/route.ts
const rawBody = await request.text();
const signature = request.headers.get("x-webhook-signature");
const timestamp = request.headers.get("x-webhook-timestamp");

const expectedSignature = crypto
  .createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
  .update(`${timestamp}${rawBody}`)
  .digest("base64");

if (signature !== expectedSignature) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}
```

---

## 3. Webhook Idempotency & Ledger Design

Distributed payment webhooks can be retried multiple times by the payment gateway due to transient network timeouts.

### Database Constraint
The `payment_events` table enforces uniqueness on the provider event key:
```sql
CREATE TABLE payment_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_event_key TEXT NOT NULL UNIQUE, -- Idempotency key
  event_type TEXT NOT NULL,
  amount INTEGER,
  currency TEXT,
  payload JSON NOT NULL,
  processed_at DATETIME NOT NULL
);
```

### Idempotent Ingestion Flow
1. Compute `provider_event_key = event_id || (order_id + "_" + payment_status)`.
2. Query `SELECT id FROM payment_events WHERE provider_event_key = ?`.
3. If the record exists:
   - Immediately return `HTTP 200 OK` (`{ status: "already_processed" }`).
   - Do **not** execute duplicate subscription renewals, seat increments, or audit records.
4. If new:
   - Execute the mutation inside a D1 transaction.
   - Insert the event record into `payment_events`.
   - Update `organization_subscriptions` and `organizations.plan`.

---

## 4. Resisting Out-of-Order Events

Webhooks can arrive out of chronological order (e.g., `PAYMENT_SUCCESS` arriving before `PAYMENT_PENDING`, or a delayed `SUBSCRIPTION_CANCELLED` event).

- All subscription state updates verify timestamps:
  ```sql
  UPDATE organization_subscriptions
  SET status = :newStatus, updated_at = :eventTime
  WHERE organization_id = :orgId AND updated_at <= :eventTime
  ```
- If a state update arrives with a timestamp older than the current recorded state, it is logged for observability but discarded to prevent stale rollbacks.

---

## 5. Failure Recovery

- If D1 is temporarily unreachable, the endpoint returns `HTTP 500` or `HTTP 503`, signaling Cashfree's retry mechanism to redeliver the event with exponential backoff.
- The webhook secret (`CASHFREE_SECRET_KEY`) is stored exclusively as a server-side environment variable and never bundled into the client build.
