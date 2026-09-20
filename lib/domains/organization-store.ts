import "server-only";
import {
  OrganizationControlCenterOverview,
  OrganizationMemberRecord,
  OrganizationTeamRecord,
  OrganizationRoleRecord,
  OrganizationInvitationRecord,
} from "@nxtqr/db";
import { SYSTEM_ROLE_PERMISSIONS, PermissionCode } from "@nxtqr/contracts";
import { SessionUser } from "@/lib/auth/session";

export interface StoredApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: "active" | "revoked";
  lastUsedAt?: number;
  createdAt: number;
}

export interface StoredOrgData {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    billingPlan: string;
  };
  members: OrganizationMemberRecord[];
  teams: OrganizationTeamRecord[];
  roles: OrganizationRoleRecord[];
  invitations: OrganizationInvitationRecord[];
  apiKeys?: StoredApiKeyRecord[];
}

// In-memory runtime state for transient UI views (no local database or file storage)
const ORGS_CACHE = new Map<string, StoredOrgData>();

function ensureLoaded() {
  // Pure in-memory initialization
}

function persist() {
  // No filesystem writes — local database storage is strictly prohibited
}

function findUserFromCache(): any | null {
  return null;
}

const DEFAULT_SYSTEM_ROLES: OrganizationRoleRecord[] = [
  {
    id: "role_owner",
    organizationId: null,
    name: "Owner",
    description: "Full administrative and financial control over workspace",
    isSystem: true,
    memberCount: 1,
    permissions: SYSTEM_ROLE_PERMISSIONS.Owner,
  },
  {
    id: "role_admin",
    organizationId: null,
    name: "Admin",
    description: "Manage assets, team members, invitations, and publishing authority",
    isSystem: true,
    memberCount: 0,
    permissions: SYSTEM_ROLE_PERMISSIONS.Admin,
  },
  {
    id: "role_manager",
    organizationId: null,
    name: "Manager",
    description: "Create and publish QR assets and campaigns without member administration",
    isSystem: true,
    memberCount: 0,
    permissions: SYSTEM_ROLE_PERMISSIONS.Manager,
  },
  {
    id: "role_editor",
    organizationId: null,
    name: "Editor",
    description: "Create and edit QR assets. Cannot publish to live edge routing",
    isSystem: true,
    memberCount: 0,
    permissions: SYSTEM_ROLE_PERMISSIONS.Editor,
  },
  {
    id: "role_analyst",
    organizationId: null,
    name: "Analyst",
    description: "Read-only access to QR configurations with analytics export authority",
    isSystem: true,
    memberCount: 0,
    permissions: SYSTEM_ROLE_PERMISSIONS.Analyst,
  },
  {
    id: "role_viewer",
    organizationId: null,
    name: "Viewer",
    description: "Read-only inspection across workspace assets and folders",
    isSystem: true,
    memberCount: 0,
    permissions: SYSTEM_ROLE_PERMISSIONS.Viewer,
  },
];

/**
 * Gets or initializes the real organization data for an orgSlug using active session or users cache.
 */
