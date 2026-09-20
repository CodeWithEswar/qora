/**
 * NXTQR — Organization & RBAC Repository
 * Comprehensive multi-tenant queries for the Organization Control Center.
 */

import {
  NotFoundError,
  ConflictError,
  ValidationError,
  EntitlementError,
  PermissionCode,
  SystemRoleName,
} from "@nxtqr/contracts";
import { D1Database, generateOpaqueId } from "../index";

export interface OrganizationControlCenterOverview {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    billingPlan: string;
  };
  metrics: {
    membersCount: number;
    teamsCount: number;
    customRolesCount: number;
    pendingInvitationsCount: number;
    seatsAssigned: number;
    seatLimit: number | null;
    seatsPercentage: number | null;
  };
  topology: {
    organization: { id: string; name: string; slug: string };
    teams: Array<{ id: string; name: string; membersCount: number }>;
    roles: Array<{ id: string; name: string; isSystem: boolean; memberCount: number }>;
  };
}

export interface OrganizationMemberRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  status: "active" | "invited" | "suspended";
  joinedAt: number;
  lastActiveAt?: number;
  teams: Array<{ id: string; name: string }>;
}

export interface OrganizationTeamRecord {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: number;
  membersCount: number;
  members: Array<{
    memberId: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string;
    roleName: string;
    joinedAt: number;
  }>;
}

export interface OrganizationRoleRecord {
  id: string;
  organizationId: string | null;
  name: string;
  description?: string;
  isSystem: boolean;
  memberCount: number;
  permissions: PermissionCode[];
}

export interface OrganizationInvitationRecord {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  teamIds: string[];
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: number;
  createdAt: number;
}

/**
 * SHA-256 hash helper for tokens
 */
export async function hashToken(token: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(token));
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require("crypto");
  return nodeCrypto.createHash("sha256").update(token).digest("hex");
}

export const computeTokenHash = hashToken;

/**
 * Retrieves high-level control center statistics and topology for an organization
 */
export async function getOrganizationControlCenter(
  db: D1Database,
  orgSlug: string
): Promise<OrganizationControlCenterOverview> {
  // 1. Fetch organization
  const org = await db
    .prepare("SELECT id, name, slug, logo_url as logoUrl, billing_plan as billingPlan FROM organizations WHERE slug = ?")
    .bind(orgSlug)
    .first<any>();

  if (!org) {
    throw new NotFoundError(`Organization with slug '${orgSlug}' not found.`);
  }

  const orgId = org.id;

  // 2. Fetch counts
  const membersCountRes = await db
    .prepare("SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ?")
    .bind(orgId)
    .first<{ count: number }>();
  const membersCount = membersCountRes?.count ?? 0;

  const teamsCountRes = await db
    .prepare("SELECT COUNT(*) as count FROM teams WHERE organization_id = ?")
    .bind(orgId)
    .first<{ count: number }>();
  const teamsCount = teamsCountRes?.count ?? 0;

  const customRolesCountRes = await db
    .prepare("SELECT COUNT(*) as count FROM roles WHERE organization_id = ? AND is_system = 0")
    .bind(orgId)
    .first<{ count: number }>();
  const customRolesCount = customRolesCountRes?.count ?? 0;

  const pendingInvitesRes = await db
    .prepare("SELECT COUNT(*) as count FROM invitations WHERE organization_id = ? AND status = 'pending' AND expires_at > (unixepoch())")
    .bind(orgId)
    .first<{ count: number }>();
  const pendingInvitationsCount = pendingInvitesRes?.count ?? 0;

  // 3. Resolve seat entitlement limit
  let seatLimit: number | null = null;
  if (org.billingPlan === "FREE") seatLimit = 5;
  else if (org.billingPlan === "PRO") seatLimit = 20;
  else if (org.billingPlan === "BUSINESS") seatLimit = 100;
  // ENTERPRISE or custom may be null (unlimited)

  const seatsPercentage = seatLimit ? Math.min(100, Math.round((membersCount / seatLimit) * 100)) : null;

  // 4. Fetch topology teams & member counts
  const teamsRes = await db
    .prepare(`
      SELECT t.id, t.name, COUNT(tm.member_id) as membersCount
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      WHERE t.organization_id = ?
      GROUP BY t.id, t.name
      ORDER BY t.name ASC
    `)
    .bind(orgId)
    .all<{ id: string; name: string; membersCount: number }>();

  // 5. Fetch topology roles & member counts
  const rolesRes = await db
    .prepare(`
      SELECT r.id, r.name, r.is_system as isSystem, COUNT(mr.member_id) as memberCount
      FROM roles r
      LEFT JOIN member_roles mr ON mr.role_id = r.id AND mr.member_id IN (
        SELECT id FROM organization_members WHERE organization_id = ?
      )
      WHERE r.organization_id = ? OR r.is_system = 1
      GROUP BY r.id, r.name, r.is_system
      ORDER BY r.is_system DESC, r.name ASC
    `)
    .bind(orgId, orgId)
    .all<{ id: string; name: string; isSystem: number; memberCount: number }>();

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl || undefined,
      billingPlan: org.billingPlan,
    },
    metrics: {
      membersCount,
      teamsCount,
      customRolesCount,
      pendingInvitationsCount,
      seatsAssigned: membersCount,
      seatLimit,
      seatsPercentage,
    },
    topology: {
      organization: { id: org.id, name: org.name, slug: org.slug },
      teams: (teamsRes.results || []).map((t) => ({
        id: t.id,
        name: t.name,
        membersCount: Number(t.membersCount || 0),
      })),
      roles: (rolesRes.results || []).map((r) => ({
        id: r.id,
        name: r.name,
        isSystem: Boolean(r.isSystem),
        memberCount: Number(r.memberCount || 0),
      })),
    },
  };
}

