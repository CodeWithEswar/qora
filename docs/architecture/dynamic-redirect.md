# NXTQR Dynamic Redirect Architecture

Edge Data Plane: sub-10ms deterministic QR resolution, dynamic routing, and non-blocking scan telemetry.

---

## 1. Primary Product Contract

```
PRINTED DYNAMIC QR
        │
        ▼ (Stable URL: https://<domain>/<slug>)
NXTQR EDGE WORKER
        │
        ▼ (Host + Slug Normalization)
KV RESOLVER LOOKUP (Hot Path: sub-10ms)
    ┌───┴───┐
   HIT     MISS
    │       │
    │       ▼
    │   D1 FALLBACK QUERY (Minimal Projection)
    │       │
    │       ▼
    │   CACHE REPAIR (Async KV Put)
    └───┬───┘
        ▼
PUBLISHED RESOLVER SNAPSHOT (QrResolverSnapshotV1)
        │
        ▼
LIFECYCLE GATE (Draft / Active / Paused / Scheduled / Expired / Archived)
        │
        ▼
SCANNER CONTEXT NORMALIZATION (Device, OS, Time, Geo, Language)
        │
        ▼
QR BRAIN EVALUATION (Deterministic First-Match Rules)
        │
        ▼
EXPERIMENT / GUARDIAN FALLBACK (Compact State)
        │
        ▼
APPROVED DESTINATION (Valid HTTP/HTTPS only)
   ┌────┴────┐
   │         │
   ▼         ▼
REDIRECT    SCAN TELEMETRY
 HTTP 302     ctx.waitUntil(SCAN_EVENTS.send())
```

- **Invariant 01**: The printed dynamic QR contains a stable resolver URL (`https://<domain>/<slug>`).
- **Invariant 02**: Destination changes never require QR reprinting.
- **Invariant 03**: D1 is business truth; KV is published edge state.
- **Invariant 04**: Redirection never waits for analytics writes, external geolocation APIs, LLMs, or heavy control-plane database queries.

---

## 2. Host Normalization & Custom Domain Namespacing

To prevent collision across tenants and isolate custom domain namespaces:
```
Key Format: qr:v1:<namespace>:<slug>
```

- **Default Domains** (`nxtqr.vercel.app`, `localhost`, `*.workers.dev`, `*.pages.dev`):
  Normalized to namespace `"global"`. Key: `qr:v1:global:<slug>`.
- **Verified Custom Domains** (`qr.brand.com`):
  Normalized to lowercase hostname without ports: `qr:v1:qr.brand.com:<slug>`.

---

## 3. Slug Validation Grammar

Slugs are validated before any storage lookup:
- **Grammar**: `^[a-zA-Z0-9_-]{3,64}$`.
- **Rejections**:
  - Path traversal (`..`)
  - Directory separators (`/`, `\`, `%2f`, `%2F`)
  - Control characters and whitespace
  - Reserved system routes: `api`, `admin`, `auth`, `login`, `signup`, `status`, `robots.txt`, `favicon.ico`, `health`, `_health`, `assets`, `dashboard`.

Invalid slugs return a branded 404 response without querying D1.

---

## 4. Negative Caching

To protect D1 against cache-stampedes and random slug scanning probes:
- A KV miss that also returns null in D1 writes a negative cache key:
  `qr:v1:neg:<namespace>:<slug>` with a short TTL of **60 seconds**.
- Subsequent random requests are rejected in sub-5ms directly from KV.

---

## 5. Lifecycle Gate Semantics

| State | Public Resolution Behavior | HTTP Status |
| :--- | :--- | :--- |
| **DRAFT** | Inactive draft mode; never exposed publicly | `403 Forbidden` |
| **ACTIVE** | Resolves deterministically to target destination | `302 Found` |
| **PAUSED** | Temporarily suspended by owner; destination hidden | `503 Service Unavailable` |
| **SCHEDULED** | Active only after `startsAt` epoch timestamp | `403 Forbidden` |
| **EXPIRED** | Campaign ended after `expiresAt` epoch timestamp | `410 Gone` |
| **ARCHIVED** | Permanently deleted or retired | `410 Gone` |

---

## 6. Safe Redirect Response Headers

Redirection uses HTTP `302 Found`:
```http
HTTP/1.1 302 Found
Location: https://example.com/target-page
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
Referrer-Policy: no-referrer-when-downgrade
X-Content-Type-Options: nosniff
X-NXTQR-Resolved: 1
```

- External browser/CDN caching is disabled (`no-store, must-revalidate`) so destination updates take effect immediately.
- Sensitive internal identifiers (`organizationId`, `qrId`, `ruleId`, `experimentId`) are never exposed in public response headers.

---

## 7. Asynchronous Scan Telemetry

- Executed entirely inside Cloudflare `ctx.waitUntil()` non-blocking execution contexts.
- Telemetry enqueue failures are caught and logged operationally; they never block or delay the 302 redirect.
- HEAD requests resolve destination headers without generating scan telemetry.
