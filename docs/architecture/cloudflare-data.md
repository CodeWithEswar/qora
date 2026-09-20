# Cloudflare Data Architecture & Production Edge Foundation

**NXTQR — Smart QR Infrastructure**  
*Authoritative Cloudflare Data Model & Edge Service Ownership Matrix*

---

## 1. Architectural Objective

NXTQR decouples relational business truth from edge resolution speed and high-volume event processing across distinct Cloudflare primitives:

```
                   CONTROL PLANE
             Next.js App Router / BFF
                      │
                      ▼
                     D1
          AUTHORITATIVE RELATIONAL TRUTH
                      │
            ┌─────────┼─────────┐
            │         │         │
            ▼         ▼         ▼
           KV        R2       Queues
            │                   │
            │                   ▼
            │             Async Consumers
            │
            ▼
      Published Resolver
            │
            ▼
      Redirect Worker (Edge Hot Path)
            │
            ├──────────────→ Destination (HTTP 302)
            │
            └── async scan event
                        │
                        ▼
                      Queue (SCAN_QUEUE)
                        │
                        ▼
                 Analytics Pipeline
                        │
                        ▼
                 Analytics Engine / Rollups
```

---

## 2. Non-Negotiable Storage Rules

| Cloudflare Primitive | Authorized Responsibility | STRICTLY FORBIDDEN |
| :--- | :--- | :--- |
| **D1** | Relational business state, organization tenancy, user accounts, QR configurations, versioned revisions, billing records, webhook endpoints, audit logs. | Raw scan event firehose, transient presence data, large binaries. |
| **KV** | Edge-readable resolver snapshots (`qr:v1:<namespace>:<slug>`), published routing policies, public runtime config. | Authoritative billing, subscription records, permissions, raw customer database tables. |
| **R2** | Object storage: logos, brand SVG assets, generated PDF/SVG exports, downloadable analytical reports. | Relational metadata, direct public browsing of sensitive customer exports. |
| **Queues** | Asynchronous work transport: scan telemetry, webhook dispatch, report generation, Guardian link checks. | Synchronous scanner blocking, storing multi-megabyte payloads. |
| **Durable Objects** | Coordination-only workloads: live workspace presence, real-time collaboration rooms, edit coordination locks. | General relational CRUD, primary data persistence. |
| **Analytics Engine** | High-volume scan telemetry, dimensional query analytics, real-time scan metrics. | Authoritative billing, subscription plans, access permissions. |
| **Workers** | Sub-10ms redirect resolution, asynchronous queue consumers, scheduled cron triggers. | Long blocking synchronous loops, heavy Node.js libraries. |

---

## 3. Cloudflare Service & Binding Matrix

### Authoritative Runtime Bindings

| Binding Name | Cloudflare Service | Target Resource | Public/Internal Contract | Usage in Code |
| :--- | :--- | :--- | :--- | :--- |
| `DB` | Cloudflare D1 | `nxtqr-db` | Core Relational Store | Primary database for control plane and edge read-fallback. |
| `REDIRECT_KV` | Cloudflare KV | `59cdce31e89a4...` | Edge Resolver Cache | Hot path snapshot lookup (`qr:v1:<namespace>:<slug>`). |
| `ASSETS_R2` | Cloudflare R2 | `nxtqr-assets` | Asset Object Storage | Logos, custom frame icons, brand media, generated QR bundles. |
| `SCAN_QUEUE` | Cloudflare Queue | `nxtqr-scan-telemetry` | Telemetry Transport | Fire-and-forget scan event ingestion from the redirect worker. |

### Conceptual Async Extension Bindings

| Extension Binding | Service | Target Resource | Purpose |
| :--- | :--- | :--- | :--- |
| `EXPORTS_BUCKET` | R2 | `nxtqr-exports` | Private analytical CSVs and generated compliance reports. |
| `WEBHOOK_JOBS` | Queue | `nxtqr-webhook-jobs` | Outbound customer webhook delivery with exponential backoff. |
| `REPORT_JOBS` | Queue | `nxtqr-report-jobs` | Heavy report generation offloaded from browser requests. |
| `LINK_CHECK_JOBS`| Queue | `nxtqr-link-checks` | Background Guardian destination health probes. |
| `COLLAB_ROOM` | Durable Object | `CollabRoomDO` | Presence and edit locking for concurrent QR design sessions. |
| `ANALYTICS` | Analytics Engine | `nxtqr_scan_telemetry` | Time-series dimensional aggregates for millions of daily scans. |

---

## 4. Environment Separation

NXTQR strictly isolates resources between execution environments:

```
[Local Development]   ──> wrangler dev --local (Local Miniflare SQLite D1, Memory KV/R2/Queues)
[Preview / Staging]  ──> Preview D1 database, Staging KV namespace, isolated test Queues
[Production]         ──> Authoritative Production D1, Production KV, Geo-distributed R2
```

- **Local Development**: Commands like `npm run d1:migrate:local` execute strictly against `.wrangler/state/v3/d1` using `--local`. Production credentials and database IDs are never consumed by local developers.
- **Preview / CI**: Automated pull-request previews use isolated ephemeral databases.
- **Production**: Production D1 database ID (`6d36ec62-7f19-4d14-ac8f-ba2ba4c93c7b`) is locked to production pipelines.

---

## 5. KV Key Model & Edge Resolver Snapshot

