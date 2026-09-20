-- ==============================================================================
-- NXTQR — Security Invoker Helpers Migration
-- Version: 20260918190807_security_invoker_helpers.sql
-- Switches RLS helpers to SECURITY INVOKER with immutable search_path
-- and restricts RPC exposure.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_memberships
        WHERE organization_id = target_org_id
          AND user_id = (select auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION public.has_org_permission(target_org_id UUID, req_perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_memberships om
        JOIN public.member_roles mr ON mr.membership_id = om.id
        JOIN public.role_permissions rp ON rp.role_id = mr.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE om.organization_id = target_org_id
          AND om.user_id = (select auth.uid())
          AND p.code = req_perm
    );
$$;

REVOKE EXECUTE ON FUNCTION public.has_org_permission(UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_org_permission(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated, service_role;
