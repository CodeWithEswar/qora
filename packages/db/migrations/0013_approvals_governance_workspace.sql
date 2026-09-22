-- Migration: 0013_approvals_governance_workspace.sql
-- Upgrades approval_requests for immutable revision governance, status extension, and change topology

ALTER TABLE public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_status_check;
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_status_check 
  CHECK (status IN ('PENDING', 'WAITING', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'));

ALTER TABLE public.approval_requests
  ADD COLUMN IF NOT EXISTS target_revision_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_revision_number INTEGER,
  ADD COLUMN IF NOT EXISTS target_revision_id TEXT,
  ADD COLUMN IF NOT EXISTS change_topology JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS impact_summary JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_approvals_target_rev ON public.approval_requests(organization_id, affected_entity_type, target_revision_number);
CREATE INDEX IF NOT EXISTS idx_approvals_org_lifecycle ON public.approval_requests(organization_id, status, created_at DESC);
