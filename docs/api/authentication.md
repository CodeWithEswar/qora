# NXTQR API Authentication & Authorization

All requests to the NXTQR Developer API (`/api/v1/*`) require authentication using an API Key.

---

## Authorization Header

Provide your API key in the `Authorization` header as a Bearer token:

```http
Authorization: Bearer nxtqr_live_9a8b7c6d_f0e1d2c3b4a5...
```

Alternatively, you may provide it via the `X-Api-Key` header:

```http
X-Api-Key: nxtqr_live_9a8b7c6d_f0e1d2c3b4a5...
```

---

## API Key Security Model

1. **Prefix Convention**:
   - Live production keys: `nxtqr_live_<keyId>_<secret>`
   - Sandbox / testing keys: `nxtqr_test_<keyId>_<secret>`
   - *Security Note*: The prefix is solely an informational display aid. Authentication is strictly established by verifying the SHA-256 hash of the complete key against the database.
2. **One-Time Disclosure**:
   - Plaintext API keys are displayed **only once** upon generation. NXTQR stores only the cryptographically salted SHA-256 hash at rest.
3. **Tenant Scoping**:
   - An API key is immutably bound to a single organization tenant. Clients cannot pass `organizationId` in query strings or request bodies to switch or probe other tenants.

---

## Scope Registry

API Keys are granted least-privilege access using granular scopes:

| Scope | Description |
| :--- | :--- |
| `qrs:read` | Read QR metadata, versions, and collections. |
| `qrs:write` | Create, update, archive, and publish QR codes and routing rules. |
| `campaigns:read` | List organizational campaigns and view schedules. |
| `campaigns:write` | Create, update, and manage campaigns. |
| `experiments:read` | View A/B experiment configurations and variants. |
| `experiments:write` | Create and manage traffic-split experiments. |
| `conversions:write` | Submit post-scan conversion events. |
| `reports:read` | View report job status and download completed reports. |
| `reports:write` | Enqueue new asynchronous report generation jobs. |
| `webhooks:read` | List configured webhook endpoints and delivery history. |
| `webhooks:manage` | Register, update, and delete outbound webhook endpoints. |
| `analytics:read` | Query aggregate scan analytics and breakdowns. |
| `*` | Full administrative access to all developer API endpoints. |

---

## Authorization Pipeline

Every API call flows through an 8-stage pipeline:

```text
REQUEST
   ↓
[1] EXTRACT BEARER TOKEN
   ↓
[2] COMPUTE SHA-256 KEY HASH
   ↓
[3] QUERY D1 API_KEYS RECORD
   ↓
[4] VERIFY STATUS == 'active' & EXPIRATION > NOW()
   ↓
[5] RESOLVE AUTHORITATIVE TENANT (organizationId)
   ↓
[6] ASSERT REQUIRED API SCOPE (e.g. qrs:write)
   ↓
[7] ASSERT COMMERCIAL PLAN ENTITLEMENT
   ↓
[8] EXECUTE COMMAND & RETURN DTO
```
