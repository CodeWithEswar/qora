# NXTQR Data Retention & Lifecycle Governance

This document establishes the data retention policies, physical deletion pipelines, and compliance boundaries across NXTQR storage layers.

---

## 1. Core Principles

1. **Policy-Driven Retention**: Data deletion is never scattered as ad-hoc `DELETE WHERE created_at < ...` queries in user request paths. All lifecycle sweeps execute via scheduled background workers with bounded batch limits.
2. **UI Access Window $\neq$ Physical Retention**:
   - A Free plan organization may have a **30-day UI analytics access window**, but the underlying aggregate summaries are preserved for historical reporting and compliance.
   - Downgrading a subscription does not immediately purge historical audit or billing records.
3. **Audit Immutability**: Security audit events are governance records, distinct from product activity logs. They cannot be edited or deleted by normal tenant users.

---

## 2. Retention Schedule by Domain

| Resource Class | Storage Layer | System Default Retention | Plan/Policy Variable | Deletion Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Audit Logs** | Cloudflare D1 (`audit_logs`) | 365 Days | Enterprise: up to 7 years | Scheduled background batch purge; records policy summary in audit trail. |
| **Activity Events** | Cloudflare D1 (`activity_events`) | 90 Days | Pro/Business: 180 days | Batched background deletion (`LIMIT 500`). |
| **Raw Scan Telemetry** | Analytics Engine | 30 Days (raw points) | Aggregates retained indefinitely | Managed by Cloudflare Analytics Engine lifecycle. |
| **Aggregated Daily Rollups** | Cloudflare D1 (`analytics_daily`) | Indefinite (summary metrics) | Free: 90-day query limit | Retained for historical trending. |
| **Export Files & PDF Reports** | Cloudflare R2 | 14 Days | Configurable via share link | R2 Object Lifecycle Rule (`DaysAfterInitiation: 14`). |
| **Guardian Health Logs** | Cloudflare D1 (`guardian_checks`) | 30 Days | Business/Enterprise: 90 days | Bounded FIFO rolling retention. |
| **Outbound Webhook Delivery Logs** | Cloudflare D1 (`webhook_logs`) | 30 Days | Standard across all tiers | Batched purge of deliveries > 30 days. |
| **Payment Events & Ledger** | Cloudflare D1 (`payment_events`) | 7 Years (Financial / Tax) | Immutable legal requirement | Never deleted automatically; soft-archived if required. |
| **Soft-Deleted QRs & Rules** | Cloudflare D1 | 30 Days grace period | Immediate purge on request | Background worker deletes after 30 days of `deleted_at`. |

---

## 3. Organization Deletion Pipeline

Deleting an organization is a high-consequence operation executed through a strict multi-stage workflow:

```
[ STAGE 1: REQUEST & VERIFICATION ]
   │── Action authorized by workspace OWNER only
   │── Re-authentication / password confirmation required
   ▼
[ STAGE 2: LOCK TENANT ]
   │── Set organization status to 'SUSPENDED' or 'PENDING_DELETION'
   │── Invalidate all active user sessions for this workspace
   │── Revoke all API keys immediately
   ▼
[ STAGE 3: EDGE WITHDRAWAL ]
   │── Evict all published QR resolver keys from Cloudflare KV
   │── Incoming scans return safe 404 / custom deactivated page
   ▼
[ STAGE 4: QUEUE ASYNC PURGE WORKER ]
   │── Delete R2 customer assets (logos, reports, exports)
   │── Clean up rule graphs, campaigns, and dynamic QR records
   │── Apply financial retention rules to payment history
   ▼
[ STAGE 5: FINAL AUDIT RECORD ]
   └── Write final terminal audit event before tenant metadata purge
```

---

## 4. Background Purge Worker Architecture

Retention jobs run via Cloudflare Scheduled Cron Workers (`cron = "0 3 * * *"`, 03:00 UTC):
- **Batching**: Never issue unindexed bulk deletes. Purges are executed with `LIMIT 500` per batch to keep D1 transactions fast and non-blocking.
- **Audit Summary**: The retention worker records a single aggregate audit log:
  ```json
  {
    "action": "RETENTION_POLICY_EXECUTED",
    "resourceType": "retention_worker",
    "metadata": {
      "prunedWebhookLogs": 1420,
      "prunedGuardianChecks": 580,
      "prunedExpiredExports": 43
    }
  }
  ```
