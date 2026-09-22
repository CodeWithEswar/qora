export type ApprovalRequestStatus =
  | "PENDING"
  | "WAITING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "CHANGES_REQUESTED"
  | "WITHDRAWN";

export type ApprovalExecutionStatus =
  | "NOT_STARTED"
  | "QUEUED"
  | "PROCESSING"
  | "APPLIED"
  | "FAILED";

export type ApprovalType =
  | "QR_REPLACEMENT"
  | "MEMBER_ROLE_ESCALATION"
  | "TEAM_ACCESS_OVERRIDE"
  | "BULK_BATCH_DISPATCH"
  | "QR_VERSION_PUBLISH"
  | "BRAND_KIT_UPDATE"
  | "CAMPAIGN_LAUNCH"
  | "TEMPLATE_PUBLISH"
  | "ROUTING_RULE_UPDATE";

export type ReviewPolicy =
  | "ANY_AUTHORIZED"
  | "TEAM_MEMBER"
  | "DIRECT_ASSIGNMENT"
  | "TWO_OF_THREE"
  | "SINGLE"
  | "DUAL_CUSTODY";

export type ChangeTopologyCategory =
  | "DESIGN"
  | "CONTENT"
  | "ROUTING"
  | "BRAND"
  | "SECURITY"
  | "GOVERNANCE"
  | "METADATA";

export interface ChangeTopologyItem {
  category: ChangeTopologyCategory;
  label: string;
  changeCount: number;
  status: "MODIFIED" | "UNCHANGED" | "ADDED" | "REMOVED";
}

export interface ImpactResourceItem {
  id: string;
  name: string;
  type: string;
  status?: string;
  relationship?: string;
  href?: string;
}

export interface ImpactRadiusCategory {
  category: string;
  label: string;
  count: number;
  description: string;
  resources?: ImpactResourceItem[];
}

export interface DetailedPropertyDiff {
  id: string;
  category: ChangeTopologyCategory;
  field: string;
  label: string;
  changeType: "CHANGED" | "ADDED" | "REMOVED" | "UNCHANGED";
  beforeValue?: string | number | boolean | null;
  proposedValue?: string | number | boolean | null;
  beforeDisplay?: string;
  proposedDisplay?: string;
  isSecret?: boolean;
}

export interface ApprovalEvidenceItem {
  id: string;
  title: string;
  fileType: "IMAGE" | "DOCUMENT" | "IDENTITY" | "LOG";
  sizeBytes?: number;
  url?: string;
  referenceId?: string;
  uploadedAt: string;
  uploadedByName: string;
}

export interface ApprovalChangeDiff {
  beforeLabel: string;
  beforeValue: string;
  beforeStatus?: string;
  proposedLabel: string;
  proposedValue: string;
  proposedStatus?: string;
  gaining?: string[];
  unchanged?: string[];
  losing?: string[];
}

export interface DecisionTraceEvent {
  id: string;
  step: "REQUESTED" | "ASSIGNED" | "REVIEWED" | "DECIDED" | "EXECUTED";
  title: string;
  description?: string;
  actorName: string;
  timestamp: string;
  isCompleted: boolean;
  isFailed?: boolean;
}

export interface ApprovalSummary {
  id: string;
  publicId: string;
  organizationId: string;
  type: ApprovalType;
  title: string;
  description?: string | null;
  reason?: string | null;
  status: ApprovalRequestStatus;
  executionStatus: ApprovalExecutionStatus;
  executionError?: string | null;
  affectedEntityType: string;
  affectedEntityId: string;
  affectedEntityRef: string;
  targetRevisionNumber: number;
  baseRevisionNumber?: number;
  targetRevisionId?: string;
  changeTopology?: ChangeTopologyItem[];
  impactRadius?: ImpactRadiusCategory[];
  isActionableForUser: boolean;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  assignedTeam?: {
    id: string;
    name: string;
  } | null;
  assignedMember?: {
    id: string;
    name: string;
  } | null;
  reviewPolicy: ReviewPolicy;
  evidenceCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  decidedAt?: string | null;
  decidedBy?: {
    id: string;
    name: string;
  } | null;
  decisionNote?: string | null;
  availableActions: {
    canApprove: boolean;
    canReject: boolean;
    canCancel: boolean;
    canRetry: boolean;
    canRequestChanges: boolean;
    canWithdraw: boolean;
    isSelfRequester: boolean;
  };
}

