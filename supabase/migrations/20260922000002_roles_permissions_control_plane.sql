-- ==============================================================================
-- NXTQR — Access Architecture Control Plane: Roles & Permissions Governance
-- Version: 20260922000002_roles_permissions_control_plane.sql
-- Canonical permissions catalog, system role immutability, tenant-isolated custom
-- roles, and strict Row-Level Security (RLS) policies.
-- ==============================================================================

-- 1. SEED CANONICAL SYSTEM PERMISSIONS (Both dot-notation and legacy colon codes)
INSERT INTO public.permissions (code, category, description) VALUES
    -- Organization & Governance
    ('organization.read', 'organization', 'View workspace profile, identifiers, and configuration'),
    ('organization.update', 'organization', 'Modify workspace name, slug, branding, and policies'),
    ('audit.read', 'organization', 'Inspect immutable security audit event stream'),
    ('activity.read', 'organization', 'View operational activity intelligence timeline'),
    ('activity.export', 'organization', 'Export organization activity logs'),

    -- Members & Access
    ('members.read', 'members', 'List organization members, roles, and pending invitations'),
    ('members.invite', 'members', 'Issue new invitations to collaborators with assigned roles'),
    ('members.remove', 'members', 'Revoke membership (protected against the final workspace owner)'),

    -- Teams
    ('teams.read', 'teams', 'Browse team lists and view team membership assignments'),
    ('teams.create', 'teams', 'Create new collaborative teams within the workspace'),
    ('teams.update', 'teams', 'Edit team identity, membership, and leadership assignments'),
    ('teams.delete', 'teams', 'Disband and remove collaborative teams'),

    -- Approvals & Governance
    ('approvals.read', 'approvals', 'View approval requests and submission timelines'),
    ('approvals.decide', 'approvals', 'Approve, reject, or request changes on pending revisions'),
    ('approvals.request', 'approvals', 'Submit changes requiring publishing approval'),
    ('approvals.cancel', 'approvals', 'Cancel pending approval requests'),

    -- Comments & Collaboration
    ('comments.read', 'comments', 'Read comments and discussion threads across resources'),
    ('comments.create', 'comments', 'Start new comment threads or post replies'),
    ('comments.edit', 'comments', 'Edit own posted comments'),
    ('comments.delete', 'comments', 'Remove posted comments or resolve discussions'),
    ('comments.resolve', 'comments', 'Mark comment threads as resolved'),

    -- Roles & Access Control
    ('roles.read', 'roles', 'View role catalog, capability matrix, and permissions'),
    ('roles.create', 'roles', 'Create custom workspace roles with selected capabilities'),
    ('roles.update', 'roles', 'Modify custom role capabilities and descriptions'),
    ('roles.delete', 'roles', 'Delete custom workspace roles with mandatory member reassignment'),
    ('roles.assign', 'roles', 'Change member role assignments'),

    -- QR Asset Lifecycle
    ('qr.read', 'qr', 'View QR codes and draft details'),
    ('qr.create', 'qr', 'Create new QR assets and dynamic redirects'),
    ('qr.update', 'qr', 'Update QR content and design drafts'),
    ('qr.delete', 'qr', 'Archive or delete QR assets'),
    ('qr.publish', 'qr', 'Publish new immutable revisions to edge redirect resolvers'),

    -- Routing Policies
    ('routing.read', 'routing', 'View destination routing rules and condition trees'),
    ('routing.update', 'routing', 'Modify destination routing and dynamic rules'),
    ('routing.publish', 'routing', 'Deploy routing changes live to the edge network'),

    -- Campaigns
    ('campaigns.read', 'campaigns', 'View campaigns and assigned asset collections'),
    ('campaigns.create', 'campaigns', 'Create new promotional campaigns'),
    ('campaigns.update', 'campaigns', 'Edit campaign attributes and resource groupings'),
    ('campaigns.delete', 'campaigns', 'Archive or remove campaigns'),

    -- Folders & Asset Organization
    ('folders.read', 'folders', 'Browse organizational folders and hierarchical tags'),
    ('folders.create', 'folders', 'Create new organization folders'),
    ('folders.update', 'folders', 'Rename and reorder folder structures'),
    ('folders.delete', 'folders', 'Remove empty folder structures'),

    -- Landing Pages & Destination Studio
    ('landing_pages.read', 'landing_pages', 'View mobile-first landing pages and microsites'),
    ('landing_pages.create', 'landing_pages', 'Create new responsive landing pages'),
    ('landing_pages.update', 'landing_pages', 'Edit landing page blocks and themes'),
    ('landing_pages.publish', 'landing_pages', 'Publish landing pages to live URLs'),
    ('landing_pages.delete', 'landing_pages', 'Archive or delete landing pages'),

    -- Brand Kits
    ('brand.read', 'brand', 'Inspect organizational brand kits, color palettes, and logos'),
    ('brand.manage', 'brand', 'Create, update, and publish authoritative brand kits'),

    -- Analytics & Telemetry
    ('analytics.read', 'analytics', 'View real-time scan analytics, heatmaps, and telemetry'),
    ('analytics.export', 'analytics', 'Export raw scan and performance reports'),

    -- Link Guardian Operations
    ('guardian.read', 'guardian', 'View automated destination monitoring and incident alerts'),
    ('guardian.manage', 'guardian', 'Configure monitor targets and self-healing redirect rules'),

    -- Commerce & Billing
    ('billing.read', 'billing', 'View subscription plan, invoices, and quota usage'),
    ('billing.manage', 'billing', 'Upgrade subscriptions, change payment methods, and manage seats'),

    -- Developer Platform
    ('api_keys.read', 'developer', 'View developer API keys and usage logs'),
    ('api_keys.manage', 'developer', 'Create, rotate, and revoke developer API keys'),
    ('webhooks.read', 'developer', 'View registered event webhook endpoints'),
    ('webhooks.manage', 'developer', 'Register and test event webhook subscriptions'),

    -- Reports
    ('reports.read', 'reports', 'Browse scheduled and generated intelligence reports'),
    ('reports.create', 'reports', 'Configure automated recurring intelligence reports'),
    ('reports.share', 'reports', 'Share reports with stakeholders via secure links'),

    -- Custom Domains
    ('domains.read', 'domains', 'View custom domain registry and DNS verification status'),
    ('domains.manage', 'domains', 'Connect, verify, and configure organizational vanity domains')
