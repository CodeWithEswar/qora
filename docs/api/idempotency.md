# NXTQR API Mutation Idempotency

To prevent accidental duplicate resource creation during network retries, NXTQR supports **durable idempotency keys** on mutation endpoints.

---

## Supported Endpoints

- `POST /api/v1/qrs` (QR creation)
- `POST /api/v1/reports` (Report job submission)
- `POST /api/v1/conversions` (Conversion occurrence submission)
- `POST /api/v1/qrs/:id/share-links` (Share link creation)

---

## Usage

Attach the `Idempotency-Key` header with a unique UUID or client-generated key:

```http
POST /api/v1/qrs HTTP/1.1
Host: nxtqr.vercel.app
Authorization: Bearer nxtqr_live_...
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
Content-Type: application/json

{
  "name": "Store Entrance",
  "destinationUrl": "https://example.com/store"
}
```

---

## Mechanics & Invariants

1. **Scoping**:
   - An idempotency record is strictly scoped to the combination of:
     `organizationId + credentialId + endpointPath + key`.
2. **Canonical Payload Fingerprinting**:
   - The server computes a SHA-256 hash of the canonical request body.
   - If the same key is reused with **identical parameters**:
     The server bypasses re-execution and returns the **cached original response** (with header `X-Idempotency-Status: CACHED`).
   - If the same key is reused with **altered parameters**:
     The server rejects the request with HTTP `409 Conflict` and code `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`.
3. **In-Flight Protection**:
   - If a duplicate request arrives while the original request is still executing in D1, the server returns HTTP `409 Conflict` with code `IDEMPOTENT_REQUEST_IN_PROGRESS`.
4. **Retention Window**:
   - Idempotency records are durably persisted in Cloudflare D1 and retained for **24 hours** (86,400 seconds), after which the key may be safely reused.