export function getOrCreateOrgData(
  orgSlug: string,
  sessionUser?: SessionUser | null
): StoredOrgData {
  ensureLoaded();

  let existing = ORGS_CACHE.get(orgSlug);
  if (existing) {
    // If name is still Acme Workspace from previous demo, update it from session/slug
    if (existing.organization.name === "Acme Workspace" && orgSlug !== "acme") {
      const user = sessionUser || findUserFromCache();
      const ws = user?.workspaces?.find((w: any) => w.slug === orgSlug) || user?.workspaces?.[0];
      existing.organization.name = ws?.name || orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1).replace(/-/g, " ");
      existing.organization.billingPlan = ws?.plan || existing.organization.billingPlan || "FREE";
      if (user && existing.members.length > 0 && existing.members[0].name === "Hemanth Reddy") {
        existing.members = [
          {
            id: `mem_${user.id}`,
            userId: user.id,
            name: user.name || "Workspace Owner",
            email: user.email,
            avatarUrl: user.avatarUrl,
            roleId: "role_owner",
            roleName: "Owner",
            isSystemRole: true,
            status: "active",
            joinedAt: user.createdAt || Date.now(),
            teams: [],
          },
        ];
        existing.teams = [];
        existing.invitations = [];
      }
      persist();
    }
    return existing;
  }

  const user = sessionUser || findUserFromCache();
  const ws = user?.workspaces?.find((w: any) => w.slug === orgSlug) || user?.workspaces?.[0];

  const orgId = ws?.id || `org_${orgSlug.replace(/-/g, "_")}`;
  const orgName = ws?.name || orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1).replace(/-/g, " ");
  const billingPlan = ws?.plan || "FREE";

  const ownerMember: OrganizationMemberRecord = user
    ? {
        id: `mem_${user.id}`,
        userId: user.id,
        name: user.name || "Workspace Owner",
        email: user.email,
        avatarUrl: user.avatarUrl,
        roleId: "role_owner",
        roleName: "Owner",
        isSystemRole: true,
        status: "active",
        joinedAt: user.createdAt || Date.now(),
        teams: [],
      }
    : {
        id: `mem_primary_owner`,
        userId: "usr_owner",
        name: "Workspace Owner",
        email: `owner@${orgSlug}.com`,
        roleId: "role_owner",
        roleName: "Owner",
        isSystemRole: true,
        status: "active",
        joinedAt: Date.now(),
        teams: [],
      };

  const initialRoles: OrganizationRoleRecord[] = DEFAULT_SYSTEM_ROLES.map((r) => ({
    ...r,
    organizationId: null,
    memberCount: r.id === "role_owner" ? 1 : 0,
  }));

  const newOrgData: StoredOrgData = {
    organization: {
      id: orgId,
      name: orgName,
      slug: orgSlug,
      billingPlan,
    },
    members: [ownerMember],
    teams: [], // True empty state: NO fake teams!
    roles: initialRoles,
    invitations: [], // True empty state: NO fake invitations!
  };

  ORGS_CACHE.set(orgSlug, newOrgData);
  ORGS_CACHE.set(orgId, newOrgData);
  persist();

  return newOrgData;
}

/**
 * Builds the complete control center overview from stored data with real seat metrics.
 */
export function buildControlCenterOverview(data: StoredOrgData): OrganizationControlCenterOverview {
  const plan = data.organization.billingPlan || "FREE";
  const seatLimits: Record<string, number | null> = {
    FREE: 5,
    PRO: 20,
    BUSINESS: 100,
    ENTERPRISE: null,
  };

  const seatLimit = seatLimits[plan] ?? 5;
  const seatsAssigned = data.members.length;
  const seatsPercentage = seatLimit ? Math.min(100, Math.round((seatsAssigned / seatLimit) * 100)) : null;

  const customRoles = data.roles.filter((r) => !r.isSystem);

  // Recalculate member counts per role
  const roleMemberCounts = new Map<string, number>();
  for (const m of data.members) {
    roleMemberCounts.set(m.roleId, (roleMemberCounts.get(m.roleId) || 0) + 1);
  }

  const updatedRoles = data.roles.map((r) => ({
    ...r,
    memberCount: roleMemberCounts.get(r.id) || 0,
  }));

  return {
    organization: data.organization,
    metrics: {
      membersCount: data.members.length,
      teamsCount: data.teams.length,
      customRolesCount: customRoles.length,
      pendingInvitationsCount: data.invitations.filter((i) => i.status === "pending").length,
      seatsAssigned,
      seatLimit,
      seatsPercentage,
    },
    topology: {
      organization: {
        id: data.organization.id,
        name: data.organization.name,
        slug: data.organization.slug,
      },
      teams: data.teams.map((t) => ({
        id: t.id,
        name: t.name,
        membersCount: t.membersCount,
      })),
      roles: updatedRoles.map((r) => ({
        id: r.id,
        name: r.name,
        isSystem: r.isSystem,
        memberCount: r.memberCount,
      })),
    },
  };
}

// -------------------------------------------------------------
// Organization Store Mutations (Fallback when direct D1 is null)
// -------------------------------------------------------------

export function createTeamInStore(
  orgSlug: string,
  name: string,
  description?: string
): OrganizationTeamRecord {
  const data = getOrCreateOrgData(orgSlug);
  const newTeam: OrganizationTeamRecord = {
    id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    organizationId: data.organization.id,
    name,
    description: description || undefined,
    membersCount: 0,
    createdAt: Date.now(),
    members: [],
  };
  data.teams.push(newTeam);
  persist();
  return newTeam;
}

export function updateTeamInStore(
  orgSlug: string,
  teamId: string,
  name: string,
  description?: string
): void {
  const data = getOrCreateOrgData(orgSlug);
  const team = data.teams.find((t) => t.id === teamId);
  if (team) {
    team.name = name;
    if (description !== undefined) team.description = description;
    // Update team name in member assignments
    for (const m of data.members) {
      for (const t of m.teams) {
        if (t.id === teamId) t.name = name;
      }
    }
    persist();
  }
}

