-- ==============================================================================
-- NXTQR — Supabase Linter & Security Hardening Migration
-- Version: 20260918190656_linter_and_security_hardening.sql
-- Resolves all database linter warnings, sets immutable search paths,
-- revokes RPC exposure from internal functions, and optimizes RLS policies.
-- ==============================================================================

-- 1. SET IMMUTABLE SEARCH PATHS ON UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_immutable_qr_versions()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        IF OLD.version_number IS NOT NULL AND (
            NEW.version_number IS DISTINCT FROM OLD.version_number OR
            NEW.qr_id IS DISTINCT FROM OLD.qr_id OR
            NEW.design_json IS DISTINCT FROM OLD.design_json OR
            NEW.content_json IS DISTINCT FROM OLD.content_json OR
            NEW.destination_json IS DISTINCT FROM OLD.destination_json OR
            NEW.routing_json IS DISTINCT FROM OLD.routing_json
        ) THEN
            RAISE EXCEPTION 'QR Versions are immutable. Create a new version instead of updating.';
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- 2. REVOKE REST/RPC EXECUTION PRIVILEGES ON INTERNAL / TRIGGER FUNCTIONS
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_immutable_qr_versions() FROM PUBLIC, anon, authenticated;

-- Ensure internal RLS helpers are not exposed to unauthenticated REST clients
REVOKE EXECUTE ON FUNCTION public.has_org_permission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM anon;

-- 3. OPTIMIZE MULTIPLE PERMISSIVE POLICIES TO REDUCE QUERY OVERHEAD
-- Drop duplicate SELECT policy on campaign_qr_codes (covered by the ALL policy)
DROP POLICY IF EXISTS "Members can view campaign qr associations" ON public.campaign_qr_codes;

-- Adjust qr_resolution_snapshots to separate manage (INSERT/UPDATE/DELETE) from public read
DROP POLICY IF EXISTS "Members can manage resolution snapshots" ON public.qr_resolution_snapshots;

CREATE POLICY "Members can insert resolution snapshots"
    ON public.qr_resolution_snapshots FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_resolution_snapshots.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

CREATE POLICY "Members can update resolution snapshots"
    ON public.qr_resolution_snapshots FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_resolution_snapshots.qr_id
              AND public.is_org_member(q.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_resolution_snapshots.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );

CREATE POLICY "Members can delete resolution snapshots"
    ON public.qr_resolution_snapshots FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes q
            WHERE q.id = qr_resolution_snapshots.qr_id
              AND public.is_org_member(q.organization_id)
        )
    );
