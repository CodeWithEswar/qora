-- Migration: 20260921000006_approvals_decision_governance.sql
-- Upgrades approval_requests for generic enterprise decision governance and adds approval_decisions table

-- 1. Modify approval_requests to support multi-domain consequential decisions
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'approval_requests' AND column_name = 'qr_id'
  ) THEN
    ALTER TABLE public.approval_requests ALTER COLUMN qr_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'approval_requests' AND column_name = 'target_version_id'
  ) THEN
    ALTER TABLE public.approval_requests ALTER COLUMN target_version_id DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE public.approval_requests
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'QR_REPLACEMENT',
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Consequential Action Approval',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS execution_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN IF NOT EXISTS execution_error TEXT,
  ADD COLUMN IF NOT EXISTS execution_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS affected_entity_type TEXT NOT NULL DEFAULT 'qr_identity',
  ADD COLUMN IF NOT EXISTS affected_entity_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS affected_entity_ref TEXT,
  ADD COLUMN IF NOT EXISTS request_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS review_policy TEXT NOT NULL DEFAULT 'ANY_AUTHORIZED',
  ADD COLUMN IF NOT EXISTS assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS decided_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evidence_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Create approval_decisions table for historical audit traces
CREATE TABLE IF NOT EXISTS public.approval_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  reason_code TEXT,
  decision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for fast queue queries
CREATE INDEX IF NOT EXISTS idx_approvals_org_status ON public.approval_requests(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_assigned_team ON public.approval_requests(assigned_team_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON public.approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approvals_public_id ON public.approval_requests(public_id);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_req ON public.approval_decisions(approval_request_id, created_at DESC);