export interface ApprovalDetail extends ApprovalSummary {
  changeDiff: ApprovalChangeDiff;
  propertyDiffs?: DetailedPropertyDiff[];
  impactRadiusCategories?: ImpactRadiusCategory[];
  evidenceItems: ApprovalEvidenceItem[];
  trace: DecisionTraceEvent[];
  assignedReviewers: Array<{
    id: string;
    name: string;
    roleName: string;
    avatarUrl?: string | null;
    hasDecided?: boolean;
    decision?: string;
  }>;
  impactSummary: {
    affectedObjectsCount: number;
    consequenceDescription: string;
    reversibility: "REVERSIBLE" | "IRREVERSIBLE" | "GOVERNED";
  };
}

export interface ApprovalSignalMetrics {
  totalRequests: number;
  waitingCount: number;
  inReviewCount: number;
  decidedCount: number;
  myActionCount: number;
  // Legacy / backwards-compat aliases
  openCount: number;
  myReviewCount: number;
  decidedTodayCount: number;
}

export interface ApprovalHorizonMetrics {
  needsReviewCount: number;
  teamAssignedCount: number;
  directAssignedCount: number;
  waitingCount: number;
  decidedCount: number;
  topCategory: string;
}

export type CanonicalApprovalView = "my_queue" | "all_requests" | "requested_by_me" | "history";

export interface ApprovalFilters {
  view?: CanonicalApprovalView | "my_review" | "all_open" | "decided";
  search?: string;
  type?: ApprovalType | "all";
  teamId?: string | "all";
  status?: ApprovalRequestStatus | "all";
  executionStatus?: ApprovalExecutionStatus | "all";
  sort?: "oldest_waiting" | "newest" | "recently_decided" | "resource_name";
}

export const CANONICAL_APPROVAL_TYPES: Array<{
  type: ApprovalType;
  label: string;
  description: string;
  domain: string;
  requiredPermission: string;
  selfApprovalAllowed: boolean;
}> = [
  {
    type: "QR_REPLACEMENT",
    label: "QR Identity Replacement",
    description: "Authorize replacement QR identity or destination re-assignment for active QR asset.",
    domain: "QR Operations",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "MEMBER_ROLE_ESCALATION",
    label: "Member Role Escalation",
    description: "Grant higher organization authority to a member.",
    domain: "Identity & Access",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "TEAM_ACCESS_OVERRIDE",
    label: "Team Domain Access Override",
    description: "Modify operational reach levels for a collaborative team.",
    domain: "Access Governance",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "BULK_BATCH_DISPATCH",
    label: "Bulk QR Production Dispatch",
    description: "Approve high-volume QR print batch for physical release.",
    domain: "Operations & Printing",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "QR_VERSION_PUBLISH",
    label: "Emergency Destination Override",
    description: "Publish high-impact edge destination changes to live QR.",
    domain: "QR Brain / Edge",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "BRAND_KIT_UPDATE",
    label: "Brand Kit Governance Revision",
    description: "Approve immutable changes to typography, color palette, and asset styling.",
    domain: "Brand Systems",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "CAMPAIGN_LAUNCH",
    label: "Campaign Schedule & Launch",
    description: "Authorize campaign publication and live audience routing.",
    domain: "Campaign Governance",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "TEMPLATE_PUBLISH",
    label: "Template Design System Release",
    description: "Publish reusable QR template to organizational catalog.",
    domain: "Design Governance",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
  {
    type: "ROUTING_RULE_UPDATE",
    label: "Edge Routing Rule Modification",
    description: "Update conditional traffic dispatch logic for edge resolvers.",
    domain: "QR Brain / Edge",
    requiredPermission: "approvals.decide",
    selfApprovalAllowed: false,
  },
];

export const STANDARDIZED_REJECTION_REASONS = [
  { code: "INSUFFICIENT_EVIDENCE", label: "Insufficient evidence provided" },
  { code: "POLICY_CONFLICT", label: "Conflicts with organization policy" },
  { code: "INVALID_REQUEST", label: "Invalid request parameters" },
  { code: "DUPLICATE_REQUEST", label: "Duplicate or redundant request" },
  { code: "STALE_CONTEXT", label: "Affected asset context has changed" },
  { code: "OTHER", label: "Other operational rationale" },
] as const;
