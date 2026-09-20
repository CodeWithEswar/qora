-- NXTQR — Guardian Reliability & Automatic Fallback Control Center Migration
-- Version: 20260921000002_guardian_infrastructure.sql
-- Enforces: Server-authoritative monitor state, bounded observation history, incident lifecycle, fallback policies, and tenant isolation.

-- 1. EVOLVE public.guardian_monitors TABLE
ALTER TABLE public.guardian_monitors
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS destination_url TEXT,
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS current_health TEXT NOT NULL DEFAULT 'UNKNOWN',
    ADD COLUMN IF NOT EXISTS check_interval_sec INTEGER NOT NULL DEFAULT 300,
    ADD COLUMN IF NOT EXISTS timeout_ms INTEGER NOT NULL DEFAULT 5000,
    ADD COLUMN IF NOT EXISTS failure_threshold INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN IF NOT EXISTS recovery_threshold INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS consecutive_successes INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_state_changed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Allow standalone destination monitors without required qr_id attachment
ALTER TABLE public.guardian_monitors ALTER COLUMN qr_id DROP NOT NULL;
ALTER TABLE public.guardian_monitors ALTER COLUMN checked_url DROP NOT NULL;
ALTER TABLE public.guardian_monitors ALTER COLUMN response_time_ms DROP NOT NULL;
ALTER TABLE public.guardian_monitors ALTER COLUMN response_time_ms SET DEFAULT 0;

-- Backfill organization_id and destination_url from qr_codes if present
UPDATE public.guardian_monitors gm
SET 
    organization_id = qc.organization_id,
    destination_url = COALESCE(gm.checked_url, 'https://example.com'),
    name = COALESCE(gm.name, qc.name, 'Destination Monitor')
FROM public.qr_codes qc
WHERE gm.qr_id = qc.id AND gm.organization_id IS NULL;

-- Remove old constraint on status and apply active monitor statuses
ALTER TABLE public.guardian_monitors DROP CONSTRAINT IF EXISTS guardian_monitors_status_check;
ALTER TABLE public.guardian_monitors
    ADD CONSTRAINT guardian_monitors_status_check
    CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED', 'HEALTHY', 'DEGRADED', 'DOWN'));

-- Health state constraint
ALTER TABLE public.guardian_monitors DROP CONSTRAINT IF EXISTS guardian_monitors_current_health_check;
ALTER TABLE public.guardian_monitors
    ADD CONSTRAINT guardian_monitors_current_health_check
    CHECK (current_health IN ('HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN', 'PAUSED'));

-- 2. CREATE public.guardian_observations TABLE (Bounded historical samples)
CREATE TABLE IF NOT EXISTS public.guardian_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    monitor_id UUID REFERENCES public.guardian_monitors(id) ON DELETE CASCADE,
    qr_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    result TEXT NOT NULL CHECK (result IN ('HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'TIMEOUT', 'DNS_ERROR', 'TLS_ERROR', 'HTTP_ERROR')),
    http_status INTEGER,
    duration_ms INTEGER NOT NULL,
    tls_valid BOOLEAN NOT NULL DEFAULT true,
    failure_reason TEXT,
    checked_url TEXT NOT NULL
);

-- 3. EVOLVE public.guardian_incidents TABLE
ALTER TABLE public.guardian_incidents
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS monitor_id UUID REFERENCES public.guardian_monitors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS triggering_observation_id UUID REFERENCES public.guardian_observations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS timeline_events_json JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Allow incidents on standalone monitors without required qr_id
ALTER TABLE public.guardian_incidents ALTER COLUMN qr_id DROP NOT NULL;

-- Backfill organization_id on guardian_incidents from qr_codes
UPDATE public.guardian_incidents gi
SET organization_id = qc.organization_id
FROM public.qr_codes qc
WHERE gi.qr_id = qc.id AND gi.organization_id IS NULL;

-- 4. EVOLVE public.fallback_policies TABLE
ALTER TABLE public.fallback_policies
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS monitor_id UUID REFERENCES public.guardian_monitors(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Allow fallback policies on monitors without required qr_id
ALTER TABLE public.fallback_policies ALTER COLUMN qr_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fallback_policies_monitor_id ON public.fallback_policies(monitor_id) WHERE monitor_id IS NOT NULL;

-- Backfill organization_id on fallback_policies from qr_codes
UPDATE public.fallback_policies fp
SET organization_id = qc.organization_id
FROM public.qr_codes qc
WHERE fp.qr_id = qc.id AND fp.organization_id IS NULL;

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_guardian_monitors_org_health 
    ON public.guardian_monitors(organization_id, current_health);

CREATE INDEX IF NOT EXISTS idx_guardian_monitors_org_status 
    ON public.guardian_monitors(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_guardian_obs_monitor_time 
    ON public.guardian_observations(monitor_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_guardian_obs_org_time 
    ON public.guardian_observations(organization_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_guardian_incidents_org_started 
    ON public.guardian_incidents(organization_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_guardian_incidents_active 
    ON public.guardian_incidents(organization_id, status) 
    WHERE status != 'RESOLVED';

CREATE INDEX IF NOT EXISTS idx_fallback_policies_org 
    ON public.fallback_policies(organization_id);

-- 6. ROW LEVEL SECURITY (Strict Multi-Tenant Isolation)
ALTER TABLE public.guardian_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fallback_policies ENABLE ROW LEVEL SECURITY;

-- Monitors policies
DROP POLICY IF EXISTS "Members can view guardian monitors" ON public.guardian_monitors;
CREATE POLICY "Members can view guardian monitors"
    ON public.guardian_monitors FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can manage guardian monitors" ON public.guardian_monitors;
CREATE POLICY "Members can manage guardian monitors"
    ON public.guardian_monitors FOR ALL
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Observations policies
DROP POLICY IF EXISTS "Members can view guardian observations" ON public.guardian_observations;
CREATE POLICY "Members can view guardian observations"
    ON public.guardian_observations FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can manage guardian observations" ON public.guardian_observations;
CREATE POLICY "Members can manage guardian observations"
    ON public.guardian_observations FOR ALL
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Incidents policies
DROP POLICY IF EXISTS "Members can view guardian incidents" ON public.guardian_incidents;
CREATE POLICY "Members can view guardian incidents"
    ON public.guardian_incidents FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can manage guardian incidents" ON public.guardian_incidents;
CREATE POLICY "Members can manage guardian incidents"
    ON public.guardian_incidents FOR ALL
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Fallback policies
DROP POLICY IF EXISTS "Members can view fallback policies" ON public.fallback_policies;
CREATE POLICY "Members can view fallback policies"
    ON public.fallback_policies FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can manage fallback policies" ON public.fallback_policies;
CREATE POLICY "Members can manage fallback policies"
    ON public.fallback_policies FOR ALL
    TO authenticated
    USING (public.is_org_member(organization_id));
