"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import { getSession } from "@/lib/auth/session";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "@nxtqr/contracts";

import {
  MemberSecuritySummary,
  ROLE_CAPABILITIES,
  AdminMemberSummary,
  MemberActivityEvent,
  AdminMemberDetail,
  WorkspaceSignalMetrics,
  WorkspaceTopology,
  MemberFilters,
} from "../types/members";

export * from "../types/members";

function getClient() {
  return createAdminClient();
}

/**
 * Generates high-entropy cryptographic token and SHA-256 hash.
 */
async function computeHash(token: string): Promise<string> {
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

export const SupabaseMembersRepository = {
  /**
   * Retrieves high-level signal rail metrics for the organization.
   */
  async getSignalMetrics(orgId: string): Promise<WorkspaceSignalMetrics> {
    const supabase = getClient();

    const [membersRes, activeRes, suspendedRes, invitedRes, teamsRes] = await Promise.all([
      supabase
        .from("organization_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
      supabase
        .from("organization_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "active"),
      supabase
        .from("organization_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "suspended"),
      supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString()),
      supabase
        .from("teams")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
    ]);

    return {
      totalMembers: membersRes.count ?? 0,
      activeMembers: activeRes.count ?? 0,
      suspendedMembers: suspendedRes.count ?? 0,
      invitedMembers: invitedRes.count ?? 0,
      totalTeams: teamsRes.count ?? 0,
    };
  },

  /**
   * Retrieves compact signature access topology.
   */
  async getAccessTopology(
    orgId: string,
    orgName: string,
    orgSlug: string
  ): Promise<WorkspaceTopology> {
    const metrics = await this.getSignalMetrics(orgId);
    return {
      organization: {
        id: orgId,
        name: orgName,
        slug: orgSlug,
      },
      activeMembersCount: metrics.activeMembers,
      teamsCount: metrics.totalTeams,
      pendingInvitationsCount: metrics.invitedMembers,
    };
  },

  /**
   * Lists all organization members joined with user profile, role, teams, and security credentials.
   */
  async listMembers(
    orgId: string,
    filters?: MemberFilters,
    currentUserId?: string
  ): Promise<AdminMemberSummary[]> {
    const supabase = getClient();

    // 1. Fetch organization memberships joined with profiles and member_roles -> roles
    const { data: rawMemberships, error } = await supabase
      .from("organization_memberships")
      .select(`
        id,
        user_id,
        status,
        joined_at,
        profiles:user_id (
          id,
          email,
          display_name,
          avatar_url,
          created_at,
          updated_at
        ),
        member_roles (
          roles:role_id (
            id,
            code,
            name,
            description,
            is_system
          )
        )
      `)
      .eq("organization_id", orgId)
      .order("joined_at", { ascending: true });

    if (error || !rawMemberships) {
      console.error("[SupabaseMembersRepository.listMembers] query error:", error);
      throw new Error(`Failed to load workspace members: ${error?.message || "Unknown error"}`);
    }

    // 2. Fetch team memberships in one batch for this organization
    const { data: rawTeamMembers } = await supabase
      .from("team_members")
      .select(`
        membership_id,
        teams:team_id (
          id,
          name,
          organization_id
        )
      `);

    const teamsByMembership = new Map<string, Array<{ id: string; name: string }>>();
    (rawTeamMembers || []).forEach((tm: any) => {
      if (tm.teams && tm.teams.organization_id === orgId) {
        const list = teamsByMembership.get(tm.membership_id) || [];
        list.push({ id: tm.teams.id, name: tm.teams.name });
        teamsByMembership.set(tm.membership_id, list);
      }
    });

    // 3. Fetch recent activity timestamps to establish factual last-active state
    const userIds = rawMemberships.map((m: any) => m.user_id).filter(Boolean);
    const lastActiveMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: recentEvents } = await supabase
        .from("activity_events")
        .select("actor_id, created_at")
        .eq("organization_id", orgId)
        .in("actor_id", userIds)
        .order("created_at", { ascending: false })
        .limit(200);

      (recentEvents || []).forEach((evt: any) => {
        if (evt.actor_id && !lastActiveMap.has(evt.actor_id)) {
          lastActiveMap.set(evt.actor_id, evt.created_at);
        }
      });
    }

    // 4. Map into clean, typed AdminMemberSummary
    let members: AdminMemberSummary[] = rawMemberships.map((m: any) => {
      const profile = m.profiles;
      const roleRelation = m.member_roles?.[0]?.roles;

      const isGoogle = Boolean(
        profile?.avatar_url && profile.avatar_url.includes("googleusercontent.com")
      );

      const lastActive = lastActiveMap.get(m.user_id) || m.joined_at;

      const rCode = (roleRelation?.code || "VIEWER").toUpperCase();
      const capabilities = ROLE_CAPABILITIES[rCode] || [
        "View QR Assets & Drafts",
        "Scan Telemetry & Intelligence",
      ];

      return {
        id: m.id,
        userId: m.user_id,
        publicRef: `MBR-${m.id.replace(/-/g, "").substring(0, 4).toUpperCase()}`,
        displayName: profile?.display_name || profile?.email?.split("@")[0] || "Workspace Member",
        email: profile?.email || "",
        avatarUrl: profile?.avatar_url || null,
        roleId: roleRelation?.id || "00000000-0000-0000-0000-000000000004",
        roleCode: rCode,
        roleName: roleRelation?.name || "Viewer",
        roleDescription: roleRelation?.description || null,
        capabilities,
        isSystemRole: Boolean(roleRelation?.is_system),
        status: (m.status as any) || "active",
        joinedAt: m.joined_at,
        lastActiveAt: lastActive,
        teams: teamsByMembership.get(m.id) || [],
        security: {
          isEmailVerified: true,
          isGoogleConnected: isGoogle,
          isMobileVerified: false,
        },
        isCurrentUser: currentUserId ? m.user_id === currentUserId : false,
      };
    });

    // 5. Apply filtering
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      members = members.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    if (filters?.role && filters.role !== "all") {
      const rKey = filters.role.toLowerCase();
      members = members.filter(
        (m) =>
          m.roleId === filters.role ||
          m.roleCode.toLowerCase() === rKey ||
          m.roleName.toLowerCase() === rKey
      );
    }

    if (filters?.teamId && filters.teamId !== "all") {
      members = members.filter((m) =>
        m.teams.some((t: { id: string; name: string }) => t.id === filters.teamId)
      );
    }

    if (filters?.status && filters.status !== "all") {
      members = members.filter((m) => m.status === filters.status);
    }

    // 6. Apply sorting
    if (filters?.sort) {
      if (filters.sort === "name") {
        members.sort((a, b) => a.displayName.localeCompare(b.displayName));
      } else if (filters.sort === "recent_active") {
        members.sort((a, b) => {
          const tA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
          const tB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
          return tB - tA;
        });
      } else if (filters.sort === "recent_joined") {
        members.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
      } else if (filters.sort === "role") {
        members.sort((a, b) => a.roleName.localeCompare(b.roleName));
      }
    }

    return members;
  },

  /**
   * Retrieves full details for a member including recent 5 audit events.
   */
  async getMemberDetail(
    orgId: string,
    memberId: string,
    currentUserId?: string
  ): Promise<AdminMemberDetail | null> {
    const members = await this.listMembers(orgId, undefined, currentUserId);
    const member = members.find((m) => m.id === memberId);
    if (!member) return null;

    const supabase = getClient();
    const { data: events } = await supabase
      .from("activity_events")
      .select("id, action, resource_type, resource_id, metadata_json, created_at")
      .eq("organization_id", orgId)
      .eq("actor_id", member.userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const recentActivity: MemberActivityEvent[] = (events || []).map((e: any) => ({
      id: e.id,
      action: e.action,
      resourceType: e.resource_type,
      resourceId: e.resource_id,
      metadata: e.metadata_json,
      createdAt: e.created_at,
    }));

    return {
      ...member,
      recentActivity,
    };
  },

  /**
   * Changes a member's role with Last Owner Protection.
   */
  async changeMemberRole(
    orgId: string,
    memberId: string,
    newRoleId: string,
    actorId: string
  ): Promise<{ success: boolean; previousRole: string; newRole: string }> {
    const supabase = getClient();

    // 1. Verify member belongs to this organization
    const { data: mem, error: memErr } = await supabase
      .from("organization_memberships")
      .select(`
        id,
        user_id,
        status,
        member_roles(
          role_id,
          roles(id, code, name)
        )
      `)
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (memErr || !mem) {
      throw new NotFoundError(`Member '${memberId}' not found in workspace.`);
    }

    const currentRole = (mem.member_roles as any)?.[0]?.roles;
    const currentRoleCode = currentRole?.code || "VIEWER";

    // 2. Last Owner Protection: If currently Owner, check if other active owners exist
    if (currentRoleCode === "OWNER") {
      const { data: otherOwners } = await supabase
        .from("organization_memberships")
        .select("id, member_roles!inner(roles!inner(code))")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .eq("member_roles.roles.code", "OWNER")
        .neq("id", memberId);

      if (!otherOwners || otherOwners.length === 0) {
        throw new ConflictError(
          "Cannot demote the final Workspace Owner. Transfer ownership or assign another Owner first."
        );
      }
    }

    // 3. Verify new role exists
    const { data: targetRole } = await supabase
      .from("roles")
      .select("id, code, name")
      .eq("id", newRoleId)
      .single();

    if (!targetRole) {
      throw new NotFoundError(`Target role '${newRoleId}' does not exist.`);
    }

    // 4. Update member_roles table
    await supabase.from("member_roles").delete().eq("membership_id", memberId);
    const { error: insErr } = await supabase.from("member_roles").insert({
      membership_id: memberId,
      role_id: targetRole.id,
    });

    if (insErr) {
      throw new Error(`Failed to update role assignment: ${insErr.message}`);
    }

    // 5. Write audit event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "member.role_changed",
      resource_type: "member",
      resource_id: memberId,
      metadata_json: {
        previousRole: currentRole?.name || currentRoleCode,
        newRole: targetRole.name,
      },
    });

    return {
      success: true,
      previousRole: currentRole?.name || currentRoleCode,
      newRole: targetRole.name,
    };
  },

  /**
   * Suspends a member with Last Owner Protection and Self-Suspension Safeguards.
   */
  async suspendMember(
    orgId: string,
    memberId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    // 1. Verify member
    const { data: mem } = await supabase
      .from("organization_memberships")
      .select(`
        id,
        user_id,
        status,
        member_roles(roles(code))
      `)
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (!mem) {
      throw new NotFoundError(`Member '${memberId}' not found in workspace.`);
    }

    // 2. Self-Suspension Guard
    if (mem.user_id === actorId) {
      throw new ConflictError("You cannot suspend your own access session.");
    }

    // 3. Last Owner Protection
    const roleCode = (mem.member_roles as any)?.[0]?.roles?.code;
    if (roleCode === "OWNER") {
      const { data: otherOwners } = await supabase
        .from("organization_memberships")
        .select("id, member_roles!inner(roles!inner(code))")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .eq("member_roles.roles.code", "OWNER")
        .neq("id", memberId);

      if (!otherOwners || otherOwners.length === 0) {
        throw new ConflictError(
          "Cannot suspend the final Workspace Owner. Transfer ownership first."
        );
      }
    }

    // 4. Update status
    const { error } = await supabase
      .from("organization_memberships")
      .update({ status: "suspended" })
      .eq("id", memberId);

    if (error) {
      throw new Error(`Failed to suspend member: ${error.message}`);
    }

    // 5. Write audit event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "member.suspended",
      resource_type: "member",
      resource_id: memberId,
      metadata_json: { targetUserId: mem.user_id },
    });

    return { success: true };
  },

  /**
   * Restores a suspended member.
   */
  async restoreMember(
    orgId: string,
    memberId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { data: mem } = await supabase
      .from("organization_memberships")
      .select("id, user_id, status")
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (!mem) {
      throw new NotFoundError(`Member '${memberId}' not found in workspace.`);
    }

    const { error } = await supabase
      .from("organization_memberships")
      .update({ status: "active" })
      .eq("id", memberId);

    if (error) {
      throw new Error(`Failed to restore member: ${error.message}`);
    }

    // Write audit event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "member.restored",
      resource_type: "member",
      resource_id: memberId,
      metadata_json: { targetUserId: mem.user_id },
    });

    return { success: true };
  },

  /**
   * Removes a member with Last Owner Protection. Preserves historical activity.
   */
  async removeMember(
    orgId: string,
    memberId: string,
    actorId: string
  ): Promise<{ success: boolean; email: string }> {
    const supabase = getClient();

    const { data: mem } = await supabase
      .from("organization_memberships")
      .select(`
        id,
        user_id,
        profiles(email),
        member_roles(roles(code))
      `)
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (!mem) {
      throw new NotFoundError(`Member '${memberId}' not found in workspace.`);
    }

    // Last Owner Protection
    const roleCode = (mem.member_roles as any)?.[0]?.roles?.code;
    if (roleCode === "OWNER") {
      const { data: otherOwners } = await supabase
        .from("organization_memberships")
        .select("id, member_roles!inner(roles!inner(code))")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .eq("member_roles.roles.code", "OWNER")
        .neq("id", memberId);

      if (!otherOwners || otherOwners.length === 0) {
        throw new ConflictError(
          "Cannot remove the final Workspace Owner from the organization."
        );
      }
    }

    // Remove team memberships and role links
    await supabase.from("team_members").delete().eq("membership_id", memberId);
    await supabase.from("member_roles").delete().eq("membership_id", memberId);

    // Delete membership
    const { error } = await supabase
      .from("organization_memberships")
      .delete()
      .eq("id", memberId);

    if (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }

    const email = (mem.profiles as any)?.email || "";

    // Write audit event (never deletes historical audit logs)
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "member.removed",
      resource_type: "member",
      resource_id: memberId,
      metadata_json: { targetUserId: mem.user_id, email },
    });

    return { success: true, email };
  },

  /**
   * Creates an invitation with cryptographically hashed token in Supabase.
   */
  async createInvitation(
    orgId: string,
    email: string,
    roleId: string,
    actorId: string,
    teamIds: string[] = []
  ): Promise<{ id: string; inviteUrl: string }> {
    const supabase = getClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new ValidationError("Valid email address is required.");
    }

    // 1. Check if user is already an active member
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail);

    if (existingProfiles && existingProfiles.length > 0) {
      const userIds = existingProfiles.map((p) => p.id);
      const { data: existingMem } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", orgId)
        .in("user_id", userIds)
        .maybeSingle();

      if (existingMem) {
        throw new ConflictError(`User '${normalizedEmail}' is already a member of this workspace.`);
      }
    }

    // 2. Check if pending valid invitation exists
    const { data: pendingInv } = await supabase
      .from("invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (pendingInv) {
      throw new ConflictError(
        `A pending invitation has already been sent to '${normalizedEmail}'. You can resend or revoke it.`
      );
    }

    // 3. Verify role exists
    const { data: role } = await supabase
      .from("roles")
      .select("id, name")
      .eq("id", roleId)
      .single();

    if (!role) {
      throw new NotFoundError(`Role '${roleId}' does not exist.`);
    }

    // 4. Generate high-entropy token and SHA-256 hash
    const randomBytes = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).substring(2, 15);
    const plaintextToken = `nxtqr_inv_${randomBytes}`;
    const tokenHash = await computeHash(plaintextToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: newInv, error: invErr } = await supabase
      .from("invitations")
      .insert({
        organization_id: orgId,
        email: normalizedEmail,
        role_id: roleId,
        token_hash: tokenHash,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (invErr || !newInv) {
      throw new Error(`Failed to record invitation: ${invErr?.message}`);
    }

    // 5. Write audit event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "invitation.created",
      resource_type: "invitation",
      resource_id: newInv.id,
      metadata_json: { email: normalizedEmail, roleName: role.name },
    });

    return {
      id: newInv.id,
      inviteUrl: `/invite/${plaintextToken}`,
    };
  },

  /**
   * Lists invitations for an organization.
   */
  async listInvitations(orgId: string) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("invitations")
      .select(`
        id,
        email,
        role_id,
        status,
        expires_at,
        created_at,
        roles:role_id (
          id,
          name,
          code
        )
      `)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((inv: any) => ({
      id: inv.id,
      email: inv.email,
      roleId: inv.role_id,
      roleName: inv.roles?.name || "Member",
      status: inv.status,
      expiresAt: inv.expires_at,
      createdAt: inv.created_at,
    }));
  },

  /**
   * Revokes an invitation.
   */
  async revokeInvitation(
    orgId: string,
    invitationId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { data: inv, error } = await supabase
      .from("invitations")
      .update({ status: "revoked" })
      .eq("id", invitationId)
      .eq("organization_id", orgId)
      .select("id, email")
      .single();

    if (error || !inv) {
      throw new NotFoundError("Invitation not found or cannot be revoked.");
    }

    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "invitation.revoked",
      resource_type: "invitation",
      resource_id: invitationId,
      metadata_json: { email: inv.email },
    });

    return { success: true };
  },

  /**
   * Resends an invitation with a fresh secure token and extended expiry.
   */
  async resendInvitation(
    orgId: string,
    invitationId: string,
    actorId: string
  ): Promise<{ success: boolean; inviteUrl: string }> {
    const supabase = getClient();

    const { data: inv, error } = await supabase
      .from("invitations")
      .select("id, email, role_id")
      .eq("id", invitationId)
      .eq("organization_id", orgId)
      .single();

    if (error || !inv) {
      throw new NotFoundError("Invitation not found in this workspace.");
    }

    const randomBytes = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).substring(2, 15);
    const plaintextToken = `nxtqr_inv_${randomBytes}`;
    const tokenHash = await computeHash(plaintextToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateErr } = await supabase
      .from("invitations")
      .update({
        token_hash: tokenHash,
        status: "pending",
        expires_at: expiresAt,
      })
      .eq("id", invitationId)
      .eq("organization_id", orgId);

    if (updateErr) {
      throw new Error(`Failed to resend invitation: ${updateErr.message}`);
    }

    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "invitation.resent",
      resource_type: "invitation",
      resource_id: invitationId,
      metadata_json: { email: inv.email },
    });

    return {
      success: true,
      inviteUrl: `/invite/${plaintextToken}`,
    };
  },

  /**
   * Updates team assignments for a member.
   */
  async updateMemberTeams(
    orgId: string,
    memberId: string,
    teamIds: string[],
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    // 1. Verify membership belongs to organization
    const { data: mem } = await supabase
      .from("organization_memberships")
      .select("id")
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (!mem) throw new NotFoundError(`Member '${memberId}' not found in workspace.`);

    // 2. Clear current team assignments for this member
    await supabase.from("team_members").delete().eq("membership_id", memberId);

    // 3. Insert valid teams belonging to this organization
    if (teamIds.length > 0) {
      const { data: validTeams } = await supabase
        .from("teams")
        .select("id")
        .eq("organization_id", orgId)
        .in("id", teamIds);

      const toInsert = (validTeams || []).map((t) => ({
        membership_id: memberId,
        team_id: t.id,
      }));

      if (toInsert.length > 0) {
        await supabase.from("team_members").insert(toInsert);
      }
    }

    // 4. Write audit event
    await supabase.from("activity_events").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "member.teams_updated",
      resource_type: "member",
      resource_id: memberId,
      metadata_json: { teamIds },
    });

    return { success: true };
  },

  /**
   * Lists workspace roles from Supabase.
   */
  async listRoles(orgId: string) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .or(`organization_id.eq.${orgId},is_system.eq.true`)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data.map((r: any) => ({
      ...r,
      capabilities: ROLE_CAPABILITIES[r.code?.toUpperCase()] || [
        "View QR Assets & Drafts",
        "Scan Telemetry & Intelligence",
      ],
    }));
  },

  /**
   * Lists workspace teams from Supabase.
   */
  async listTeams(orgId: string) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data;
  },
};
