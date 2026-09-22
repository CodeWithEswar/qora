-- Migration: 0012_team_resource_assignments.sql
-- Enables explicit many-to-many resource connections to teams without overloading resource schemas

CREATE TABLE IF NOT EXISTS public.team_resource_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('qr_code', 'campaign', 'brand_kit', 'template', 'domain', 'folder')),
    resource_id UUID NOT NULL,
    relationship_type TEXT NOT NULL DEFAULT 'responsible' CHECK (relationship_type IN ('responsible', 'collaborator', 'reviewer')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_team_resource_assignments_team ON public.team_resource_assignments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_resource_assignments_org ON public.team_resource_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_resource_assignments_lookup ON public.team_resource_assignments(organization_id, resource_type, resource_id);

-- Enable RLS
ALTER TABLE public.team_resource_assignments ENABLE ROW LEVEL SECURITY;
