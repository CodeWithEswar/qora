-- ==============================================================================
-- NXTQR — Comprehensive Supabase Production Database Schema
-- File: supabase/schema.sql
-- Architecture: PostgreSQL 15+ with Strict Multi-Tenancy, Google Auth,
--               Canonical RBAC, Immutable QR Versions, Real Telemetry,
--               Cashfree Minor-Unit Billing, Storage Policies, and RLS.
--
-- Instructions:
-- Execute this file in the Supabase Dashboard SQL Editor (or via psql / CLI).
-- It is 100% idempotent and can be safely re-run without dropping active data.
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS & UTILITIES
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Standard timestamp updater function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. USER PROFILES & AUTHENTICATION HOOK
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    locale TEXT NOT NULL DEFAULT 'en',
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Automatic profile creation on Supabase Auth (Google OAuth) sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(COALESCE(NEW.email, 'user'), '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = CASE WHEN profiles.display_name = '' THEN EXCLUDED.display_name ELSE profiles.display_name END,
        avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. ORGANIZATIONS & WORKSPACES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    billing_plan TEXT NOT NULL DEFAULT 'FREE' CHECK (billing_plan IN ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 4. RBAC: ROLES & PERMISSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

-- Seed System Permissions
INSERT INTO public.permissions (code, category, description) VALUES
    ('qr:read', 'qr', 'View QR codes and draft details'),
    ('qr:create', 'qr', 'Create new QR assets'),
    ('qr:update', 'qr', 'Update QR content and design drafts'),
    ('qr:publish', 'qr', 'Publish new immutable revisions'),
    ('qr:delete', 'qr', 'Archive or delete QR assets'),
    ('campaign:read', 'campaign', 'View campaigns and associations'),
    ('campaign:manage', 'campaign', 'Create, update, and manage campaigns'),
    ('analytics:read', 'analytics', 'View scan telemetry and reports'),
    ('org:admin', 'organization', 'Manage organization settings and members'),
    ('org:billing', 'organization', 'Manage subscriptions and payment methods')
ON CONFLICT (code) DO NOTHING;

-- Seed Default System Roles
INSERT INTO public.roles (id, code, name, description, is_system) VALUES
    ('00000000-0000-0000-0000-000000000001', 'OWNER', 'Owner', 'Full organization control and billing', true),
    ('00000000-0000-0000-0000-000000000002', 'ADMIN', 'Admin', 'Administrative access to workspace assets', true),
    ('00000000-0000-0000-0000-000000000003', 'MEMBER', 'Member', 'Standard creation and editing rights', true),
    ('00000000-0000-0000-0000-000000000004', 'VIEWER', 'Viewer', 'Read-only access to published QRs and analytics', true)
ON CONFLICT (id) DO NOTHING;

-- Grant Owner all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Grant Admin operational permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM public.permissions
WHERE code NOT IN ('org:billing')
ON CONFLICT DO NOTHING;

-- Grant Member creation and editing permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM public.permissions
WHERE code IN ('qr:read', 'qr:create', 'qr:update', 'qr:publish', 'campaign:read', 'campaign:manage', 'analytics:read')
ON CONFLICT DO NOTHING;

-- Grant Viewer read permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM public.permissions
WHERE code IN ('qr:read', 'campaign:read', 'analytics:read')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 5. MEMBERSHIPS, TEAMS & INVITATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    legacy_id TEXT UNIQUE,
    UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.member_roles (
    membership_id UUID NOT NULL REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY(membership_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(team_id, membership_id)
);

CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. FOLDERS & BRAND KITS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    color TEXT,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    is_default BOOLEAN NOT NULL DEFAULT false,
    primary_color TEXT NOT NULL DEFAULT '#FA520F',
    palette_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    colors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    typography_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    logos_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    qr_presets_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    guidelines_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    governance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    logo_url TEXT,
    locked_by_admin BOOLEAN NOT NULL DEFAULT false,
    published_revision INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.brand_kit_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    brand_kit_id UUID NOT NULL REFERENCES public.brand_kits(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    snapshot_json JSONB NOT NULL,
    change_summary TEXT NOT NULL DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(brand_kit_id, version_number)
);


-- ==============================================================================
-- 7. QR CODES, WORKING DRAFTS & IMMUTABLE VERSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    qr_type TEXT NOT NULL DEFAULT 'url' CHECK (qr_type IN ('url', 'vcard', 'wifi', 'email', 'phone', 'sms', 'whatsapp', 'app', 'payment', 'location', 'pdf', 'text', 'event')),
    is_dynamic BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'SCHEDULED', 'EXPIRED', 'ARCHIVED')),
    published_revision INTEGER NOT NULL DEFAULT 1,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_qr_codes_updated_at ON public.qr_codes;
CREATE TRIGGER trg_qr_codes_updated_at
    BEFORE UPDATE ON public.qr_codes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Dedicated mutable drafts (Direct debounced autosave target in React memory)
CREATE TABLE IF NOT EXISTS public.qr_drafts (
    qr_id UUID PRIMARY KEY REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    draft_version INTEGER NOT NULL DEFAULT 1,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    destination_json JSONB,
    routing_json JSONB,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_qr_drafts_updated_at ON public.qr_drafts;
CREATE TRIGGER trg_qr_drafts_updated_at
    BEFORE UPDATE ON public.qr_drafts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Immutable published revisions (Strict audit & rollback history)
CREATE TABLE IF NOT EXISTS public.qr_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    destination_json JSONB,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    routing_json JSONB,
    change_summary TEXT NOT NULL DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    legacy_id TEXT UNIQUE,
    UNIQUE(qr_id, version_number)
);

-- Trigger to strictly protect immutable versions from UPDATE or DELETE
CREATE OR REPLACE FUNCTION public.protect_immutable_qr_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'CANNOT UPDATE IMMUTABLE QR VERSION: Published versions are tamper-evident and read-only.';
    END IF;
    IF (TG_OP = 'DELETE' AND CURRENT_USER != 'postgres') THEN
        RAISE EXCEPTION 'CANNOT DELETE IMMUTABLE QR VERSION: Published revisions cannot be deleted individually.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_qr_versions ON public.qr_versions;
CREATE TRIGGER trg_immutable_qr_versions
    BEFORE UPDATE OR DELETE ON public.qr_versions
    FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_qr_versions();

-- Resolution snapshot compiled for ultra-fast edge lookup
CREATE TABLE IF NOT EXISTS public.qr_resolution_snapshots (
    qr_id UUID PRIMARY KEY REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    revision INTEGER NOT NULL,
    snapshot_json JSONB NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 8. QR BRAIN: INTELLIGENT ROUTING RULES & CONDITIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.qr_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    destination_url TEXT NOT NULL,
    destination_id TEXT,
    match_type TEXT NOT NULL DEFAULT 'ALL' CHECK (match_type IN ('ALL', 'ANY')),
    action_type TEXT NOT NULL DEFAULT 'redirect' CHECK (action_type IN ('redirect', 'experiment', 'fallback', 'webhook')),
    conditions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qr_rule_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES public.qr_rules(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('country', 'region', 'device', 'os', 'browser', 'language', 'time_window', 'date_range', 'weekday', 'campaign_state', 'custom')),
    operator TEXT NOT NULL CHECK (operator IN ('eq', 'neq', 'in', 'nin', 'between', 'contains')),
    value_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 9. CAMPAIGNS & ORCHESTRATION LAYER
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    budget_minor BIGINT,
    budget_inr NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Association table for many-to-many relationship: Campaign <-> QR Codes
-- IMPORTANT ARCHITECTURAL INVARIANT:
-- Deleting a campaign cascades association rows ONLY. Underlying QR codes remain 100% intact!
CREATE TABLE IF NOT EXISTS public.campaign_qr_codes (
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(campaign_id, qr_id)
);

-- ==============================================================================
-- 10. PRIVACY-AWARE TELEMETRY & ATTRIBUTION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.scan_events_hourly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    hour_bucket TIMESTAMPTZ NOT NULL,
    total_scans INTEGER NOT NULL DEFAULT 1,
    unique_scans INTEGER NOT NULL DEFAULT 1,
    country_code TEXT DEFAULT 'XX',
    region TEXT DEFAULT 'Unknown',
    device_type TEXT DEFAULT 'mobile',
    os_name TEXT DEFAULT 'Unknown',
    browser_name TEXT DEFAULT 'Unknown',
    referrer TEXT DEFAULT 'direct'
);

CREATE TABLE IF NOT EXISTS public.conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_value NUMERIC(12, 2),
    currency TEXT DEFAULT 'INR',
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experiments & Variant A/B testing
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiment_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    traffic_weight REAL NOT NULL DEFAULT 50.0,
    total_scans INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    scanner_token_hash TEXT NOT NULL,
    variant_id UUID NOT NULL REFERENCES public.experiment_variants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(experiment_id, scanner_token_hash)
);

