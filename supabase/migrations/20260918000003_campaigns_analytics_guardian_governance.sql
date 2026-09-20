-- ==============================================================================
-- NXTQR — Campaigns, Analytics, Guardian & Governance Migration
-- Version: 20260918000003_campaigns_analytics_guardian_governance.sql
-- Complete operational layer for campaigns, telemetry, guardian, and collaboration.
-- ==============================================================================

-- 1. CAMPAIGNS & QR ORCHESTRATION LAYER
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

CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Association table for many-to-many relationship: Campaign <-> QR Codes
-- IMPORTANT ARCHITECTURAL INVARIANT:
-- Deleting a campaign cascades association rows ONLY. The underlying QR assets remain 100% intact.
CREATE TABLE IF NOT EXISTS public.campaign_qr_codes (
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(campaign_id, qr_id)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_org_status ON public.campaigns(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_created ON public.campaigns(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_qr_codes_qr ON public.campaign_qr_codes(qr_id);

-- 2. PRIVACY-AWARE TELEMETRY & ATTRIBUTION
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

CREATE INDEX IF NOT EXISTS idx_scan_hourly_qr_bucket ON public.scan_events_hourly(qr_id, hour_bucket DESC);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_org_bucket ON public.scan_events_hourly(organization_id, hour_bucket DESC);

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

-- 3. A/B DESTINATION EXPERIMENTS
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

-- 4. LINK GUARDIAN (24/7 HEALTH & AUTOMATED RECOVERY)
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

CREATE INDEX IF NOT EXISTS idx_guardian_monitors_qr ON public.guardian_monitors(qr_id, checked_at DESC);

-- 5. COLLABORATION & GOVERNANCE
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

CREATE TABLE IF NOT EXISTS public.brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    primary_color TEXT NOT NULL DEFAULT '#FA520F',
    palette_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    logo_url TEXT,
    locked_by_admin BOOLEAN NOT NULL DEFAULT false,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_resource ON public.comments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_org ON public.activity_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id, created_at DESC);
