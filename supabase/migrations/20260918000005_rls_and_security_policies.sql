-- ==============================================================================
-- NXTQR — Row Level Security (RLS) & Multi-Tenant Authorization Migration
-- Version: 20260918000005_rls_and_security_policies.sql
-- Strict DENY-by-default posture with tenant isolation across all tables.
-- ==============================================================================

-- 1. CANONICAL TENANT MEMBERSHIP & PERMISSION EVALUATORS
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF target_org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.organization_memberships
        WHERE organization_id = target_org_id
          AND user_id = (SELECT auth.uid())
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_org_permission(target_org_id UUID, req_perm TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF target_org_id IS NULL OR req_perm IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_memberships om
        JOIN public.member_roles mr ON mr.membership_id = om.id
        JOIN public.role_permissions rp ON rp.role_id = mr.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE om.organization_id = target_org_id
          AND om.user_id = (SELECT auth.uid())
          AND om.status = 'active'
          AND p.code = req_perm
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. ENABLE RLS ACROSS ALL PRODUCTION TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_resolution_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_events_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fallback_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- 3. USER PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- 4. ORGANIZATIONS POLICIES
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members can view their organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (public.is_org_member(id));

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS "Admins can update their organizations" ON public.organizations;
CREATE POLICY "Admins can update their organizations"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (public.is_org_member(id))
    WITH CHECK (public.is_org_member(id));

-- 5. ORGANIZATION MEMBERSHIPS POLICIES
DROP POLICY IF EXISTS "Members can view workspace memberships" ON public.organization_memberships;
CREATE POLICY "Members can view workspace memberships"
    ON public.organization_memberships FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 6. QR CODES POLICIES
DROP POLICY IF EXISTS "Members can view their organization QR codes" ON public.qr_codes;
CREATE POLICY "Members can view their organization QR codes"
    ON public.qr_codes FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert QR codes" ON public.qr_codes;
CREATE POLICY "Members can insert QR codes"
    ON public.qr_codes FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update QR codes" ON public.qr_codes;
CREATE POLICY "Members can update QR codes"
    ON public.qr_codes FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete QR codes" ON public.qr_codes;
CREATE POLICY "Members can delete QR codes"
    ON public.qr_codes FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 7. QR DRAFTS POLICIES (Autosave target)
DROP POLICY IF EXISTS "Members can view drafts" ON public.qr_drafts;
CREATE POLICY "Members can view drafts"
    ON public.qr_drafts FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert drafts" ON public.qr_drafts;
CREATE POLICY "Members can insert drafts"
    ON public.qr_drafts FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update drafts" ON public.qr_drafts;
CREATE POLICY "Members can update drafts"
    ON public.qr_drafts FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

-- 8. QR VERSIONS (Immutable published revisions)
DROP POLICY IF EXISTS "Members can view versions" ON public.qr_versions;
CREATE POLICY "Members can view versions"
    ON public.qr_versions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_versions.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

DROP POLICY IF EXISTS "Members can insert new versions" ON public.qr_versions;
CREATE POLICY "Members can insert new versions"
    ON public.qr_versions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_versions.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

-- 9. RESOLUTION SNAPSHOTS (Public read for resolver path, org members manage)
DROP POLICY IF EXISTS "Public can view resolution snapshots" ON public.qr_resolution_snapshots;
CREATE POLICY "Public can view resolution snapshots"
    ON public.qr_resolution_snapshots FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Members can manage resolution snapshots" ON public.qr_resolution_snapshots;
CREATE POLICY "Members can manage resolution snapshots"
    ON public.qr_resolution_snapshots FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_resolution_snapshots.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

-- 10. CAMPAIGNS POLICIES
DROP POLICY IF EXISTS "Members can view campaigns" ON public.campaigns;
CREATE POLICY "Members can view campaigns"
    ON public.campaigns FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert campaigns" ON public.campaigns;
CREATE POLICY "Members can insert campaigns"
    ON public.campaigns FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update campaigns" ON public.campaigns;
CREATE POLICY "Members can update campaigns"
    ON public.campaigns FOR UPDATE
    TO authenticated
    USING (public.is_org_member(organization_id))
    WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete campaigns" ON public.campaigns;
CREATE POLICY "Members can delete campaigns"
    ON public.campaigns FOR DELETE
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 11. CAMPAIGN QR ASSOCIATIONS POLICIES
DROP POLICY IF EXISTS "Members can view campaign qr associations" ON public.campaign_qr_codes;
CREATE POLICY "Members can view campaign qr associations"
    ON public.campaign_qr_codes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_qr_codes.campaign_id
              AND public.is_org_member(c.organization_id)
        )
    );

DROP POLICY IF EXISTS "Members can manage campaign qr associations" ON public.campaign_qr_codes;
CREATE POLICY "Members can manage campaign qr associations"
    ON public.campaign_qr_codes FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_qr_codes.campaign_id
              AND public.is_org_member(c.organization_id)
        )
    );

-- 12. TELEMETRY & ATTRIBUTION POLICIES
DROP POLICY IF EXISTS "Members can view scan telemetry" ON public.scan_events_hourly;
CREATE POLICY "Members can view scan telemetry"
    ON public.scan_events_hourly FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 13. BILLING & PLANS POLICIES (Plans public read, subscriptions & payments org isolated)
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans"
    ON public.plans FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Anyone can view plan features" ON public.plan_features;
CREATE POLICY "Anyone can view plan features"
    ON public.plan_features FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Members can view their subscription" ON public.subscriptions;
CREATE POLICY "Members can view their subscription"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view their payments" ON public.payments;
CREATE POLICY "Members can view their payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view their entitlements" ON public.entitlements;
CREATE POLICY "Members can view their entitlements"
    ON public.entitlements FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 14. DEVELOPER PLATFORM POLICIES (API keys & webhooks)
DROP POLICY IF EXISTS "Members can view api keys" ON public.api_keys;
CREATE POLICY "Members can view api keys"
    ON public.api_keys FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view webhook endpoints" ON public.webhook_endpoints;
CREATE POLICY "Members can view webhook endpoints"
    ON public.webhook_endpoints FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 15. CUSTOM DOMAINS POLICIES
DROP POLICY IF EXISTS "Members can view custom domains" ON public.custom_domains;
CREATE POLICY "Members can view custom domains"
    ON public.custom_domains FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

-- 16. COLLABORATION (Comments, activities, audit)
DROP POLICY IF EXISTS "Members can view comments" ON public.comments;
CREATE POLICY "Members can view comments"
    ON public.comments FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can insert comments" ON public.comments;
CREATE POLICY "Members can insert comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (public.is_org_member(organization_id) AND (SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Members can view activity events" ON public.activity_events;
CREATE POLICY "Members can view activity events"
    ON public.activity_events FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can view audit logs" ON public.audit_logs;
CREATE POLICY "Members can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_org_member(organization_id));