/**
 * Lists organization members with joined user profiles, roles, and assigned teams.
 * Implements batch aggregation to avoid N+1 queries.
 */
export async function listOrganizationMembers(
  db: D1Database,
  orgId: string,
  filter?: {
    search?: string;
    role?: string;
    status?: string;
    teamId?: string;
  }
): Promise<OrganizationMemberRecord[]> {
  // Query members with users and roles
  const sql = `
    SELECT 
      om.id as memberId,
      om.user_id as userId,
      u.name as userName,
      u.email as userEmail,
      u.avatar_url as avatarUrl,
      om.status as status,
      om.joined_at as joinedAt,
      r.id as roleId,
      r.name as roleName,
      r.is_system as isSystemRole
    FROM organization_members om
    JOIN users u ON u.id = om.user_id
    LEFT JOIN member_roles mr ON mr.member_id = om.id
    LEFT JOIN roles r ON r.id = mr.role_id
    WHERE om.organization_id = ?
    ORDER BY om.joined_at ASC
  `;

  const rowsRes = await db.prepare(sql).bind(orgId).all<any>();
  const rows = rowsRes.results || [];

  // Query all team mappings for this organization's members in one batch
  const teamsSql = `
    SELECT tm.member_id as memberId, t.id as teamId, t.name as teamName
    FROM team_members tm
    JOIN teams t ON t.id = tm.team_id
    WHERE t.organization_id = ?
  `;
  const teamsRes = await db.prepare(teamsSql).bind(orgId).all<any>();
  const teamsMap = new Map<string, Array<{ id: string; name: string }>>();

  (teamsRes.results || []).forEach((tm) => {
    const list = teamsMap.get(tm.memberId) || [];
    list.push({ id: tm.teamId, name: tm.teamName });
    teamsMap.set(tm.memberId, list);
  });

  let records: OrganizationMemberRecord[] = rows.map((r) => ({
    id: r.memberId,
    userId: r.userId,
    name: r.userName || "Unknown",
    email: r.userEmail || "",
    avatarUrl: r.avatarUrl || undefined,
    roleId: r.roleId || "role_viewer",
    roleName: r.roleName || "Viewer",
    isSystemRole: Boolean(r.isSystemRole),
    status: r.status as any,
    joinedAt: Number(r.joinedAt) * 1000,
    teams: teamsMap.get(r.memberId) || [],
  }));

  // Apply filters in-memory
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    records = records.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }

  if (filter?.role) {
    const roleQ = filter.role.toLowerCase();
    records = records.filter(
      (m) => m.roleName.toLowerCase() === roleQ || m.roleId === filter.role
    );
  }

  if (filter?.status) {
    records = records.filter((m) => m.status === filter.status);
  }

  if (filter?.teamId) {
    records = records.filter((m) => m.teams.some((t) => t.id === filter.teamId));
  }

  return records;
}

/**
 * Changes a member's assigned role with last owner protection.
 */
