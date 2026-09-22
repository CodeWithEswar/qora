-- ==============================================================================
-- NXTQR — Migration: Audit Intelligence & Evidence Ledger
-- Enhances public.audit_logs with structured forensic evidence fields,
-- performance indexes, and strict multi-tenant boundary policies.
-- ==============================================================================

-- 1. Ensure public.audit_logs exists and has rich evidence columns
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata_json JSONB,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drop NOT NULL on resource_id if it was set previously, to support flexible target IDs
ALTER TABLE public.audit_logs ALTER COLUMN resource_id DROP NOT NULL;

-- Add rich forensic evidence fields
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS actor_type TEXT DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS actor_snapshot JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS target_type TEXT,
    ADD COLUMN IF NOT EXISTS target_id TEXT,
    ADD COLUMN IF NOT EXISTS target_snapshot JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS result TEXT DEFAULT 'success',
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web_ui',
    ADD COLUMN IF NOT EXISTS request_id TEXT,
    ADD COLUMN IF NOT EXISTS correlation_id TEXT,
    ADD COLUMN IF NOT EXISTS changes JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS authorization_context JSONB DEFAULT '{}'::jsonb;

-- Backfill target_type and target_id from legacy columns if empty
UPDATE public.audit_logs
SET 
    target_type = COALESCE(target_type, resource_type),
    target_id = COALESCE(target_id, resource_id::text)
WHERE target_type IS NULL OR target_id IS NULL;

-- 2. Create optimized query indexes for audit investigations
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created 
    ON public.audit_logs(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_actor 
    ON public.audit_logs(organization_id, actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_action 
    ON public.audit_logs(organization_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_category 
    ON public.audit_logs(organization_id, category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_correlation 
    ON public.audit_logs(organization_id, correlation_id) 
    WHERE correlation_id IS NOT NULL;

-- 3. Row-Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view audit logs" ON public.audit_logs;
CREATE POLICY "Members can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Prevent direct client modifications
DROP POLICY IF EXISTS "Clients cannot modify audit logs" ON public.audit_logs;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM authenticated, anon;
