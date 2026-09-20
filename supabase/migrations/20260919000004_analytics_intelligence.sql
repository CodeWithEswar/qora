-- ==============================================================================
-- NXTQR — Analytics & Telemetry Intelligence Migration
-- Version: 20260919000004_analytics_intelligence.sql
-- Adds rule-level telemetry, destination flows, and report jobs in Supabase.
-- ==============================================================================

-- 1. EXTEND SCAN_EVENTS_HOURLY FOR ROUTING, DESTINATION, AND TRAFFIC QUALITY
ALTER TABLE public.scan_events_hourly
    ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES public.qr_rules(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS destination_url TEXT,
    ADD COLUMN IF NOT EXISTS traffic_quality TEXT DEFAULT 'NORMAL' CHECK (traffic_quality IN ('NORMAL', 'SUSPECTED_AUTOMATION', 'BLOCKED'));

CREATE INDEX IF NOT EXISTS idx_scan_hourly_org_rule ON public.scan_events_hourly(organization_id, rule_id);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_org_quality ON public.scan_events_hourly(organization_id, traffic_quality);
CREATE INDEX IF NOT EXISTS idx_scan_hourly_org_dest ON public.scan_events_hourly(organization_id, destination_url);

-- 2. REPORT JOBS & EXPORT ARTIFACTS IN SUPABASE
CREATE TABLE IF NOT EXISTS public.report_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'csv' CHECK (format IN ('csv', 'json', 'pdf')),
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'EXPIRED')),
    range_from TIMESTAMPTZ NOT NULL,
    range_to TIMESTAMPTZ NOT NULL,
    filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    storage_path TEXT,
    file_size_bytes BIGINT,
    error_message TEXT,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_report_jobs_org ON public.report_jobs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_jobs_status ON public.report_jobs(status, created_at ASC);

-- 3. ROW-LEVEL SECURITY POLICIES FOR REPORT JOBS
ALTER TABLE public.report_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view report jobs"
    ON public.report_jobs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can create report jobs"
    ON public.report_jobs FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can delete report jobs"
    ON public.report_jobs FOR DELETE
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE user_id = auth.uid()
        )
    );