export async function changeMemberRoleInD1(
  db: D1Database,
  orgId: string,
  memberId: string,
  newRoleId: string,
  actorId: string
): Promise<{ success: boolean; previousRole: string; newRole: string }> {
  // 1. Verify member belongs to this organization
  const member = await db
    .prepare(`
      SELECT om.id, om.user_id, r.id as roleId, r.name as roleName
      FROM organization_members om
      LEFT JOIN member_roles mr ON mr.member_id = om.id
      LEFT JOIN roles r ON r.id = mr.role_id
      WHERE om.id = ? AND om.organization_id = ?
    `)
    .bind(memberId, orgId)
    .first<any>();

  if (!member) {
    throw new NotFoundError(`Member '${memberId}' not found in organization.`);
  }

  // 2. Last Owner Protection: If currently Owner, check if other owners exist
  if (member.roleName === "Owner" || member.roleName === "Workspace Owner") {
    const ownerCountRes = await db
      .prepare(`
        SELECT COUNT(DISTINCT om.id) as count
        FROM organization_members om
        JOIN member_roles mr ON mr.member_id = om.id
        JOIN roles r ON r.id = mr.role_id
        WHERE om.organization_id = ? AND (r.name = 'Owner' OR r.name = 'Workspace Owner')
      `)
      .bind(orgId)
      .first<{ count: number }>();

    if ((ownerCountRes?.count ?? 0) <= 1) {
      throw new ConflictError(
        "Cannot demote the final Workspace Owner. Transfer ownership or assign another owner first."
      );
    }
  }

  // 3. Verify target role exists and belongs to organization (or is system role)
  const targetRole = await db
    .prepare("SELECT id, name FROM roles WHERE id = ? AND (organization_id = ? OR is_system = 1)")
    .bind(newRoleId, orgId)
    .first<any>();

  if (!targetRole) {
    throw new NotFoundError(`Target role '${newRoleId}' does not exist.`);
  }

  // 4. Update role binding
  await db.prepare("DELETE FROM member_roles WHERE member_id = ?").bind(memberId).run();
  await db
    .prepare("INSERT INTO member_roles (member_id, role_id) VALUES (?, ?)")
    .bind(memberId, targetRole.id)
    .run();

  return {
    success: true,
    previousRole: member.roleName,
    newRole: targetRole.name,
  };
}

/**
 * Removes a member from the workspace with last owner protection.
 */
export async function removeMemberFromD1(
  db: D1Database,
  orgId: string,
  memberId: string,
  actorId: string
): Promise<{ success: boolean; removedMemberEmail: string }> {
  // 1. Verify member belongs to this organization
  const member = await db
    .prepare(`
      SELECT om.id, u.email, r.name as roleName
      FROM organization_members om
      JOIN users u ON u.id = om.user_id
      LEFT JOIN member_roles mr ON mr.member_id = om.id
      LEFT JOIN roles r ON r.id = mr.role_id
      WHERE om.id = ? AND om.organization_id = ?
    `)
    .bind(memberId, orgId)
    .first<any>();

  if (!member) {
    throw new NotFoundError(`Member '${memberId}' not found in organization.`);
  }

  // 2. Last Owner Protection
  if (member.roleName === "Owner" || member.roleName === "Workspace Owner") {
    const ownerCountRes = await db
      .prepare(`
        SELECT COUNT(DISTINCT om.id) as count
        FROM organization_members om
        JOIN member_roles mr ON mr.member_id = om.id
        JOIN roles r ON r.id = mr.role_id
        WHERE om.organization_id = ? AND (r.name = 'Owner' OR r.name = 'Workspace Owner')
      `)
      .bind(orgId)
      .first<{ count: number }>();

    if ((ownerCountRes?.count ?? 0) <= 1) {
      throw new ConflictError(
        "Cannot remove the final Workspace Owner from the organization."
      );
    }
  }

  // 3. Delete member record (cascading deletes team_members and member_roles)
  await db
    .prepare("DELETE FROM organization_members WHERE id = ? AND organization_id = ?")
    .bind(memberId, orgId)
    .run();

  return {
    success: true,
    removedMemberEmail: member.email,
  };
}

/**
 * Lists organization teams with member counts and nested members.
 */
