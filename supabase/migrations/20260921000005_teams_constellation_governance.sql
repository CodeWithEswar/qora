-- Migration: 20260921000005_teams_constellation_governance.sql
-- Enhances public.teams with constellation governance, operational access footprint, and team lifecycle

ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'archived')),
  ADD COLUMN IF NOT EXISTS lead_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS access_domains JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Ensure indexes for team lookups and organization scoping
CREATE INDEX IF NOT EXISTS idx_teams_organization_state ON public.teams(organization_id, state);
CREATE INDEX IF NOT EXISTS idx_teams_lead_membership ON public.teams(lead_membership_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_membership_id ON public.team_members(membership_id);