ON CONFLICT (code) DO NOTHING;

-- 2. ENSURE SYSTEM ROLES MAP CANONICAL PERMISSIONS
-- Owner gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Admin gets administrative permissions (all except billing.manage, roles.create, roles.delete, organization.update)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM public.permissions
WHERE code NOT IN ('billing.manage', 'roles.delete')
ON CONFLICT DO NOTHING;

-- Member gets operational permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM public.permissions
WHERE category IN ('qr', 'routing', 'campaigns', 'folders', 'landing_pages', 'comments', 'brand', 'analytics', 'reports')
  AND code NOT LIKE '%.delete'
  AND code NOT IN ('brand.manage', 'roles.assign')
ON CONFLICT DO NOTHING;

-- Viewer gets read-only permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM public.permissions
WHERE code LIKE '%.read'
ON CONFLICT DO NOTHING;

-- 3. RLS POLICIES FOR ROLES
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System roles and org custom roles are readable" ON public.roles;
CREATE POLICY "System roles and org custom roles are readable"
    ON public.roles FOR SELECT
    TO authenticated
    USING (
        organization_id IS NULL 
        OR public.is_org_member(organization_id)
    );

DROP POLICY IF EXISTS "Admins can insert custom roles" ON public.roles;
CREATE POLICY "Admins can insert custom roles"
    ON public.roles FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IS NOT NULL
        AND is_system = false
        AND public.is_org_member(organization_id)
    );

DROP POLICY IF EXISTS "Admins can update custom roles" ON public.roles;
CREATE POLICY "Admins can update custom roles"
    ON public.roles FOR UPDATE
    TO authenticated
    USING (
        organization_id IS NOT NULL
        AND is_system = false
        AND public.is_org_member(organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL
        AND is_system = false
        AND public.is_org_member(organization_id)
    );

DROP POLICY IF EXISTS "Admins can delete custom roles" ON public.roles;
CREATE POLICY "Admins can delete custom roles"
    ON public.roles FOR DELETE
    TO authenticated
    USING (
        organization_id IS NOT NULL
        AND is_system = false
        AND public.is_org_member(organization_id)
    );

-- 4. RLS POLICIES FOR PERMISSIONS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permissions are readable by authenticated users" ON public.permissions;
CREATE POLICY "Permissions are readable by authenticated users"
    ON public.permissions FOR SELECT
    TO authenticated
    USING (true);

-- 5. RLS POLICIES FOR ROLE_PERMISSIONS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Role permissions are readable for accessible roles" ON public.role_permissions;
CREATE POLICY "Role permissions are readable for accessible roles"
    ON public.role_permissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = public.role_permissions.role_id
              AND (r.organization_id IS NULL OR public.is_org_member(r.organization_id))
        )
    );

DROP POLICY IF EXISTS "Admins can manage custom role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage custom role permissions"
    ON public.role_permissions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = public.role_permissions.role_id
              AND r.organization_id IS NOT NULL
              AND r.is_system = false
              AND public.is_org_member(r.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = public.role_permissions.role_id
              AND r.organization_id IS NOT NULL
              AND r.is_system = false
              AND public.is_org_member(r.organization_id)
        )
    );

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_roles_org_system ON public.roles(organization_id, is_system);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON public.role_permissions(permission_id);
