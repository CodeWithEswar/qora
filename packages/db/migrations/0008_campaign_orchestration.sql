-- ==============================================================================
-- NXTQR — Cloudflare D1 Migration 0008
-- Version: 0008_campaign_orchestration.sql
-- Campaign Orchestration, Lifecycle Statuses, Emoji Identity & Performance Indexes
-- ==============================================================================

PRAGMA foreign_keys = OFF;

-- 1. Create modernized campaigns table with full lifecycle statuses and emoji identity
CREATE TABLE IF NOT EXISTS campaigns_new (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    start_date INTEGER,
    end_date INTEGER,
    budget_inr REAL,
    budget_minor INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    created_by TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    archived_at INTEGER
);

-- 2. Migrate existing records safely
INSERT INTO campaigns_new (
    id, organization_id, name, description, start_date, end_date, budget_inr, budget_minor, status, created_at, updated_at
)
SELECT 
    id, organization_id, name, description, start_date, end_date, budget_inr, budget_minor, 
    CASE 
        WHEN status IN ('draft', 'active', 'paused', 'completed', 'archived') THEN status
        ELSE 'active'
    END,
    created_at, created_at
FROM campaigns;

-- 3. Replace old table with new table
DROP TABLE campaigns;
ALTER TABLE campaigns_new RENAME TO campaigns;

-- 4. High-throughput indexes for operational listings and QR asset associations
CREATE INDEX IF NOT EXISTS idx_campaigns_org_status ON campaigns(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_created ON campaigns(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_codes_campaign ON qr_codes(campaign_id);

PRAGMA foreign_keys = ON;
