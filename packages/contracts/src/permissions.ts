/**
 * NXTQR — RBAC Permissions Catalog & Matrix
 * Centralized authorization definitions. Every server action and API verifies authorization.
 */

export type CanonicalPermissionCode =
  // Organization & Settings
  | "organization.read"
  | "organization.update"

  // Members & Team Access
  | "members.read"
  | "members.invite"
  | "members.remove"
  | "member.invite" // Backward compatible alias
  | "member.remove" // Backward compatible alias

  // Teams
  | "teams.read"
  | "teams.create"
  | "teams.update"
  | "teams.delete"

  // Approvals & Governance
  | "approvals.read"
  | "approvals.decide"
  | "approvals.request"
  | "approvals.cancel"

  // Comments & Collaboration
  | "comments.read"
  | "comments.create"
  | "comments.edit"
  | "comments.delete"
  | "comments.resolve"

  // Roles & Governance
  | "roles.read"
  | "roles.create"
  | "roles.update"
  | "roles.delete"
  | "roles.assign"

  // QR Asset Lifecycle
  | "qr.read"
  | "qr.create"
  | "qr.update"
  | "qr.delete"
  | "qr.publish"

  // QR Brain / Routing Policies
  | "routing.read"
  | "routing.update"
  | "routing.publish"
  | "route.read"    // Backward compatible alias
  | "route.update"  // Backward compatible alias
  | "route.publish" // Backward compatible alias

  // Campaigns
  | "campaigns.read"
  | "campaigns.create"
  | "campaigns.update"
  | "campaigns.delete"

  // Folders & Asset Organization
  | "folders.read"
  | "folders.create"
  | "folders.update"
  | "folders.delete"

  // Landing Pages & Destination Studio
  | "landing_pages.read"
  | "landing_pages.create"
  | "landing_pages.update"
  | "landing_pages.publish"
  | "landing_pages.delete"

  // Brand Kits
  | "brand.read"
  | "brand.manage"

  // Intelligence & Telemetry
  | "analytics.read"
  | "analytics.export"

  // Link Guardian Operations
  | "guardian.read"
  | "guardian.manage"

  // Commerce & Subscriptions
  | "billing.read"
  | "billing.manage"

  // Developer Platform
  | "api_keys.read"
  | "api_keys.manage"
  | "api.manage" // Backward compatible alias
  | "webhooks.read"
  | "webhooks.manage"

  // Reports
  | "reports.read"
  | "reports.create"
  | "reports.share"

  // Forensic Audit
  | "audit.read"

  // Operational Activity Intelligence
  | "activity.read"
  | "activity.export"

  // Custom Domains
  | "domains.read"
  | "domains.manage";

export type PermissionCode = CanonicalPermissionCode;

export type SystemRoleName =
  | "Owner"
  | "Admin"
  | "Manager"
  | "Editor"
  | "Analyst"
  | "Viewer";

