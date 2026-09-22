export interface MemberSecuritySummary {
  isEmailVerified: boolean;
  isGoogleConnected: boolean;
  isMobileVerified: boolean;
}

export const ROLE_CAPABILITIES: Record<string, string[]> = {
  OWNER: [
    "Organization & Member Governance",
    "Billing, Invoices & Subscriptions",
    "Live Edge QR Publishing",
    "Asset Deletion & Archive",
    "QR & Campaign Creation",
    "Content & Design Studio",
    "Scan Telemetry & Intelligence",
    "Security & Developer API Keys",
  ],
  ADMIN: [
    "Organization & Member Governance",
    "Live Edge QR Publishing",
    "Asset Deletion & Archive",
    "QR & Campaign Creation",
    "Content & Design Studio",
    "Scan Telemetry & Intelligence",
  ],
  MEMBER: [
    "QR & Campaign Creation",
    "Content & Design Studio",
    "View QR Assets & Drafts",
    "Scan Telemetry & Intelligence",
  ],
  VIEWER: [
    "View QR Assets & Drafts",
    "Scan Telemetry & Intelligence",
  ],
};

export interface AdminMemberSummary {
  id: string; // membership id
  userId: string;
  publicRef: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  roleId: string;
  roleCode: string;
  roleName: string;
  roleDescription?: string | null;
  capabilities: string[];
  isSystemRole: boolean;
  status: "active" | "invited" | "suspended";
  joinedAt: string;
  lastActiveAt?: string | null;
  teams: Array<{ id: string; name: string }>;
  security: MemberSecuritySummary;
  isCurrentUser: boolean;
}

export interface MemberActivityEvent {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: any;
  createdAt: string;
}

export interface AdminMemberDetail extends AdminMemberSummary {
  recentActivity: MemberActivityEvent[];
}

export interface WorkspaceSignalMetrics {
  totalMembers: number;
  activeMembers: number;
  invitedMembers: number;
  suspendedMembers: number;
  totalTeams: number;
}

export interface WorkspaceTopology {
  organization: { id: string; name: string; slug: string };
  activeMembersCount: number;
  teamsCount: number;
  pendingInvitationsCount: number;
}

export interface MemberFilters {
  search?: string;
  role?: string;
  teamId?: string;
  status?: string;
  sort?: "name" | "recent_active" | "recent_joined" | "role";
}
