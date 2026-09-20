-- NXTQR — Custom Domain Infrastructure & Brand Routing Control Center Migration
-- Version: 20260921000001_custom_domains_governance.sql
-- Enforces: Server-authoritative domain lifecycle, multi-tenant isolation, cascade-safe resource referencing, and verification audit.

-- 1. EXTEND OR EVOLVE public.custom_domains TABLE
ALTER TABLE public.custom_domains
    ADD COLUMN IF NOT EXISTS hostname TEXT,
    ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS verification_method TEXT NOT NULL DEFAULT 'DNS_TXT',
    ADD COLUMN IF NOT EXISTS verification_records_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS certificate_status TEXT NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS routing_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Ensure hostname is populated from domain if domain column existed
UPDATE public.custom_domains
SET hostname = lower(trim(domain))
WHERE hostname IS NULL AND domain IS NOT NULL;

-- Remove obsolete status check constraint if present and re-apply standard domain lifecycle
ALTER TABLE public.custom_domains DROP CONSTRAINT IF EXISTS custom_domains_status_check;
ALTER TABLE public.custom_domains 
    ADD CONSTRAINT custom_domains_status_check 
    CHECK (status IN ('PENDING', 'VERIFYING', 'ACTIVE', 'FAILED', 'ARCHIVED'));

ALTER TABLE public.custom_domains DROP CONSTRAINT IF EXISTS custom_domains_verification_status_check;
ALTER TABLE public.custom_domains 
    ADD CONSTRAINT custom_domains_verification_status_check 
    CHECK (verification_status IN ('PENDING', 'VERIFYING', 'VERIFIED', 'FAILED'));

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_custom_domains_updated_at ON public.custom_domains;
CREATE TRIGGER trg_custom_domains_updated_at
    BEFORE UPDATE ON public.custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 2. DOMAIN VERIFICATION ATTEMPTS (Immutable audit history of DNS checks)
CREATE TABLE IF NOT EXISTS public.domain_verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES public.custom_domains(id) ON DELETE CASCADE,
    method TEXT NOT NULL DEFAULT 'DNS_TXT',
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. LINK CUSTOM DOMAINS TO PRODUCTION RESOURCES (INTENTIONAL CASCADE: ON DELETE SET NULL)
-- Safe Deletion Rule: Deleting a Custom Domain will NEVER delete the QR Code, Landing Page, or Campaign!
ALTER TABLE public.qr_codes
    ADD COLUMN IF NOT EXISTS custom_domain_id UUID REFERENCES public.custom_domains(id) ON DELETE SET NULL;

ALTER TABLE public.landing_pages
    ADD COLUMN IF NOT EXISTS custom_domain_id UUID REFERENCES public.custom_domains(id) ON DELETE SET NULL;

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS custom_domain_id UUID REFERENCES public.custom_domains(id) ON DELETE SET NULL;

-- 4. PERFORMANCE & INTEGRITY INDEXES
CREATE INDEX IF NOT EXISTS idx_custom_domains_org_status ON public.custom_domains(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_org_updated ON public.custom_domains(organization_id, updated_at DESC);

-- Unique index: only ONE active primary domain per organization
DROP INDEX IF EXISTS idx_custom_domains_org_primary;
CREATE UNIQUE INDEX idx_custom_domains_org_primary 
ON public.custom_domains (organization_id) 
WHERE is_primary = true AND status != 'ARCHIVED';

-- Unique active hostname across all organizations
DROP INDEX IF EXISTS idx_custom_domains_hostname_active;
CREATE UNIQUE INDEX idx_custom_domains_hostname_active
ON public.custom_domains (hostname)
WHERE status != 'ARCHIVED';

-- Resource attachment indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_custom_domain ON public.qr_codes(custom_domain_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_custom_domain ON public.landing_pages(custom_domain_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_custom_domain ON public.campaigns(custom_domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_verif_domain ON public.domain_verification_attempts(domain_id, attempted_at DESC);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_verification_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view custom domains" ON public.custom_domains;
CREATE POLICY "Members can view custom domains"
    ON public.custom_domains FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert custom domains" ON public.custom_domains;
CREATE POLICY "Members can insert custom domains"
    ON public.custom_domains FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update custom domains" ON public.custom_domains;
CREATE POLICY "Members can update custom domains"
    ON public.custom_domains FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete custom domains" ON public.custom_domains;
CREATE POLICY "Members can delete custom domains"
    ON public.custom_domains FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Attempts policies
DROP POLICY IF EXISTS "Members can view verification attempts" ON public.domain_verification_attempts;
CREATE POLICY "Members can view verification attempts"
    ON public.domain_verification_attempts FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert verification attempts" ON public.domain_verification_attempts;
CREATE POLICY "Members can insert verification attempts"
    ON public.domain_verification_attempts FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));
