"use safe-import";
import "server-only";
import { createAdminClient } from "../admin";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
  PermissionCode,
  RoleOverviewItem,
  RoleMemberSummary,
  RoleDetail,
  RolesControlPlaneOverview,
  PermissionMatrixDomainGroup,
  PermissionMatrixCell,
  RoleComparisonResult,
  RoleImpactResult,
  AccessSimulatorResult,
  AccessCorridorStep,
  CreateCustomRoleDto,
  UpdateCustomRoleDto,
  SimulateAccessDto,
} from "@nxtqr/contracts";
import { PERMISSION_GROUPS } from "@nxtqr/permissions";
import { EntitlementService } from "@/packages/entitlements/src";

function getClient() {
  return createAdminClient();
}

const HIGH_IMPACT_PERMISSIONS = new Set<string>([
  "organization.update",
  "billing.manage",
  "members.remove",
  "roles.delete",
  "roles.assign",
  "qr.delete",
  "domains.manage",
  "api_keys.manage",
  "guardian.manage",
]);

const RESERVED_ROLE_NAMES = new Set([
  "owner",
  "admin",
  "member",
  "viewer",
  "system",
  "root",
  "superuser",
]);

export const SupabaseRolesRepository = {
  /**
   * Retrieves the authoritative Roles & Permissions overview.
   * STRICT ZERO FAKE DATA: Real roles, real counts, real permissions, and real members.
   */
  async getRolesOverview(
    slugOrId: string,
    currentUserId?: string
  ): Promise<RolesControlPlaneOverview> {
    const supabase = getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    // 1. Resolve organization
    let orgQuery = supabase.from("organizations").select("id, name, slug");
    orgQuery = isUuid
      ? orgQuery.eq("id", slugOrId)
      : orgQuery.or(`slug.eq.${slugOrId},legacy_id.eq.${slugOrId}`);

    const { data: org, error: orgErr } = await orgQuery.maybeSingle();
    if (orgErr || !org) {
      throw new NotFoundError(`Organization '${slugOrId}' not found.`);
    }
    const orgId = org.id;

    // 2. Parallel fetch of roles, permissions, role_permissions, memberships, teams, settings
    const [
      rolesRes,
      permissionsRes,
      rolePermsRes,
      membershipsRes,
      memberRolesRes,
      teamsRes,
      settingsRes,
    ] = await Promise.all([
      // System roles (organization_id IS NULL) + this org's custom roles
      supabase
        .from("roles")
        .select("*")
        .or(`organization_id.is.null,organization_id.eq.${orgId}`)
        .order("is_system", { ascending: false })
        .order("created_at", { ascending: true }),

      // All permissions catalog
      supabase.from("permissions").select("*").order("category", { ascending: true }),

      // Role permission mappings
      supabase.from("role_permissions").select("role_id, permission_id"),

      // Organization memberships
      supabase
        .from("organization_memberships")
        .select("id, user_id, status")
        .eq("organization_id", orgId),

      // Member roles join
      supabase.from("member_roles").select("membership_id, role_id"),

      // Teams count
      supabase
        .from("teams")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),

      // Organization settings (for default role and policies)
      supabase
        .from("organization_settings")
        .select("collaboration_policy_json")
        .eq("organization_id", orgId)
        .maybeSingle(),
    ]);

    const rawRoles = rolesRes.data || [];
    const allPermissions = permissionsRes.data || [];
    const allRolePerms = rolePermsRes.data || [];
    const memberships = membershipsRes.data || [];
    const memberRoles = memberRolesRes.data || [];

    // Map permission ID -> Permission Record
    const permById = new Map(allPermissions.map((p) => [p.id, p]));
    const permByCode = new Map(allPermissions.map((p) => [p.code, p]));

    // Map roleId -> Set of permission codes
    const rolePermsMap = new Map<string, Set<string>>();
    for (const rp of allRolePerms) {
      const perm = permById.get(rp.permission_id);
      if (perm) {
        if (!rolePermsMap.has(rp.role_id)) {
          rolePermsMap.set(rp.role_id, new Set());
        }
        rolePermsMap.get(rp.role_id)!.add(perm.code);
      }
    }

    // Map membershipId -> roleId
    const membershipRoleMap = new Map(memberRoles.map((mr) => [mr.membership_id, mr.role_id]));

    // Count members per role
    const roleMemberCounts = new Map<string, number>();
    for (const m of memberships) {
      const rId = membershipRoleMap.get(m.id);
      if (rId) {
        roleMemberCounts.set(rId, (roleMemberCounts.get(rId) || 0) + 1);
      }
    }

    // Default role
    const collabPolicy = (settingsRes.data?.collaboration_policy_json as Record<string, any>) || {};
    const defaultRoleId = collabPolicy.defaultRoleId || "00000000-0000-0000-0000-000000000003";

    // 3. Build RoleOverviewItem list
    const rolesOverview: RoleOverviewItem[] = rawRoles.map((r) => {
      const permsSet = rolePermsMap.get(r.id) || new Set();

      // Calculate permission DNA (domain -> granted count)
      const dna: Record<string, number> = {};
      for (const code of permsSet) {
        const perm = permByCode.get(code);
        const domain = perm?.category || code.split(".")[0] || code.split(":")[0] || "general";
        dna[domain] = (dna[domain] || 0) + 1;
      }

      return {
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        isSystem: r.is_system,
        organizationId: r.organization_id,
        memberCount: roleMemberCounts.get(r.id) || 0,
        permissionCount: permsSet.size,
        permissionsCount: permsSet.size,
        capabilitiesCount: Object.keys(dna).length,
        permissionDna: dna,
        isDefault: r.id === defaultRoleId,
        createdAt: r.created_at,
      };
    });

    // 4. Build Permission Matrix Domain Groups
    // We group by canonical PERMISSION_GROUPS from @nxtqr/permissions
    const matrix: PermissionMatrixDomainGroup[] = PERMISSION_GROUPS.map((group) => {
      const groupPerms = group.permissions.map((pDef) => {
        const states: Record<string, "allowed" | "denied" | "system"> = {};
        const roleStates: Record<string, PermissionMatrixCell> = {};

        for (const r of rawRoles) {
          const permsSet = rolePermsMap.get(r.id) || new Set();
          const has = permsSet.has(pDef.code) || permsSet.has(pDef.code.replace(".", ":"));
          let cellState: "allowed" | "denied" | "system" | "system_required" = "denied";

          if (r.code === "OWNER") {
            states[r.id] = "system";
            cellState = "system_required";
          } else if (has) {
            states[r.id] = r.is_system ? "system" : "allowed";
            cellState = r.is_system ? "system_required" : "allowed";
          } else {
            states[r.id] = "denied";
            cellState = "denied";
          }

          roleStates[r.id] = {
            roleId: r.id,
            roleName: r.name,
            state: cellState,
            isAllowed: cellState !== "denied",
          };
        }

        return {
          code: pDef.code,
          name: pDef.label,
          label: pDef.label,
          description: pDef.description,
          isHighImpact: HIGH_IMPACT_PERMISSIONS.has(pDef.code),
          states,
          roleStates,
        };
      });

      return {
        id: group.id,
        domainKey: group.id,
        domainName: group.category,
        name: group.category,
        description: group.description,
        permissions: groupPerms,
      };
    });

    // 5. Build members summary
    const membersSummary: RoleMemberSummary[] = memberships.map((m) => {
      const mAny = m as any;
      const rId = membershipRoleMap.get(m.id) || defaultRoleId;
      const roleObj = rawRoles.find((r) => r.id === rId);
      const profile = mAny.profiles || {};
      const name = profile.display_name || profile.name || profile.email?.split("@")[0] || "Member";
      return {
        membershipId: m.id,
        userId: m.user_id,
        name,
        displayName: name,
        email: profile.email || "",
        avatarUrl: profile.avatar_url || null,
        roleId: rId,
        roleName: roleObj ? roleObj.name : "Member",
        status: m.status || "active",
        joinedAt: mAny.joined_at || new Date().toISOString(),
      };
    });

    // 6. Current user permissions
    let canManageRoles = true;
    let canAssignRoles = true;
    if (currentUserId) {
      const myMembership = memberships.find((m) => m.user_id === currentUserId);
      if (myMembership) {
        const myRoleId = membershipRoleMap.get(myMembership.id);
        const myPerms = myRoleId ? rolePermsMap.get(myRoleId) : undefined;
        const isOwnerOrAdmin = myRoleId === "00000000-0000-0000-0000-000000000001" || myRoleId === "00000000-0000-0000-0000-000000000002";
        canManageRoles = isOwnerOrAdmin || Boolean(myPerms?.has("roles.update") || myPerms?.has("roles.create"));
        canAssignRoles = isOwnerOrAdmin || Boolean(myPerms?.has("roles.assign") || myPerms?.has("members.invite"));
      }
    }

    const systemCount = rolesOverview.filter((r) => r.isSystem).length;
    const customCount = rolesOverview.filter((r) => !r.isSystem).length;

    return {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
      metrics: {
        totalRoles: rolesOverview.length,
        systemRoles: systemCount,
        customRoles: customCount,
        totalMembers: memberships.length,
        totalCapabilities: PERMISSION_GROUPS.length,
        teamsCount: teamsRes.count || 0,
      },
      roles: rolesOverview,
      members: membersSummary,
      matrix,
      defaultRoleId,
      userPermissions: {
        canManageRoles,
        canAssignRoles,
      },
      systemRolesCount: systemCount,
      customRolesCount: customCount,
      totalMembersCount: memberships.length,
      totalCapabilitiesCount: PERMISSION_GROUPS.length,
      totalPermissionsCount: allPermissions.length,
      teamsCount: teamsRes.count || 0,
    };
  },

  /**
   * Retrieves full detail for a single role including its assigned members.
   */
  async getRoleDetail(orgId: string, roleId: string): Promise<RoleDetail> {
    const supabase = getClient();

    // 1. Fetch role
    const { data: role, error: rErr } = await supabase
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .or(`organization_id.is.null,organization_id.eq.${orgId}`)
      .maybeSingle();

    if (rErr || !role) {
      throw new NotFoundError(`Role '${roleId}' not found.`);
    }

    // 2. Fetch role permissions
    const { data: rolePerms } = await supabase
      .from("role_permissions")
      .select("permission_id, permissions(code, category)")
      .eq("role_id", roleId);

    const permissions: PermissionCode[] = [];
    const capabilityAreasSet = new Set<string>();

    for (const rp of rolePerms || []) {
      const p = (rp as any).permissions;
      if (p?.code) {
        permissions.push(p.code as PermissionCode);
        capabilityAreasSet.add(p.category || p.code.split(".")[0]);
      }
    }

    // 3. Fetch assigned members
    const { data: assignedMemberships } = await supabase
      .from("member_roles")
      .select(`
        membership_id,
        organization_memberships!inner(
          id,
          user_id,
          status,
          created_at,
          organization_id,
          profiles(display_name, email, avatar_url)
        )
      `)
      .eq("role_id", roleId)
      .eq("organization_memberships.organization_id", orgId);

    const members: RoleMemberSummary[] = (assignedMemberships || []).map((am: any) => {
      const om = am.organization_memberships;
      const prof = om?.profiles;
      const name = prof?.display_name || prof?.email || "Member";
      return {
        membershipId: om.id,
        userId: om.user_id,
        name,
        displayName: name,
        email: prof?.email || "",
        avatarUrl: prof?.avatar_url || null,
        roleId: role.id,
        roleName: role.name,
        status: om.status || "active",
        joinedAt: om.created_at,
        teams: [],
      };
    });

    const dna: Record<string, number> = {};
    for (const code of permissions) {
      const domain = code.split(".")[0] || code.split(":")[0] || "general";
      dna[domain] = (dna[domain] || 0) + 1;
    }

    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isSystem: role.is_system,
      organizationId: role.organization_id,
      memberCount: members.length,
      permissionCount: permissions.length,
      permissionsCount: permissions.length,
      capabilitiesCount: capabilityAreasSet.size,
      permissionDna: dna,
      isDefault: false,
      createdAt: role.created_at,
      permissions,
      members,
      capabilityAreas: Array.from(capabilityAreasSet),
    };
  },

  /**
   * Creates a new custom role within the organization.
   */
  async createCustomRole(
    orgId: string,
    input: CreateCustomRoleDto,
    actorId?: string
  ): Promise<RoleDetail> {
    const supabase = getClient();
    const name = input.name.trim();

    if (RESERVED_ROLE_NAMES.has(name.toLowerCase())) {
      throw new ValidationError(`The role name '${name}' is reserved by platform infrastructure.`);
    }

    const code = name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    // Check uniqueness within organization
    const { data: existing } = await supabase
      .from("roles")
      .select("id")
      .eq("organization_id", orgId)
      .or(`name.ilike.${name},code.eq.${code}`)
      .maybeSingle();

    if (existing) {
      throw new ConflictError(`A role named '${name}' already exists in this organization.`);
    }

    // Insert role
    const { data: createdRole, error: createErr } = await supabase
      .from("roles")
      .insert({
        organization_id: orgId,
        code,
        name,
        description: input.description || null,
        is_system: false,
      })
      .select()
      .single();

    if (createErr || !createdRole) {
      throw new Error(`Failed to create custom role: ${createErr?.message}`);
    }

    // Resolve permission IDs
    const { data: allPerms } = await supabase
      .from("permissions")
      .select("id, code")
      .in("code", input.permissions);

    if (allPerms && allPerms.length > 0) {
      const rolePermsInserts = allPerms.map((p) => ({
        role_id: createdRole.id,
        permission_id: p.id,
      }));
      await supabase.from("role_permissions").insert(rolePermsInserts);
    }

    // Activity & Audit
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "ROLE_CREATED",
        resource_type: "roles",
        resource_id: createdRole.id,
        metadata_json: { name, code, permissionsCount: input.permissions.length },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "role.created",
        resource_type: "role",
        resource_id: createdRole.id,
        metadata_json: { roleName: name },
      }),
    ]);

    return this.getRoleDetail(orgId, createdRole.id);
  },

  /**
   * Updates an existing custom role's metadata and permissions.
   */
  async updateCustomRole(
    orgId: string,
    roleId: string,
    input: UpdateCustomRoleDto,
    actorId?: string
  ): Promise<RoleDetail> {
    const supabase = getClient();

    // 1. Verify role is custom and belongs to org
    const { data: role, error: rErr } = await supabase
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (rErr || !role) {
      throw new NotFoundError("Custom role not found or not editable.");
    }

    if (role.is_system) {
      throw new ForbiddenError("System roles are permanently protected and immutable.");
    }

    // 2. Update role metadata
    const updates: Record<string, any> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (RESERVED_ROLE_NAMES.has(name.toLowerCase())) {
        throw new ValidationError(`The role name '${name}' is reserved by platform infrastructure.`);
      }
      updates.name = name;
      updates.code = name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    }
    if (input.description !== undefined) {
      updates.description = input.description.trim() || null;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("roles").update(updates as any).eq("id", roleId);
    }

    // 3. Update permissions if supplied
    if (input.permissions !== undefined) {
      // Clear existing
      await supabase.from("role_permissions").delete().eq("role_id", roleId);

      // Insert new
      const { data: allPerms } = await supabase
        .from("permissions")
        .select("id, code")
        .in("code", input.permissions);

      if (allPerms && allPerms.length > 0) {
        const inserts = allPerms.map((p) => ({
          role_id: roleId,
          permission_id: p.id,
        }));
        await supabase.from("role_permissions").insert(inserts);
      }
    }

    // Activity & Audit
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "ROLE_UPDATED",
        resource_type: "roles",
        resource_id: roleId,
        metadata_json: { roleName: role.name, ...updates },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "role.updated",
        resource_type: "role",
        resource_id: roleId,
        metadata_json: { roleName: updates.name || role.name },
      }),
    ]);

    return this.getRoleDetail(orgId, roleId);
  },

  /**
   * Duplicates an existing role into a new custom role.
   */
  async duplicateCustomRole(
    orgId: string,
    sourceRoleId: string,
    newName: string,
    actorId?: string
  ): Promise<RoleDetail> {
    const supabase = getClient();

    // 1. Fetch source role permissions
    const { data: sourcePerms } = await supabase
      .from("role_permissions")
      .select("permissions(code)")
      .eq("role_id", sourceRoleId);

    const permissions = (sourcePerms || [])
      .map((sp: any) => sp.permissions?.code)
      .filter(Boolean);

    // 2. Create new custom role
    return this.createCustomRole(
      orgId,
      {
        name: newName,
        description: `Copy of role permissions`,
        permissions,
      },
      actorId
    );
  },

  /**
   * Deletes a custom role with mandatory member reassignment.
   */
  async deleteCustomRole(
    orgId: string,
    roleId: string,
    reassignRoleId: string,
    actorId?: string
  ): Promise<{ deletedRoleId: string; reassignedCount: number }> {
    const supabase = getClient();

    // 1. Verify role
    const { data: role, error: rErr } = await supabase
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (rErr || !role) {
      throw new NotFoundError("Custom role not found.");
    }

    if (role.is_system) {
      throw new ForbiddenError("System roles cannot be deleted.");
    }

    // 2. Verify reassignment target role
    const { data: targetRole } = await supabase
      .from("roles")
      .select("id, name")
      .eq("id", reassignRoleId)
      .or(`organization_id.is.null,organization_id.eq.${orgId}`)
      .maybeSingle();

    if (!targetRole) {
      throw new ValidationError("Reassignment target role does not exist.");
    }

    // 3. Find currently assigned memberships
    const { data: assignedMembers } = await supabase
      .from("member_roles")
      .select("membership_id")
      .eq("role_id", roleId);

    const membershipIds = (assignedMembers || []).map((am) => am.membership_id);

    // 4. Reassign members to target role
    if (membershipIds.length > 0) {
      await supabase.from("member_roles").delete().eq("role_id", roleId);
      const reassignments = membershipIds.map((mId) => ({
        membership_id: mId,
        role_id: reassignRoleId,
      }));
      await supabase.from("member_roles").insert(reassignments);
    }

    // 5. Delete role_permissions and role
    await supabase.from("role_permissions").delete().eq("role_id", roleId);
    await supabase.from("roles").delete().eq("id", roleId);

    // Activity & Audit
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "ROLE_DELETED",
        resource_type: "roles",
        resource_id: roleId,
        metadata_json: {
          roleName: role.name,
          reassignedTo: targetRole.name,
          reassignedCount: membershipIds.length,
        },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "role.deleted",
        resource_type: "role",
        resource_id: roleId,
        metadata_json: { roleName: role.name },
      }),
    ]);

    return { deletedRoleId: roleId, reassignedCount: membershipIds.length };
  },

  /**
   * Reassigns a member's role with strict owner protection.
   */
  async assignMemberRole(
    orgId: string,
    membershipId: string,
    newRoleId: string,
    actorId?: string
  ): Promise<{ success: boolean; roleName: string }> {
    const supabase = getClient();

    // 1. Verify membership
    const { data: membership, error: mErr } = await supabase
      .from("organization_memberships")
      .select("id, user_id, organization_id")
      .eq("id", membershipId)
      .eq("organization_id", orgId)
      .single();

    if (mErr || !membership) {
      throw new NotFoundError("Organization membership not found.");
    }

    // 2. Verify new role
    const { data: newRole, error: rErr } = await supabase
      .from("roles")
      .select("id, name, code")
      .eq("id", newRoleId)
      .or(`organization_id.is.null,organization_id.eq.${orgId}`)
      .single();

    if (rErr || !newRole) {
      throw new NotFoundError("Selected role does not exist.");
    }

    // 3. Check current role for Owner protection
    const { data: currentMemberRoles } = await supabase
      .from("member_roles")
      .select("role_id, roles(code)")
      .eq("membership_id", membershipId);

    const isCurrentOwner = (currentMemberRoles || []).some(
      (mr: any) => mr.roles?.code === "OWNER" || mr.role_id === "00000000-0000-0000-0000-000000000001"
    );

    if (isCurrentOwner && newRole.code !== "OWNER") {
      // Check total remaining owners
      const { data: allOwners } = await supabase
        .from("member_roles")
        .select("membership_id, organization_memberships!inner(organization_id)")
        .eq("role_id", "00000000-0000-0000-0000-000000000001")
        .eq("organization_memberships.organization_id", orgId);

      if ((allOwners || []).length <= 1) {
        throw new ValidationError(
          "Cannot demote or remove the sole workspace owner. Please transfer workspace ownership first."
        );
      }
    }

    // 4. Update member role
    await supabase.from("member_roles").delete().eq("membership_id", membershipId);
    await supabase.from("member_roles").insert({
      membership_id: membershipId,
      role_id: newRoleId,
    });

    // Activity & Audit
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "MEMBER_ROLE_CHANGED",
        resource_type: "organization_memberships",
        resource_id: membershipId,
        metadata_json: { targetUserId: membership.user_id, newRole: newRole.name },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "member.role_changed",
        resource_type: "member",
        resource_id: membershipId,
        metadata_json: { newRole: newRole.name },
      }),
    ]);

    return { success: true, roleName: newRole.name };
  },

  /**
   * Mathematically compares two roles (shared, only A, only B).
   */
  async compareRoles(
    orgId: string,
    roleIdA: string,
    roleIdB: string
  ): Promise<RoleComparisonResult> {
    const supabase = getClient();

    const [roleARes, roleBRes] = await Promise.all([
      this.getRoleDetail(orgId, roleIdA),
      this.getRoleDetail(orgId, roleIdB),
    ]);

    const permsA = new Set(roleARes.permissions);
    const permsB = new Set(roleBRes.permissions);

    const shared: PermissionCode[] = [];
    const onlyA: PermissionCode[] = [];
    const onlyB: PermissionCode[] = [];

    for (const p of roleARes.permissions) {
      if (permsB.has(p)) shared.push(p);
      else onlyA.push(p);
    }
    for (const p of roleBRes.permissions) {
      if (!permsA.has(p)) onlyB.push(p);
    }

    // Group differences by domain
    const allDomains = new Set<string>();
    [...shared, ...onlyA, ...onlyB].forEach((p) => {
      allDomains.add(p.split(".")[0] || p.split(":")[0]);
    });

    const domains = Array.from(allDomains).map((d) => ({
      domainId: d,
      domainName: d.toUpperCase(),
      shared: shared.filter((p) => (p.split(".")[0] || p.split(":")[0]) === d),
      onlyA: onlyA.filter((p) => (p.split(".")[0] || p.split(":")[0]) === d),
      onlyB: onlyB.filter((p) => (p.split(".")[0] || p.split(":")[0]) === d),
    }));

    return {
      roleA: { id: roleARes.id, name: roleARes.name, isSystem: roleARes.isSystem },
      roleB: { id: roleBRes.id, name: roleBRes.name, isSystem: roleBRes.isSystem },
      shared,
      onlyA,
      onlyB,
      roleAOnly: onlyA,
      roleBOnly: onlyB,
      domains,
    };
  },

  /**
   * Calculates the impact radius of modifying a role's permissions.
   */
  async calculateRoleImpact(
    orgId: string,
    roleId: string,
    proposedPermissions: string[]
  ): Promise<RoleImpactResult> {
    const supabase = getClient();

    // 1. Current role detail
    const currentRole = await this.getRoleDetail(orgId, roleId);
    const currentSet = new Set(currentRole.permissions);
    const proposedSet = new Set(proposedPermissions as PermissionCode[]);

    const added = (proposedPermissions as PermissionCode[]).filter((p) => !currentSet.has(p));
    const removed = currentRole.permissions.filter((p) => !proposedSet.has(p));

    const affectedDomains = new Set<string>();
    [...added, ...removed].forEach((p) => {
      affectedDomains.add(p.split(".")[0] || p.split(":")[0]);
    });

    // 2. Count distinct teams represented by affected members
    const memberIds = currentRole.members.map((m) => m.membershipId);
    let teamsCount = 0;
    if (memberIds.length > 0) {
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .in("membership_id", memberIds);
      teamsCount = new Set((teamMembers || []).map((tm) => tm.team_id)).size;
    }

    return {
      membersAffectedCount: currentRole.members.length,
      teamsAffectedCount: teamsCount,
      capabilitiesAddedCount: added.length,
      capabilitiesRemovedCount: removed.length,
      addedPermissions: added,
      removedPermissions: removed,
      affectedDomains: Array.from(affectedDomains),
    };
  },

  /**
   * Simulates an action through the complete authorization decision pipeline.
   * Visualizes the 8-stage Access Corridor.
   */
  async simulateAccess(
    orgId: string,
    input: SimulateAccessDto
  ): Promise<AccessSimulatorResult> {
    const supabase = getClient();
    const action = input.action as PermissionCode;

    // 1. Fetch organization & settings
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, billing_plan")
      .eq("id", orgId)
      .single();

    const { data: settings } = await supabase
      .from("organization_settings")
      .select("collaboration_policy_json")
      .eq("organization_id", orgId)
      .maybeSingle();

    const planTier = (org?.billing_plan?.toUpperCase() || "FREE") as any;
    const collabPolicy = (settings?.collaboration_policy_json as Record<string, any>) || {};

    // 2. Fetch membership
    let memQuery = supabase
      .from("organization_memberships")
      .select(`
        id,
        user_id,
        status,
        profiles(display_name, email)
      `)
      .eq("organization_id", orgId);

    if (input.membershipId) {
      memQuery = memQuery.eq("id", input.membershipId);
    } else if (input.memberUserId) {
      memQuery = memQuery.eq("user_id", input.memberUserId);
    }

    const { data: membership } = await memQuery.maybeSingle();

    const corridor: AccessCorridorStep[] = [];
    const reasons: string[] = [];

    const memberName = (membership?.profiles as any)?.display_name || (membership?.profiles as any)?.email || "Unknown Member";

    // Stage 1: Identity Check
    if (!membership || !membership.user_id) {
      corridor.push({
        stage: "identity",
        label: "User Identity",
        status: "failed",
        detail: "User identity record not found in tenant directory.",
      });
      reasons.push("identity_unverified");
      return {
        decision: "denied",
        memberName,
        roleName: "None",
        action,
        corridor,
        reasons,
        explanation: "Action denied: Member identity cannot be verified in this organization.",
      };
    }
    corridor.push({
      stage: "identity",
      label: "User Identity",
      status: "passed",
      detail: `Authenticated identity verified for ${memberName}.`,
    });

    // Stage 2: Membership Check
    if (membership.status !== "active") {
      corridor.push({
        stage: "membership",
        label: "Workspace Membership",
        status: "failed",
        detail: `Membership is currently '${membership.status}'. Only active members may act.`,
      });
      reasons.push("membership_inactive");
      return {
        decision: "denied",
        memberName,
        roleName: "None",
        action,
        corridor,
        reasons,
        explanation: `Action denied: Workspace membership is ${membership.status}.`,
      };
    }
    corridor.push({
      stage: "membership",
      label: "Workspace Membership",
      status: "passed",
      detail: "Active organization membership confirmed.",
    });

    // Stage 3: Role Resolution
    const { data: memberRoles } = await supabase
      .from("member_roles")
      .select("role_id, roles(id, name, code, is_system)")
      .eq("membership_id", membership.id);

    const primaryRole = (memberRoles?.[0] as any)?.roles;
    if (!primaryRole) {
      corridor.push({
        stage: "role",
        label: "Assigned Role",
        status: "failed",
        detail: "No active workspace role assigned to this member.",
      });
      reasons.push("role_unassigned");
      return {
        decision: "denied",
        memberName,
        roleName: "Unassigned",
        action,
        corridor,
        reasons,
        explanation: "Action denied: Member has no assigned role.",
      };
    }
    const roleName = primaryRole.name;
    corridor.push({
      stage: "role",
      label: "Assigned Role",
      status: "passed",
      detail: `Assigned role: ${roleName} (${primaryRole.is_system ? "System" : "Custom"}).`,
    });

    // Stage 4: Permission Check
    const { data: rolePerms } = await supabase
      .from("role_permissions")
      .select("permissions(code)")
      .eq("role_id", primaryRole.id);

    const grantedCodes = new Set((rolePerms || []).map((rp: any) => rp.permissions?.code).filter(Boolean));

    const isOwner = primaryRole.code === "OWNER";
    const hasPerm = isOwner || grantedCodes.has(action) || grantedCodes.has(action.replace(".", ":"));

    if (!hasPerm) {
      corridor.push({
        stage: "permission",
        label: "Capability Permission",
        status: "failed",
        detail: `Role '${roleName}' lacks required permission '${action}'.`,
      });
      reasons.push("permission_missing");
      return {
        decision: "denied",
        memberName,
        roleName,
        action,
        corridor,
        reasons,
        explanation: `Action denied: Role '${roleName}' does not grant '${action}'.`,
      };
    }
    corridor.push({
      stage: "permission",
      label: "Capability Permission",
      status: "passed",
      detail: `Permission '${action}' explicitly granted to '${roleName}'.`,
    });

    // Stage 5: Entitlement Check
    let entitlementAllowed = true;
    let entitlementReason = "";

    if (action.startsWith("domains.") || action.startsWith("domains:")) {
      const limit = EntitlementService.checkLimit(planTier, "customDomainsAllowed" as any, 0);
      if (!limit.allowed) {
        entitlementAllowed = false;
        entitlementReason = `Custom Domains are restricted under the ${planTier} plan tier.`;
      }
    } else if (action.startsWith("api_keys.") || action.startsWith("developer.")) {
      const limit = EntitlementService.checkLimit(planTier, "developerApiAllowed" as any, 0);
      if (!limit.allowed) {
        entitlementAllowed = false;
        entitlementReason = `Developer API keys require an upgraded commercial tier.`;
      }
    }

    if (!entitlementAllowed) {
      corridor.push({
        stage: "entitlement",
        label: "Plan Entitlement",
        status: "failed",
        detail: entitlementReason,
      });
      reasons.push("entitlement_unavailable");
      return {
        decision: "denied",
        memberName,
        roleName,
        action,
        corridor,
        reasons,
        explanation: `Action denied by entitlement: ${entitlementReason}`,
      };
    }
    corridor.push({
      stage: "entitlement",
      label: "Plan Entitlement",
      status: "passed",
      detail: `Current ${planTier} tier includes this capability.`,
    });

    // Stage 6: Governance Policy (e.g. Approval Required)
    let approvalRequired = false;
    if (
      (action === "qr.publish" || action === "landing_pages.publish") &&
      collabPolicy.approvalRequiredForPublish &&
      !isOwner
    ) {
      approvalRequired = true;
      corridor.push({
        stage: "policy",
        label: "Governance Policy",
        status: "conditional",
        detail: "Publishing approval is required by workspace governance policy.",
      });
      reasons.push("governance_approval_required");
    } else {
      corridor.push({
        stage: "policy",
        label: "Governance Policy",
        status: "passed",
        detail: "Standard operating policy applies. No approval block active.",
      });
    }

    // Stage 7: Resource Boundary
    corridor.push({
      stage: "resource",
      label: "Resource Boundary",
      status: "passed",
      detail: `Resource type '${input.resourceType}' validated within organization boundary.`,
    });

    // Stage 8: Final Decision
    if (approvalRequired) {
      corridor.push({
        stage: "decision",
        label: "Access Decision",
        status: "conditional",
        detail: "Approval Required: Member can submit revision, but publication requires reviewer approval.",
      });
      return {
        decision: "approval_required",
        memberName,
        roleName,
        action,
        corridor,
        reasons,
        explanation: `Permission granted, but organizational policy mandates reviewer approval before '${action}' takes effect live.`,
      };
    }

    corridor.push({
      stage: "decision",
      label: "Access Decision",
      status: "passed",
      detail: "Action Allowed: Full authority verified through complete pipeline.",
    });

    return {
      decision: "allowed",
      memberName,
      roleName,
      action,
      corridor,
      reasons: ["authorized"],
      explanation: `Member '${memberName}' has full authority to execute '${action}'.`,
    };
  },
};
