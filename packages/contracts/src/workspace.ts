/**
 * NXTQR — Workspace Control Plane Contracts & DTOs
 * Authoritative interfaces, types, and schemas for workspace operational control.
 */

import { SaaSTier } from "./entitlements";

export interface WorkspaceIdentity {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  billingPlan: SaaSTier;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  description: string;
  timezone: string;
  locale: string;
}

export interface WorkspaceOwner {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface WorkspaceStats {
  memberCount: number;
  teamCount: number;
  qrCount: number;
  campaignCount: number;
  brandKitCount: number;
  domainCount: number;
  fileCount: number;
  landingPageCount: number;
  templateCount: number;
}

export interface WorkspaceBrandDefaults {
  defaultBrandKitId?: string | null;
  defaultBrandKitName?: string | null;
  defaultBrandKitSlug?: string | null;
  defaultBrandKitUpdatedAt?: string | null;
}

export interface WorkspaceQrDefaults {
  errorCorrection: "L" | "M" | "Q" | "H";
  quietZone: number;
  moduleStyle: "squares" | "rounded" | "dots" | "diamond";
  eyeOuterStyle: "square" | "rounded" | "leaf";
  eyeInnerStyle: "square" | "dot";
  fgColor: string;
  bgColor: string;
  frameStyle: "none" | "simple" | "badge";
  frameText: string;
  format: "png" | "svg" | "pdf";
  size: number;
}

export interface WorkspaceCollaborationPolicy {
  defaultRoleId: string;
  defaultRoleName?: string;
  invitationPolicy: "admins_and_owners" | "owners_only" | "all_members";
  approvalRequiredForPublish: boolean;
  externalSharingEnabled: boolean;
}

export interface WorkspaceNotificationPreferences {
  inApp: boolean;
  email: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

export interface WorkspaceStorageComposition {
  totalBytes: number;
  fileCount: number;
  byCategory: {
    files: number;
    qrAssets: number;
    brandAssets: number;
    exports: number;
  };
}

export interface WorkspaceCapabilityItem {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  limit?: number | string;
  requiredTier?: SaaSTier;
}

export interface WorkspaceDeletionImpact {
  qrCodes: number;
  campaigns: number;
  brandKits: number;
  domains: number;
  files: number;
  members: number;
  teams: number;
  landingPages: number;
  templates: number;
}

export interface WorkspaceBrandPropagationImpact {
  qrCodesUsingDefault: number;
  templatesUsingDefault: number;
  landingPagesUsingDefault: number;
}

export interface WorkspaceAvailableBrandKit {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface WorkspaceAvailableRole {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface WorkspaceEligibleMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  roleName: string;
}

export interface WorkspaceControlPlaneOverview {
  identity: WorkspaceIdentity;
  owner: WorkspaceOwner;
  stats: WorkspaceStats;
  brandDefaults: WorkspaceBrandDefaults;
  qrDefaults: WorkspaceQrDefaults;
  collaborationPolicy: WorkspaceCollaborationPolicy;
  notificationPreferences: WorkspaceNotificationPreferences;
  storage: WorkspaceStorageComposition;
  domains: {
    customDomainsCount: number;
    defaultHost: string;
    shortUrlBase: string;
  };
  capabilities: WorkspaceCapabilityItem[];
  userPermissions: {
    canUpdate: boolean;
    canTransferOwnership: boolean;
    canDelete: boolean;
    canExport: boolean;
    isOwner: boolean;
  };
  availableBrandKits: WorkspaceAvailableBrandKit[];
  availableRoles: WorkspaceAvailableRole[];
  eligibleTransferMembers: WorkspaceEligibleMember[];
}

// Mutation Request DTOs
export interface UpdateWorkspaceGeneralRequest {
  name?: string;
  slug?: string;
  description?: string;
  timezone?: string;
  locale?: string;
}

export interface UpdateWorkspaceLogoRequest {
  logoUrl: string | null;
}

export interface UpdateWorkspaceBrandDefaultsRequest {
  defaultBrandKitId: string | null;
}

export interface UpdateWorkspaceQrDefaultsRequest {
  qrDefaults: WorkspaceQrDefaults;
}

export interface UpdateWorkspaceCollaborationRequest {
  collaborationPolicy: WorkspaceCollaborationPolicy;
}

export interface UpdateWorkspaceNotificationsRequest {
  notificationPreferences: WorkspaceNotificationPreferences;
}

export interface TransferWorkspaceOwnershipRequest {
  newOwnerMemberId: string;
  confirmationWorkspaceName: string;
}

export interface ArchiveWorkspaceRequest {
  confirmationWorkspaceName: string;
}

export interface DeleteWorkspaceRequest {
  confirmationWorkspaceName: string;
}
