-- ==============================================================================
-- NXTQR — Landing Pages: Mobile-First Destination Studio Migration
-- Version: 20260919000002_landing_pages.sql
-- Relational identity, mutable drafts, immutable versions, QR connections,
-- real telemetry, and organization-scoped Row Level Security (RLS).
-- ==============================================================================

-- 1. LANDING PAGES (Logical Identity)
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_version_id UUID NULL,
    published_at TIMESTAMPTZ NULL,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ NULL
);

-- Unique index per organization for active/draft slugs
CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_pages_org_slug 
ON public.landing_pages (organization_id, lower(trim(slug))) 
WHERE status != 'archived';

-- Global unique index for published slugs (guarantees deterministic public edge resolution)
CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_pages_public_slug 
ON public.landing_pages (lower(trim(slug))) 
WHERE status = 'published';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_landing_pages_org_status ON public.landing_pages (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_landing_pages_org_updated ON public.landing_pages (organization_id, updated_at DESC);

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER trg_landing_pages_updated_at
    BEFORE UPDATE ON public.landing_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 2. WORKING DRAFTS (Debounced Server Autosave Target)
CREATE TABLE IF NOT EXISTS public.landing_page_drafts (
    page_id UUID PRIMARY KEY REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    draft_version INTEGER NOT NULL DEFAULT 1,
    document JSONB NOT NULL DEFAULT '{"schemaVersion": 1, "theme": {}, "blocks": []}'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_landing_page_drafts_updated_at ON public.landing_page_drafts;
CREATE TRIGGER trg_landing_page_drafts_updated_at
    BEFORE UPDATE ON public.landing_page_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 3. IMMUTABLE VERSIONS (Published Snapshots & Rollback History)
CREATE TABLE IF NOT EXISTS public.landing_page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    document JSONB NOT NULL,
    change_summary TEXT NOT NULL DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(page_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_lp_versions_page_num ON public.landing_page_versions (page_id, version_number DESC);

-- Trigger to protect published versions from accidental mutation
CREATE OR REPLACE FUNCTION public.protect_immutable_landing_page_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'CANNOT UPDATE IMMUTABLE LANDING PAGE VERSION: Published snapshots are tamper-evident and read-only.';
    END IF;
    IF (TG_OP = 'DELETE' AND CURRENT_USER != 'postgres') THEN
        RAISE EXCEPTION 'CANNOT DELETE IMMUTABLE LANDING PAGE VERSION: Published snapshots cannot be individually deleted.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_landing_page_versions ON public.landing_page_versions;
CREATE TRIGGER trg_immutable_landing_page_versions
    BEFORE UPDATE OR DELETE ON public.landing_page_versions
    FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_landing_page_versions();

-- Add deferred foreign key for published_version_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'landing_pages_published_version_id_fkey'
    ) THEN
        ALTER TABLE public.landing_pages 
        ADD CONSTRAINT landing_pages_published_version_id_fkey 
        FOREIGN KEY (published_version_id) 
        REFERENCES public.landing_page_versions(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 4. CONNECTED QR CODES (Many-to-Many Association & Dependency Guard)
-- Deleting a landing page cascades association rows ONLY. The underlying QR assets remain 100% intact.
CREATE TABLE IF NOT EXISTS public.landing_page_qr_codes (
    landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(landing_page_id, qr_id)
);

CREATE INDEX IF NOT EXISTS idx_landing_page_qrs_qr ON public.landing_page_qr_codes(qr_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_qrs_page ON public.landing_page_qr_codes(landing_page_id);

-- 5. REAL SCAN-TO-ACTION TELEMETRY (Page Views & CTA Clicks)
CREATE TABLE IF NOT EXISTS public.landing_page_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    version_id UUID REFERENCES public.landing_page_versions(id) ON DELETE SET NULL,
    qr_id UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'action_click', 'conversion')),
    action_id TEXT NULL,
    action_type TEXT NULL,
    device_type TEXT DEFAULT 'mobile',
    os_name TEXT DEFAULT 'Unknown',
    browser_name TEXT DEFAULT 'Unknown',
    referrer TEXT DEFAULT 'direct',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lp_events_page_time ON public.landing_page_events (landing_page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lp_events_org_time ON public.landing_page_events (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lp_events_type ON public.landing_page_events (landing_page_id, event_type);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_events ENABLE ROW LEVEL SECURITY;

-- Landing Pages: Org members full access, public can view published
DROP POLICY IF EXISTS "Members can view organization landing pages" ON public.landing_pages;
CREATE POLICY "Members can view organization landing pages"
    ON public.landing_pages FOR SELECT TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Public can view published landing pages" ON public.landing_pages;
CREATE POLICY "Public can view published landing pages"
    ON public.landing_pages FOR SELECT TO anon, authenticated
    USING (status = 'published');

DROP POLICY IF EXISTS "Members can create landing pages" ON public.landing_pages;
CREATE POLICY "Members can create landing pages"
    ON public.landing_pages FOR INSERT TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update landing pages" ON public.landing_pages;
CREATE POLICY "Members can update landing pages"
    ON public.landing_pages FOR UPDATE TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete landing pages" ON public.landing_pages;
CREATE POLICY "Members can delete landing pages"
    ON public.landing_pages FOR DELETE TO authenticated
    USING (public.is_org_member(organization_id));

-- Drafts: Strictly org members
DROP POLICY IF EXISTS "Members can view organization landing page drafts" ON public.landing_page_drafts;
CREATE POLICY "Members can view organization landing page drafts"
    ON public.landing_page_drafts FOR SELECT TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can create landing page drafts" ON public.landing_page_drafts;
CREATE POLICY "Members can create landing page drafts"
    ON public.landing_page_drafts FOR INSERT TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update landing page drafts" ON public.landing_page_drafts;
CREATE POLICY "Members can update landing page drafts"
    ON public.landing_page_drafts FOR UPDATE TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete landing page drafts" ON public.landing_page_drafts;
CREATE POLICY "Members can delete landing page drafts"
    ON public.landing_page_drafts FOR DELETE TO authenticated
    USING (public.is_org_member(organization_id));

-- Versions: Org members view all, public can view active published version
DROP POLICY IF EXISTS "Members can view organization landing page versions" ON public.landing_page_versions;
CREATE POLICY "Members can view organization landing page versions"
    ON public.landing_page_versions FOR SELECT TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Public can view published landing page versions" ON public.landing_page_versions;
CREATE POLICY "Public can view published landing page versions"
    ON public.landing_page_versions FOR SELECT TO anon, authenticated
    USING (id IN (SELECT published_version_id FROM public.landing_pages WHERE status = 'published'));

DROP POLICY IF EXISTS "Members can insert landing page versions" ON public.landing_page_versions;
CREATE POLICY "Members can insert landing page versions"
    ON public.landing_page_versions FOR INSERT TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

-- QR Connections: Org members full access
DROP POLICY IF EXISTS "Members can view landing page QR connections" ON public.landing_page_qr_codes;
CREATE POLICY "Members can view landing page QR connections"
    ON public.landing_page_qr_codes FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = landing_page_id AND public.is_org_member(lp.organization_id)
    ));

DROP POLICY IF EXISTS "Members can manage landing page QR connections" ON public.landing_page_qr_codes;
CREATE POLICY "Members can manage landing page QR connections"
    ON public.landing_page_qr_codes FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = landing_page_id AND public.is_org_member(lp.organization_id)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = landing_page_id AND public.is_org_member(lp.organization_id)
    ));

