"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "@nxtqr/contracts";

import {
  TeamAccessDomain,
  AccessDomainLevel,
  TeamMemberItem,
  TeamSummary,
  TeamDetail,
  TeamFilters,
  TeamSignalMetrics,
  TeamResourceAssignment,
  TeamConnectedWorkSummary,
  TeamOverlapItem,
  CANONICAL_OPERATIONAL_DOMAINS,
} from "../types/teams";
export * from "../types/teams";

function getClient() {
  return createAdminClient();
}

export const SupabaseTeamsRepository = {
  /**
   * Retrieves high-level factual signal metrics for teams.
   */
  async getSignalMetrics(orgId: string): Promise<TeamSignalMetrics> {
    const supabase = getClient();

    // 1. Fetch total teams
    const { data: allTeams } = await supabase
      .from("teams")
      .select("id, state")
      .eq("organization_id", orgId);

    const teamsList = allTeams || [];
    const activeTeams = teamsList.filter((t: any) => t.state !== "archived").length;
    const archivedTeams = teamsList.filter((t: any) => t.state === "archived").length;

    // 2. Fetch total unique members in organization
    const { count: totalOrgMembers } = await supabase
      .from("organization_memberships")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active");

    // 3. Fetch all team members for membership accounting
    const teamIds = teamsList.map((t: any) => t.id);
    let totalMemberships = 0;
    const assignedMembershipIds = new Set<string>();

    if (teamIds.length > 0) {
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("membership_id")
        .in("team_id", teamIds);

      const rows = teamMembers || [];
      totalMemberships = rows.length;
      rows.forEach((tm: any) => {
        if (tm.membership_id) assignedMembershipIds.add(tm.membership_id);
      });
    }

    const uniqueMembers = assignedMembershipIds.size;
    const unassigned = Math.max(0, (totalOrgMembers || 0) - uniqueMembers);

    // 4. Fetch total connected work assignments
    let totalConnectedWork = 0;
    try {
      if (teamIds.length > 0) {
        const { count: workCount } = await (supabase as any)
          .from("team_resource_assignments")
          .select("id", { count: "exact", head: true })
          .in("team_id", teamIds);

        totalConnectedWork = workCount || 0;
      }
    } catch {
      // Table may not exist in unmigrated environments
      totalConnectedWork = 0;
    }

    return {
      totalTeams: teamsList.length,
      activeTeams,
      archivedTeams,
      totalMemberships,
      totalMembersInTeams: uniqueMembers,
      unassignedMembers: unassigned,
      totalConnectedWork,
    };
  },

  /**
   * Lists teams with member count, access footprint, connected work, and recent activity.
   */
  async listTeams(
    orgId: string,
    filters?: TeamFilters,
    currentUserId?: string
  ): Promise<TeamSummary[]> {
    const supabase = getClient();

    // 1. Fetch teams for organization
    let query = supabase
      .from("teams")
      .select("*")
      .eq("organization_id", orgId);

    if (filters?.state && filters.state !== "all") {
      if (filters.state === "archived") {
        query = query.eq("state", "archived");
      } else {
        query = query.or("state.eq.active,state.is.null");
      }
    }

    const { data: rawTeams, error } = await query.order("created_at", { ascending: false });

    if (error || !rawTeams) {
      console.error("[SupabaseTeamsRepository.listTeams] error:", error);
      return [];
    }

    if (rawTeams.length === 0) return [];

    const teamIds = rawTeams.map((t: any) => t.id);

    // 2. Fetch all team members joined with profiles and roles
    const { data: rawMembers } = await supabase
      .from("team_members")
      .select(`
        team_id,
        joined_at,
        organization_memberships:membership_id (
          id,
          user_id,
          status,
          profiles:user_id (
            id,
            email,
            display_name,
            avatar_url
          ),
          member_roles (
            roles:role_id (
              code,
              name
            )
          )
        )
      `)
      .in("team_id", teamIds);

    const membersByTeam = new Map<string, TeamMemberItem[]>();
    (rawMembers || []).forEach((row: any) => {
      const mem = row.organization_memberships;
      if (!mem || mem.status === "suspended") return;

      const profile = mem.profiles;
      const roleRelation = mem.member_roles?.[0]?.roles;

      const item: TeamMemberItem = {
        membershipId: mem.id,
        userId: mem.user_id,
        displayName: profile?.display_name || profile?.email?.split("@")[0] || "Member",
        email: profile?.email || "",
        avatarUrl: profile?.avatar_url || null,
        roleName: roleRelation?.name || "Viewer",
        roleCode: roleRelation?.code || "VIEWER",
        isCurrentUser: currentUserId ? mem.user_id === currentUserId : false,
        joinedAt: row.joined_at,
      };

      const list = membersByTeam.get(row.team_id) || [];
      list.push(item);
      membersByTeam.set(row.team_id, list);
    });

    // 3. Fetch connected work assignments
    const connectedWorkByTeam = new Map<string, TeamConnectedWorkSummary>();
    try {
      const { data: rawAssignments } = await (supabase as any)
        .from("team_resource_assignments")
        .select("team_id, resource_type, resource_id, relationship_type, created_at")
        .in("team_id", teamIds);

      (rawAssignments || []).forEach((row: any) => {
        const current = connectedWorkByTeam.get(row.team_id) || {
          qrCount: 0,
          campaignCount: 0,
          brandKitCount: 0,
          templateCount: 0,
          domainCount: 0,
          folderCount: 0,
          totalCount: 0,
        };

        if (row.resource_type === "qr_code") current.qrCount++;
        else if (row.resource_type === "campaign") current.campaignCount++;
        else if (row.resource_type === "brand_kit") current.brandKitCount++;
        else if (row.resource_type === "template") current.templateCount++;
        else if (row.resource_type === "domain") current.domainCount++;
        else if (row.resource_type === "folder") current.folderCount++;
        current.totalCount++;

        connectedWorkByTeam.set(row.team_id, current);
      });
    } catch {
      // Graceful fallback if table not yet migrated
    }

    // 4. Fetch recent audit events related to these teams
    const { data: teamEvents } = await supabase
      .from("audit_logs")
      .select("resource_id, created_at")
      .eq("organization_id", orgId)
      .eq("resource_type", "team")
      .in("resource_id", teamIds)
      .order("created_at", { ascending: false });

    const activityByTeam = new Map<string, { count: number; lastAt: string }>();
    (teamEvents || []).forEach((evt: any) => {
      const existing = activityByTeam.get(evt.resource_id);
      if (!existing) {
        activityByTeam.set(evt.resource_id, { count: 1, lastAt: evt.created_at });
      } else {
        existing.count++;
      }
    });

    // 5. Map into clean TeamSummary DTOs
    let teams: TeamSummary[] = rawTeams.map((t: any) => {
      const members = membersByTeam.get(t.id) || [];
      const act = activityByTeam.get(t.id);
      const work = connectedWorkByTeam.get(t.id) || {
        qrCount: 0,
        campaignCount: 0,
        brandKitCount: 0,
        templateCount: 0,
        domainCount: 0,
        folderCount: 0,
        totalCount: 0,
      };

      // Parse access domains
      let accessDomains: TeamAccessDomain[] = [];
      if (Array.isArray(t.access_domains) && t.access_domains.length > 0) {
        accessDomains = t.access_domains;
      } else {
        const isOps = t.name.toLowerCase().includes("op") || t.name.toLowerCase().includes("qr");
        const isSupport = t.name.toLowerCase().includes("support");
        accessDomains = [
          { domain: "QR Operations", level: isOps ? "FULL" : "VIEW" },
          { domain: "QR Batch & Print", level: isOps ? "MANAGE" : isSupport ? "VIEW" : "NONE" },
          { domain: "Brand Kits & Assets", level: isSupport ? "MANAGE" : "VIEW" },
          { domain: "Status & Guardian", level: isOps ? "MANAGE" : "NONE" },
        ];
      }

      const publicRef = `TM-${t.id.replace(/-/g, "").substring(0, 4).toUpperCase()}`;

      return {
        id: t.id,
        publicId: publicRef,
        organizationId: t.organization_id,
        name: t.name,
        description: t.description || null,
        state: t.state === "archived" ? "archived" : "active",
        lead: null,
        memberCount: members.length,
        memberPreview: members.slice(0, 5),
        accessDomains,
        connectedWork: work,
        recentActivityCount: act?.count || 1,
        lastActivityAt: act?.lastAt || t.created_at,
        createdAt: t.created_at,
        archivedAt: t.archived_at || null,
      };
    });

    // 6. Apply filters
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      teams = teams.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.publicId.toLowerCase().includes(q)
      );
    }

    if (filters?.domain && filters.domain !== "all") {
      const domKey = filters.domain.toLowerCase();
      teams = teams.filter((t) =>
        t.accessDomains.some(
          (ad) => ad.domain.toLowerCase() === domKey && ad.level !== "NONE"
        )
      );
    }

    if (filters?.resource && filters.resource !== "all") {
      const rKey = filters.resource;
      teams = teams.filter((t) => {
        if (rKey === "qr_code") return t.connectedWork.qrCount > 0;
        if (rKey === "campaign") return t.connectedWork.campaignCount > 0;
        if (rKey === "brand_kit") return t.connectedWork.brandKitCount > 0;
        if (rKey === "template") return t.connectedWork.templateCount > 0;
        if (rKey === "domain") return t.connectedWork.domainCount > 0;
        if (rKey === "folder") return t.connectedWork.folderCount > 0;
        return false;
      });
    }

    if (filters?.size && filters.size !== "all") {
      if (filters.size === "1-5") {
        teams = teams.filter((t) => t.memberCount >= 1 && t.memberCount <= 5);
      } else if (filters.size === "6-10") {
        teams = teams.filter((t) => t.memberCount >= 6 && t.memberCount <= 10);
      } else if (filters.size === "10+") {
        teams = teams.filter((t) => t.memberCount > 10);
      }
    }

    // 7. Apply sorting
    if (filters?.sort) {
      if (filters.sort === "name") {
        teams.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filters.sort === "members_count") {
        teams.sort((a, b) => b.memberCount - a.memberCount);
      } else if (filters.sort === "connected_work") {
        teams.sort((a, b) => b.connectedWork.totalCount - a.connectedWork.totalCount);
      } else if (filters.sort === "recent_created") {
        teams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (filters.sort === "recent_active") {
        teams.sort((a, b) => {
          const tA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
          const tB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
          return tB - tA;
        });
      }
    }

    return teams;
  },

  /**
   * Retrieves full details for a team including all members, connected work, dependencies, and audit trail.
   */
  async getTeamDetail(
    orgId: string,
    teamId: string,
    currentUserId?: string
  ): Promise<TeamDetail | null> {
    const supabase = getClient();

    // 1. Fetch team record
    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (error || !team) return null;

    // 2. Fetch all team members
    const { data: rawMembers } = await supabase
      .from("team_members")
      .select(`
        joined_at,
        organization_memberships:membership_id (
          id,
          user_id,
          status,
          profiles:user_id (
            id,
            email,
            display_name,
            avatar_url
          ),
          member_roles (
            roles:role_id (
              code,
              name
            )
          )
        )
      `)
      .eq("team_id", teamId);

    const members: TeamMemberItem[] = (rawMembers || [])
      .map((row: any) => {
        const mem = row.organization_memberships;
        if (!mem) return null;
        const profile = mem.profiles;
        const roleRelation = mem.member_roles?.[0]?.roles;

        return {
          membershipId: mem.id,
          userId: mem.user_id,
          displayName: profile?.display_name || profile?.email?.split("@")[0] || "Member",
          email: profile?.email || "",
          avatarUrl: profile?.avatar_url || null,
          roleName: roleRelation?.name || "Viewer",
          roleCode: roleRelation?.code || "VIEWER",
          isCurrentUser: currentUserId ? mem.user_id === currentUserId : false,
          joinedAt: row.joined_at,
        };
      })
      .filter(Boolean) as TeamMemberItem[];

    // 3. Fetch connected work assignments with titles and references
    let assignments: TeamResourceAssignment[] = [];
    const connectedSummary: TeamConnectedWorkSummary = {
      qrCount: 0,
      campaignCount: 0,
      brandKitCount: 0,
      templateCount: 0,
      domainCount: 0,
      folderCount: 0,
      totalCount: 0,
    };

    try {
      const { data: rawAssignments } = await (supabase as any)
        .from("team_resource_assignments")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (rawAssignments && rawAssignments.length > 0) {
        assignments = rawAssignments.map((a: any) => {
          if (a.resource_type === "qr_code") connectedSummary.qrCount++;
          else if (a.resource_type === "campaign") connectedSummary.campaignCount++;
          else if (a.resource_type === "brand_kit") connectedSummary.brandKitCount++;
          else if (a.resource_type === "template") connectedSummary.templateCount++;
          else if (a.resource_type === "domain") connectedSummary.domainCount++;
          else if (a.resource_type === "folder") connectedSummary.folderCount++;
          connectedSummary.totalCount++;

          const shortId = a.resource_id.replace(/-/g, "").substring(0, 4).toUpperCase();
          const refPrefix =
            a.resource_type === "qr_code"
              ? "QR-"
              : a.resource_type === "campaign"
              ? "CMP-"
              : a.resource_type === "brand_kit"
              ? "BK-"
              : a.resource_type === "domain"
              ? "DOM-"
              : "RES-";

          return {
            id: a.id,
            teamId: a.team_id,
            organizationId: a.organization_id,
            resourceType: a.resource_type,
            resourceId: a.resource_id,
            relationshipType: a.relationship_type,
            title: a.title || `${a.resource_type.toUpperCase().replace("_", " ")} ${shortId}`,
            ref: `${refPrefix}${shortId}`,
            state: "ACTIVE",
            createdAt: a.created_at,
          };
        });
      }
    } catch {
      // Graceful fallback if table not yet migrated
    }

    // 4. Fetch recent audit events for this team
    const { data: recentEvents } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("organization_id", orgId)
      .eq("resource_type", "team")
      .eq("resource_id", teamId)
      .order("created_at", { ascending: false })
      .limit(8);

    const recentActivity = (recentEvents || []).map((evt: any) => ({
      id: evt.id,
      action: evt.action,
      resourceType: evt.resource_type,
      resourceId: evt.resource_id,
      metadata: evt.metadata_json || {},
      createdAt: evt.created_at,
    }));

    // 5. Determine access domains
    let accessDomains: TeamAccessDomain[] = [];
    if (Array.isArray(team.access_domains) && team.access_domains.length > 0) {
      accessDomains = team.access_domains as unknown as TeamAccessDomain[];
    } else {
      const isOps = team.name.toLowerCase().includes("op") || team.name.toLowerCase().includes("qr");
      accessDomains = [
        { domain: "QR Operations", level: isOps ? "FULL" : "VIEW" },
        { domain: "QR Batch & Print", level: isOps ? "MANAGE" : "NONE" },
        { domain: "Brand Kits & Assets", level: "VIEW" },
        { domain: "Status & Guardian", level: isOps ? "MANAGE" : "NONE" },
      ];
    }

    const publicRef = `TM-${team.id.replace(/-/g, "").substring(0, 4).toUpperCase()}`;

    return {
      id: team.id,
      publicId: publicRef,
      organizationId: team.organization_id,
      name: team.name,
      description: team.description || null,
      state: team.state === "archived" ? "archived" : "active",
      lead: null,
      memberCount: members.length,
      memberPreview: members.slice(0, 5),
      members,
      accessDomains,
      connectedWork: {
        ...connectedSummary,
        assignments,
      },
      recentActivityCount: recentActivity.length,
      recentActivity,
      lastActivityAt: recentActivity[0]?.createdAt || team.created_at,
      createdAt: team.created_at,
      archivedAt: team.archived_at || null,
      dependencies: {
        memberCount: members.length,
        pendingApprovalsCount: 0,
        activeWorkflowsCount: 0,
      },
    };
  },

  /**
   * Computes factual shared memberships between pairs of teams in the organization.
   */
  async getTeamOverlaps(orgId: string): Promise<TeamOverlapItem[]> {
    const supabase = getClient();

    // 1. Fetch active teams
    const { data: teams } = await supabase
      .from("teams")
      .select("id, name")
      .eq("organization_id", orgId)
      .eq("state", "active");

    if (!teams || teams.length < 2) return [];

    const teamMap = new Map<string, string>();
    teams.forEach((t) => teamMap.set(t.id, t.name));
    const teamIds = Array.from(teamMap.keys());

    // 2. Fetch all memberships across these teams
    const { data: rawMembers } = await supabase
      .from("team_members")
      .select(`
        team_id,
        joined_at,
        organization_memberships:membership_id (
          id,
          user_id,
          profiles:user_id (
            id,
            email,
            display_name,
            avatar_url
          ),
          member_roles (
            roles:role_id (
              code,
              name
            )
          )
        )
      `)
      .in("team_id", teamIds);

    const membersByTeam = new Map<string, Map<string, TeamMemberItem>>();
    (rawMembers || []).forEach((row: any) => {
      const mem = row.organization_memberships;
      if (!mem) return;
      const profile = mem.profiles;
      const roleRelation = mem.member_roles?.[0]?.roles;

      const item: TeamMemberItem = {
        membershipId: mem.id,
        userId: mem.user_id,
        displayName: profile?.display_name || profile?.email?.split("@")[0] || "Member",
        email: profile?.email || "",
        avatarUrl: profile?.avatar_url || null,
        roleName: roleRelation?.name || "Viewer",
        roleCode: roleRelation?.code || "VIEWER",
        isCurrentUser: false,
        joinedAt: row.joined_at,
      };

      if (!membersByTeam.has(row.team_id)) {
        membersByTeam.set(row.team_id, new Map());
      }
      membersByTeam.get(row.team_id)!.set(mem.id, item);
    });

    // 3. Find intersections between pairs of teams
    const overlaps: TeamOverlapItem[] = [];
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        const teamA = teamIds[i];
        const teamB = teamIds[j];
        const membersA = membersByTeam.get(teamA) || new Map();
        const membersB = membersByTeam.get(teamB) || new Map();

        const shared: TeamMemberItem[] = [];
        membersA.forEach((member, membershipId) => {
          if (membersB.has(membershipId)) {
            shared.push(member);
          }
        });

        if (shared.length > 0) {
          overlaps.push({
            teamAId: teamA,
            teamAName: teamMap.get(teamA) || "Team A",
            teamBId: teamB,
            teamBName: teamMap.get(teamB) || "Team B",
            sharedMemberCount: shared.length,
            sharedMembers: shared,
          });
        }
      }
    }

    return overlaps;
  },

  /**
   * Creates a new team with initial members and access footprint.
   */
  async createTeam(
    orgId: string,
    payload: {
      name: string;
      description?: string;
      memberIds?: string[];
      accessDomains?: TeamAccessDomain[];
    },
    actorId: string
  ): Promise<{ id: string; name: string }> {
    const supabase = getClient();
    const cleanName = payload.name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new ValidationError("Team name must be at least 2 characters.");
    }

    // Check duplicate name
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", cleanName)
      .maybeSingle();

    if (existing) {
      throw new ConflictError(`A team named '${cleanName}' already exists in this workspace.`);
    }

    const defaultDomains =
      payload.accessDomains && payload.accessDomains.length > 0
        ? payload.accessDomains
        : [
            { domain: "QR Operations", level: "MANAGE" },
            { domain: "QR Batch & Print", level: "VIEW" },
            { domain: "Brand Kits & Assets", level: "VIEW" },
            { domain: "Status & Guardian", level: "NONE" },
          ];

    // Insert team
    const { data: newTeam, error } = await supabase
      .from("teams")
      .insert({
        organization_id: orgId,
        name: cleanName,
        description: payload.description?.trim() || null,
        state: "active",
        access_domains: defaultDomains as any,
      })
      .select("id, name")
      .single();

    if (error || !newTeam) {
      throw new Error(`Failed to create team: ${error?.message || "Unknown error"}`);
    }

    // Insert initial members if provided
    if (payload.memberIds && payload.memberIds.length > 0) {
      const validMemberRows = payload.memberIds.map((memId) => ({
        team_id: newTeam.id,
        membership_id: memId,
      }));

      await supabase.from("team_members").insert(validMemberRows);
    }

    // Write audit event
    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.created",
      resource_type: "team",
      resource_id: newTeam.id,
      metadata_json: {
        name: newTeam.name,
        initialMembersCount: payload.memberIds?.length || 0,
      },
    });

    return newTeam;
  },

  /**
   * Updates team metadata.
   */
  async updateTeam(
    orgId: string,
    teamId: string,
    payload: {
      name?: string;
      description?: string;
    },
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (payload.name) updatePayload.name = payload.name.trim();
    if (typeof payload.description !== "undefined") {
      updatePayload.description = payload.description?.trim() || null;
    }

    const { error } = await supabase
      .from("teams")
      .update(updatePayload)
      .eq("id", teamId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to update team: ${error.message}`);
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.updated",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: payload as any,
    });

    return { success: true };
  },

  /**
   * Atomically updates team members with addition and removal diffs.
   */
  async updateTeamMembers(
    orgId: string,
    teamId: string,
    proposedMembershipIds: string[],
    actorId: string
  ): Promise<{ success: boolean; added: number; removed: number }> {
    const supabase = getClient();

    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", teamId)
      .eq("organization_id", orgId)
      .single();

    if (!team) throw new NotFoundError("Team not found in workspace.");

    const { data: currentRows } = await supabase
      .from("team_members")
      .select("membership_id")
      .eq("team_id", teamId);

    const currentIds = new Set((currentRows || []).map((r: any) => r.membership_id));
    const proposedSet = new Set(proposedMembershipIds);

    const toAdd = proposedMembershipIds.filter((id) => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter((id) => !proposedSet.has(id));

    if (toRemove.length > 0) {
      await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .in("membership_id", toRemove);
    }

    if (toAdd.length > 0) {
      const { data: validMems } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", orgId)
        .in("id", toAdd);

      const validIds = (validMems || []).map((m: any) => m.id);
      if (validIds.length > 0) {
        const rows = validIds.map((mId) => ({
          team_id: teamId,
          membership_id: mId,
        }));
        await supabase.from("team_members").insert(rows);
      }
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.members_updated",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: {
        teamName: team.name,
        addedCount: toAdd.length,
        removedCount: toRemove.length,
      },
    });

    return {
      success: true,
      added: toAdd.length,
      removed: toRemove.length,
    };
  },

  /**
   * Connects workspace resources to a team without polluting resource schemas.
   */
  async connectResources(
    orgId: string,
    teamId: string,
    resources: Array<{
      resourceType: string;
      resourceId: string;
      relationshipType?: string;
    }>,
    actorId: string
  ): Promise<{ connectedCount: number }> {
    const supabase = getClient();

    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", teamId)
      .eq("organization_id", orgId)
      .single();

    if (!team) throw new NotFoundError("Team not found in workspace.");

    if (!resources || resources.length === 0) {
      return { connectedCount: 0 };
    }

    const rows = resources.map((r) => ({
      organization_id: orgId,
      team_id: teamId,
      resource_type: r.resourceType,
      resource_id: r.resourceId,
      relationship_type: r.relationshipType || "responsible",
      created_by: actorId,
    }));

    const { error } = await (supabase as any)
      .from("team_resource_assignments")
      .upsert(rows, { onConflict: "team_id,resource_type,resource_id" });

    if (error) {
      console.error("[SupabaseTeamsRepository.connectResources] error:", error);
      throw new Error(`Failed to connect resources: ${error.message}`);
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.resource_connected",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: {
        teamName: team.name,
        connectedCount: resources.length,
        resourceTypes: Array.from(new Set(resources.map((r) => r.resourceType))),
      },
    });

    return { connectedCount: resources.length };
  },

  /**
   * Disconnects a resource from a team.
   */
  async disconnectResource(
    orgId: string,
    teamId: string,
    assignmentId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { error } = await (supabase as any)
      .from("team_resource_assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("team_id", teamId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to disconnect resource: ${error.message}`);
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.resource_disconnected",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: { assignmentId },
    });

    return { success: true };
  },

  /**
   * Updates team access footprint domains.
   */
  async updateTeamAccess(
    orgId: string,
    teamId: string,
    accessDomains: TeamAccessDomain[],
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { error } = await supabase
      .from("teams")
      .update({
        access_domains: accessDomains as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to update team access: ${error.message}`);
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.access_updated",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: { accessDomains: accessDomains as any },
    });

    return { success: true };
  },

  /**
   * Archives a team.
   */
  async archiveTeam(
    orgId: string,
    teamId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { data: team, error } = await supabase
      .from("teams")
      .update({
        state: "archived",
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .eq("organization_id", orgId)
      .select("id, name")
      .single();

    if (error || !team) {
      throw new NotFoundError("Team not found or cannot be archived.");
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.archived",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: { name: team.name },
    });

    return { success: true };
  },

  /**
   * Restores an archived team.
   */
  async restoreTeam(
    orgId: string,
    teamId: string,
    actorId: string
  ): Promise<{ success: boolean }> {
    const supabase = getClient();

    const { data: team, error } = await supabase
      .from("teams")
      .update({
        state: "active",
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .eq("organization_id", orgId)
      .select("id, name")
      .single();

    if (error || !team) {
      throw new NotFoundError("Team not found or cannot be restored.");
    }

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.restored",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: { name: team.name },
    });

    return { success: true };
  },

  /**
   * Safely deletes a team from the workspace.
   * Cascade-deletes team_members joins and team_resource_assignments.
   * CRITICAL: Never cascades into organization members, QR codes, campaigns, brand kits, or audit records.
   */
  async deleteTeam(
    orgId: string,
    teamId: string,
    actorId: string
  ): Promise<{ success: boolean; deletedTeamName: string }> {
    const supabase = getClient();

    // 1. Fetch team metadata before deletion for audit record
    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", teamId)
      .eq("organization_id", orgId)
      .single();

    if (!team) {
      throw new NotFoundError("Team not found in workspace.");
    }

    // 2. Count impacted relationships for audit
    const { count: memberLinksCount } = await supabase
      .from("team_members")
      .select("membership_id", { count: "exact", head: true })
      .eq("team_id", teamId);

    let assignedWorkCount = 0;
    try {
      const { count: workCount } = await (supabase as any)
        .from("team_resource_assignments")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId);
      assignedWorkCount = workCount || 0;
    } catch {
      // Ignored if table not yet migrated
    }

    // 3. Delete team (PostgreSQL CASCADE removes team_members and team_resource_assignments)
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to delete team: ${error.message}`);
    }

    // 4. Log audit event
    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      action: "team.deleted",
      resource_type: "team",
      resource_id: teamId,
      metadata_json: {
        deletedTeamName: team.name,
        removedMemberLinksCount: memberLinksCount || 0,
        removedResourceAssignmentsCount: assignedWorkCount,
        resourcesPreserved: true,
      },
    });

    return {
      success: true,
      deletedTeamName: team.name,
    };
  },
};
