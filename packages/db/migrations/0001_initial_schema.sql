-- ==============================================================================
-- NXTQR — Cloudflare D1 Initial Database Migration
-- Version: 0001_initial_schema.sql
-- Multi-tenant architecture for QR Intelligence SaaS with strict constraints.
-- ==============================================================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    phone_verified_at INTEGER,
    name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS auth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'phone', 'email')),
    provider_account_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    ip_hash TEXT,
    user_agent TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 2. ORGANIZATIONS & WORKSPACES
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    billing_plan TEXT NOT NULL DEFAULT 'FREE' CHECK (billing_plan IN ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS organization_members (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
    joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(team_id, member_id)
);

CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 3. RBAC (ROLES & PERMISSIONS)
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for global system roles
    name TEXT NOT NULL,
    description TEXT,
    is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS member_roles (
    member_id TEXT NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY(member_id, role_id)
);

-- 4. FOLDERS & CAMPAIGNS
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    color TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date INTEGER,
    end_date INTEGER,
    budget_inr REAL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(organization_id, name)
);

-- 5. QR ASSETS & CORE INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS qr_codes (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    qr_type TEXT NOT NULL CHECK (qr_type IN ('url', 'vcard', 'wifi', 'email', 'phone', 'sms', 'whatsapp', 'app', 'payment', 'location', 'pdf', 'text', 'event')),
    is_dynamic INTEGER NOT NULL DEFAULT 1 CHECK (is_dynamic IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'SCHEDULED', 'EXPIRED', 'ARCHIVED')),
    current_version_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    archived_at INTEGER
);