export async function listOrganizationTeams(
  db: D1Database,
  orgId: string
): Promise<OrganizationTeamRecord[]> {
  const teamsRes = await db
    .prepare("SELECT id, organization_id, name, description, created_at FROM teams WHERE organization_id = ? ORDER BY name ASC")
    .bind(orgId)
    .all<any>();

  const teams = teamsRes.results || [];
  const teamRecords: OrganizationTeamRecord[] = [];

  for (const t of teams) {
    const membersRes = await db
      .prepare(`
        SELECT 
          tm.member_id as memberId,
          om.user_id as userId,
          u.name as userName,
          u.email as userEmail,
          u.avatar_url as avatarUrl,
          r.name as roleName,
          tm.joined_at as joinedAt
        FROM team_members tm
        JOIN organization_members om ON om.id = tm.member_id
        JOIN users u ON u.id = om.user_id
        LEFT JOIN member_roles mr ON mr.member_id = om.id
        LEFT JOIN roles r ON r.id = mr.role_id
        WHERE tm.team_id = ?
        ORDER BY tm.joined_at ASC
      `)
      .bind(t.id)
      .all<any>();

    const members = (membersRes.results || []).map((m) => ({
      memberId: m.memberId,
      userId: m.userId,
      name: m.userName || "Unknown",
      email: m.userEmail || "",
      avatarUrl: m.avatarUrl || undefined,
      roleName: m.roleName || "Member",
      joinedAt: Number(m.joinedAt) * 1000,
    }));

    teamRecords.push({
      id: t.id,
      organizationId: t.organization_id,
      name: t.name,
      description: t.description || undefined,
      createdAt: Number(t.created_at) * 1000,
      membersCount: members.length,
      members,
    });
  }

  return teamRecords;
}

/**
 * Creates a new team in the organization.
 */
export async function createTeamInD1(
  db: D1Database,
  orgId: string,
  name: string,
  description?: string
): Promise<{ id: string; name: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new ValidationError("Team name is required.");
  }

  const teamId = generateOpaqueId("team");
  await db
    .prepare("INSERT INTO teams (id, organization_id, name, description) VALUES (?, ?, ?, ?)")
    .bind(teamId, orgId, trimmedName, description?.trim() || null)
    .run();

  return { id: teamId, name: trimmedName };
}

/**
 * Updates an existing team's name and description.
 */
export async function updateTeamInD1(
  db: D1Database,
  orgId: string,
  teamId: string,
  name: string,
  description?: string
): Promise<{ id: string; name: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new ValidationError("Team name cannot be empty.");

  const res = await db
    .prepare("UPDATE teams SET name = ?, description = ? WHERE id = ? AND organization_id = ?")
    .bind(trimmedName, description?.trim() || null, teamId, orgId)
    .run();

  return { id: teamId, name: trimmedName };
}

/**
 * Deletes a team. (Members remain in the organization).
 */
export async function deleteTeamInD1(
  db: D1Database,
  orgId: string,
  teamId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM teams WHERE id = ? AND organization_id = ?")
    .bind(teamId, orgId)
    .run();
}

/**
 * Adds members to a team (validates that members belong to the same organization).
 */
export async function addTeamMembersInD1(
  db: D1Database,
  orgId: string,
  teamId: string,
  memberIds: string[]
): Promise<{ addedCount: number }> {
  // Verify team belongs to organization
  const team = await db
    .prepare("SELECT id FROM teams WHERE id = ? AND organization_id = ?")
    .bind(teamId, orgId)
    .first();

  if (!team) throw new NotFoundError(`Team '${teamId}' not found in organization.`);

  let addedCount = 0;
  for (const memberId of memberIds) {
    // Verify member belongs to this organization
    const member = await db
      .prepare("SELECT id FROM organization_members WHERE id = ? AND organization_id = ?")
      .bind(memberId, orgId)
      .first();

    if (member) {
      const tmId = generateOpaqueId("tm");
      await db
        .prepare("INSERT OR IGNORE INTO team_members (id, team_id, member_id) VALUES (?, ?, ?)")
        .bind(tmId, teamId, memberId)
        .run();
      addedCount++;
    }
  }

  return { addedCount };
}

/**
 * Removes a member from a team.
 */
export async function removeTeamMemberInD1(
  db: D1Database,
  orgId: string,
  teamId: string,
  memberId: string
): Promise<void> {
  await db
    .prepare(`
      DELETE FROM team_members 
      WHERE team_id = ? AND member_id = ? AND team_id IN (
        SELECT id FROM teams WHERE organization_id = ?
      )
    `)
    .bind(teamId, memberId, orgId)
    .run();
}

