-- ==============================================================================
-- NXTQR — Folders / QR Asset Organization Workspace Migration
-- Version: 20260919000001_folders_workspace.sql
-- Upgrades public.folders with metadata columns, indexes, set_updated_at trigger,
-- and organization-scoped Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. ADD COLUMNS TO public.folders
ALTER TABLE public.folders
    ADD COLUMN IF NOT EXISTS description TEXT NULL,
    ADD COLUMN IF NOT EXISTS emoji TEXT NULL,
    ADD COLUMN IF NOT EXISTS accent_key TEXT NULL DEFAULT 'Graphite',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- 2. DETERMINISTIC UNIQUE INDEX FOR ACTIVE FOLDERS PER ORGANIZATION
CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_org_name_active 
ON public.folders (organization_id, lower(trim(name))) 
WHERE status = 'active';

-- 3. HIGH-THROUGHPUT INDEXES FOR FOLDERS AND QR ASSOCIATIONS
CREATE INDEX IF NOT EXISTS idx_folders_org_status ON public.folders (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_folders_org_updated ON public.folders (organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_folder ON public.qr_codes (organization_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_folder_updated ON public.qr_codes (folder_id, updated_at DESC);

-- 4. ATTACH EXISTING set_updated_at() TRIGGER
DROP TRIGGER IF EXISTS trg_folders_updated_at ON public.folders;
CREATE TRIGGER trg_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR public.folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view organization folders" ON public.folders;
CREATE POLICY "Members can view organization folders"
    ON public.folders FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can create organization folders" ON public.folders;
CREATE POLICY "Members can create organization folders"
    ON public.folders FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update organization folders" ON public.folders;
CREATE POLICY "Members can update organization folders"
    ON public.folders FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete organization folders" ON public.folders;
CREATE POLICY "Members can delete organization folders"
    ON public.folders FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));
