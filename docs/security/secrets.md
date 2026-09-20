# NXTQR Secrets Management & Cryptographic Controls

This document details the lifecycle, storage, rotation, and logging guardrails for all credentials used across NXTQR.

---

## 1. Secret Classification Matrix

| Secret Class | Purpose | Storage Boundary | Exposure Risk | Storage Format |
| :--- | :--- | :--- | :--- | :--- |
| **`AUTH_SECRET`** | Signs and verifies user session JWTs | Server Environment Variable | Forged user sessions | Raw 256-bit entropy in runtime env. Never committed. |
| **`GOOGLE_CLIENT_SECRET`** | OAuth 2.0 authorization code exchange | Server Environment Variable | Google identity impersonation | Raw secret in runtime env. Server-only. |
| **`CASHFREE_SECRET_KEY`** | Signs checkout requests & verifies webhooks | Server Environment Variable | Unauthorized billing operations | Raw secret in runtime env. Never exposed to browser. |
| **API Keys (`nxtqr_live_*`)** | Machine-to-machine developer API authentication | D1 Database (`api_keys` table) | Cross-tenant API access | Plaintext returned **once** to creator; stored exclusively as **SHA-256 hash**. |
| **Share Link Tokens** | Bearer access to exported reports & dashboards | D1 Database (`share_links` table) | Unauthorized report downloads | Stored exclusively as **SHA-256 hash**. Optional password hashed with PBKDF2/SHA-256. |
| **Invitation Tokens** | Grants membership upon registration | D1 Database (`organization_invitations`) | Unauthorized workspace joining | Stored exclusively as **SHA-256 hash** with 7-day expiration. |
| **Outbound Webhook Secrets** | HMAC-SHA256 signature for customer event payloads | D1 Database (`webhooks` table) | Webhook payload spoofing | Stored encrypted or hashed; shared securely with tenant admin. |

---

## 2. Environment Boundaries & Client Bundle Isolation

### Rule 1: Strict Server Isolation
- Server secrets (`AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `CASHFREE_SECRET_KEY`) must **never** be prefixed with `NEXT_PUBLIC_`.
- Any secret prefixed with `NEXT_PUBLIC_` is inlined into the client-side JavaScript bundle during Next.js compilation and is fully visible to anyone inspecting the network tab or bundle source.

### Rule 2: Fail Closed in Production (No Insecure Fallbacks)
In local development, developers can supply `.env.local` values. In production environments (`NODE_ENV === "production"`), missing critical secrets immediately throw an exception and fail closed:

```typescript
// Enforced in lib/auth/session.ts & middleware.ts
function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be configured in production.");
    }
    return new TextEncoder().encode("development-fallback-secret-min-32-chars-local-dev-only");
  }
  return new TextEncoder().encode(secret);
}
```

---

## 3. Storage at Rest: One-Time Reveal & One-Way Hashing

### Developer API Keys
```
GENERATION:
crypto.getRandomValues(32 bytes)
  │
  ├──► Prefix: 'nxtqr_live_••••' + safe 4-char suffix
  ├──► Plaintext Key: 'nxtqr_live_' + base64url(bytes) ──► RETURNED ONCE TO USER
  └──► Hash: SHA-256(plaintext) ──────────────────────────► STORED IN D1
```
- Plaintext API keys cannot be read from the database, dashboard, or logs after creation.
- The UI displays only: `Key Prefix`, `Creation Date`, `Last Used Date`, `Scopes`, and a `Revoke` action.

### Share Link Tokens & Invitation Tokens
- Bearer tokens are generated with 256 bits of cryptographic entropy.
- Stored in D1 as `token_hash = SHA-256(token)`.
- Verification performs `SHA-256(incoming_token)` and looks up the corresponding hash in D1.

---

## 4. Secret Logging & Redaction Guardrails

The application employs a recursive log sanitizer (`redactSensitiveData`) across all API routes, audit log formatters, and error handlers.

### Blacklisted Keys (Automatically Redacted to `[REDACTED]`)
- `authorization`
- `cookie`
- `set-cookie`
- `password`
- `token`
- `secret`
- `apiKey` / `api_key`
- `accessToken` / `refreshToken`
- `signature` / `x-webhook-signature`

### Logging Invariants
1. Never log the `Authorization: Bearer <token>` header.
2. Never log raw session cookies (`nxtqr_session`).
3. Never log Cashfree webhook secret keys or full signature headers.
4. Error responses returned to clients contain sanitized messages and request correlation IDs, never SQL queries or stack traces.
