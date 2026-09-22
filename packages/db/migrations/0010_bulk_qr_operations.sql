-- ==============================================================================
-- NXTQR — Cloudflare D1 Migration 0010
-- Bulk QR Operations: Batches and Batch Rows
-- ==============================================================================

CREATE TABLE IF NOT EXISTS bulk_qr_batches (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'manual_grid')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'VALIDATING', 'READY', 'QUEUED', 'PROCESSING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED')),
    creation_mode TEXT NOT NULL DEFAULT 'DRAFT' CHECK (creation_mode IN ('DRAFT', 'PUBLISH')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    ready_rows INTEGER NOT NULL DEFAULT 0,
    warning_rows INTEGER NOT NULL DEFAULT 0,
    blocked_rows INTEGER NOT NULL DEFAULT 0,
    processed_rows INTEGER NOT NULL DEFAULT 0,
    created_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    design_json TEXT NOT NULL DEFAULT '{}',
    manifest_json TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    started_at INTEGER,
    completed_at INTEGER,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS bulk_qr_batch_rows (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL REFERENCES bulk_qr_batches(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_row_number INTEGER NOT NULL,
    normalized_payload TEXT NOT NULL,
    validation_status TEXT NOT NULL DEFAULT 'READY' CHECK (validation_status IN ('READY', 'WARNING', 'BLOCKED')),
    validation_errors TEXT NOT NULL DEFAULT '[]',
    execution_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (execution_status IN ('PENDING', 'PROCESSING', 'CREATED', 'FAILED', 'SKIPPED')),
    qr_id TEXT REFERENCES qr_codes(id) ON DELETE SET NULL,
    error_code TEXT,
    error_message TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(batch_id, source_row_number)
);

CREATE INDEX IF NOT EXISTS idx_bulk_qr_batches_org_created ON bulk_qr_batches(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_qr_batches_org_status ON bulk_qr_batches(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_batch_row ON bulk_qr_batch_rows(batch_id, source_row_number);
CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_batch_exec ON bulk_qr_batch_rows(batch_id, execution_status);
CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_batch_val ON bulk_qr_batch_rows(batch_id, validation_status);
CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_qr_id ON bulk_qr_batch_rows(qr_id);
