# NXTQR — Production Analytics & Scan Event Pipeline Architecture

## 1. Core Architectural Principle
```text
                     QR SCAN
                        │
                        ▼
                REDIRECT WORKER
                        │
              resolve destination
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
       REDIRECT USER         ScanEventV1
          302/307                  │
                                  ▼
                           SCAN_EVENTS QUEUE
                                  │
                                  ▼
                           Queue Consumer
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
        Analytics Engine    Traffic Quality       Usage
                                                   Counters
              │
              ▼
       Analytics Query
           Services
              │
              ▼
        NXTQR Analytics UI
```

### Absolute Invariant: REDIRECT $\neq$ ANALYTICS TRANSACTION
A valid QR redirect MUST NOT wait for analytics persistence.
Never make the scanner redirect wait for:
- D1 database writes
- Analytics Engine writes
- Queue consumer batch processing
- Conversion correlation
- Bot/crawler classification
- Report generation

Destination resolution executes synchronously in sub-10ms via Cloudflare KV (with D1 cache miss fallback). Telemetry creation and enqueueing occurs strictly asynchronously inside `ctx.waitUntil()`.

---

## 2. Event Pipeline & Contract: `ScanEventV1`

All telemetry messages conform to the versioned `ScanEventV1` contract:

```typescript
export interface ScanEventV1 {
  schemaVersion: 1;
  eventId: string;           // Unique, opaque identifier (e.g. evt_1740000000_abc123)
  occurredAt: string;        // UTC ISO 8601 timestamp
  organizationId: string;    // Authoritative tenant ID resolved from DB/KV
  qrId: string;              // Authoritative QR asset ID
  campaignId?: string;       // Optional associated campaign
  routingRuleId?: string;    // Matched dynamic routing rule ID
  destinationId: string;     // Resolved destination URL or ID
  experimentId?: string;     // A/B test identifier
  experimentVariantId?: string; // Assigned test variant
  country?: string;          // Coarse ISO 3166-1 alpha-2 code
  region?: string;           // Coarse administrative subdivision
  deviceClass: DeviceClass;  // MOBILE | DESKTOP | TABLET | OTHER | UNKNOWN
  osFamily: OSFamily;        // ANDROID | IOS | WINDOWS | MACOS | LINUX | CHROME_OS | OTHER | UNKNOWN
  browserFamily: BrowserFamily; // CHROME | SAFARI | EDGE | FIREFOX | SAMSUNG_INTERNET | OTHER | UNKNOWN
  referrerClass: ReferrerClass; // DIRECT_OR_UNKNOWN | WEB | SOCIAL | SEARCH | INTERNAL | OTHER
  trafficQuality: TrafficQualityClass; // NORMAL | SUSPECTED_AUTOMATION | BLOCKED | UNKNOWN
  responseClass: ResponseClass; // REDIRECTED | BLOCKED | INACTIVE | EXPIRED | NOT_FOUND
  resolverVersion: 1;
  isFallback?: boolean;      // True if Guardian fallback destination was used
  ipHash?: string;           // Daily salted SHA-256 hash (never raw IP)
}
```

---

## 3. Storage Separation: Analytics Engine vs D1 Database

| Concern | Cloudflare Analytics Engine | Cloudflare D1 (SQLite) |
| :--- | :--- | :--- |
| **Primary Role** | High-volume time-series telemetry firehose | Relational control plane & aggregate rollups |
| **Data Stored** | Raw dimensional data points (blobs, doubles, indexes) | `scan_events_hourly` composite rollups, `conversion_events`, `saved_reports`, `report_jobs` |
| **Durability Model** | Loss-tolerant aggregate analytics | ACID relational authority |
| **Tenancy Enforcement** | Indexed by `organizationId` | Scoped by `organization_id` foreign keys |
| **Raw Event Firehose** | Supported via `SCAN_ANALYTICS` dataset | **Prohibited** (Only hourly rollups stored) |

---

## 4. Billable Usage vs Informational Telemetry

> [!IMPORTANT]
> **Billable Usage Separation Invariant**:
> Loss-tolerant scan telemetry from `SCAN_EVENTS` is strictly informational. If scan counts become billable units under customer plans, durable accounting must be maintained through transactional reconciliation rather than best-effort queue consumption.

---

## 5. Metric & Dimension Registries

All analytics surfaces and reports reference the centralized registries in `@nxtqr/contracts`:

### Metric Registry
- `total_scans`: Total accepted scan signals (`responseClass = 'REDIRECTED'`).
- `estimated_unique_scans`: Daily salted hash approximation. Labeled as *Estimated Unique Scans*, never "Unique People".
- `conversions`: Verified post-scan business occurrences.
- `conversion_rate`: Percentage of eligible scans converted (`conversions / total_scans * 100`).
- `suspected_automation`: Requests showing bot, crawler, or unfurler patterns.
- `blocked_events`: Traffic halted due to draft, paused, expired, or security rules.
- `fallback_rate`: Proportion of traffic routed to backup destinations by Link Guardian.

### Dimension Registry
- `country`: ISO 3166-1 alpha-2 coarse geography.
- `region`: Coarse administrative region.
- `device_class`: `MOBILE`, `DESKTOP`, `TABLET`, `OTHER`, `UNKNOWN`.
- `os_family`: `ANDROID`, `IOS`, `WINDOWS`, `MACOS`, `LINUX`, `CHROME_OS`, `OTHER`, `UNKNOWN`.
- `browser_family`: `CHROME`, `SAFARI`, `EDGE`, `FIREFOX`, `SAMSUNG_INTERNET`, `OTHER`, `UNKNOWN`.
- `referrer_class`: `DIRECT_OR_UNKNOWN`, `WEB`, `SOCIAL`, `SEARCH`, `INTERNAL`, `OTHER`.
- `traffic_quality`: `NORMAL`, `SUSPECTED_AUTOMATION`, `BLOCKED`, `UNKNOWN`.

---

## 6. Query Service Boundary: `AnalyticsQueryService`

Browser components never construct raw SQL or Analytics Engine queries directly. All requests pass through `AnalyticsQueryService`:
1. **Tenant Verification**: Authoritative `organizationId` verified from authenticated session.
2. **Entitlement Enforcement**: Queries are validated against workspace plan limits (e.g. max historical range).
3. **Bounded Filters**: Maximum date ranges and filter parameters enforced before execution.
4. **Data Masking**: Error details, stack traces, and internal binding names are shielded from the client.

---

## 7. Asynchronous Reporting Engine

Large export operations follow the asynchronous job pattern:
```text
User Request → Create Report Job (D1) → Enqueue REPORT_QUEUE → Worker Consumer → Query D1/Analytics Engine → Stream CSV/PDF → Store in R2 (nxtqr-assets/exports) → Mark Job Complete → Authorized Download
```
Direct browser downloads are strictly authorized against organization ownership; arbitrary R2 object keys are never accepted from clients.
