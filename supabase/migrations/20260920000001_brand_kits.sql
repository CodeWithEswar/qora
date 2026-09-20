-- ==============================================================================
-- NXTQR — Brand Kits: Premium Brand Identity Control System Migration
-- Version: 20260920000001_brand_kits.sql
-- Relational identity, design tokens, typography, logos, QR style presets,
-- immutable version snapshots, foreign key cascade safety, and strict RLS.
-- ==============================================================================

-- 1. ENHANCE public.brand_kits TABLE
ALTER TABLE public.brand_kits
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS colors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS typography_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS logos_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS qr_presets_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS guidelines_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS governance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS published_revision INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Backfill slug if null
UPDATE public.brand_kits
SET slug = COALESCE(NULLIF(trim(both '-' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))), ''), 'brand') || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.brand_kits ALTER COLUMN slug SET NOT NULL;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_brand_kits_updated_at ON public.brand_kits;
CREATE TRIGGER trg_brand_kits_updated_at
    BEFORE UPDATE ON public.brand_kits
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Indexes for performance and uniqueness
CREATE INDEX IF NOT EXISTS idx_brand_kits_org_updated ON public.brand_kits(organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_kits_org_status ON public.brand_kits(organization_id, status);

-- Unique index: only ONE default active brand kit per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_kits_org_default 
ON public.brand_kits (organization_id) 
WHERE is_default = true AND status != 'ARCHIVED';

-- 2. IMMUTABLE BRAND KIT VERSIONS TABLE
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

CREATE INDEX IF NOT EXISTS idx_brand_kit_versions_kit_num 
ON public.brand_kit_versions(brand_kit_id, version_number DESC);

-- Trigger to protect immutable published versions from UPDATE or DELETE
CREATE OR REPLACE FUNCTION public.protect_immutable_brand_kit_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'CANNOT UPDATE IMMUTABLE BRAND KIT VERSION: Published versions are tamper-evident and read-only.';
    END IF;
    IF (TG_OP = 'DELETE' AND CURRENT_USER != 'postgres') THEN
        RAISE EXCEPTION 'CANNOT DELETE IMMUTABLE BRAND KIT VERSION: Published revisions cannot be deleted individually.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS trg_immutable_brand_kit_versions ON public.brand_kit_versions;
CREATE TRIGGER trg_immutable_brand_kit_versions
    BEFORE UPDATE OR DELETE ON public.brand_kit_versions
    FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_brand_kit_versions();

-- 3. LINK BRAND KITS TO PRODUCTION RESOURCES (INTENTIONAL CASCADE: ON DELETE SET NULL)
-- Deleting a Brand Kit will NEVER delete the QR Code, Landing Page, or Campaign!
ALTER TABLE public.qr_codes
    ADD COLUMN IF NOT EXISTS brand_kit_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS brand_version_number INTEGER;

ALTER TABLE public.landing_pages
    ADD COLUMN IF NOT EXISTS brand_kit_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL;

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS brand_kit_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_qr_codes_brand_kit ON public.qr_codes(brand_kit_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_brand_kit ON public.landing_pages(brand_kit_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_kit ON public.campaigns(brand_kit_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kit_versions ENABLE ROW LEVEL SECURITY;

-- public.brand_kits Policies
DROP POLICY IF EXISTS "Members can view organization brand kits" ON public.brand_kits;
CREATE POLICY "Members can view organization brand kits"
    ON public.brand_kits FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert organization brand kits" ON public.brand_kits;
CREATE POLICY "Members can insert organization brand kits"
    ON public.brand_kits FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update organization brand kits" ON public.brand_kits;
CREATE POLICY "Members can update organization brand kits"
    ON public.brand_kits FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete organization brand kits" ON public.brand_kits;
CREATE POLICY "Members can delete organization brand kits"
    ON public.brand_kits FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- public.brand_kit_versions Policies
DROP POLICY IF EXISTS "Members can view brand kit versions" ON public.brand_kit_versions;
CREATE POLICY "Members can view brand kit versions"
    ON public.brand_kit_versions FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert brand kit versions" ON public.brand_kit_versions;
CREATE POLICY "Members can insert brand kit versions"
    ON public.brand_kit_versions FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

-- 5. SEED RBAC PERMISSIONS FOR BRAND KITS
INSERT INTO public.permissions (code, category, description) VALUES
    ('brand.read', 'brand', 'View brand kits, tokens, assets, guidelines, and versions'),
    ('brand.create', 'brand', 'Create new organization brand kits'),
    ('brand.update', 'brand', 'Modify brand tokens, typography, logos, and QR presets'),
    ('brand.publish', 'brand', 'Publish immutable revisions of brand kits'),
    ('brand.delete', 'brand', 'Archive or delete organization brand kits')
ON CONFLICT (code) DO NOTHING;

-- Grant owner all brand permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions WHERE category = 'brand'
ON CONFLICT DO NOTHING;

-- Grant admin all brand permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM public.permissions WHERE category = 'brand'
ON CONFLICT DO NOTHING;

-- Grant member read, create, update, and publish
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM public.permissions 
WHERE code IN ('brand.read', 'brand.create', 'brand.update', 'brand.publish')
ON CONFLICT DO NOTHING;

-- Grant viewer read only
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM public.permissions 
WHERE code = 'brand.read'
ON CONFLICT DO NOTHING;
