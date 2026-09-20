/**
 * NXTQR — Collaboration & Enterprise Governance Contracts
 * Type contracts for multi-tenant teams, threaded discussions,
 * immutable revision approvals, live presence, and client portals.
 */

export type PolymorphicResourceType = "qr" | "campaign" | "report" | "folder" | "brand_kit";

export type TeamResourceAccessLevel = "view" | "edit" | "manage";

export interface ResourceTeamAssignment {
  id: string;
  organizationId: string;
  teamId: string;
  resourceType: PolymorphicResourceType;
  resourceId: string;
  accessLevel: TeamResourceAccessLevel;
  createdAt: number;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  membersCount: number;
  resourcesCount?: number;
  createdAt: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  memberId: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId?: string;
  joinedAt: number;
}

export interface Comment {
  id: string;
  organizationId: string;
  resourceType: PolymorphicResourceType;
  resourceId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  resolved: boolean;
  replies?: Comment[];
  createdAt: number;
  updatedAt?: number;
}

export interface Mention {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  readAt?: number | null;
  createdAt: number;
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type ApprovalStepStatus = "WAITING" | "APPROVED" | "REJECTED" | "SKIPPED";
export type ApproverType = "USER" | "ROLE" | "TEAM";

export interface ApprovalStep {
  id: string;
  requestId: string;
  stepOrder: number;
  approverType: ApproverType;
  approverId: string;
  approverName?: string;
  status: ApprovalStepStatus;
  decisionNote?: string;
  actedAt?: number | null;
  createdAt: number;
}

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  qrId: string;
  resourceType: PolymorphicResourceType;
  resourceId: string;
  requestedBy: string;
  requestedByName: string;
  targetVersionId: string;
  targetVersionNumber: number;
  status: ApprovalStatus;
  decisionNote?: string;
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: number | null;
  steps: ApprovalStep[];
  currentStepOrder: number;
  createdAt: number;
}

export interface QRVersionSnapshot {
  id: string;
  qrId: string;
  versionNumber: number;
  destinationId: string;
  designId: string;
  payloadJson?: string;
  designJson?: string;
  changeSummary: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  isPublished?: boolean;
}

export interface VersionDiffSummary {
  fromVersion: number;
  toVersion: number;
  destinationChanged: boolean;
  oldDestination?: string;
  newDestination?: string;
  stylingChanged: boolean;
  changes: string[];
}

export interface PresenceParticipant {
  connectionId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  resourceId: string;
  joinedAt: number;
  lastSeenAt: number;
  isEditing?: boolean;
  focusedField?: string;
}

export interface PresenceRoomState {
  roomId: string;
  organizationId: string;
  resourceType: PolymorphicResourceType;
  resourceId: string;
  participants: PresenceParticipant[];
  activeEditorId?: string | null;
  editLockExpiresAt?: number | null;
}

export interface ClientPortalBranding {
  primaryColor?: string;
  logoUrl?: string;
  companyName?: string;
  customDomain?: string;
}

export interface ClientPortal {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  brandingConfig: ClientPortalBranding;
  resourcesCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ClientPortalResourceGrant {
  id: string;
  portalId: string;
  resourceType: "qr" | "campaign" | "report";
  resourceId: string;
  accessLevel: "VIEW" | "DOWNLOAD";
  title: string;
  createdAt: number;
}

export type ActivityActionCode =
  | "QR_CREATED"
  | "QR_UPDATED"
  | "QR_PUBLISHED"
  | "COMMENT_ADDED"
  | "COMMENT_RESOLVED"
  | "MEMBER_JOINED"
  | "MEMBER_INVITED"
  | "TEAM_CREATED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "REPORT_CREATED"
  | "CAMPAIGN_UPDATED"
  | "SHARE_LINK_CREATED";

export interface ActivityEventEntry {
  id: string;
  organizationId: string;
  actorId?: string;
  actorName: string;
  actorAvatar?: string;
  action: ActivityActionCode;
  resourceType: PolymorphicResourceType;
  resourceId: string;
  resourceTitle?: string;
  metadata?: Record<string, unknown>;
  formattedText: string;
  createdAt: number;
}

export interface LockedTemplateRules {
  lockedLogoUrl?: string;
  lockedPrimaryColor?: string;
  lockedEyeStyle?: string;
  lockedPixelStyle?: string;
  lockedFrameStyle?: string;
  lockedFrameText?: string;
  enforceRules: boolean;
}