### Authoritative KV Key Design
Keys are centrally generated via `buildKvResolverKey(slug, domain)`:
```
Default / Global Domain:   qr:v1:global:<slug>
Custom Domain Namespace:   qr:v1:<custom_domain_id>:<slug>
Legacy Compatibility:      slug:<slug>
```

### Snapshot Schema (`RedirectSnapshot` V1)
```json
{
  "schemaVersion": 1,
  "qrId": "qr_01hn9...",
  "organizationId": "org_01hn9...",
  "status": "ACTIVE",
  "defaultDestination": "https://brand.com/offer",
  "fallbackDestination": "https://brand.com/backup",
  "passwordHash": null,
  "startsAt": 1740000000,
  "expiresAt": 1780000000,
  "rulesVersion": 1,
  "rules": [
    {
      "id": "rule_01hn9...",
      "name": "iOS Redirect",
      "priority": 1,
      "isActive": true,
      "matchType": "ALL",
      "conditions": [
        { "type": "os", "operator": "eq", "value": "ios" }
      ],
      "action": {
        "type": "redirect",
        "destinationUrl": "https://apps.apple.com/app/brand"
      }
    }
  ],
  "guardianHealthy": true,
  "updatedAt": 1741234567
}
```

### Cache Miss Resolution Flow
```
SCAN REQUEST
    │
    ▼
Check REDIRECT_KV (qr:v1:global:<slug>)
    ├── HIT  ──> Evaluate rules & redirect
    └── MISS
          │
          ▼
      Query D1 (Fallback Query)
          ├── NOT FOUND ──> Render branded 404 (Negative TTL: 60s)
          └── FOUND
                │
                ▼
            Write to KV (1 hour TTL)
                │
                ▼
            Evaluate rules & redirect
```

---

## 6. R2 Object Layout & Ownership Authority

R2 stores raw object bytes. D1 stores authoritative tenant ownership metadata in `r2_assets`:

```
r2_assets (D1 Table)
├── id: "r2_01hn..."
├── organization_id: "org_01hn..." (Tenant ownership enforcement)
├── bucket_name: "assets" | "exports"
├── object_key: "org/org_01hn.../brand/logo.svg"
├── file_name: "logo.svg"
├── content_type: "image/svg+xml"
├── size_bytes: 42150
├── resource_type: "brand_kit"
├── resource_id: "bk_01hn..."
└── status: "READY"
```

### Server-Side Key Generation Convention
- Brand Assets: `org/<organizationId>/brand/<assetId>/<filename>`
- QR Render Exports: `org/<organizationId>/qr/<qrId>/<exportId>.<ext>`
- Report Deliveries: `org/<organizationId>/reports/<reportJobId>/<filename>`

*Never trust client-supplied file paths; prevent directory traversal vulnerabilities.*

---

## 7. Asynchronous Queue Message Contracts

All queue messages carry an explicit `schemaVersion: 1` property to support non-blocking schema evolution:

### Telemetry Queue (`ScanEventV1`)
```typescript
interface ScanEventV1 {
  schemaVersion: 1;
  eventId: string;
  qrId: string;
  organizationId: string;
  timestamp: number;
  ipHash: string; // Salted daily SHA-256 (Never raw IP)
  countryCode?: string;
  region?: string;
  deviceType?: "mobile" | "tablet" | "desktop" | "bot";
  osName?: string;
  browserName?: string;
  resolvedDestination: string;
  matchedRuleId?: string;
  experimentVariantId?: string;
  isFallback: boolean;
}
```

### Webhook Dispatch Queue (`WebhookJobV1`)
```typescript
interface WebhookJobV1 {
  schemaVersion: 1;
  jobId: string;
  eventId: string;
  endpointId: string;
  eventType: string;
  targetUrl: string;
  signingSecret: string;
  payload: Record<string, unknown>;
  attemptNumber: number;
  enqueuedAt: number;
}
```

### Asynchronous Report Queue (`ReportJobV1`)
```typescript
interface ReportJobV1 {
  schemaVersion: 1;
  jobId: string;
  organizationId: string;
  savedReportId?: string;
  reportType: "scans" | "conversions" | "audit" | "guardian";
  format: "csv" | "pdf" | "json";
  dateRange: { start: number; end: number };
  requestedBy: string;
  enqueuedAt: number;
}
```

---

## 8. Privacy-Aware Telemetry & Data Retention

1. **Zero Raw IP Persistence**: The client IP (`cf-connecting-ip`) is hashed at the edge using SHA-256 with a secret salt and a daily date boundary:
   ```typescript
   const ipHash = hash(`${clientIp}-${IP_SALT}-${YYYY-MM-DD}`).substring(0, 16);
   ```
2. **Scan Telemetry Rollups in D1**: Raw scan events are written to Queues and rolled up into `scan_events_hourly` dimension buckets in D1 (`ON CONFLICT(qr_id, hour_bucket, country_code, device_type, os_name)`). Raw per-scan firehoses never populate D1.
3. **Guardian Health Check Retention**: Detailed `link_checks` rows are indexed by `(checked_at DESC)` and periodically pruned via `pruneOldGuardianChecks()` to a bounded window (7–30 days). Continuous health probes do not bloat D1.
4. **Non-Blocking Telemetry Invariant**: A failure to deliver a telemetry message to `SCAN_QUEUE` will never prevent or delay an HTTP 302 redirect for the user.