CREATE TABLE IF NOT EXISTS qr_destinations (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    default_url TEXT NOT NULL,
    fallback_url TEXT,
    password_hash TEXT,
    starts_at INTEGER,
    expires_at INTEGER,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS qr_designs (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    pixel_style TEXT NOT NULL DEFAULT 'squares' CHECK (pixel_style IN ('squares', 'rounded', 'dots')),
    eye_style TEXT NOT NULL DEFAULT 'square' CHECK (eye_style IN ('square', 'rounded', 'leaf')),
    eye_color TEXT,
    fg_color TEXT NOT NULL DEFAULT '#1F1F1F',
    bg_color TEXT NOT NULL DEFAULT '#FFFFFF',
    gradient_json TEXT,
    logo_url TEXT,
    logo_scale REAL DEFAULT 0.25,
    logo_padding REAL DEFAULT 4.0,
    frame_style TEXT NOT NULL DEFAULT 'none' CHECK (frame_style IN ('none', 'simple', 'badge', 'callout')),
    frame_text TEXT,
    frame_bg_color TEXT,
    frame_text_color TEXT,
    error_correction TEXT NOT NULL DEFAULT 'Q' CHECK (error_correction IN ('L', 'M', 'Q', 'H')),
    scanability_score INTEGER NOT NULL DEFAULT 95,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS qr_versions (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    destination_id TEXT NOT NULL REFERENCES qr_destinations(id),
    design_id TEXT NOT NULL REFERENCES qr_designs(id),
    change_summary TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(qr_id, version_number)
);

CREATE TABLE IF NOT EXISTS qr_tags (
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY(qr_id, tag_id)
);

-- 6. INTELLIGENT ROUTING (NXTQR ROUTES / QR BRAIN)
CREATE TABLE IF NOT EXISTS qr_rules (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    destination_url TEXT NOT NULL,
    match_type TEXT NOT NULL DEFAULT 'ALL' CHECK (match_type IN ('ALL', 'ANY')),
    action_type TEXT NOT NULL DEFAULT 'redirect' CHECK (action_type IN ('redirect', 'experiment', 'fallback', 'webhook')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS qr_rule_conditions (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL REFERENCES qr_rules(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('country', 'region', 'device', 'os', 'browser', 'language', 'time_window', 'date_range', 'weekday', 'campaign_state', 'custom')),
    operator TEXT NOT NULL CHECK (operator IN ('eq', 'neq', 'in', 'nin', 'between', 'contains')),
    value_json TEXT NOT NULL, -- JSON string representation
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 7. A/B DESTINATION EXPERIMENTS
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')),
    start_time INTEGER,
    end_time INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS experiment_variants (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    traffic_weight REAL NOT NULL DEFAULT 50.0,
    total_scans INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experiment_assignments (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    scanner_token_hash TEXT NOT NULL,
    variant_id TEXT NOT NULL REFERENCES experiment_variants(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(experiment_id, scanner_token_hash)
);

-- 8. LINK GUARDIAN (24/7 HEALTH & AUTOMATED RECOVERY)
CREATE TABLE IF NOT EXISTS link_checks (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    checked_url TEXT NOT NULL,
    http_status INTEGER,
    response_time_ms INTEGER NOT NULL,
    tls_valid INTEGER NOT NULL DEFAULT 1 CHECK (tls_valid IN (0, 1)),
    status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'DOWN')),
    failure_reason TEXT,
    checked_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS guardian_incidents (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')),
    started_at INTEGER NOT NULL DEFAULT (unixepoch()),
    resolved_at INTEGER,
    failure_reason TEXT NOT NULL,
    fallback_triggered INTEGER NOT NULL DEFAULT 0 CHECK (fallback_triggered IN (0, 1))
);

CREATE TABLE IF NOT EXISTS fallback_policies (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE UNIQUE,
    failure_threshold INTEGER NOT NULL DEFAULT 3,
    backup_url TEXT NOT NULL,
    auto_switch INTEGER NOT NULL DEFAULT 1 CHECK (auto_switch IN (0, 1)),
    notify_emails_json TEXT NOT NULL DEFAULT '[]'
);

-- 9. ANALYTICS & ATTRIBUTION (AGGREGATED)
CREATE TABLE IF NOT EXISTS scan_events_hourly (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    hour_bucket INTEGER NOT NULL, -- Unix timestamp aligned to top of hour
    total_scans INTEGER NOT NULL DEFAULT 1,
    unique_scans INTEGER NOT NULL DEFAULT 1,
    country_code TEXT DEFAULT 'XX',
    region TEXT DEFAULT 'Unknown',
    device_type TEXT DEFAULT 'mobile',
    os_name TEXT DEFAULT 'Unknown',
    browser_name TEXT DEFAULT 'Unknown',
    referrer TEXT DEFAULT 'direct'
);

CREATE TABLE IF NOT EXISTS conversion_events (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_value REAL,
    currency TEXT DEFAULT 'INR',
    metadata_json TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 10. COLLABORATION & GOVERNANCE
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('qr', 'route', 'campaign')),
    resource_id TEXT NOT NULL,
    author_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    resolved INTEGER NOT NULL DEFAULT 0 CHECK (resolved IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS approval_requests (
    id TEXT PRIMARY KEY,
    qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    requested_by TEXT NOT NULL REFERENCES users(id),
    target_version_id TEXT NOT NULL REFERENCES qr_versions(id),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    decision_note TEXT,
    decided_by TEXT REFERENCES users(id),
    decided_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    metadata_json TEXT,
    ip_hash TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS brand_kits (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    primary_color TEXT NOT NULL DEFAULT '#FA520F',
    palette_json TEXT NOT NULL DEFAULT '[]',
    logo_url TEXT,
    locked_by_admin INTEGER NOT NULL DEFAULT 0 CHECK (locked_by_admin IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS custom_domains (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFYING', 'ACTIVE', 'ERROR', 'SUSPENDED')),
    verification_token TEXT NOT NULL,
    ssl_active INTEGER NOT NULL DEFAULT 0 CHECK (ssl_active IN (0, 1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 11. BILLING & ENTITLEMENTS (CASHFREE INTEGRATION)
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY CHECK (id IN ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE')),
    name TEXT NOT NULL,
    tier_level INTEGER NOT NULL,
    monthly_price_inr REAL NOT NULL,
    annual_price_inr REAL NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS plan_features (
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    numeric_limit INTEGER,
    boolean_allowed INTEGER NOT NULL DEFAULT 1 CHECK (boolean_allowed IN (0, 1)),
    PRIMARY KEY(plan_id, feature_key)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    plan_id TEXT NOT NULL REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCEL_SCHEDULED', 'CANCELLED', 'EXPIRED')),
    cashfree_subscription_id TEXT,
    current_period_start INTEGER NOT NULL,
    current_period_end INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cashfree_order_id TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    payment_method TEXT,
    signature_verified INTEGER NOT NULL DEFAULT 0 CHECK (signature_verified IN (0, 1)),
    raw_payload_json TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS entitlements (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    boolean_allowed INTEGER NOT NULL DEFAULT 1 CHECK (boolean_allowed IN (0, 1)),
    numeric_limit INTEGER NOT NULL DEFAULT 0,
    current_usage INTEGER NOT NULL DEFAULT 0,
    reset_period TEXT DEFAULT 'MONTHLY' CHECK (reset_period IN ('MONTHLY', 'ANNUAL', 'NEVER')),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(organization_id, feature_key)
);

-- 12. DEVELOPER PLATFORM (API KEYS & WEBHOOKS)
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL, -- e.g. "nxtqr_live_"
    key_hash TEXT NOT NULL UNIQUE,
    scopes_json TEXT NOT NULL DEFAULT '["qr:read"]',
    last_used_at INTEGER,
    expires_at INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    events_json TEXT NOT NULL DEFAULT '["*"]',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id TEXT PRIMARY KEY,
    endpoint_id TEXT NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    http_status INTEGER,
    response_ms INTEGER,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    next_retry_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ==============================================================================
-- INDEXES FOR HIGH-THROUGHPUT HOT PATH & REPORTING
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_status ON qr_codes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_qr_rules_qr_priority ON qr_rules(qr_id, priority);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_qr_hour ON scan_events_hourly(qr_id, hour_bucket);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_org_hour ON scan_events_hourly(organization_id, hour_bucket);
CREATE INDEX IF NOT EXISTS idx_guardian_checks_qr ON link_checks(qr_id, checked_at);
CREATE INDEX IF NOT EXISTS idx_audit_org_timestamp ON audit_logs(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