export function deleteTeamInStore(orgSlug: string, teamId: string): void {
  const data = getOrCreateOrgData(orgSlug);
  const team = data.teams.find((t) => t.id === teamId);
  if (team) {
    // Remove from members
    for (const m of data.members) {
      m.teams = m.teams.filter((t) => t.id !== teamId);
    }
    data.teams = data.teams.filter((t) => t.id !== teamId);
    persist();
  }
}

export function addTeamMembersInStore(
  orgSlug: string,
  teamId: string,
  memberIds: string[]
): number {
  const data = getOrCreateOrgData(orgSlug);
  const team = data.teams.find((t) => t.id === teamId);
  if (!team) return 0;

  let added = 0;
  for (const mid of memberIds) {
    const mem = data.members.find((m) => m.id === mid);
    if (mem && !mem.teams.some((t) => t.id === team.id)) {
      mem.teams.push({ id: team.id, name: team.name });
      added++;
    }
  }

  // Recalculate team members array
  team.members = data.members
    .filter((m) => m.teams.some((t) => t.id === team.id))
    .map((m) => ({
      memberId: m.id,
      userId: m.userId,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatarUrl,
      roleName: m.roleName,
      joinedAt: m.joinedAt,
    }));
  team.membersCount = team.members.length;
  persist();
  return added;
}

export function removeTeamMemberInStore(
  orgSlug: string,
  teamId: string,
  memberId: string
): void {
  const data = getOrCreateOrgData(orgSlug);
  const team = data.teams.find((t) => t.id === teamId);
  if (!team) return;

  const mem = data.members.find((m) => m.id === memberId);
  if (mem) {
    mem.teams = mem.teams.filter((t) => t.id !== team.id);
  }

  team.members = team.members.filter((m) => m.memberId !== memberId);
  team.membersCount = team.members.length;
  persist();
}

export function createRoleInStore(
  orgSlug: string,
  name: string,
  description?: string,
  permissions: PermissionCode[] = []
): OrganizationRoleRecord {
  const data = getOrCreateOrgData(orgSlug);
  const newRole: OrganizationRoleRecord = {
    id: `role_custom_${Date.now()}`,
    organizationId: data.organization.id,
    name,
    description: description || undefined,
    isSystem: false,
    memberCount: 0,
    permissions,
  };
  data.roles.push(newRole);
  persist();
  return newRole;
}

export function updateRolePermissionsInStore(
  orgSlug: string,
  roleId: string,
  permissions: PermissionCode[]
): void {
  const data = getOrCreateOrgData(orgSlug);
  const role = data.roles.find((r) => r.id === roleId);
  if (role) {
    role.permissions = permissions;
    persist();
  }
}

export function deleteRoleInStore(orgSlug: string, roleId: string): void {
  const data = getOrCreateOrgData(orgSlug);
  data.roles = data.roles.filter((r) => r.id !== roleId);
  persist();
}

export function changeMemberRoleInStore(
  orgSlug: string,
  memberId: string,
  newRoleId: string
): { previousRole: string; newRole: string } {
  const data = getOrCreateOrgData(orgSlug);
  const mem = data.members.find((m) => m.id === memberId);
  if (!mem) return { previousRole: "", newRole: "" };

  const role = data.roles.find((r) => r.id === newRoleId);
  if (!role) return { previousRole: mem.roleName, newRole: mem.roleName };

  const prev = mem.roleName;
  mem.roleId = role.id;
  mem.roleName = role.name;
  mem.isSystemRole = role.isSystem;
  persist();
  return { previousRole: prev, newRole: role.name };
}

export function updateMemberTeamsInStore(
  orgSlug: string,
  memberId: string,
  teamIds: string[]
): void {
  const data = getOrCreateOrgData(orgSlug);
  const mem = data.members.find((m) => m.id === memberId);
  if (!mem) return;

  const newTeams = data.teams
    .filter((t) => teamIds.includes(t.id))
    .map((t) => ({ id: t.id, name: t.name }));

  mem.teams = newTeams;

  // Recalculate team members
  for (const t of data.teams) {
    t.members = data.members
      .filter((m) => m.teams.some((tm) => tm.id === t.id))
      .map((m) => ({
        memberId: m.id,
        userId: m.userId,
        name: m.name,
        email: m.email,
        avatarUrl: m.avatarUrl,
        roleName: m.roleName,
        joinedAt: m.joinedAt,
      }));
    t.membersCount = t.members.length;
  }

  persist();
}

