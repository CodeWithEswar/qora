-- ==============================================================================
-- NXTQR — Cloudflare D1 Seed Fixtures
-- Version: 0001_seed_initial.sql
-- Default SaaS Plans, RBAC Catalog, System Roles, and Initial Workspace Seed.
-- ==============================================================================

-- 1. DEFAULT SAAS PLANS
INSERT OR IGNORE INTO plans (id, name, tier_level, monthly_price_inr, annual_price_inr, monthly_price_minor, annual_price_minor) VALUES
('FREE', 'Free Starter', 0, 0.0, 0.0, 0, 0),
('PRO', 'NXTQR Pro', 1, 999.0, 9990.0, 99900, 999000),
('BUSINESS', 'NXTQR Business', 2, 4999.0, 49990.0, 499900, 4999000),
('ENTERPRISE', 'NXTQR Enterprise', 3, 24999.0, 249990.0, 2499900, 24999000);

-- 2. RBAC PERMISSIONS CATALOG
INSERT OR IGNORE INTO permissions (id, code, category, description) VALUES
('perm_qr_create', 'qr.create', 'QR Assets', 'Create new QR codes and designs'),
('perm_qr_read', 'qr.read', 'QR Assets', 'View QR codes, settings, and designs'),
('perm_qr_update', 'qr.update', 'QR Assets', 'Edit QR configuration and visual styling'),
('perm_qr_delete', 'qr.delete', 'QR Assets', 'Delete or archive QR assets'),
('perm_qr_publish', 'qr.publish', 'QR Assets', 'Publish QR codes to edge live network'),
('perm_route_read', 'route.read', 'Routing Engine', 'View intelligent routing rules and conditions'),
('perm_route_update', 'route.update', 'Routing Engine', 'Draft and edit routing rules and branches'),
('perm_route_publish', 'route.publish', 'Routing Engine', 'Activate routing rules into edge KV snapshot'),
('perm_analytics_read', 'analytics.read', 'Intelligence', 'View scan analytics and audience telemetry'),
('perm_analytics_export', 'analytics.export', 'Intelligence', 'Export scan data and conversion reports'),
('perm_guardian_manage', 'guardian.manage', 'Operations', 'Configure health checks and automated fallback policies'),
('perm_member_invite', 'member.invite', 'Workspace', 'Invite new collaborators to workspace'),
('perm_member_remove', 'member.remove', 'Workspace', 'Remove members or revoke invites'),
('perm_billing_read', 'billing.read', 'Commerce', 'View plan usage, invoices, and billing history'),
('perm_billing_manage', 'billing.manage', 'Commerce', 'Upgrade/downgrade plans and manage Cashfree subscriptions'),
('perm_api_manage', 'api.manage', 'Developers', 'Generate API keys and configure webhooks'),
('perm_audit_read', 'audit.read', 'Governance', 'Access security audit trail and compliance logs');

-- 3. SYSTEM ROLES
INSERT OR IGNORE INTO roles (id, organization_id, name, description, is_system) VALUES
('role_owner', NULL, 'Owner', 'Full control over workspace, billing, security, and team governance', 1),
('role_admin', NULL, 'Admin', 'Administrative control over assets, settings, members, and developers', 1),
('role_manager', NULL, 'Manager', 'Publish authority over campaigns, QR assets, routes, and analytics', 1),
('role_editor', NULL, 'Editor', 'Create and edit QR codes and draft routing rules', 1),
('role_analyst', NULL, 'Analyst', 'Access scan analytics, conversion metrics, and data exports', 1),
('role_viewer', NULL, 'Viewer', 'Read-only access to view QR codes and basic performance metrics', 1);

-- 4. ROLE-PERMISSION MAPPINGS
-- Owner (All 17 permissions)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_owner', 'perm_qr_create'), ('role_owner', 'perm_qr_read'), ('role_owner', 'perm_qr_update'), ('role_owner', 'perm_qr_delete'), ('role_owner', 'perm_qr_publish'),
('role_owner', 'perm_route_read'), ('role_owner', 'perm_route_update'), ('role_owner', 'perm_route_publish'),
('role_owner', 'perm_analytics_read'), ('role_owner', 'perm_analytics_export'),
('role_owner', 'perm_guardian_manage'),
('role_owner', 'perm_member_invite'), ('role_owner', 'perm_member_remove'),
('role_owner', 'perm_billing_read'), ('role_owner', 'perm_billing_manage'),
('role_owner', 'perm_api_manage'),
('role_owner', 'perm_audit_read');

