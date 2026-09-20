-- ==============================================================================
-- NXTQR — Files / Asset Vault Architecture Migration
-- Version: 20260919000003_files_asset_vault.sql
-- Enhances file_assets metadata and introduces file_usages dependency graph
-- ==============================================================================

-- 1. ENHANCE public.file_assets METADATA TABLE
ALTER TABLE public.file_assets 
    ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'OTHER',
    ADD COLUMN IF NOT EXISTS file_extension TEXT,
    ADD COLUMN IF NOT EXISTS checksum TEXT,
    ADD COLUMN IF NOT EXISTS width INTEGER,
    ADD COLUMN IF NOT EXISTS height INTEGER,
    ADD COLUMN IF NOT EXISTS duration_ms BIGINT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'READY',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Backfill display_name from file_name where display_name is empty
UPDATE public.file_assets 
SET display_name = file_name 
WHERE display_name = '' OR display_name IS NULL;

-- Backfill category from mime_type
UPDATE public.file_assets
SET category = CASE 
    WHEN mime_type LIKE 'image/%' THEN 'IMAGE'
    WHEN mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/json') THEN 'DOCUMENT'
    WHEN mime_type LIKE 'video/%' THEN 'VIDEO'
    WHEN mime_type LIKE 'audio/%' THEN 'AUDIO'
    WHEN mime_type IN ('application/zip', 'application/x-tar', 'application/gzip', 'application/x-rar-compressed') THEN 'ARCHIVE'
    ELSE 'OTHER'
END
WHERE category = 'OTHER';

-- Add Category & Status Check Constraints if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'file_assets_category_check'
    ) THEN
        ALTER TABLE public.file_assets 
            ADD CONSTRAINT file_assets_category_check 
            CHECK (category IN ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'ARCHIVE', 'EXPORT', 'BRAND', 'OTHER'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'file_assets_status_check'
    ) THEN
        ALTER TABLE public.file_assets 
            ADD CONSTRAINT file_assets_status_check 
            CHECK (status IN ('UPLOADING', 'READY', 'PROCESSING', 'FAILED', 'ARCHIVED'));
    END IF;
END $$;

-- Indexes for high-performance tenant asset queries
CREATE INDEX IF NOT EXISTS idx_file_assets_org_updated ON public.file_assets(organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_assets_org_category ON public.file_assets(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_file_assets_org_status ON public.file_assets(organization_id, status);

-- 2. CREATE public.file_usages DEPENDENCY GRAPH TABLE
-- Connects files to QR Studio, Landing Pages, Campaigns, Brand Kits, and Reports.
-- A file is a dependency. Deleting a file NEVER cascade-deletes the parent resource!
CREATE TABLE IF NOT EXISTS public.file_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES public.file_assets(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('QR_CODE', 'LANDING_PAGE', 'CAMPAIGN', 'BRAND_KIT', 'REPORT')),
    resource_id TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    usage_role TEXT NOT NULL CHECK (usage_role IN ('LOGO', 'HERO_IMAGE', 'BACKGROUND', 'DOWNLOAD', 'SOCIAL_IMAGE', 'CAMPAIGN_ASSET', 'BRAND_LOGO', 'REPORT_OUTPUT', 'OTHER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_file_usage_unique UNIQUE (file_id, resource_type, resource_id, usage_role)
);

CREATE INDEX IF NOT EXISTS idx_file_usages_file_id ON public.file_usages(file_id);
CREATE INDEX IF NOT EXISTS idx_file_usages_org_resource ON public.file_usages(organization_id, resource_type, resource_id);

-- 3. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_usages ENABLE ROW LEVEL SECURITY;

-- file_assets RLS Policies: Tenant scoped via organization_memberships
DROP POLICY IF EXISTS "Members can view organization file assets" ON public.file_assets;
CREATE POLICY "Members can view organization file assets"
    ON public.file_assets FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Members can upload organization file assets" ON public.file_assets;
CREATE POLICY "Members can upload organization file assets"
    ON public.file_assets FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Members can update organization file assets" ON public.file_assets;
CREATE POLICY "Members can update organization file assets"
    ON public.file_assets FOR UPDATE
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Members can delete organization file assets" ON public.file_assets;
CREATE POLICY "Members can delete organization file assets"
    ON public.file_assets FOR DELETE
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    );

-- file_usages RLS Policies: Tenant scoped via organization_memberships
DROP POLICY IF EXISTS "Members can view organization file usages" ON public.file_usages;
CREATE POLICY "Members can view organization file usages"
    ON public.file_usages FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Members can manage organization file usages" ON public.file_usages;
CREATE POLICY "Members can manage organization file usages"
    ON public.file_usages FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships 
            WHERE user_id = (select auth.uid())
        )
    );