/**
 * Lists system and custom roles with their member counts and permissions.
 */
export async function listOrganizationRoles(
  db: D1Database,
  orgId: string
): Promise<OrganizationRoleRecord[]> {
  const sql = `
    SELECT 
      r.id, 
      r.organization_id as organizationId, 
      r.name, 
      r.description, 
      r.is_system as isSystem,
      COUNT(DISTINCT mr.member_id) as memberCount
    FROM roles r
    LEFT JOIN member_roles mr ON mr.role_id = r.id AND mr.member_id IN (
      SELECT id FROM organization_members WHERE organization_id = ?
    )
    WHERE r.organization_id = ? OR r.is_system = 1
    GROUP BY r.id, r.organization_id, r.name, r.description, r.is_system
    ORDER BY r.is_system DESC, r.name ASC
  `;

  const rolesRes = await db.prepare(sql).bind(orgId, orgId).all<any>();
  const roles = rolesRes.results || [];
  const records: OrganizationRoleRecord[] = [];

  for (const r of roles) {
    // Query permission codes for this role
    const permsRes = await db
      .prepare(`
        SELECT p.code 
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `)
      .bind(r.id)
      .all<{ code: PermissionCode }>();

    records.push({
      id: r.id,
      organizationId: r.organizationId,
      name: r.name,
      description: r.description || undefined,
      isSystem: Boolean(r.isSystem),
      memberCount: Number(r.memberCount || 0),
      permissions: (permsRes.results || []).map((p) => p.code),
    });
  }

  return records;
}

/**
 * Creates a custom role in the organization with selected permissions.
 */
export async function createCustomRoleInD1(
  db: D1Database,
  orgId: string,
  name: string,
  description?: string,
  permissionCodes: PermissionCode[] = []
): Promise<{ id: string; name: string }> {
  const trimmed = name.trim();
  if (!trimmed) throw new ValidationError("Role name is required.");

  const roleId = generateOpaqueId("role");
  await db
    .prepare("INSERT INTO roles (id, organization_id, name, description, is_system) VALUES (?, ?, ?, ?, 0)")
    .bind(roleId, orgId, trimmed, description?.trim() || null)
    .run();

  // Attach permissions
  for (const code of permissionCodes) {
    // Find permission ID
    const perm = await db
      .prepare("SELECT id FROM permissions WHERE code = ?")
      .bind(code)
      .first<{ id: string }>();

    if (perm) {
      await db
        .prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)")
        .bind(roleId, perm.id)
        .run();
    }
  }

  return { id: roleId, name: trimmed };
}

/**
 * Updates permissions for a custom role. Protected against system roles.
 */
export async function updateCustomRolePermissionsInD1(
  db: D1Database,
  orgId: string,
  roleId: string,
  permissionCodes: PermissionCode[]
): Promise<void> {
  const role = await db
    .prepare("SELECT id, is_system as isSystem FROM roles WHERE id = ? AND organization_id = ?")
    .bind(roleId, orgId)
    .first<any>();

  if (!role) {
    throw new NotFoundError(`Custom role '${roleId}' not found in organization.`);
  }

  if (role.isSystem) {
    throw new ConflictError("System roles are immutable and protected.");
  }

  // Clear existing role permissions
  await db.prepare("DELETE FROM role_permissions WHERE role_id = ?").bind(roleId).run();

  // Insert new role permissions
  for (const code of permissionCodes) {
    const perm = await db
      .prepare("SELECT id FROM permissions WHERE code = ?")
      .bind(code)
      .first<{ id: string }>();

    if (perm) {
      await db
        .prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)")
        .bind(roleId, perm.id)
        .run();
    }
  }
}

/**
 * Deletes a custom role. Prohibited if role is currently assigned to members.
 */
