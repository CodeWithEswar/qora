-- Migration: 20260921000008_team_resource_assignments.sql
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

-- RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'team_resource_assignments' 
        AND policyname = 'Team resource assignments are visible to organization members'
    ) THEN
        CREATE POLICY "Team resource assignments are visible to organization members"
            ON public.team_resource_assignments
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.organization_memberships m
                    WHERE m.organization_id = public.team_resource_assignments.organization_id
                    AND m.user_id = auth.uid()
                    AND m.status = 'active'
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'team_resource_assignments' 
        AND policyname = 'Team resource assignments can be managed by authorized organization members'
    ) THEN
        CREATE POLICY "Team resource assignments can be managed by authorized organization members"
            ON public.team_resource_assignments
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.organization_memberships m
                    JOIN public.member_roles mr ON mr.membership_id = m.id
                    JOIN public.roles r ON r.id = mr.role_id
                    WHERE m.organization_id = public.team_resource_assignments.organization_id
                    AND m.user_id = auth.uid()
                    AND m.status = 'active'
                    AND r.code IN ('OWNER', 'ADMIN', 'EDITOR')
                )
            );
    END IF;
END $$;
