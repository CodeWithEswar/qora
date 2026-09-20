-- ==============================================================================
-- NXTQR — Supabase Core Foundation Migration
-- Version: 20260918000001_core_foundation.sql
-- Strictly authoritative PostgreSQL schema for multi-tenant QR infrastructure.
-- ==============================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger for automatic updated_at timestamping
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. USER PROFILES
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

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to create empty profile on Supabase auth user creation (Zero fake data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
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

-- 3. ORGANIZATIONS & WORKSPACES
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

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RBAC: ROLES & PERMISSIONS
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

-- Grant owner all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- 5. ORGANIZATION MEMBERSHIPS & TEAMS
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

-- 6. FOLDERS
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    color TEXT,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. QR CODES, WORKING DRAFTS & IMMUTABLE VERSIONS
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

CREATE TRIGGER trg_qr_codes_updated_at
    BEFORE UPDATE ON public.qr_codes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Dedicated mutable drafts (Direct debounced autosave target)
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

-- 8. QR BRAIN: INTELLIGENT ROUTING & CONDITIONS
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

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON public.qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_status ON public.qr_codes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_qr_drafts_org ON public.qr_drafts(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_versions_qr_num ON public.qr_versions(qr_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_qr_rules_qr_priority ON public.qr_rules(qr_id, priority);
CREATE INDEX IF NOT EXISTS idx_qr_resolution_snapshots_slug ON public.qr_resolution_snapshots(slug);
