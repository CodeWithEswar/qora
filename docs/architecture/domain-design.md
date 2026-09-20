# NXTQR — Production Domain & Service Design
## Modular Domain Architecture Specification

This document defines the authoritative architecture, bounded contexts, ownership rules, and service contracts for the **NXTQR Smart QR Infrastructure Platform**.

---

## 1. Architectural Philosophy: Modular Control Plane

NXTQR is built as a **disciplined modular monolith / control plane** inside a single monorepo, paired with an independently deployable **Cloudflare Edge Data Plane (Redirect Worker)** and an **Asynchronous Event Plane (Cloudflare Queues)**.

```
                    ┌──────────────────────────────────────────────────────────────┐
                    │                   NXTQR CONTROL PLANE (Next.js)              │
                    │                                                              │
                    │  01 Identity          02 Organizations        03 QR          │
                    │  04 Routing           05 Campaigns            06 Brand       │
                    │  07 Analytics         08 Collaboration        09 Security    │
                    │  10 Billing           11 Developer            12 Guardian    │
                    └──────────────────────────────┬───────────────────────────────┘
                                                   │
                                    shared infrastructure clients
                                                   │
                            ┌──────────────────────┼──────────────────────┐
                            ▼                      ▼                      ▼
                     Cloudflare D1          Cloudflare R2          Cloudflare KV
                    (Authoritative DB)      (Object Storage)      (Resolver Cache)
                            ▲
                            │ fallback on cache miss
                            │
                    ┌───────┴──────────────────────────────────────┐
                    │       EDGE DATA PLANE (Redirect Worker)      │
                    │   sub-10ms scan resolution via KV snapshot   │
                    └──────────────────────┬───────────────────────┘
                                           │ non-blocking telemetry
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │         EVENT PLANE (Cloudflare Queues)      │
                    │                                              │
                    │     nxtqr-scan-telemetry   (Analytics)       │
                    │     nxtqr-guardian-checks  (Guardian)        │
                    │     nxtqr-webhook-delivery (Developer)       │
                    └──────────────────────────────────────────────┘
```

---

## 2. Domain Map & Relationship Topology

```
                         ┌──────────────┐
                         │ 01 Identity  │
                         └──────┬───────┘
                                │ user
                                ▼
                         ┌──────────────┐
                         │02 Org/Tenancy│
                         └──────┬───────┘
                                │ organizationId
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
   │    03 QR    │◄─────►│ 04 Routing  │       │05 Campaigns │
   └──────┬──────┘       └──────┬──────┘       └─────────────┘
          │                     │
          │                     │ health
          │                     ▼
          │              ┌─────────────┐
          │              │ 12 Guardian │
          │              └─────────────┘
          │
          ├──────────────► 07 Analytics (via Queue)
          │
          ├──────────────► 08 Collaboration
          │
          └──────────────► 11 Developer

   02 Organizations ──┬── 06 Brand
                      ├── 09 Security
                      └── 10 Billing
```

---

## 3. The 12 Bounded Contexts

### 01. Identity
- **Responsibilities**: Users, authentication accounts, session resolution, account lifecycle.
- **Provider Authority**: Google OAuth server-side verification. Provider subject (`googleSub`) maps directly to `UserEntity.id`. Never trust browser-submitted email alone.
- **MFA Boundary**: Provides an extensible `MfaSecurityProfile` interface without prematurely implementing multi-factor verification in Phase 3.

### 02. Organizations
- **Responsibilities**: Workspaces, memberships, teams, role-based access control (RBAC), invitations.
- **Tenancy**: The primary organizational boundary. Every business entity belongs to an `organizationId`.
- **Authorization Engine**: Authoritative server-side `authorizeCapability({ actorUserId, organizationId, requiredPermission })`.
- **Invitations**: State machine (`PENDING` $\to$ `ACCEPTED`, `EXPIRED`, `REVOKED`) with idempotent acceptance.

### 03. QR
- **Responsibilities**: QR digital assets, design configurations, short slug namespace, revisions, publication.
- **Lifecycle State Machine**:
  $$\text{DRAFT} \longrightarrow \text{ACTIVE} \longleftrightarrow \text{PAUSED} \longrightarrow \text{ARCHIVED}$$
  (Transitions strictly validated via `assertValidQRTransition`).
