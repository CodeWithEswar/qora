-- ==============================================================================
-- NXTQR — Bulk QR Operations Migration
-- Schema for Bulk QR Creation Studio: batches, batch rows, progress, and results.
--
-- Invariants:
-- 1. All records are strictly scoped to organization_id.
-- 2. Deleting a batch or batch history NEVER deletes created QR assets (ON DELETE SET NULL).
-- 3. Validation status (READY/WARNING/BLOCKED) is separated from execution status (PENDING/PROCESSING/CREATED/FAILED).
-- 4. RLS ensures strict tenant isolation.
-- ==============================================================================

-- 1. BULK QR BATCHES
CREATE TABLE IF NOT EXISTS public.bulk_qr_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'manual_grid')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'VALIDATING', 'READY', 'QUEUED', 'PROCESSING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED')),
    creation_mode TEXT NOT NULL DEFAULT 'DRAFT' CHECK (creation_mode IN ('DRAFT', 'PUBLISH')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    ready_rows INTEGER NOT NULL DEFAULT 0,
    warning_rows INTEGER NOT NULL DEFAULT 0,
    blocked_rows INTEGER NOT NULL DEFAULT 0,
    processed_rows INTEGER NOT NULL DEFAULT 0,
    created_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    design_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    manifest_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_bulk_qr_batches_updated_at
    BEFORE UPDATE ON public.bulk_qr_batches
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. BULK QR BATCH ROWS
CREATE TABLE IF NOT EXISTS public.bulk_qr_batch_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.bulk_qr_batches(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source_row_number INTEGER NOT NULL,
    normalized_payload JSONB NOT NULL,
    validation_status TEXT NOT NULL DEFAULT 'READY' CHECK (validation_status IN ('READY', 'WARNING', 'BLOCKED')),
    validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
    execution_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (execution_status IN ('PENDING', 'PROCESSING', 'CREATED', 'FAILED', 'SKIPPED')),
    qr_id UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(batch_id, source_row_number)
);

CREATE TRIGGER trg_bulk_qr_batch_rows_updated_at
    BEFORE UPDATE ON public.bulk_qr_batch_rows
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bulk_qr_batches_org_created 
    ON public.bulk_qr_batches(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_qr_batches_org_status 
    ON public.bulk_qr_batches(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_batch_row 
    ON public.bulk_qr_batch_rows(batch_id, source_row_number);

CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_batch_exec 
    ON public.bulk_qr_batch_rows(batch_id, execution_status);

CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_batch_val 
    ON public.bulk_qr_batch_rows(batch_id, validation_status);

CREATE INDEX IF NOT EXISTS idx_bulk_qr_batch_rows_qr_id 
    ON public.bulk_qr_batch_rows(qr_id) WHERE qr_id IS NOT NULL;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.bulk_qr_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_qr_batch_rows ENABLE ROW LEVEL SECURITY;

-- Batches RLS
DROP POLICY IF EXISTS "Users can view batches for their organizations" ON public.bulk_qr_batches;
CREATE POLICY "Users can view batches for their organizations"
    ON public.bulk_qr_batches FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can insert batches for their organizations" ON public.bulk_qr_batches;
CREATE POLICY "Users can insert batches for their organizations"
    ON public.bulk_qr_batches FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can update batches for their organizations" ON public.bulk_qr_batches;
CREATE POLICY "Users can update batches for their organizations"
    ON public.bulk_qr_batches FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can delete batches for their organizations" ON public.bulk_qr_batches;
CREATE POLICY "Users can delete batches for their organizations"
    ON public.bulk_qr_batches FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- Batch rows RLS
DROP POLICY IF EXISTS "Users can view batch rows for their organizations" ON public.bulk_qr_batch_rows;
CREATE POLICY "Users can view batch rows for their organizations"
    ON public.bulk_qr_batch_rows FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can insert batch rows for their organizations" ON public.bulk_qr_batch_rows;
CREATE POLICY "Users can insert batch rows for their organizations"
    ON public.bulk_qr_batch_rows FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can update batch rows for their organizations" ON public.bulk_qr_batch_rows;
CREATE POLICY "Users can update batch rows for their organizations"
    ON public.bulk_qr_batch_rows FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can delete batch rows for their organizations" ON public.bulk_qr_batch_rows;
CREATE POLICY "Users can delete batch rows for their organizations"
    ON public.bulk_qr_batch_rows FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));
