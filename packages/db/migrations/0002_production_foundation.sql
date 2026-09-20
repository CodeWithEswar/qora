-- ==============================================================================
-- NXTQR — Cloudflare D1 Production Foundation Migration
-- Version: 0002_production_foundation.sql
-- Production tightening: Integer minor money units, published QR revision isolation,
-- multi-tenant scoping, webhook signing secrets, idempotent billing/events,
-- and bounded telemetry & queue index models.
-- ==============================================================================

-- 1. CURRENCY MINOR INTEGER UNITS (No REAL/FLOAT money drift)
ALTER TABLE campaigns ADD COLUMN budget_minor INTEGER;
ALTER TABLE plans ADD COLUMN monthly_price_minor INTEGER;
ALTER TABLE plans ADD COLUMN annual_price_minor INTEGER;
ALTER TABLE payments ADD COLUMN amount_minor INTEGER;
ALTER TABLE conversion_events ADD COLUMN value_minor INTEGER;

-- Backfill existing plans prices to minor units (Paise: 100 paise = 1 INR)
UPDATE plans SET monthly_price_minor = CAST(monthly_price_inr * 100 AS INTEGER) WHERE monthly_price_minor IS NULL;
UPDATE plans SET annual_price_minor = CAST(annual_price_inr * 100 AS INTEGER) WHERE annual_price_minor IS NULL;

-- 2. QR CODES: PUBLISHED REVISION & EDGE STATE ISOLATION
-- Decouples working draft revisions from live edge-published resolver state
ALTER TABLE qr_codes ADD COLUMN published_version_id TEXT REFERENCES qr_versions(id);
ALTER TABLE qr_codes ADD COLUMN published_at INTEGER;

-- Initialize published_version_id to current_version_id for existing ACTIVE QRs
UPDATE qr_codes SET published_version_id = current_version_id WHERE status = 'ACTIVE' AND published_version_id IS NULL;

-- 3. MULTI-TENANT SCOPING TIGHTENING
ALTER TABLE approval_requests ADD COLUMN organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE guardian_incidents ADD COLUMN organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill organization_id on approval_requests from qr_codes
UPDATE approval_requests SET organization_id = (SELECT organization_id FROM qr_codes WHERE qr_codes.id = approval_requests.qr_id) WHERE organization_id IS NULL;
-- Backfill organization_id on guardian_incidents from qr_codes
UPDATE guardian_incidents SET organization_id = (SELECT organization_id FROM qr_codes WHERE qr_codes.id = guardian_incidents.qr_id) WHERE organization_id IS NULL;

-- 4. WEBHOOK SIGNING SECRETS & SUBSCRIPTIONS
-- Retrievable signing secret for HMAC-SHA256 payload signing (never expose on read)
ALTER TABLE webhook_endpoints ADD COLUMN signing_secret TEXT;

-- Tighten webhook_deliveries with event reference and status
ALTER TABLE webhook_deliveries ADD COLUMN event_id TEXT REFERENCES webhook_events(id);
ALTER TABLE webhook_deliveries ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING'));
ALTER TABLE webhook_deliveries ADD COLUMN completed_at INTEGER;

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    endpoint_id TEXT NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY(endpoint_id, event_type)
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS webhook_attempts (
    id TEXT PRIMARY KEY,
    delivery_id TEXT NOT NULL REFERENCES webhook_deliveries(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'TIMEOUT')),
    response_code INTEGER,
    duration_ms INTEGER,
    error_message TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 5. BILLING IDEMPOTENCY & PAYMENT EVENTS
CREATE TABLE IF NOT EXISTS payment_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    provider_event_key TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED', 'IGNORED')),
    processed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(provider, provider_event_key)
);

ALTER TABLE subscriptions ADD COLUMN provider TEXT NOT NULL DEFAULT 'cashfree';
ALTER TABLE subscriptions ADD COLUMN provider_subscription_id TEXT;
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_id ON subscriptions(provider, provider_subscription_id);

-- 6. ACTIVITY STREAM (Product/Team Facing) vs AUDIT LOGS (Security/Governance)
CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata_json TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 7. GOVERNANCE, COLLABORATION & SECURITY PRIMITIVES
CREATE TABLE IF NOT EXISTS share_links (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('qr', 'route', 'campaign', 'report')),
    resource_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
    password_hash TEXT,
    expires_at INTEGER,
    revoked_at INTEGER,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS mentions (
    id TEXT PRIMARY KEY,
    comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS api_key_scopes (
    api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    scope TEXT NOT NULL,
    PRIMARY KEY(api_key_id, scope)
);

-- 8. ASYNCHRONOUS REPORT ENGINE
CREATE TABLE IF NOT EXISTS saved_reports (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config_json TEXT NOT NULL DEFAULT '{}',
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    saved_report_id TEXT NOT NULL REFERENCES saved_reports(id) ON DELETE CASCADE,
    cadence TEXT NOT NULL CHECK (cadence IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    recipients_json TEXT NOT NULL DEFAULT '[]',
    next_run_at INTEGER NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS report_jobs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    saved_report_id TEXT REFERENCES saved_reports(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'EXPIRED')),
    requested_by TEXT NOT NULL REFERENCES users(id),
    output_object_key TEXT,
    error_message TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    started_at INTEGER,
    completed_at INTEGER,
    expires_at INTEGER
);

-- 9. R2 ASSET METADATA (D1 Ownership Authority for Object Storage)
CREATE TABLE IF NOT EXISTS r2_assets (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    bucket_name TEXT NOT NULL, -- 'assets' or 'exports'
    object_key TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN ('PENDING', 'READY', 'FAILED', 'DELETED')),
    created_by TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 10. COMPOSITE INDEXES & PERFORMANCE FOUNDATION
-- Mandatory composite unique index for Queue consumer UPSERT on scan_events_hourly
CREATE UNIQUE INDEX IF NOT EXISTS idx_scan_hourly_composite ON scan_events_hourly(qr_id, hour_bucket, country_code, device_type, os_name);

-- Guardian check retention & prune index
CREATE INDEX IF NOT EXISTS idx_link_checks_retention ON link_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_checks_qr_recent ON link_checks(qr_id, checked_at DESC);

-- Activity timeline index
CREATE INDEX IF NOT EXISTS idx_activity_org_timeline ON activity_events(organization_id, created_at DESC);

-- Webhook queue & retry lookups
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_org ON webhook_events(organization_id, created_at DESC);

-- Report jobs queue lookup
CREATE INDEX IF NOT EXISTS idx_report_jobs_org ON report_jobs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_jobs_status ON report_jobs(status, created_at ASC);

-- R2 asset tenancy lookup
CREATE INDEX IF NOT EXISTS idx_r2_assets_org ON r2_assets(organization_id, bucket_name);

-- Approval requests tenant lookup
CREATE INDEX IF NOT EXISTS idx_approval_requests_org ON approval_requests(organization_id, status);