-- Admin (All except billing.manage)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_admin', 'perm_qr_create'), ('role_admin', 'perm_qr_read'), ('role_admin', 'perm_qr_update'), ('role_admin', 'perm_qr_delete'), ('role_admin', 'perm_qr_publish'),
('role_admin', 'perm_route_read'), ('role_admin', 'perm_route_update'), ('role_admin', 'perm_route_publish'),
('role_admin', 'perm_analytics_read'), ('role_admin', 'perm_analytics_export'),
('role_admin', 'perm_guardian_manage'),
('role_admin', 'perm_member_invite'), ('role_admin', 'perm_member_remove'),
('role_admin', 'perm_billing_read'),
('role_admin', 'perm_api_manage'),
('role_admin', 'perm_audit_read');

-- Manager
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_manager', 'perm_qr_create'), ('role_manager', 'perm_qr_read'), ('role_manager', 'perm_qr_update'), ('role_manager', 'perm_qr_publish'),
('role_manager', 'perm_route_read'), ('role_manager', 'perm_route_update'), ('role_manager', 'perm_route_publish'),
('role_manager', 'perm_analytics_read'), ('role_manager', 'perm_analytics_export'),
('role_manager', 'perm_guardian_manage');

-- Editor
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_editor', 'perm_qr_create'), ('role_editor', 'perm_qr_read'), ('role_editor', 'perm_qr_update'),
('role_editor', 'perm_route_read'), ('role_editor', 'perm_route_update'),
('role_editor', 'perm_analytics_read');

-- Analyst
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_analyst', 'perm_qr_read'),
('role_analyst', 'perm_route_read'),
('role_analyst', 'perm_analytics_read'), ('role_analyst', 'perm_analytics_export');

-- Viewer
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_viewer', 'perm_qr_read'),
('role_viewer', 'perm_route_read');

-- 5. DEMO TENANT: ACME CORP & INITIAL SEED USER
INSERT OR IGNORE INTO users (id, email, name, timezone) VALUES
('usr_alex_rivera', 'alex@acme.com', 'Alex Rivera', 'Asia/Kolkata');

INSERT OR IGNORE INTO organizations (id, name, slug, billing_plan) VALUES
('org_acme_corp', 'Acme Corp', 'acme-corp', 'PRO');

INSERT OR IGNORE INTO organization_members (id, organization_id, user_id, status) VALUES
('mem_alex_acme', 'org_acme_corp', 'usr_alex_rivera', 'active');

INSERT OR IGNORE INTO member_roles (member_id, role_id) VALUES
('mem_alex_acme', 'role_owner');

-- Initial PRO Plan Entitlements for Acme Corp
INSERT OR IGNORE INTO entitlements (id, organization_id, feature_key, boolean_allowed, numeric_limit, current_usage) VALUES
('ent_acme_dyn', 'org_acme_corp', 'qr.dynamic.max', 1, 100, 42),
('ent_acme_ret', 'org_acme_corp', 'analytics.retentionDays', 1, 90, 0),
('ent_acme_rt', 'org_acme_corp', 'routing.level', 1, 1, 0),
('ent_acme_grd', 'org_acme_corp', 'guardian.enabled', 1, 1, 0),
('ent_acme_seats', 'org_acme_corp', 'team.maxSeats', 1, 3, 1),
('ent_acme_api', 'org_acme_corp', 'api.monthlyRequests', 1, 10000, 1420);

-- Initial Mock Dynamic QR Code for Demo
INSERT OR IGNORE INTO qr_codes (id, organization_id, owner_id, slug, name, qr_type, is_dynamic, status, current_version_id) VALUES
('qr_summer_promo', 'org_acme_corp', 'usr_alex_rivera', 'summer-launch', 'Summer Launch Promo', 'url', 1, 'ACTIVE', 'ver_summer_v1');

INSERT OR IGNORE INTO qr_destinations (id, qr_id, default_url, fallback_url) VALUES
('dest_summer_v1', 'qr_summer_promo', 'https://acme.com/summer-promo', 'https://acme.com/fallback');

INSERT OR IGNORE INTO qr_designs (id, qr_id, pixel_style, eye_style, fg_color, bg_color, error_correction, scanability_score) VALUES
('des_summer_v1', 'qr_summer_promo', 'rounded', 'rounded', '#FA520F', '#FFFFFF', 'Q', 96);

INSERT OR IGNORE INTO qr_versions (id, qr_id, version_number, destination_id, design_id, change_summary, created_by) VALUES
('ver_summer_v1', 'qr_summer_promo', 1, 'dest_summer_v1', 'des_summer_v1', 'Initial publication of Summer Promo QR', 'usr_alex_rivera');
