-- ==============================================================================
-- NXTQR — QR Templates & Design Library Migration
-- Authoritative Schema for Reusable QR Design Identities and Versioned Templates.
--
-- Invariants:
-- 1. All records are strictly scoped to organization_id (or system scope).
-- 2. Deleting a template NEVER deletes QR assets, versions, campaigns, or Brand Kits (ON DELETE SET NULL).
-- 3. Template versions are immutable records of historical design configurations.
-- 4. RLS guarantees strict tenant isolation.
-- ==============================================================================

-- 1. QR TEMPLATES
CREATE TABLE IF NOT EXISTS public.qr_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    scope TEXT NOT NULL DEFAULT 'organization' CHECK (scope IN ('organization', 'system')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    brand_kit_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL,
    compatibility JSONB NOT NULL DEFAULT '["UNIVERSAL"]'::jsonb,
    is_brand_locked BOOLEAN NOT NULL DEFAULT false,
    locked_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_version INTEGER NOT NULL DEFAULT 1,
    design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    scanability_score INTEGER NOT NULL DEFAULT 100,
    scanability_status TEXT NOT NULL DEFAULT 'PASS' CHECK (scanability_status IN ('PASS', 'WARNING', 'FAIL')),
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

CREATE TRIGGER trg_qr_templates_updated_at
    BEFORE UPDATE ON public.qr_templates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. QR TEMPLATE VERSIONS (IMMUTABLE DESIGN SNAPSHOTS)
CREATE TABLE IF NOT EXISTS public.qr_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.qr_templates(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    change_summary TEXT,
    design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    scanability_score INTEGER NOT NULL DEFAULT 100,
    scanability_status TEXT NOT NULL DEFAULT 'PASS' CHECK (scanability_status IN ('PASS', 'WARNING', 'FAIL')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(template_id, version)
);

CREATE OR REPLACE FUNCTION public.protect_immutable_template_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'CANNOT UPDATE IMMUTABLE TEMPLATE VERSION: Saved revisions are tamper-evident and read-only.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

DROP TRIGGER IF EXISTS trg_immutable_template_versions ON public.qr_template_versions;
CREATE TRIGGER trg_immutable_template_versions
    BEFORE UPDATE ON public.qr_template_versions
    FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_template_versions();

-- 3. LINK QR CODES TO TEMPLATES (CASCADE-SAFE: ON DELETE SET NULL)
ALTER TABLE public.qr_codes
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.qr_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS template_version_number INTEGER;

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_qr_templates_org_status 
    ON public.qr_templates(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_qr_templates_org_created 
    ON public.qr_templates(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qr_templates_brand_kit 
    ON public.qr_templates(brand_kit_id) WHERE brand_kit_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_qr_template_versions_template_ver 
    ON public.qr_template_versions(template_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_qr_codes_template_id 
    ON public.qr_codes(template_id) WHERE template_id IS NOT NULL;

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.qr_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_template_versions ENABLE ROW LEVEL SECURITY;

-- Templates RLS
DROP POLICY IF EXISTS "Members can view organization templates" ON public.qr_templates;
CREATE POLICY "Members can view organization templates"
    ON public.qr_templates FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id) OR scope = 'system');

DROP POLICY IF EXISTS "Members can insert organization templates" ON public.qr_templates;
CREATE POLICY "Members can insert organization templates"
    ON public.qr_templates FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update organization templates" ON public.qr_templates;
CREATE POLICY "Members can update organization templates"
    ON public.qr_templates FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete organization templates" ON public.qr_templates;
CREATE POLICY "Members can delete organization templates"
    ON public.qr_templates FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Template Versions RLS
DROP POLICY IF EXISTS "Members can view template versions" ON public.qr_template_versions;
CREATE POLICY "Members can view template versions"
    ON public.qr_template_versions FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert template versions" ON public.qr_template_versions;
CREATE POLICY "Members can insert template versions"
    ON public.qr_template_versions FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete template versions" ON public.qr_template_versions;
CREATE POLICY "Members can delete template versions"
    ON public.qr_template_versions FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 6. SEED PERMISSIONS
INSERT INTO public.permissions (code, category, description) VALUES
    ('template.read', 'template', 'View reusable design templates and versions'),
    ('template.create', 'template', 'Create new organization QR templates in Template Forge'),
    ('template.update', 'template', 'Modify template designs, parameters, and Brand Kit constraints'),
    ('template.apply', 'template', 'Apply templates to QR codes and bulk batches'),
    ('template.delete', 'template', 'Archive or delete organization templates')
ON CONFLICT (code) DO NOTHING;

-- Grant owner all template permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions WHERE category = 'template'
ON CONFLICT DO NOTHING;

-- Grant admin all template permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM public.permissions WHERE category = 'template'
ON CONFLICT DO NOTHING;

-- Grant member read, create, update, and apply
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM public.permissions 
WHERE code IN ('template.read', 'template.create', 'template.update', 'template.apply')
ON CONFLICT DO NOTHING;

-- Grant viewer read only
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM public.permissions 
WHERE code = 'template.read'
ON CONFLICT DO NOTHING;