export function removeMemberInStore(
  orgSlug: string,
  memberId: string
): { removedMemberEmail: string } {
  const data = getOrCreateOrgData(orgSlug);
  const mem = data.members.find((m) => m.id === memberId);
  const email = mem?.email || "";
  data.members = data.members.filter((m) => m.id !== memberId);

  // Recalculate team members
  for (const t of data.teams) {
    t.members = t.members.filter((m) => m.memberId !== memberId);
    t.membersCount = t.members.length;
  }

  persist();
  return { removedMemberEmail: email };
}

export function createInvitationInStore(
  orgSlug: string,
  email: string,
  roleId: string,
  actorId: string,
  teamIds: string[] = []
): { invitationId: string; plaintextToken: string; inviteUrl: string } {
  const data = getOrCreateOrgData(orgSlug);
  const role = data.roles.find((r) => r.id === roleId);

  const rawSuffix = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
  const plaintextToken = `nxtqr_inv_${rawSuffix}`;
  const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newInv: OrganizationInvitationRecord & { token?: string } = {
    id: invitationId,
    organizationId: data.organization.id,
    email: email.trim().toLowerCase(),
    roleId,
    roleName: role?.name || "Member",
    teamIds,
    status: "pending",
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    token: plaintextToken,
  };

  data.invitations.push(newInv as any);
  persist();

  return {
    invitationId,
    plaintextToken,
    inviteUrl: `/invite/${plaintextToken}`,
  };
}

export function revokeInvitationInStore(orgSlug: string, invitationId: string): void {
  const data = getOrCreateOrgData(orgSlug);
  const inv = data.invitations.find((i) => i.id === invitationId);
  if (inv) {
    inv.status = "revoked";
    persist();
  }
}

export function findInvitationByToken(token: string): {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  email: string;
  roleName: string;
  isExpired: boolean;
  isValid: boolean;
} | null {
  ensureLoaded();
  for (const orgData of Array.from(ORGS_CACHE.values())) {
    const inv = (orgData.invitations as any[]).find((i) => i.token === token || i.id === token);
    if (inv) {
      const isExpired = Date.now() > inv.expiresAt;
      const isValid = inv.status === "pending" && !isExpired;
      return {
        invitationId: inv.id,
        organizationId: orgData.organization.id,
        organizationName: orgData.organization.name,
        organizationSlug: orgData.organization.slug,
        email: inv.email,
        roleName: inv.roleName,
        isExpired,
        isValid,
      };
    }
  }
  return null;
}

export function acceptInvitationInStore(
  token: string,
  user: { id: string; name: string; email: string; avatarUrl?: string }
): { organizationSlug: string } | null {
  ensureLoaded();
  for (const orgData of Array.from(ORGS_CACHE.values())) {
    const inv = (orgData.invitations as any[]).find((i) => i.token === token || i.id === token);
    if (inv && inv.status === "pending") {
      inv.status = "accepted";
      const existing = orgData.members.find((m) => m.userId === user.id || m.email === user.email);
      if (!existing) {
        orgData.members.push({
          id: `mem_${Date.now()}_${user.id}`,
          userId: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          roleId: inv.roleId,
          roleName: inv.roleName,
          isSystemRole: true,
          status: "active",
          joinedAt: Date.now(),
          teams: [],
        });
      }
      persist();
      return { organizationSlug: orgData.organization.slug };
    }
  }
  return null;
}

export function listApiKeysInStore(slugOrId: string): StoredApiKeyRecord[] {
  ensureLoaded();
  const org = getOrCreateOrgData(slugOrId);
  return org.apiKeys || [];
}

export function createApiKeyInStore(
  slugOrId: string,
  key: StoredApiKeyRecord
): StoredApiKeyRecord {
  ensureLoaded();
  const org = getOrCreateOrgData(slugOrId);
  if (!org.apiKeys) org.apiKeys = [];
  org.apiKeys.unshift(key);
  persist();
  return key;
}

export function revokeApiKeyInStore(slugOrId: string, keyId: string): boolean {
  ensureLoaded();
  const org = getOrCreateOrgData(slugOrId);
  if (!org.apiKeys) return false;
  const target = org.apiKeys.find((k) => k.id === keyId);
  if (target) {
    target.status = "revoked";
    persist();
    return true;
  }
  return false;
}

