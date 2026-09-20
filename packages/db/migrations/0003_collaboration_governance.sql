-- ==============================================================================
-- NXTQR — Cloudflare D1 Collaboration & Governance Migration
-- Version: 0003_collaboration_governance.sql
-- Multi-tenant team resource assignments, ordered approval workflows,
-- threaded comments, immutable version snapshots, and client portals.
-- ==============================================================================

-- 1. TEAM-SCORED RESOURCE ASSIGNMENTS (Polymorphic, non-exclusive)
CREATE TABLE IF NOT EXISTS resource_team_assignments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('qr', 'campaign', 'report', 'folder', 'brand_kit')),
    resource_id TEXT NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'manage')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(team_id, resource_type, resource_id)
);
CREATE INDEX IF NOT EXISTS idx_rta_org_resource ON resource_team_assignments(organization_id, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_rta_team ON resource_team_assignments(team_id);

-- 2. ORDERED MULTI-STEP APPROVAL WORKFLOWS
CREATE TABLE IF NOT EXISTS approval_steps (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    approver_type TEXT NOT NULL CHECK (approver_type IN ('USER', 'ROLE', 'TEAM')),
    approver_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'APPROVED', 'REJECTED', 'SKIPPED')),
    decision_note TEXT,
    acted_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(request_id, step_order)
);
CREATE INDEX IF NOT EXISTS idx_approval_steps_request ON approval_steps(request_id, step_order);

-- 3. THREADED COMMENTS (Bounded reply nesting via parent_id)
ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(organization_id, resource_type, resource_id);

-- 4. IMMUTABLE VERSION SNAPSHOTS (Payload and design JSON decoupling)
ALTER TABLE qr_versions ADD COLUMN payload_json TEXT;
ALTER TABLE qr_versions ADD COLUMN design_json TEXT;

-- 5. BRAND GOVERNANCE LOCKED TEMPLATE RULES
ALTER TABLE brand_kits ADD COLUMN locked_rules_json TEXT NOT NULL DEFAULT '{}';

-- 6. CLIENT PORTALS & ALLOWLISTED RESOURCE ACCESS
CREATE TABLE IF NOT EXISTS client_portals (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    branding_config_json TEXT NOT NULL DEFAULT '{}',
    access_token_hash TEXT,
    password_hash TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_client_portals_org ON client_portals(organization_id, status);

CREATE TABLE IF NOT EXISTS client_portal_resources (
    id TEXT PRIMARY KEY,
    portal_id TEXT NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('qr', 'campaign', 'report')),
    resource_id TEXT NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'VIEW' CHECK (access_level IN ('VIEW', 'DOWNLOAD')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(portal_id, resource_type, resource_id)
);
CREATE INDEX IF NOT EXISTS idx_cpr_portal ON client_portal_resources(portal_id);