-- Events: Org members view telemetry, public/anon can insert events on published pages
DROP POLICY IF EXISTS "Members can view landing page events" ON public.landing_page_events;
CREATE POLICY "Members can view landing page events"
    ON public.landing_page_events FOR SELECT TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Public can insert landing page events" ON public.landing_page_events;
CREATE POLICY "Public can insert landing page events"
    ON public.landing_page_events FOR INSERT TO anon, authenticated
    WITH CHECK (landing_page_id IN (SELECT id FROM public.landing_pages WHERE status = 'published'));

-- 7. SEED RBAC PERMISSIONS FOR LANDING PAGES
INSERT INTO public.permissions (code, category, description) VALUES
    ('landing_pages.read', 'landing_pages', 'View landing pages, preview drafts, and inspect versions'),
    ('landing_pages.create', 'landing_pages', 'Create new mobile-first destination landing pages'),
    ('landing_pages.update', 'landing_pages', 'Edit landing page content, blocks, and design in Destination Studio'),
    ('landing_pages.publish', 'landing_pages', 'Publish immutable versions of landing pages'),
    ('landing_pages.delete', 'landing_pages', 'Archive or delete landing pages')
ON CONFLICT (code) DO NOTHING;

-- Grant owner all landing page permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions WHERE category = 'landing_pages'
ON CONFLICT DO NOTHING;

-- Grant admin all landing page permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM public.permissions WHERE category = 'landing_pages'
ON CONFLICT DO NOTHING;

-- Grant member read, create, update, and publish
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM public.permissions 
WHERE code IN ('landing_pages.read', 'landing_pages.create', 'landing_pages.update', 'landing_pages.publish')
ON CONFLICT DO NOTHING;

-- Grant viewer read only
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM public.permissions 
WHERE code = 'landing_pages.read'
ON CONFLICT DO NOTHING;