export async function deleteCustomRoleInD1(
  db: D1Database,
  orgId: string,
  roleId: string
): Promise<void> {
  const role = await db
    .prepare("SELECT id, is_system as isSystem FROM roles WHERE id = ? AND organization_id = ?")
    .bind(roleId, orgId)
    .first<any>();

  if (!role) {
    throw new NotFoundError(`Custom role '${roleId}' not found in organization.`);
  }

  if (role.isSystem) {
    throw new ConflictError("Cannot delete protected system roles.");
  }

  // Check if assigned to any members in this organization
  const assignedRes = await db
    .prepare(`
      SELECT COUNT(*) as count 
      FROM member_roles mr
      JOIN organization_members om ON om.id = mr.member_id
      WHERE mr.role_id = ? AND om.organization_id = ?
    `)
    .bind(roleId, orgId)
    .first<{ count: number }>();

  if ((assignedRes?.count ?? 0) > 0) {
    throw new ConflictError(
      `Cannot delete role because it is currently assigned to ${assignedRes?.count} workspace member(s). Reassign them first.`
    );
  }

  await db.prepare("DELETE FROM roles WHERE id = ? AND organization_id = ?").bind(roleId, orgId).run();
}

/**
 * Lists pending, accepted, and revoked invitations for an organization.
 */
export async function listOrganizationInvitations(
  db: D1Database,
  orgId: string
): Promise<OrganizationInvitationRecord[]> {
  const sql = `
    SELECT 
      i.id,
      i.organization_id as organizationId,
      i.email,
      i.role_id as roleId,
      r.name as roleName,
      i.status,
      i.expires_at as expiresAt,
      i.created_at as createdAt
    FROM invitations i
    JOIN roles r ON r.id = i.role_id
    WHERE i.organization_id = ?
    ORDER BY i.created_at DESC
  `;

  const rowsRes = await db.prepare(sql).bind(orgId).all<any>();
  return (rowsRes.results || []).map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    email: r.email,
    roleId: r.roleId,
    roleName: r.roleName,
    teamIds: [],
    status: r.status,
    expiresAt: Number(r.expiresAt) * 1000,
    createdAt: Number(r.createdAt) * 1000,
  }));
}

/**
 * Creates an invitation record with seat enforcement and secure SHA-256 token hashing.
 * Returns the invitation ID and the plaintext token (which is only shown once).
 */
export async function createInvitationInD1(
  db: D1Database,
  orgId: string,
  email: string,
  roleId: string,
  actorId: string,
  teamIds: string[] = []
): Promise<{ invitationId: string; plaintextToken: string; inviteUrl: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new ValidationError("Valid email address is required.");
  }

  // 1. Check if user is already a member
  const existingMember = await db
    .prepare(`
      SELECT om.id 
      FROM organization_members om
      JOIN users u ON u.id = om.user_id
      WHERE om.organization_id = ? AND u.email = ?
    `)
    .bind(orgId, normalizedEmail)
    .first();

  if (existingMember) {
    throw new ConflictError(`User '${normalizedEmail}' is already a member of this workspace.`);
  }

  // 2. Check seat capacity
  const org = await db
    .prepare("SELECT billing_plan as billingPlan FROM organizations WHERE id = ?")
    .bind(orgId)
    .first<{ billingPlan: string }>();

  let seatLimit: number | null = null;
  if (org?.billingPlan === "FREE") seatLimit = 5;
  else if (org?.billingPlan === "PRO") seatLimit = 20;
  else if (org?.billingPlan === "BUSINESS") seatLimit = 100;

  if (seatLimit !== null) {
    const memberCountRes = await db
      .prepare("SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ?")
      .bind(orgId)
      .first<{ count: number }>();

    const activeCount = memberCountRes?.count ?? 0;
    if (activeCount >= seatLimit) {
      throw new EntitlementError(
        `Seat limit reached: Workspace is using ${activeCount} of ${seatLimit} available seats. Please upgrade your plan to invite more collaborators.`
      );
    }
  }

  // 3. Verify role exists
  const role = await db
    .prepare("SELECT id FROM roles WHERE id = ? AND (organization_id = ? OR is_system = 1)")
    .bind(roleId, orgId)
    .first();

  if (!role) throw new NotFoundError(`Role '${roleId}' does not exist.`);

  // 4. Generate random plaintext token and compute hash
  const randomSuffix = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "")
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const plaintextToken = `nxtqr_inv_${randomSuffix}`;
  const tokenHash = await hashToken(plaintextToken);

  const invitationId = generateOpaqueId("inv");
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

  await db
    .prepare(`
      INSERT INTO invitations (id, organization_id, email, role_id, token_hash, status, expires_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `)
    .bind(invitationId, orgId, normalizedEmail, roleId, tokenHash, expiresAt)
    .run();

  return {
    invitationId,
    plaintextToken,
    inviteUrl: `/invite/${plaintextToken}`,
  };
}

