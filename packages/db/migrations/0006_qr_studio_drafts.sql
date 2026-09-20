-- ==============================================================================
-- NXTQR — Cloudflare D1 Migration 0006
-- Version: 0006_qr_studio_drafts.sql
-- Dedicated Draft Persistence with Optimistic Concurrency Control
-- ==============================================================================

-- 1. QR WORKING DRAFTS (Decoupled mutable draft from immutable qr_versions)
CREATE TABLE IF NOT EXISTS qr_drafts (
    qr_id TEXT PRIMARY KEY REFERENCES qr_codes(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    draft_version INTEGER NOT NULL DEFAULT 1,
    content_json TEXT NOT NULL,
    design_json TEXT NOT NULL,
    destination_json TEXT,
    updated_by TEXT NOT NULL REFERENCES users(id),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_qr_drafts_org ON qr_drafts(organization_id);

-- 2. Ensure qr_versions supports full content snapshot JSON
ALTER TABLE qr_versions ADD COLUMN content_json TEXT;