export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRoleName, PermissionCode[]> = {
  Owner: [
    "organization.read",
    "organization.update",
    "members.read",
    "members.invite",
    "members.remove",
    "member.invite",
    "member.remove",
    "teams.read",
    "teams.create",
    "teams.update",
    "teams.delete",
    "approvals.read",
    "approvals.decide",
    "approvals.request",
    "approvals.cancel",
    "comments.read",
    "comments.create",
    "comments.edit",
    "comments.delete",
    "comments.resolve",
    "roles.read",
    "roles.create",
    "roles.update",
    "roles.delete",
    "roles.assign",
    "qr.read",
    "qr.create",
    "qr.update",
    "qr.delete",
    "qr.publish",
    "routing.read",
    "routing.update",
    "routing.publish",
    "route.read",
    "route.update",
    "route.publish",
    "campaigns.read",
    "campaigns.create",
    "campaigns.update",
    "campaigns.delete",
    "folders.read",
    "folders.create",
    "folders.update",
    "folders.delete",
    "landing_pages.read",
    "landing_pages.create",
    "landing_pages.update",
    "landing_pages.publish",
    "landing_pages.delete",
    "brand.read",
    "brand.manage",
    "analytics.read",
    "analytics.export",
    "guardian.read",
    "guardian.manage",
    "billing.read",
    "billing.manage",
    "api_keys.read",
    "api_keys.manage",
    "api.manage",
    "webhooks.read",
    "webhooks.manage",
    "reports.read",
    "reports.create",
    "reports.share",
    "audit.read",
    "activity.read",
    "activity.export",
    "domains.read",
    "domains.manage",
  ],
  Admin: [
    "organization.read",
    "organization.update",
    "members.read",
    "members.invite",
    "members.remove",
    "member.invite",
    "member.remove",
    "teams.read",
    "teams.create",
    "teams.update",
    "teams.delete",
    "approvals.read",
    "approvals.decide",
    "approvals.request",
    "approvals.cancel",
    "comments.read",
    "comments.create",
    "comments.edit",
    "comments.delete",
    "comments.resolve",
    "roles.read",
    "roles.assign",
    "qr.read",
    "qr.create",
    "qr.update",
    "qr.delete",
    "qr.publish",
    "routing.read",
    "routing.update",
    "routing.publish",
    "route.read",
    "route.update",
    "route.publish",
    "campaigns.read",
    "campaigns.create",
    "campaigns.update",
    "campaigns.delete",
    "folders.read",
    "folders.create",
    "folders.update",
    "folders.delete",
    "landing_pages.read",
    "landing_pages.create",
    "landing_pages.update",
    "landing_pages.publish",
    "landing_pages.delete",
    "brand.read",
    "brand.manage",
    "analytics.read",
    "analytics.export",
    "guardian.read",
    "guardian.manage",
    "billing.read",
    "api_keys.read",
    "api_keys.manage",
    "api.manage",
    "webhooks.read",
    "webhooks.manage",
    "reports.read",
    "reports.create",
    "reports.share",
    "audit.read",
    "activity.read",
    "activity.export",
    "domains.read",
    "domains.manage",
  ],
  Manager: [
    "organization.read",
    "members.read",
    "teams.read",
    "approvals.read",
    "approvals.decide",
    "approvals.request",
    "comments.read",
    "comments.create",
    "comments.edit",
    "comments.resolve",
    "qr.read",
    "qr.create",
    "qr.update",
    "qr.publish",
    "routing.read",
    "routing.update",
    "routing.publish",
    "route.read",
    "route.update",
    "route.publish",
    "campaigns.read",
    "campaigns.create",
    "campaigns.update",
    "folders.read",
    "folders.create",
    "folders.update",
    "landing_pages.read",
    "landing_pages.create",
    "landing_pages.update",
    "landing_pages.publish",
    "brand.read",
    "analytics.read",
    "analytics.export",
    "guardian.read",
    "guardian.manage",
    "reports.read",
    "reports.create",
    "reports.share",
    "activity.read",
    "activity.export",
    "domains.read",
  ],
  Editor: [
    "organization.read",
    "members.read",
    "teams.read",
    "approvals.read",
    "approvals.request",
    "comments.read",
    "comments.create",
    "comments.edit",
    "qr.read",
    "qr.create",
    "qr.update",
    "routing.read",
    "routing.update",
    "route.read",
    "route.update",
    "campaigns.read",
    "campaigns.create",
    "campaigns.update",
    "folders.read",
    "folders.create",
    "folders.update",
    "landing_pages.read",
    "landing_pages.create",
    "landing_pages.update",
    "brand.read",
    "analytics.read",
    "reports.read",
    "reports.create",
    "activity.read",
    "domains.read",
  ],
  Analyst: [
    "organization.read",
    "members.read",
    "teams.read",
    "approvals.read",
    "comments.read",
    "qr.read",
    "routing.read",
    "route.read",
    "campaigns.read",
    "folders.read",
    "landing_pages.read",
    "brand.read",
    "analytics.read",
    "analytics.export",
    "reports.read",
    "reports.create",
    "reports.share",
    "activity.read",
    "activity.export",
    "domains.read",
  ],
  Viewer: [
    "organization.read",
    "members.read",
    "teams.read",
    "approvals.read",
    "comments.read",
    "qr.read",
    "routing.read",
    "route.read",
    "campaigns.read",
    "folders.read",
    "landing_pages.read",
    "brand.read",
    "analytics.read",
    "reports.read",
    "activity.read",
    "domains.read",
  ],
};

export const ALL_PERMISSIONS: PermissionCode[] = SYSTEM_ROLE_PERMISSIONS.Owner;
