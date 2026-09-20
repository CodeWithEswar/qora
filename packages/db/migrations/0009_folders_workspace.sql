-- ==============================================================================
-- NXTQR — Cloudflare D1 Migration 0009
-- Version: 0009_folders_workspace.sql
-- Folders Workspace, Visual Accents, Emoji Identity, and Performance Indexes
-- ==============================================================================

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS folders_new (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES folders_new(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    accent_key TEXT DEFAULT 'Graphite',
    color TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_by TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    archived_at INTEGER
);

INSERT INTO folders_new (
    id, organization_id, parent_id, name, color, created_at, updated_at
)
SELECT 
    id, organization_id, parent_id, name, color, created_at, created_at
FROM folders;

DROP TABLE folders;
ALTER TABLE folders_new RENAME TO folders;

CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_org_name_active ON folders(organization_id, lower(trim(name))) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_folders_org_status ON folders(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_folders_org_updated ON folders(organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_codes_folder ON qr_codes(folder_id);

PRAGMA foreign_keys = ON;