- **Resolver Compilation**: Rich D1 data models compile down into compact `RedirectSnapshot` objects for Cloudflare KV.

### 04. Routing
- **Responsibilities**: Route policies, condition evaluation, experiments/variants, fallback policies.
- **Single Deterministic Evaluator**: Shared across the Edge Worker, Next.js simulator, and test suites. Strictly deterministic with zero `eval()`.
- **Routing Decision**: Computes the winning destination URL and decision trace.

### 05. Campaigns
- **Responsibilities**: Marketing campaigns, folder hierarchies, tags, schedules.
- **Folder Constraints**: Enforces cycle prevention and depth limits ($\le 5$) via `assertValidFolderNesting`.
- **Tags**: Strictly scoped per organization.

### 06. Brand
- **Responsibilities**: Brand kits, approved template governance, custom domains, DNS verification.
- **Custom Domains**: State machine (`PENDING` $\to$ `VERIFYING` $\to$ `ACTIVE`). Domain must undergo TXT record verification before activation.
- **Asset Storage**: Logos and vector assets stored in R2 (`brands/{orgId}/{assetId}.{ext}`); metadata stored in D1.

### 07. Analytics
- **Responsibilities**: Scan event ingestion contracts (`ScanTelemetryPayload`), normalized hourly aggregates, conversions, reports.
- **Privacy Policy**: No raw IP addresses or persistent cross-site device fingerprints are retained. Uses salted SHA-256 hashes for coarse unique calculations.
- **Asynchronous Reports**: Report generation is offloaded to queues, stored in R2, and polled via D1 job metadata.

### 08. Collaboration
- **Responsibilities**: Comments, mentions, approval workflows (`PENDING`, `APPROVED`, `REJECTED`).
- **Separation of Concerns**: QR domain owns QR revisions; Collaboration owns discussions and approval workflows around revisions.
- **Presence**: Real-time coordination and ephemeral cursor/lock state isolated to Cloudflare Durable Objects.

### 09. Security
- **Responsibilities**: Append-only audit events, credential security policies, rate-limiting rules.
- **API Key Security**: Cryptographic generation (`nxtqr_live_` + 24-byte entropy). Only key prefix and SHA-256 hash are persisted in D1. Plaintext secret is revealed once.

### 10. Billing
- **Responsibilities**: Plans (`FREE`, `PRO`, `BUSINESS`, `ENTERPRISE`), subscriptions, feature entitlements, quotas, Cashfree integration.
- **Permission vs Entitlement**:
  - *Permission*: Can this user perform this action? (Checked by Organizations/RBAC)
  - *Entitlement*: Does the organization plan permit this feature / quota? (Checked by Billing)
- **Cashfree Adapter**: All payment gateway details isolated behind a `BillingProvider` interface with HMAC signature verification.

### 11. Developer Platform
- **Responsibilities**: Public API v1, versioned DTOs (`toPublicQrV1`), API key scope enforcement, outbound webhooks.
- **Outbound Webhook Delivery**: Delivered asynchronously via queues with exponential backoff retries and strict SSRF defenses.

### 12. Guardian
- **Responsibilities**: Automated destination health checks, incident lifecycle (`OPEN`, `INVESTIGATING`, `RESOLVED`), fallback policy publication.
- **Scan Path Decoupling**: Guardian NEVER blocks scan-time redirects. It runs background edge probes and publishes a compact health signal that Routing consumes.
- **SSRF Defenses**: Full validation blocking private IPs, link-local, and cloud metadata (`169.254.169.254`).

---

## 4. Storage & Runtime Ownership Matrix

