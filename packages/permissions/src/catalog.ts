/**
 * NXTQR — Canonical Permission Registry & Catalog
 * Single source of truth for application capabilities.
 */

import { PermissionCode, SystemRoleName } from "@nxtqr/contracts";

export const PERMISSIONS = {
  // Organization & Governance
  ORGANIZATION_READ: "organization.read",
  ORGANIZATION_UPDATE: "organization.update",

  // Members & Access
  MEMBERS_READ: "members.read",
  MEMBERS_INVITE: "members.invite",
  MEMBERS_REMOVE: "members.remove",

  // Teams
  TEAMS_READ: "teams.read",
  TEAMS_CREATE: "teams.create",
  TEAMS_UPDATE: "teams.update",
  TEAMS_DELETE: "teams.delete",

  // Roles & Governance
  ROLES_READ: "roles.read",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  ROLES_ASSIGN: "roles.assign",

  // QR Lifecycle
  QR_READ: "qr.read",
  QR_CREATE: "qr.create",
  QR_UPDATE: "qr.update",
  QR_DELETE: "qr.delete",
  QR_PUBLISH: "qr.publish",

  // Routing Policies
  ROUTING_READ: "routing.read",
  ROUTING_UPDATE: "routing.update",
  ROUTING_PUBLISH: "routing.publish",

  // Campaigns
  CAMPAIGNS_READ: "campaigns.read",
  CAMPAIGNS_CREATE: "campaigns.create",
  CAMPAIGNS_UPDATE: "campaigns.update",
  CAMPAIGNS_DELETE: "campaigns.delete",

  // Folders
  FOLDERS_READ: "folders.read",
  FOLDERS_CREATE: "folders.create",
  FOLDERS_UPDATE: "folders.update",
  FOLDERS_DELETE: "folders.delete",

  // Landing Pages & Destination Studio
  LANDING_PAGES_READ: "landing_pages.read",
  LANDING_PAGES_CREATE: "landing_pages.create",
  LANDING_PAGES_UPDATE: "landing_pages.update",
  LANDING_PAGES_PUBLISH: "landing_pages.publish",
  LANDING_PAGES_DELETE: "landing_pages.delete",

  // Brand Kits
  BRAND_READ: "brand.read",
  BRAND_MANAGE: "brand.manage",

  // Analytics
  ANALYTICS_READ: "analytics.read",
  ANALYTICS_EXPORT: "analytics.export",

  // Guardian
  GUARDIAN_READ: "guardian.read",
  GUARDIAN_MANAGE: "guardian.manage",

  // Billing
  BILLING_READ: "billing.read",
  BILLING_MANAGE: "billing.manage",

  // Developer Platform
  API_KEYS_READ: "api_keys.read",
  API_KEYS_MANAGE: "api_keys.manage",
  WEBHOOKS_READ: "webhooks.read",
  WEBHOOKS_MANAGE: "webhooks.manage",

  // Reports
  REPORTS_READ: "reports.read",
  REPORTS_CREATE: "reports.create",
  REPORTS_SHARE: "reports.share",

  // Audit
  AUDIT_READ: "audit.read",

  // Domains
  DOMAINS_READ: "domains.read",
  DOMAINS_MANAGE: "domains.manage",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export interface PermissionDefinition {
  code: PermissionCode;
  label: string;
  description: string;
  category: string;
}

export interface PermissionCategoryGroup {
  id: string;
  category: string;
  description: string;
  permissions: PermissionDefinition[];
}

export const PERMISSION_GROUPS: PermissionCategoryGroup[] = [
  {
    id: "organization",
    category: "Organization & Governance",
    description: "Tenant configuration, policies, and forensic audit inspection",
    permissions: [
      {
        code: "organization.read",
        label: "View Organization",
        description: "View workspace profile, identifiers, and configuration",
        category: "Organization & Governance",
      },
      {
        code: "organization.update",
        label: "Update Organization",
        description: "Modify workspace name, slug, branding, and policies",
        category: "Organization & Governance",
      },
      {
        code: "audit.read",
        label: "View Audit Trail",
        description: "Inspect immutable security audit event stream",
        category: "Organization & Governance",
      },
    ],
  },
  {
    id: "members",
    category: "Members & Access Control",
    description: "Manage who can enter the workspace and their assigned authority",
    permissions: [
      {
        code: "members.read",
        label: "View Members",
        description: "List organization members, roles, and pending invitations",
        category: "Members & Access Control",
      },
      {
        code: "members.invite",
        label: "Invite Members",
        description: "Issue new invitations to collaborators with assigned roles",
        category: "Members & Access Control",
      },
      {
        code: "members.remove",
        label: "Remove Members",
        description: "Revoke membership (protected against the final workspace owner)",
        category: "Members & Access Control",
      },
    ],
  },
  {
    id: "teams",
    category: "Teams & Collaboration",
    description: "Organize collaborators into structured teams with scoped access",
    permissions: [
      {
        code: "teams.read",
        label: "View Teams",
        description: "Browse team lists and view team membership assignments",
        category: "Teams & Collaboration",
      },
      {
        code: "teams.create",
        label: "Create Teams",
        description: "Create new collaborative teams within the workspace",
        category: "Teams & Collaboration",
      },
      {
        code: "teams.update",
        label: "Update Teams",
        description: "Modify team metadata, add members, or remove team members",
        category: "Teams & Collaboration",
      },
      {
        code: "teams.delete",
        label: "Delete Teams",
        description: "Disband and delete team units (members remain in workspace)",
        category: "Teams & Collaboration",
      },
    ],
  },
  {
    id: "roles",
    category: "Roles & Permissions",
    description: "Define custom access boundaries and assign authority levels",
    permissions: [
      {
        code: "roles.read",
        label: "View Roles",
        description: "Inspect system and custom role definitions and permission matrices",
        category: "Roles & Permissions",
      },
      {
        code: "roles.create",
        label: "Create Custom Roles",
        description: "Author new custom roles with tailored permission subsets",
        category: "Roles & Permissions",
      },
      {
        code: "roles.update",
        label: "Update Roles",
        description: "Modify permissions assigned to custom workspace roles",
        category: "Roles & Permissions",
      },
      {
        code: "roles.delete",
        label: "Delete Roles",
        description: "Delete custom roles not currently bound to active members",
        category: "Roles & Permissions",
      },
      {
        code: "roles.assign",
        label: "Assign Member Roles",
        description: "Promote, demote, or reassign roles to workspace members",
        category: "Roles & Permissions",
      },
    ],
  },
  {
    id: "qr",
    category: "QR Asset Lifecycle",
    description: "Create, edit, design, and publish dynamic QR assets",
    permissions: [
      {
        code: "qr.read",
        label: "View QRs",
        description: "Browse QR asset catalogue, design states, and analytics",
        category: "QR Asset Lifecycle",
      },
      {
        code: "qr.create",
        label: "Create QRs",
        description: "Generate new dynamic QR records and studio drafts",
        category: "QR Asset Lifecycle",
      },
      {
        code: "qr.update",
        label: "Edit QRs",
        description: "Modify QR destinations, designs, frames, and metadata",
        category: "QR Asset Lifecycle",
      },
      {
        code: "qr.publish",
        label: "Publish QR Revisions",
        description: "Deploy approved QR snapshots to Cloudflare edge routing",
        category: "QR Asset Lifecycle",
      },
      {
        code: "qr.delete",
        label: "Archive / Delete QRs",
        description: "Move QR assets to archived state or permanently remove",
        category: "QR Asset Lifecycle",
      },
    ],
  },
  {
    id: "routing",
    category: "Routing & Smart Policies",
    description: "Configure dynamic condition rules (device, OS, geo, time)",
    permissions: [
      {
        code: "routing.read",
        label: "View Routing Rules",
        description: "Inspect traffic condition policies and destination targets",
        category: "Routing & Smart Policies",
      },
      {
        code: "routing.update",
        label: "Update Routing Rules",
        description: "Configure device, geo-fencing, and time-of-day rule sets",
        category: "Routing & Smart Policies",
      },
      {
        code: "routing.publish",
        label: "Publish Routing",
        description: "Commit routing changes to live edge resolver snapshots",
        category: "Routing & Smart Policies",
      },
    ],
  },
  {
    id: "campaigns",
    category: "Campaigns & Initiatives",
    description: "Organize assets into marketing initiatives and business projects",
    permissions: [
      {
        code: "campaigns.read",
        label: "View Campaigns",
        description: "Inspect marketing campaigns, schedules, and grouped assets",
        category: "Campaigns & Initiatives",
      },
      {
        code: "campaigns.create",
        label: "Create Campaigns",
        description: "Create new marketing campaign containers",
        category: "Campaigns & Initiatives",
      },
      {
        code: "campaigns.update",
        label: "Update Campaigns",
        description: "Edit campaign parameters, schedules, and asset memberships",
        category: "Campaigns & Initiatives",
      },
      {
        code: "campaigns.delete",
        label: "Delete Campaigns",
        description: "Archive or delete campaign groupings",
        category: "Campaigns & Initiatives",
      },
    ],
  },
  {
    id: "folders",
    category: "Folders & Asset Spaces",
    description: "Organize QR codes into structured visual workspaces",
    permissions: [
      {
        code: "folders.read",
        label: "View Folders",
        description: "Browse organized workspaces and unfiled QR assets",
        category: "Folders & Asset Spaces",
      },
      {
        code: "folders.create",
        label: "Create Folders",
        description: "Create new QR asset spaces with emoji and visual accents",
        category: "Folders & Asset Spaces",
      },
      {
        code: "folders.update",
        label: "Update Folders",
        description: "Edit folder metadata, accents, and manage QR assignments",
        category: "Folders & Asset Spaces",
      },
      {
        code: "folders.delete",
        label: "Delete Folders",
        description: "Safely remove folders, moving associated QR codes to Unfiled",
        category: "Folders & Asset Spaces",
      },
    ],
  },
  {
    id: "landing_pages",
    category: "Landing Pages & Destinations",
    description: "Build and publish mobile-first destination experiences",
    permissions: [
      {
        code: "landing_pages.read",
        label: "View Landing Pages",
        description: "Browse landing pages, inspect versions, and preview drafts",
        category: "Landing Pages & Destinations",
      },
      {
        code: "landing_pages.create",
        label: "Create Landing Pages",
        description: "Create new destination landing pages with starter templates",
        category: "Landing Pages & Destinations",
      },
      {
        code: "landing_pages.update",
        label: "Update Landing Pages",
        description: "Edit blocks, themes, and autosave drafts in Destination Studio",
        category: "Landing Pages & Destinations",
      },
      {
        code: "landing_pages.publish",
        label: "Publish Landing Pages",
        description: "Publish immutable versions and set live public destinations",
        category: "Landing Pages & Destinations",
      },
      {
        code: "landing_pages.delete",
        label: "Delete Landing Pages",
        description: "Archive or delete landing pages with dependency protection",
        category: "Landing Pages & Destinations",
      },
    ],
  },
  {
    id: "analytics",
    category: "Analytics & Intelligence",
    description: "Scan telemetry, traffic quality, and performance reporting",
    permissions: [
      {
        code: "analytics.read",
        label: "View Analytics",
        description: "Access scan volume, estimated unique scans, and geo telemetry",
        category: "Analytics & Intelligence",
      },
      {
        code: "analytics.export",
        label: "Export Analytics",
        description: "Export aggregated telemetry datasets as CSV or JSON",
        category: "Analytics & Intelligence",
      },
      {
        code: "reports.read",
        label: "View Reports",
        description: "Browse scheduled and generated intelligence reports",
        category: "Analytics & Intelligence",
      },
      {
        code: "reports.create",
        label: "Generate Reports",
        description: "Trigger asynchronous report generation jobs",
        category: "Analytics & Intelligence",
      },
    ],
  },
  {
    id: "guardian",
    category: "Link Guardian Operations",
    description: "Automated destination health monitoring and fallback protection",
    permissions: [
      {
        code: "guardian.read",
        label: "View Guardian",
        description: "Inspect destination health checks and incident logs",
        category: "Link Guardian Operations",
      },
      {
        code: "guardian.manage",
        label: "Manage Guardian",
        description: "Configure probe intervals, thresholds, and fallback targets",
        category: "Link Guardian Operations",
      },
    ],
  },
  {
    id: "developer",
    category: "Developer Platform & API",
    description: "Programmatic access tokens and outbound event webhooks",
    permissions: [
      {
        code: "api_keys.read",
        label: "View API Keys",
        description: "List active API credentials and scopes",
        category: "Developer Platform & API",
      },
      {
        code: "api_keys.manage",
        label: "Manage API Keys",
        description: "Generate, scope, and revoke programmatic API keys",
        category: "Developer Platform & API",
      },
      {
        code: "webhooks.read",
        label: "View Webhooks",
        description: "Inspect registered customer webhook endpoints and deliveries",
        category: "Developer Platform & API",
      },
      {
        code: "webhooks.manage",
        label: "Manage Webhooks",
        description: "Register and configure outbound webhook subscriptions",
        category: "Developer Platform & API",
      },
    ],
  },
  {
    id: "billing",
    category: "Commerce & Subscriptions",
    description: "Manage subscription tiers, payment methods, and invoices",
    permissions: [
      {
        code: "billing.read",
        label: "View Billing",
        description: "Inspect plan details, seat usage, and payment receipts",
        category: "Commerce & Subscriptions",
      },
      {
        code: "billing.manage",
        label: "Manage Subscriptions",
        description: "Upgrade plan, modify payment credentials, or cancel tier",
        category: "Commerce & Subscriptions",
      },
    ],
  },
];

export const SYSTEM_ROLE_METADATA: Record<
  SystemRoleName,
  { label: string; description: string; isProtected: boolean }
> = {
  Owner: {
    label: "Workspace Owner",
    description: "Ultimate administrative authority with full control over billing, members, and deletion.",
    isProtected: true,
  },
  Admin: {
    label: "Administrator",
    description: "Full workspace operational management including member invitations, teams, and asset publishing.",
    isProtected: true,
  },
  Manager: {
    label: "Operations Manager",
    description: "Can create and publish QR assets, manage campaigns, and view telemetry without member administration.",
    isProtected: true,
  },
  Editor: {
    label: "Editor",
    description: "Create and modify QR assets and campaigns. Cannot publish to live edge or manage workspace access.",
    isProtected: true,
  },
  Analyst: {
    label: "Data Analyst",
    description: "Read-only access to QR configurations with full permission to view and export analytics.",
    isProtected: true,
  },
  Viewer: {
    label: "Viewer",
    description: "Read-only access across QR assets, campaigns, and workspace directories.",
    isProtected: true,
  },
};