-- ==============================================================================
-- 11. LINK GUARDIAN (24/7 HEALTH & AUTOMATED RECOVERY)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.guardian_monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    checked_url TEXT NOT NULL,
    http_status INTEGER,
    response_time_ms INTEGER NOT NULL,
    tls_valid BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'DOWN')),
    failure_reason TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guardian_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    failure_reason TEXT NOT NULL,
    fallback_triggered BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.fallback_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE UNIQUE,
    failure_threshold INTEGER NOT NULL DEFAULT 3,
    backup_url TEXT NOT NULL,
    auto_switch BOOLEAN NOT NULL DEFAULT true,
    notify_emails JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ==============================================================================
-- 12. COLLABORATION & GOVERNANCE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('qr', 'route', 'campaign')),
    resource_id UUID NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comment_mentions (
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY(comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_version_id UUID NOT NULL REFERENCES public.qr_versions(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    decision_note TEXT,
    decided_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    metadata_json JSONB,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 13. BILLING PLANS, CASHFREE PAYMENTS & ENTITLEMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY CHECK (id IN ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE')),
    name TEXT NOT NULL,
    tier_level INTEGER NOT NULL,
    monthly_price_minor BIGINT NOT NULL DEFAULT 0,
    annual_price_minor BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_features (
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    numeric_limit INTEGER,
    boolean_allowed BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY(plan_id, feature_key)
);

-- Seed Default Plans with Minor Units (paisa)
INSERT INTO public.plans (id, name, tier_level, monthly_price_minor, annual_price_minor) VALUES
    ('FREE', 'Starter Free', 0, 0, 0),
    ('PRO', 'Professional', 1, 99900, 999000),          -- ₹999/mo, ₹9,990/yr
    ('BUSINESS', 'Business Suite', 2, 299900, 2999000),     -- ₹2,999/mo, ₹29,990/yr
    ('ENTERPRISE', 'Enterprise Infrastructure', 3, 999900, 9999000)
ON CONFLICT (id) DO UPDATE SET
    monthly_price_minor = EXCLUDED.monthly_price_minor,
    annual_price_minor = EXCLUDED.annual_price_minor;

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCEL_SCHEDULED', 'CANCELLED', 'EXPIRED')),
    cashfree_subscription_id TEXT,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CRITICAL FINANCIAL INVARIANT:
-- Payments reference organizations with ON DELETE RESTRICT so ledger records are never deleted!
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    cashfree_order_id TEXT NOT NULL UNIQUE,
    amount_minor BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'USER_DROPPED')),
    payment_method TEXT,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    raw_payload_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    boolean_allowed BOOLEAN NOT NULL DEFAULT true,
    numeric_limit INTEGER NOT NULL DEFAULT 0,
    current_usage INTEGER NOT NULL DEFAULT 0,
    reset_period TEXT DEFAULT 'MONTHLY' CHECK (reset_period IN ('MONTHLY', 'ANNUAL', 'NEVER')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, feature_key)
);

-- ==============================================================================
-- 14. DEVELOPER PLATFORM (API KEYS & WEBHOOKS) & DOMAINS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL, -- e.g. "nxtqr_live_"
    key_hash TEXT NOT NULL UNIQUE,
    scopes JSONB NOT NULL DEFAULT '["qr:read"]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '["*"]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload_json JSONB NOT NULL,
    http_status INTEGER,
    response_ms INTEGER,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFYING', 'ACTIVE', 'ERROR', 'SUSPENDED')),
    verification_token TEXT NOT NULL,
    ssl_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 15. STORAGE BUCKETS & FILE ASSET METADATA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.file_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL,
    object_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Ensure default buckets exist in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('brand-assets', 'brand-assets', false, 20971520, NULL),
    ('qr-assets', 'qr-assets', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']),
    ('files', 'files', false, 104857600, NULL),
    ('reports', 'reports', false, 52428800, ARRAY['application/pdf', 'text/csv', 'application/json']),
    ('exports', 'exports', false, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 16. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON public.qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_status ON public.qr_codes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_qr_drafts_org ON public.qr_drafts(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_versions_qr_num ON public.qr_versions(qr_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_qr_rules_qr_priority ON public.qr_rules(qr_id, priority);
CREATE INDEX IF NOT EXISTS idx_qr_resolution_snapshots_slug ON public.qr_resolution_snapshots(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_status ON public.campaigns(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_created ON public.campaigns(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_qr_codes_qr ON public.campaign_qr_codes(qr_id);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_qr_bucket ON public.scan_events_hourly(qr_id, hour_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_org_bucket ON public.scan_events_hourly(organization_id, hour_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_guardian_monitors_qr ON public.guardian_monitors(qr_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_resource ON public.comments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_org ON public.activity_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_webhooks_endpoint ON public.webhook_deliveries(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_file_assets_org ON public.file_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_bucket_path ON public.file_assets(bucket, object_path);

-- ==============================================================================
-- 17. ROW LEVEL SECURITY (RLS) & MULTI-TENANT AUTHORIZATION
-- ==============================================================================

-- Canonical membership and permission evaluator functions (Hardened & Advisor-Compliant)
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_memberships
        WHERE organization_id = target_org_id
          AND user_id = (SELECT auth.uid())
          AND status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.has_org_permission(target_org_id UUID, req_perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_memberships om
        JOIN public.member_roles mr ON mr.membership_id = om.id
        JOIN public.role_permissions rp ON rp.role_id = mr.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE om.organization_id = target_org_id
          AND om.user_id = (SELECT auth.uid())
          AND om.status = 'active'
          AND p.code = req_perm
    );
$$;

REVOKE EXECUTE ON FUNCTION public.has_org_permission(UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_org_permission(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated, service_role;

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_resolution_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_events_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fallback_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- ------------------------------------------------------------------------------
-- Organizations Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members can view their organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (public.is_org_member(id));

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS "Admins can update their organizations" ON public.organizations;
CREATE POLICY "Admins can update their organizations"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (public.is_org_member(id))
    WITH CHECK (public.is_org_member(id));

-- ------------------------------------------------------------------------------
-- Memberships Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view workspace memberships" ON public.organization_memberships;
CREATE POLICY "Members can view workspace memberships"
    ON public.organization_memberships FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- QR Codes Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view their organization QR codes" ON public.qr_codes;
CREATE POLICY "Members can view their organization QR codes"
    ON public.qr_codes FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert QR codes" ON public.qr_codes;
CREATE POLICY "Members can insert QR codes"
    ON public.qr_codes FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update QR codes" ON public.qr_codes;
CREATE POLICY "Members can update QR codes"
    ON public.qr_codes FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete QR codes" ON public.qr_codes;
CREATE POLICY "Members can delete QR codes"
    ON public.qr_codes FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- QR Working Drafts Policies (Autosave Target)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view drafts" ON public.qr_drafts;
CREATE POLICY "Members can view drafts"
    ON public.qr_drafts FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert drafts" ON public.qr_drafts;
CREATE POLICY "Members can insert drafts"
    ON public.qr_drafts FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update drafts" ON public.qr_drafts;
CREATE POLICY "Members can update drafts"
    ON public.qr_drafts FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- QR Versions (Immutable Published Revisions)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view versions" ON public.qr_versions;
CREATE POLICY "Members can view versions"
    ON public.qr_versions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_versions.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

DROP POLICY IF EXISTS "Members can insert new versions" ON public.qr_versions;
CREATE POLICY "Members can insert new versions"
    ON public.qr_versions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_versions.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

-- ------------------------------------------------------------------------------
-- Resolution Snapshots Policies (Public Read for Short Redirect)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view resolution snapshots" ON public.qr_resolution_snapshots;
CREATE POLICY "Public can view resolution snapshots"
    ON public.qr_resolution_snapshots FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Members can manage resolution snapshots" ON public.qr_resolution_snapshots;
CREATE POLICY "Members can manage resolution snapshots"
    ON public.qr_resolution_snapshots FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_resolution_snapshots.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

-- ------------------------------------------------------------------------------
-- Campaigns Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view campaigns" ON public.campaigns;
CREATE POLICY "Members can view campaigns"
    ON public.campaigns FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert campaigns" ON public.campaigns;
CREATE POLICY "Members can insert campaigns"
    ON public.campaigns FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update campaigns" ON public.campaigns;
CREATE POLICY "Members can update campaigns"
    ON public.campaigns FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete campaigns" ON public.campaigns;
CREATE POLICY "Members can delete campaigns"
    ON public.campaigns FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- Campaign QR Associations Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view campaign qr associations" ON public.campaign_qr_codes;
CREATE POLICY "Members can view campaign qr associations"
    ON public.campaign_qr_codes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_qr_codes.campaign_id
              AND public.is_org_member(c.organization_id)
        )
    );

DROP POLICY IF EXISTS "Members can manage campaign qr associations" ON public.campaign_qr_codes;
CREATE POLICY "Members can manage campaign qr associations"
    ON public.campaign_qr_codes FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_qr_codes.campaign_id
              AND public.is_org_member(c.organization_id)
        )
    );

-- ------------------------------------------------------------------------------
-- Telemetry Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view scan telemetry" ON public.scan_events_hourly;
CREATE POLICY "Members can view scan telemetry"
    ON public.scan_events_hourly FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- Billing & Plans Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans"
    ON public.plans FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Anyone can view plan features" ON public.plan_features;
CREATE POLICY "Anyone can view plan features"
    ON public.plan_features FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Members can view their subscription" ON public.subscriptions;
CREATE POLICY "Members can view their subscription"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view their payments" ON public.payments;
CREATE POLICY "Members can view their payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view their entitlements" ON public.entitlements;
CREATE POLICY "Members can view their entitlements"
    ON public.entitlements FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- Developer Platform Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view api keys" ON public.api_keys;
CREATE POLICY "Members can view api keys"
    ON public.api_keys FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view webhook endpoints" ON public.webhook_endpoints;
CREATE POLICY "Members can view webhook endpoints"
    ON public.webhook_endpoints FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view custom domains" ON public.custom_domains;
CREATE POLICY "Members can view custom domains"
    ON public.custom_domains FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- Collaboration Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view comments" ON public.comments;
CREATE POLICY "Members can view comments"
    ON public.comments FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert comments" ON public.comments;
CREATE POLICY "Members can insert comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id) AND (SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Members can view activity events" ON public.activity_events;
CREATE POLICY "Members can view activity events"
    ON public.activity_events FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view audit logs" ON public.audit_logs;
CREATE POLICY "Members can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- ==============================================================================
-- 18. STORAGE OBJECTS ROW LEVEL SECURITY POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND
        (SELECT auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (SELECT auth.uid())::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'avatars' AND
        (SELECT auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (SELECT auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Public can view qr assets" ON storage.objects;
CREATE POLICY "Public can view qr assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'qr-assets');

DROP POLICY IF EXISTS "Authenticated users can upload qr assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload qr assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'qr-assets');

DROP POLICY IF EXISTS "Authenticated users can update qr assets" ON storage.objects;
CREATE POLICY "Authenticated users can update qr assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'qr-assets')
    WITH CHECK (bucket_id = 'qr-assets');

-- ==============================================================================
-- 19. DATA API PERMISSIONS (POSTGREST EXPOSURE)
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Public can read compiled resolution snapshots for fast short-slug redirects
GRANT SELECT ON public.qr_resolution_snapshots TO anon;
GRANT SELECT ON public.plans TO anon;
GRANT SELECT ON public.plan_features TO anon;

-- ==============================================================================
-- END OF NXTQR SUPABASE PRODUCTION DATABASE SCHEMA
-- ==============================================================================
