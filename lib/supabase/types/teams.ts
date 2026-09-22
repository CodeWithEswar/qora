export type AccessDomainLevel = "FULL" | "MANAGE" | "VIEW" | "NONE";

export interface TeamAccessDomain {
  domain: string;
  level: AccessDomainLevel;
}

export interface TeamMemberItem {
  membershipId: string;
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  roleName: string;
  roleCode: string;
  isCurrentUser: boolean;
  joinedAt: string;
}

export type TeamResourceType =
  | "qr_code"
  | "campaign"
  | "brand_kit"
  | "template"
  | "domain"
  | "folder";

export type TeamRelationshipType = "responsible" | "collaborator" | "reviewer";

export interface TeamResourceAssignment {
  id: string;
  teamId: string;
  organizationId: string;
  resourceType: TeamResourceType;
  resourceId: string;
  relationshipType: TeamRelationshipType;
  title: string;
  ref: string;
  state?: string;
  createdAt: string;
}

export interface TeamConnectedWorkSummary {
  qrCount: number;
  campaignCount: number;
  brandKitCount: number;
  templateCount: number;
  domainCount: number;
  folderCount: number;
  totalCount: number;
  recentAssignments?: TeamResourceAssignment[];
}

export interface TeamOverlapItem {
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  sharedMemberCount: number;
  sharedMembers: TeamMemberItem[];
}

export interface TeamSummary {
  id: string;
  publicId: string;
  organizationId: string;
  name: string;
  description?: string | null;
  state: "active" | "archived";
  lead?: {
    membershipId: string;
    displayName: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  memberCount: number;
  memberPreview: TeamMemberItem[];
  accessDomains: TeamAccessDomain[];
  connectedWork: TeamConnectedWorkSummary;
  recentActivityCount: number;
  lastActivityAt?: string | null;
  createdAt: string;
  archivedAt?: string | null;
}

export interface TeamDetail extends TeamSummary {
  members: TeamMemberItem[];
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata: any;
    createdAt: string;
  }>;
  connectedWork: TeamConnectedWorkSummary & {
    assignments: TeamResourceAssignment[];
  };
  dependencies: {
    memberCount: number;
    pendingApprovalsCount: number;
    activeWorkflowsCount: number;
  };
}

export interface TeamFilters {
  search?: string;
  domain?: string;
  resource?: TeamResourceType | "all";
  size?: "1-5" | "6-10" | "10+" | "all";
  state?: "active" | "archived" | "all";
  sort?: "recent_active" | "recent_created" | "name" | "members_count" | "connected_work";
}

export interface TeamSignalMetrics {
  totalTeams: number;
  activeTeams: number;
  archivedTeams: number;
  totalMemberships: number;
  totalMembersInTeams: number; // unique members
  unassignedMembers: number;
  totalConnectedWork: number;
}

export const CANONICAL_OPERATIONAL_DOMAINS: Array<{
  domain: string;
  description: string;
}> = [
  { domain: "QR Operations", description: "QR lifecycle, dynamic studio, edge redirects, asset controls" },
  { domain: "QR Batch & Print", description: "Physical QR tags, print exports, batch fulfillment" },
  { domain: "Brand Kits & Assets", description: "Design templates, custom logos, vector assets, landing pages" },
  { domain: "Status & Guardian", description: "Routing anomaly detection, automated failover, alerts" },
  { domain: "Campaigns & Brain", description: "Dynamic routing rules, campaign groups, A/B testing" },
];
