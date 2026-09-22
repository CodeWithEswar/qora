-- ==============================================================================
-- NXTQR — Workspace Control Plane: Organization Settings & Defaults Migration
-- Version: 20260922000001_workspace_settings_control_plane.sql
-- Authoritative relational settings, QR/Brand defaults, collaboration policies,
-- automatic default provisioning, cascade safety, and strict RLS.
-- ==============================================================================

-- 1. WORKSPACE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.organization_settings (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    description TEXT NOT NULL DEFAULT '',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    locale TEXT NOT NULL DEFAULT 'en',
    default_brand_kit_id UUID REFERENCES public.brand_kits(id) ON DELETE SET NULL,
    qr_defaults_json JSONB NOT NULL DEFAULT '{
        "errorCorrection": "Q",
        "quietZone": 4,
        "moduleStyle": "squares",
        "eyeOuterStyle": "square",
        "eyeInnerStyle": "square",
        "fgColor": "#1F1F1F",
        "bgColor": "#FFFFFF",
        "frameStyle": "none",
        "frameText": "SCAN ME",
        "format": "png",
        "size": 1024
    }'::jsonb,
    collaboration_policy_json JSONB NOT NULL DEFAULT '{
        "defaultRoleId": "00000000-0000-0000-0000-000000000003",
        "invitationPolicy": "admins_and_owners",
        "approvalRequiredForPublish": false,
        "externalSharingEnabled": true
    }'::jsonb,
    notification_preferences_json JSONB NOT NULL DEFAULT '{
        "inApp": true,
        "email": true,
        "securityAlerts": true,
        "weeklyDigest": false
    }'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS trg_organization_settings_updated_at ON public.organization_settings;
CREATE TRIGGER trg_organization_settings_updated_at
    BEFORE UPDATE ON public.organization_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. AUTO-PROVISION SETTINGS ON NEW ORGANIZATION CREATION
CREATE OR REPLACE FUNCTION public.handle_new_organization_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.organization_settings (organization_id)
    VALUES (NEW.id)
    ON CONFLICT (organization_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_organization_settings_created ON public.organizations;
CREATE TRIGGER on_organization_settings_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization_settings();

-- 4. BACKFILL FOR ALL EXISTING ORGANIZATIONS
INSERT INTO public.organization_settings (organization_id)
SELECT id FROM public.organizations
ON CONFLICT (organization_id) DO NOTHING;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_org_settings_default_brand ON public.organization_settings(default_brand_kit_id);

-- 6. ROW-LEVEL SECURITY
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view workspace settings" ON public.organization_settings;
CREATE POLICY "Members can view workspace settings"
    ON public.organization_settings FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert workspace settings" ON public.organization_settings;
CREATE POLICY "Members can insert workspace settings"
    ON public.organization_settings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update workspace settings" ON public.organization_settings;
CREATE POLICY "Members can update workspace settings"
    ON public.organization_settings FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));
