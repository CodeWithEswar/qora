# NXTQR Customer Outbound Webhooks

NXTQR webhooks notify your systems in near-real-time when business events occur within your organization (e.g. QR publications, link health incidents, or report completions).

---

## Architecture & Guarantees

```text
Internal Event (e.g. qr.published)
      ↓
[1] WEBHOOK PROJECTION (Strip internal details, format CustomerWebhookEnvelope)
      ↓
[2] STORE DURABLE WEBHOOK_EVENT RECORD (Cloudflare D1)
      ↓
[3] ENQUEUE WebhookDeliveryJobV1 (Cloudflare Queue)
      ↓
[4] EVENT WORKER CONSUMER
      ↓
[5] SIGN PAYLOAD WITH HMAC-SHA256
      ↓
[6] DISPATCH POST TO CUSTOMER HTTPS ENDPOINT
```

- **Non-Blocking**: Webhook delivery is completely decoupled from core operations. A slow customer endpoint will never block a QR publish, billing transaction, or redirect.
- **SSRF Defenses**: Endpoints targeting loopback (127.0.0.1), private RFC-1918 subnets (10.0.0.0/8, 192.168.0.0/16), or cloud metadata services (169.254.169.254) are rejected upon registration.
- **HTTPS Enforced**: All webhook destination URLs must use secure `https://`.

---

## Outbound Payload Envelope

```json
{
  "id": "evt_1789632000_a1b2c3d4",
  "type": "qr.published",
  "version": "1",
  "createdAt": "2026-09-17T12:00:00.000Z",
  "data": {
    "qrId": "qr_01h8x9p3...",
    "name": "Flagship Store Entrance",
    "version": 4,
    "destinationUrl": "https://example.com/summer-sale",
    "scanUrl": "https://nxtqr.vercel.app/s/summer-sale",
    "publishedAt": "2026-09-17T12:00:00.000Z"
  }
}
```

---

## Cryptographic Signature Verification

Every outbound webhook includes the `X-NXTQR-Signature` header:

```http
X-NXTQR-Signature: t=1789632000,v1=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

### Verification Algorithm:
1. Extract the timestamp `t` and signature `v1` from the header.
2. Verify timestamp freshness (reject if `abs(currentTime - t) > 300` seconds to prevent replay attacks).
3. Compute HMAC-SHA256 of the string `${t}.${rawRequestBody}` using your endpoint's signing secret.
4. Compare your computed hex digest with `v1` using constant-time string comparison.

### Example Verification (Node.js):
```typescript
import crypto from "crypto";

export function verifyWebhook(rawBody: string, header: string, secret: string): boolean {
  const parts = header.split(",");
  const t = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!t || !v1) return false;

  // 5 minute replay tolerance
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;

  const payloadToSign = `${t}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(payloadToSign).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}
```

---

## Retry Policy

If your endpoint returns any HTTP status outside of `200–299` or times out (5 seconds), NXTQR retries delivery using exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 minute
- Attempt 3: 5 minutes
- Attempt 4: 30 minutes
- Attempt 5: 2 hours

After 5 failed attempts, delivery is marked as `FAILED`. Persistent delivery failure may mark the endpoint as `degraded` or `disabled`.