| Domain | Cloudflare D1 Tables | Cloudflare KV | Cloudflare R2 | Cloudflare Queues | Durable Objects |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01 Identity** | `users`, `auth_accounts`, `sessions` | — | — | — | — |
| **02 Organizations** | `organizations`, `organization_members`, `teams`, `team_members`, `invitations`, `roles`, `permissions` | — | — | — | — |
| **03 QR** | `qr_codes`, `qr_destinations`, `qr_designs`, `qr_versions` | `slug:<slug>` (RedirectSnapshot) | Export vector artifacts | — | — |
| **04 Routing** | `qr_rules`, `qr_rule_conditions`, `experiments`, `experiment_variants` | — | — | — | — |
| **05 Campaigns** | `campaigns`, `folders`, `tags`, `qr_tags` | — | — | — | — |
| **06 Brand** | `brand_kits`, `custom_domains` | `domain:<domain>` | Brand logos & assets | — | — |
| **07 Analytics** | `scan_events_hourly`, `conversion_events` | — | Export reports & CSVs | `nxtqr-scan-telemetry` | — |
| **08 Collaboration** | `comments`, `approval_requests` | — | — | — | Presence coordination |
| **09 Security** | `audit_logs` | Rate limit counters | — | — | — |
| **10 Billing** | `plans`, `plan_features`, `subscriptions`, `payments`, `entitlements` | — | Invoices & receipts | — | — |
| **11 Developer** | `api_keys`, `webhook_endpoints`, `webhook_deliveries` | — | — | `nxtqr-webhook-delivery` | — |
| **12 Guardian** | `link_checks`, `guardian_incidents`, `fallback_policies` | Health status signals | — | `nxtqr-guardian-checks` | — |

---

## 5. Critical Separation: Routing $\leftrightarrow$ Guardian $\leftrightarrow$ Analytics

The hot redirect path must execute within **sub-10ms latency** without cross-domain network bottlenecks:

1. **Routing**:
   - Decides where the scan goes.
   - Evaluates pre-compiled rules against the incoming scanner context.
   - Consumes the pre-published Guardian health flag (`guardianHealthy`).
2. **Guardian**:
   - Executes background probes independently of scan traffic.
   - Validates target destinations with SSRF protections.
   - Updates the published health flag when consecutive failures exceed policy thresholds.
3. **Analytics**:
   - Asynchronously ingests scan telemetry via Cloudflare Queues (`ctx.waitUntil(SCAN_QUEUE.send(...))`).
   - Normalizes and aggregates scans into hourly buckets.
   - Never intervenes in or delays redirect resolution.

---

## 6. Security & SSRF Invariants

Guardian health checks and Developer webhooks trigger outbound HTTP calls. The system enforces strict SSRF protections:
- **Forbidden Protocols**: All schemes except `https:` (and optionally `http:` for Guardian targets) are rejected.
- **Blocked Hostnames**: `localhost`, `*.localhost`, `metadata.google.internal`, `instance-data`.
- **Blocked IPv4 Ranges**:
  - `127.0.0.0/8` (Loopback)
  - `10.0.0.0/8` (Private Class A)
  - `172.16.0.0/12` (Private Class B)
  - `192.168.0.0/16` (Private Class C)
  - `169.254.0.0/16` (Link-Local & Cloud Metadata `169.254.169.254`)
  - `0.0.0.0/8`, `255.255.255.255`
- **Blocked IPv6 Ranges**: `::1` (Loopback), `fe80::/10` (Link-Local), `fc00::/7` (Unique Local), and IPv4-mapped equivalents.

---

## 7. Synchronous vs Asynchronous Operations

| Operation Type | Mode | Mechanism | Target Latency |
| :--- | :--- | :--- | :--- |
| **Google Authentication Callback** | Synchronous | Next.js Server Action / Route | $< 250\text{ms}$ |
| **Permission & Entitlement Checks** | Synchronous | D1 query / Cached Session | $< 15\text{ms}$ |
| **Edge QR Scan Resolution** | Synchronous | Cloudflare Worker + KV | $< 10\text{ms}$ |
| **QR Publication to KV** | Synchronous | KV put & D1 transaction | $< 100\text{ms}$ |
| **Scan Telemetry Ingestion** | Asynchronous | Cloudflare Queue Producer | Non-blocking |
| **Hourly Scan Aggregation** | Asynchronous | Queue Consumer Batch Job | Eventual ($\le 1\text{m}$) |
| **Guardian Link Health Probes** | Asynchronous | Cloudflare Cron / Worker Queue | Scheduled (every 60s) |
| **Customer Webhook Delivery** | Asynchronous | Queue Consumer + Retry Worker | Eventual ($\le 5\text{s}$) |
| **Large CSV / PDF Report Exports** | Asynchronous | Queue Worker + R2 Upload | Background job |
