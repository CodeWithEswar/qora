-- ==============================================================================
-- NXTQR — Cloudflare D1 Migration 0011
-- QR Templates & Design Library: Templates, Versions, and QR links
-- ==============================================================================

CREATE TABLE IF NOT EXISTS qr_templates (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    scope TEXT NOT NULL DEFAULT 'organization' CHECK (scope IN ('organization', 'system')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    brand_kit_id TEXT REFERENCES brand_kits(id) ON DELETE SET NULL,
    compatibility TEXT NOT NULL DEFAULT '["UNIVERSAL"]',
    is_brand_locked INTEGER NOT NULL DEFAULT 0,
    locked_fields TEXT NOT NULL DEFAULT '[]',
    current_version INTEGER NOT NULL DEFAULT 1,
    design_json TEXT NOT NULL DEFAULT '{}',
    scanability_score INTEGER NOT NULL DEFAULT 100,
    scanability_status TEXT NOT NULL DEFAULT 'PASS' CHECK (scanability_status IN ('PASS', 'WARNING', 'FAIL')),
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    archived_at INTEGER
);

CREATE TABLE IF NOT EXISTS qr_template_versions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES qr_templates(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    change_summary TEXT,
    design_json TEXT NOT NULL DEFAULT '{}',
    scanability_score INTEGER NOT NULL DEFAULT 100,
    scanability_status TEXT NOT NULL DEFAULT 'PASS' CHECK (scanability_status IN ('PASS', 'WARNING', 'FAIL')),
    created_by TEXT REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(template_id, version)
);

CREATE INDEX IF NOT EXISTS idx_qr_templates_org_status ON qr_templates(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_qr_templates_org_created ON qr_templates(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_templates_brand_kit ON qr_templates(brand_kit_id);
CREATE INDEX IF NOT EXISTS idx_qr_template_versions_template_ver ON qr_template_versions(template_id, version DESC);