/**
 * Revokes a pending invitation.
 */
export async function revokeInvitationInD1(
  db: D1Database,
  orgId: string,
  invitationId: string,
  actorId: string
): Promise<void> {
  const res = await db
    .prepare("UPDATE invitations SET status = 'revoked' WHERE id = ? AND organization_id = ? AND status = 'pending'")
    .bind(invitationId, orgId)
    .run();

  if (!res.success) {
    throw new NotFoundError("Invitation not found or cannot be revoked.");
  }
}

/**
 * Validates an invitation token for acceptance.
 */
export async function validateInvitationTokenInD1(
  db: D1Database,
  token: string
): Promise<{
  invitationId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  email: string;
  roleName: string;
  isExpired: boolean;
  isValid: boolean;
}> {
  const tokenHash = await hashToken(token);

  const sql = `
    SELECT 
      i.id as invitationId,
      i.organization_id as organizationId,
      o.name as organizationName,
      o.slug as organizationSlug,
      i.email as email,
      r.name as roleName,
      i.status as status,
      i.expires_at as expiresAt
    FROM invitations i
    JOIN organizations o ON o.id = i.organization_id
    JOIN roles r ON r.id = i.role_id
    WHERE i.token_hash = ?
  `;

  const inv = await db.prepare(sql).bind(tokenHash).first<any>();
  if (!inv) {
    throw new NotFoundError("Invalid invitation token.");
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = inv.expiresAt < now;
  const isValid = inv.status === "pending" && !isExpired;

  return {
    invitationId: inv.invitationId,
    organizationId: inv.organizationId,
    organizationName: inv.organizationName,
    organizationSlug: inv.organizationSlug,
    email: inv.email,
    roleName: inv.roleName,
    isExpired,
    isValid,
  };
}

/**
 * Accepts an invitation: creates organization membership, role assignment, marks invitation accepted.
 */
export async function acceptInvitationInD1(
  db: D1Database,
  token: string,
  userId: string
): Promise<{ organizationSlug: string }> {
  const tokenHash = await hashToken(token);

  const inv = await db
    .prepare(`
      SELECT i.id, i.organization_id as orgId, i.role_id as roleId, i.email, i.status, i.expires_at as expiresAt, o.slug as orgSlug, o.billing_plan as billingPlan
      FROM invitations i
      JOIN organizations o ON o.id = i.organization_id
      WHERE i.token_hash = ?
    `)
    .bind(tokenHash)
    .first<any>();

  if (!inv) {
    throw new NotFoundError("Invitation not found.");
  }

  if (inv.status !== "pending") {
    throw new ConflictError(`This invitation has already been ${inv.status}.`);
  }

  const now = Math.floor(Date.now() / 1000);
  if (inv.expiresAt < now) {
    throw new ConflictError("This invitation has expired.");
  }

  // Check seat capacity with concurrency resilience
  let seatLimit: number | null = null;
  if (inv.billingPlan === "FREE") seatLimit = 5;
  else if (inv.billingPlan === "PRO") seatLimit = 20;
  else if (inv.billingPlan === "BUSINESS") seatLimit = 100;

  if (seatLimit !== null) {
    const countRes = await db
      .prepare("SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ?")
      .bind(inv.orgId)
      .first<{ count: number }>();
    if ((countRes?.count ?? 0) >= seatLimit) {
      throw new EntitlementError(
        "Cannot accept invitation: This workspace has reached its plan seat limit."
      );
    }
  }

  // Insert membership
  const memberId = generateOpaqueId("mem");
  await db
    .prepare("INSERT OR IGNORE INTO organization_members (id, organization_id, user_id, status) VALUES (?, ?, ?, 'active')")
    .bind(memberId, inv.orgId, userId)
    .run();

  // Assign role
  await db
    .prepare("INSERT OR IGNORE INTO member_roles (member_id, role_id) VALUES (?, ?)")
    .bind(memberId, inv.roleId)
    .run();

  // Mark invitation accepted
  await db
    .prepare("UPDATE invitations SET status = 'accepted' WHERE id = ?")
    .bind(inv.id)
    .run();

  return { organizationSlug: inv.orgSlug };
}

/**
 * Generates a cryptographically random invitation token with high entropy.
 */
export function generateInvitationToken(): string {
  const randomSuffix = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "")
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `nxtqr_inv_${randomSuffix}`;
}
