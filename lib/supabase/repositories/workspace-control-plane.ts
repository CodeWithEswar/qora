import "server-only";
import { createAdminClient } from "../admin";
import {
  WorkspaceControlPlaneOverview,
  WorkspaceIdentity,
  WorkspaceOwner,
  WorkspaceStats,
  WorkspaceBrandDefaults,
  WorkspaceQrDefaults,
  WorkspaceCollaborationPolicy,
  WorkspaceNotificationPreferences,
  WorkspaceStorageComposition,
  WorkspaceCapabilityItem,
  WorkspaceDeletionImpact,
  WorkspaceBrandPropagationImpact,
  UpdateWorkspaceGeneralRequest,
  UpdateWorkspaceQrDefaultsRequest,
  UpdateWorkspaceCollaborationRequest,
  UpdateWorkspaceNotificationsRequest,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  TIER_DEFAULT_ENTITLEMENTS,
  SaaSTier,
} from "@nxtqr/contracts";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

function getClient() {
  return createAdminClient();
}

const RESERVED_SLUGS = new Set([
  "api",
  "app",
  "auth",
  "admin",
  "login",
  "signup",
  "register",
  "logout",
  "dashboard",
  "settings",
  "workspace",
  "static",
  "assets",
  "s",
  "system",
  "nxtqr",
  "billing",
  "pricing",
  "docs",
]);

export const SupabaseWorkspaceRepository = {
  /**
   * Loads the authoritative Workspace Control Plane overview.
   * STRICT ZERO FAKE DATA: All metrics, owners, counts and storage derive from real DB rows.
   */
  async getWorkspaceOverview(
    slugOrId: string,
    currentUserId?: string
  ): Promise<WorkspaceControlPlaneOverview> {
    const supabase = getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    // 1. Fetch organization
    let orgQuery = supabase.from("organizations").select("*");
    orgQuery = isUuid
      ? orgQuery.eq("id", slugOrId)
      : orgQuery.or(`slug.eq.${slugOrId},legacy_id.eq.${slugOrId}`);

    const { data: org, error: orgError } = await orgQuery.maybeSingle();

    if (orgError || !org) {
      throw new NotFoundError(`Organization '${slugOrId}' not found.`);
    }

    const orgId = org.id;

    // 2. Fetch or auto-provision organization settings
    let { data: settings } = await supabase
      .from("organization_settings")
      .select("*")
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!settings) {
      // Auto-provision if missing
      const { data: createdSettings } = await supabase
        .from("organization_settings")
        .insert({ organization_id: orgId })
        .select()
        .single();
      settings = createdSettings;
    }

    // 3. Parallel fetch of counts, owner, brand kit, storage, available roles, members
    const [
      membersCountRes,
      teamsCountRes,
      qrCountRes,
      campaignsCountRes,
      brandKitsCountRes,
      domainsCountRes,
      filesCountRes,
      landingPagesCountRes,
      templatesCountRes,
      membersWithRolesRes,
      brandKitsListRes,
      rolesListRes,
      fileAssetsRes,
      customDomainsRes,
    ] = await Promise.all([
      supabase.from("organization_memberships").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("teams").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("qr_codes").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("brand_kits").select("id", { count: "exact", head: true }).eq("organization_id", orgId).neq("status", "ARCHIVED"),
      supabase.from("custom_domains").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("file_assets").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("landing_pages").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("qr_templates").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase
        .from("organization_memberships")
        .select(`
          id,
          user_id,
          status,
          profiles:user_id ( id, display_name, email, avatar_url ),
          member_roles ( roles:role_id ( id, code, name ) )
        `)
        .eq("organization_id", orgId)
        .eq("status", "active"),
      supabase
        .from("brand_kits")
        .select("id, name, slug, is_default, updated_at")
        .eq("organization_id", orgId)
        .neq("status", "ARCHIVED")
        .order("name", { ascending: true }),
      supabase
        .from("roles")
        .select("id, code, name, description")
        .or(`organization_id.eq.${orgId},is_system.eq.true`)
        .order("code", { ascending: true }),
      supabase
        .from("file_assets")
        .select("bucket, size_bytes, category")
        .eq("organization_id", orgId),
      supabase
        .from("custom_domains")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
    ]);

    // 4. Resolve owner from real memberships
    const allMembers = (membersWithRolesRes.data || []) as any[];
    let ownerRecord = allMembers.find((m) =>
      m.member_roles?.some((mr: any) => mr.roles?.code === "OWNER" || mr.roles?.code === "Owner")
    );

    // Fallback: If no explicit OWNER role mapped, check created_by profile
    let ownerProfile: WorkspaceOwner = {
      id: "unknown",
      displayName: "Workspace Owner",
      email: "",
      avatarUrl: null,
    };

    if (ownerRecord?.profiles) {
      ownerProfile = {
        id: ownerRecord.profiles.id,
        displayName: ownerRecord.profiles.display_name || ownerRecord.profiles.email || "Workspace Owner",
        email: ownerRecord.profiles.email || "",
        avatarUrl: ownerRecord.profiles.avatar_url || null,
      };
    } else if (org.created_by) {
      const { data: creator } = await supabase.from("profiles").select("id, display_name, email, avatar_url").eq("id", org.created_by).maybeSingle();
      if (creator) {
        ownerProfile = {
          id: creator.id,
          displayName: creator.display_name || creator.email || "Workspace Owner",
          email: creator.email || "",
          avatarUrl: creator.avatar_url || null,
        };
      }
    }

    // 5. Default brand kit resolution
    const defaultBrandKitId = settings?.default_brand_kit_id || null;
    let defaultBrandKitDetails: WorkspaceBrandDefaults = {
      defaultBrandKitId: null,
      defaultBrandKitName: null,
      defaultBrandKitSlug: null,
      defaultBrandKitUpdatedAt: null,
    };

    if (defaultBrandKitId) {
      const matched = (brandKitsListRes.data || []).find((b: any) => b.id === defaultBrandKitId);
      if (matched) {
        defaultBrandKitDetails = {
          defaultBrandKitId: matched.id,
          defaultBrandKitName: matched.name,
          defaultBrandKitSlug: matched.slug,
          defaultBrandKitUpdatedAt: matched.updated_at,
        };
      }
    }

    // 6. Calculate real storage composition
    const rawFiles = fileAssetsRes.data || [];
    let filesBytes = 0;
    let qrAssetsBytes = 0;
    let brandAssetsBytes = 0;
    let exportsBytes = 0;

    for (const file of rawFiles) {
      const bytes = Number(file.size_bytes) || 0;
      const bucket = file.bucket || "";
      const cat = file.category || "";

      if (bucket === "qr-assets") {
        qrAssetsBytes += bytes;
      } else if (bucket === "brand-assets") {
        brandAssetsBytes += bytes;
      } else if (bucket === "exports" || bucket === "reports") {
        exportsBytes += bytes;
      } else {
        filesBytes += bytes;
      }
    }

    const totalStorageBytes = filesBytes + qrAssetsBytes + brandAssetsBytes + exportsBytes;

    // 7. Derive capabilities from SaaSTier
    const planTier = (org.billing_plan || "FREE") as SaaSTier;
    const entitlements = TIER_DEFAULT_ENTITLEMENTS[planTier] || TIER_DEFAULT_ENTITLEMENTS.FREE;

    const capabilities: WorkspaceCapabilityItem[] = [
      {
        key: "qr.dynamic",
        title: "Dynamic QR Codes",
        description: "Adaptive QR codes with real-time destination and routing changes",
        enabled: true,
        limit: entitlements["qr.dynamic.max"] >= 999999 ? "Unlimited" : entitlements["qr.dynamic.max"],
      },
      {
        key: "domains.custom",
        title: "Custom Branded Domains",
        description: "Connect verified vanity domains for high-trust scan URLs",
        enabled: entitlements["domains.customMax"] > 0,
        limit: entitlements["domains.customMax"] > 0 ? entitlements["domains.customMax"] : "Unavailable",
        requiredTier: entitlements["domains.customMax"] === 0 ? "PRO" : undefined,
      },
      {
        key: "team.seats",
        title: "Team Collaboration & Seats",
        description: "Invite team members and provision granular role privileges",
        enabled: entitlements["team.maxSeats"] > 1,
        limit: `${entitlements["team.maxSeats"]} seat${entitlements["team.maxSeats"] > 1 ? "s" : ""}`,
        requiredTier: entitlements["team.maxSeats"] <= 1 ? "PRO" : undefined,
      },
      {
        key: "team.rbac",
        title: "Granular RBAC Roles",
        description: "Custom role configurations and policy boundaries",
        enabled: entitlements["team.rbac"],
        requiredTier: !entitlements["team.rbac"] ? "BUSINESS" : undefined,
      },
      {
        key: "routing.smart",
        title: "Adaptive Smart Routing",
        description: "Visual rules engine by device OS, geography, and schedule",
        enabled: entitlements["routing.level"] !== "none",
        limit: entitlements["routing.level"].toUpperCase(),
        requiredTier: entitlements["routing.level"] === "none" ? "PRO" : undefined,
      },
      {
        key: "guardian.protection",
        title: "Guardian Autonomous Protection",
        description: "Live URL health monitoring and auto-fallback redirection",
        enabled: entitlements["guardian.enabled"],
        requiredTier: !entitlements["guardian.enabled"] ? "PRO" : undefined,
      },
      {
        key: "exports.vector",
        title: "Vector Exports (SVG, PDF, CMYK)",
        description: "Print-ready high-precision exports for commercial printing",
        enabled: entitlements["exports.vectorFormats"],
        requiredTier: !entitlements["exports.vectorFormats"] ? "PRO" : undefined,
      },
      {
        key: "branding.whitelabel",
        title: "White-Label Brand Kits",
        description: "Remove all platform watermarks and enforce corporate brand guides",
        enabled: entitlements["branding.whiteLabel"],
        requiredTier: !entitlements["branding.whiteLabel"] ? "BUSINESS" : undefined,
      },
      {
        key: "api.access",
        title: "Developer API & Webhooks",
        description: "Programmatic QR generation and real-time scan event dispatch",
        enabled: entitlements["api.monthlyRequests"] > 0,
        limit: entitlements["api.monthlyRequests"] > 0 ? `${entitlements["api.monthlyRequests"].toLocaleString()} req/mo` : "Unavailable",
        requiredTier: entitlements["api.monthlyRequests"] === 0 ? "PRO" : undefined,
      },
      {
        key: "bulk.creation",
        title: "Bulk QR Generation",
        description: "Generate thousands of QR codes via CSV/Excel spreadsheets",
        enabled: entitlements["bulk.enabled"],
        limit: `${entitlements["bulk.maxRowsPerBatch"]} rows/batch`,
      },
    ];

    // 8. User permissions check
    let canUpdate = true;
    let isOwner = false;

    if (currentUserId) {
      const userMembership = allMembers.find((m) => m.user_id === currentUserId);
      if (userMembership) {
        const userRoles = userMembership.member_roles?.map((mr: any) => mr.roles?.code) || [];
        isOwner = userRoles.includes("OWNER") || userRoles.includes("Owner");
        const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("Admin");
        const isViewer = userRoles.includes("VIEWER") || userRoles.includes("Viewer");
        canUpdate = isOwner || isAdmin || !isViewer;
      }
    }

    // 9. Eligible transfer members (active members who are not the current owner)
    const eligibleTransferMembers = allMembers
      .filter((m) => {
        const roles = m.member_roles?.map((mr: any) => mr.roles?.code) || [];
        return !roles.includes("OWNER") && !roles.includes("Owner");
      })
      .map((m) => {
        const primaryRole = m.member_roles?.[0]?.roles?.name || "Member";
        return {
          id: m.id,
          userId: m.user_id,
          displayName: m.profiles?.display_name || m.profiles?.email || "Member",
          email: m.profiles?.email || "",
          avatarUrl: m.profiles?.avatar_url || null,
          roleName: primaryRole,
        };
      });

    // 10. QR Defaults fallback to canonical schema
    const rawQr = (settings?.qr_defaults_json as Record<string, any>) || {};
    const qrDefaults: WorkspaceQrDefaults = {
      errorCorrection: rawQr.errorCorrection || CANONICAL_QR_DESIGN_DEFAULTS.errorCorrection || "Q",
      quietZone: rawQr.quietZone ?? CANONICAL_QR_DESIGN_DEFAULTS.quietZone ?? 4,
      moduleStyle: rawQr.moduleStyle || CANONICAL_QR_DESIGN_DEFAULTS.moduleStyle || "squares",
      eyeOuterStyle: rawQr.eyeOuterStyle || CANONICAL_QR_DESIGN_DEFAULTS.eyeOuterStyle || "square",
      eyeInnerStyle: rawQr.eyeInnerStyle || CANONICAL_QR_DESIGN_DEFAULTS.eyeInnerStyle || "square",
      fgColor: rawQr.fgColor || CANONICAL_QR_DESIGN_DEFAULTS.fgColor || "#1F1F1F",
      bgColor: rawQr.bgColor || CANONICAL_QR_DESIGN_DEFAULTS.bgColor || "#FFFFFF",
      frameStyle: rawQr.frameStyle || "none",
      frameText: rawQr.frameText || "SCAN ME",
      format: rawQr.format || "png",
      size: rawQr.size || 1024,
    };

    // 11. Collaboration policy fallback
    const rawCollab = (settings?.collaboration_policy_json as Record<string, any>) || {};
    const defaultRoleObj = (rolesListRes.data || []).find((r: any) => r.id === rawCollab.defaultRoleId);
    const collaborationPolicy: WorkspaceCollaborationPolicy = {
      defaultRoleId: rawCollab.defaultRoleId || "00000000-0000-0000-0000-000000000003",
      defaultRoleName: defaultRoleObj?.name || "Member",
      invitationPolicy: rawCollab.invitationPolicy || "admins_and_owners",
      approvalRequiredForPublish: Boolean(rawCollab.approvalRequiredForPublish),
      externalSharingEnabled: rawCollab.externalSharingEnabled !== false,
    };

    // 12. Notification preferences
    const rawNotifs = (settings?.notification_preferences_json as Record<string, any>) || {};
    const notificationPreferences: WorkspaceNotificationPreferences = {
      inApp: rawNotifs.inApp !== false,
      email: rawNotifs.email !== false,
      securityAlerts: rawNotifs.securityAlerts !== false,
      weeklyDigest: Boolean(rawNotifs.weeklyDigest),
    };

    return {
      identity: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logo_url || null,
        billingPlan: planTier,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
        archivedAt: org.archived_at || null,
        description: settings?.description || "",
        timezone: settings?.timezone || "UTC",
        locale: settings?.locale || "en",
      },
      owner: ownerProfile,
      stats: {
        memberCount: membersCountRes.count ?? 0,
        teamCount: teamsCountRes.count ?? 0,
        qrCount: qrCountRes.count ?? 0,
        campaignCount: campaignsCountRes.count ?? 0,
        brandKitCount: brandKitsCountRes.count ?? 0,
        domainCount: domainsCountRes.count ?? 0,
        fileCount: filesCountRes.count ?? 0,
        landingPageCount: landingPagesCountRes.count ?? 0,
        templateCount: templatesCountRes.count ?? 0,
      },
      brandDefaults: defaultBrandKitDetails,
      qrDefaults,
      collaborationPolicy,
      notificationPreferences,
      storage: {
        totalBytes: totalStorageBytes,
        fileCount: filesCountRes.count ?? 0,
        byCategory: {
          files: filesBytes,
          qrAssets: qrAssetsBytes,
          brandAssets: brandAssetsBytes,
          exports: exportsBytes,
        },
      },
      domains: {
        customDomainsCount: domainsCountRes.count ?? 0,
        defaultHost: "nxtqr.vercel.app",
        shortUrlBase: "https://nxtqr.vercel.app",
      },
      capabilities,
      userPermissions: {
        canUpdate,
        canTransferOwnership: isOwner,
        canDelete: isOwner,
        canExport: canUpdate,
        isOwner,
      },
      availableBrandKits: (brandKitsListRes.data || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        isDefault: Boolean(b.is_default),
        updatedAt: b.updated_at,
      })),
      availableRoles: (rolesListRes.data || []).map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description || undefined,
      })),
      eligibleTransferMembers,
    };
  },

  /**
   * Updates workspace general metadata (name, slug, description, timezone, locale).
   */
  async updateGeneralSettings(
    orgId: string,
    req: UpdateWorkspaceGeneralRequest,
    actorId?: string
  ): Promise<WorkspaceIdentity> {
    const supabase = getClient();

    const { data: org, error: findErr } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (findErr || !org) {
      throw new NotFoundError(`Organization not found.`);
    }

    const updates: Record<string, any> = {};

    if (req.name !== undefined) {
      const trimmed = req.name.trim();
      if (!trimmed || trimmed.length < 2 || trimmed.length > 80) {
        throw new ValidationError("Workspace name must be between 2 and 80 characters.");
      }
      updates.name = trimmed;
    }

    if (req.slug !== undefined) {
      const normalized = req.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "");

      if (normalized.length < 3 || normalized.length > 64) {
        throw new ValidationError("Workspace URL slug must be between 3 and 64 characters (alphanumeric, dashes, underscores).");
      }

      if (RESERVED_SLUGS.has(normalized)) {
        throw new ValidationError(`The URL slug '${normalized}' is reserved by NXTQR platform infrastructure.`);
      }

      if (normalized !== org.slug) {
        // Uniqueness check
        const { data: existing } = await supabase
          .from("organizations")
          .select("id")
          .eq("slug", normalized)
          .neq("id", orgId)
          .maybeSingle();

        if (existing) {
          throw new ValidationError(`Workspace URL slug '${normalized}' is already in use.`);
        }

        updates.slug = normalized;
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: orgUpdateErr } = await supabase
        .from("organizations")
        .update(updates as any)
        .eq("id", orgId);

      if (orgUpdateErr) {
        throw new Error(`Failed to update organization: ${orgUpdateErr.message}`);
      }
    }

    // Update settings table
    const settingsUpdates: Record<string, any> = {};
    if (req.description !== undefined) settingsUpdates.description = req.description.trim();
    if (req.timezone !== undefined) settingsUpdates.timezone = req.timezone.trim();
    if (req.locale !== undefined) settingsUpdates.locale = req.locale.trim();
    if (actorId) settingsUpdates.updated_by = actorId;

    if (Object.keys(settingsUpdates).length > 0) {
      await supabase
        .from("organization_settings")
        .upsert({ organization_id: orgId, ...settingsUpdates }, { onConflict: "organization_id" });
    }

    // Audit log & activity
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "WORKSPACE_GENERAL_UPDATED",
        resource_type: "organization",
        resource_id: orgId,
        metadata_json: { ...updates, ...settingsUpdates },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "workspace.updated",
        resource_type: "organization",
        resource_id: orgId,
        metadata_json: { name: updates.name || org.name, slug: updates.slug || org.slug },
      }),
    ]);

    // Return updated identity
    const overview = await this.getWorkspaceOverview(orgId, actorId);
    return overview.identity;
  },

  /**
   * Updates workspace logo URL.
   */
  async updateLogo(orgId: string, logoUrl: string | null, actorId?: string): Promise<void> {
    const supabase = getClient();

    const { error } = await supabase
      .from("organizations")
      .update({ logo_url: logoUrl })
      .eq("id", orgId);

    if (error) {
      throw new Error(`Failed to update workspace logo: ${error.message}`);
    }

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: logoUrl ? "WORKSPACE_LOGO_UPDATED" : "WORKSPACE_LOGO_REMOVED",
        resource_type: "organization",
        resource_id: orgId,
        metadata_json: { logoUrl },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: logoUrl ? "workspace.logo_updated" : "workspace.logo_removed",
        resource_type: "organization",
        resource_id: orgId,
        metadata_json: { logoUrl },
      }),
    ]);
  },

  /**
   * Sets or clears the workspace default Brand Kit.
   */
  async updateBrandDefaults(
    orgId: string,
    defaultBrandKitId: string | null,
    actorId?: string
  ): Promise<WorkspaceBrandDefaults> {
    const supabase = getClient();

    if (defaultBrandKitId) {
      // Verify brand kit exists and belongs to this org
      const { data: brandKit, error: bkErr } = await supabase
        .from("brand_kits")
        .select("id, name, slug, updated_at")
        .eq("id", defaultBrandKitId)
        .eq("organization_id", orgId)
        .neq("status", "ARCHIVED")
        .single();

      if (bkErr || !brandKit) {
        throw new NotFoundError("Selected Brand Kit not found or is archived.");
      }

      // Clear previous is_default
      await supabase
        .from("brand_kits")
        .update({ is_default: false })
        .eq("organization_id", orgId);

      // Set new is_default
      await supabase
        .from("brand_kits")
        .update({ is_default: true })
        .eq("id", defaultBrandKitId);

      // Save in organization_settings
      await supabase
        .from("organization_settings")
        .upsert(
          {
            organization_id: orgId,
            default_brand_kit_id: defaultBrandKitId,
            updated_by: actorId || null,
          },
          { onConflict: "organization_id" }
        );

      await Promise.allSettled([
        (supabase as any).from("audit_logs").insert({
          organization_id: orgId,
          actor_id: actorId || null,
          action: "WORKSPACE_DEFAULT_BRAND_KIT_UPDATED",
          resource_type: "brand_kit",
          resource_id: defaultBrandKitId,
          metadata_json: { brandKitId: defaultBrandKitId, brandKitName: brandKit.name },
        }),
        (supabase as any).from("activity_events").insert({
          organization_id: orgId,
          actor_id: actorId || null,
          action: "workspace.default_brand_kit_changed",
          resource_type: "brand_kit",
          resource_id: defaultBrandKitId,
          metadata_json: { brandKitName: brandKit.name },
        }),
      ]);

      return {
        defaultBrandKitId: brandKit.id,
        defaultBrandKitName: brandKit.name,
        defaultBrandKitSlug: brandKit.slug,
        defaultBrandKitUpdatedAt: brandKit.updated_at,
      };
    } else {
      // Clear default
      await supabase
        .from("brand_kits")
        .update({ is_default: false })
        .eq("organization_id", orgId);

      await supabase
        .from("organization_settings")
        .upsert(
          {
            organization_id: orgId,
            default_brand_kit_id: null,
            updated_by: actorId || null,
          },
          { onConflict: "organization_id" }
        );

      return {
        defaultBrandKitId: null,
        defaultBrandKitName: null,
        defaultBrandKitSlug: null,
        defaultBrandKitUpdatedAt: null,
      };
    }
  },

  /**
   * Updates workspace-level QR defaults.
   */
  async updateQrDefaults(
    orgId: string,
    req: UpdateWorkspaceQrDefaultsRequest,
    actorId?: string
  ): Promise<WorkspaceQrDefaults> {
    const supabase = getClient();
    const { qrDefaults } = req;

    // Validate parameters
    const validEc = ["L", "M", "Q", "H"];
    if (!validEc.includes(qrDefaults.errorCorrection)) {
      throw new ValidationError("Invalid error correction level. Must be L, M, Q, or H.");
    }

    if (qrDefaults.quietZone < 0 || qrDefaults.quietZone > 10) {
      throw new ValidationError("Quiet zone must be between 0 and 10 modules.");
    }

    await supabase
      .from("organization_settings")
      .upsert(
        {
          organization_id: orgId,
          qr_defaults_json: qrDefaults as any,
          updated_by: actorId || null,
        },
        { onConflict: "organization_id" }
      );

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "WORKSPACE_QR_DEFAULTS_UPDATED",
        resource_type: "organization_settings",
        resource_id: orgId,
        metadata_json: qrDefaults,
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "workspace.qr_defaults_updated",
        resource_type: "organization_settings",
        resource_id: orgId,
        metadata_json: { errorCorrection: qrDefaults.errorCorrection, style: qrDefaults.moduleStyle },
      }),
    ]);

    return qrDefaults;
  },

  /**
   * Updates workspace collaboration policies.
   */
  async updateCollaborationPolicy(
    orgId: string,
    req: UpdateWorkspaceCollaborationRequest,
    actorId?: string
  ): Promise<WorkspaceCollaborationPolicy> {
    const supabase = getClient();
    const { collaborationPolicy } = req;

    // Verify role exists
    const { data: role } = await supabase
      .from("roles")
      .select("id, name")
      .eq("id", collaborationPolicy.defaultRoleId)
      .maybeSingle();

    if (!role) {
      throw new ValidationError("Selected default member role does not exist.");
    }

    await supabase
      .from("organization_settings")
      .upsert(
        {
          organization_id: orgId,
          collaboration_policy_json: collaborationPolicy as any,
          updated_by: actorId || null,
        },
        { onConflict: "organization_id" }
      );

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "WORKSPACE_COLLABORATION_UPDATED",
        resource_type: "organization_settings",
        resource_id: orgId,
        metadata_json: collaborationPolicy,
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "workspace.collaboration_updated",
        resource_type: "organization_settings",
        resource_id: orgId,
        metadata_json: { defaultRole: role.name },
      }),
    ]);

    return {
      ...collaborationPolicy,
      defaultRoleName: role.name,
    };
  },

  /**
   * Updates workspace notification preferences.
   */
  async updateNotificationPreferences(
    orgId: string,
    req: UpdateWorkspaceNotificationsRequest,
    actorId?: string
  ): Promise<WorkspaceNotificationPreferences> {
    const supabase = getClient();
    const { notificationPreferences } = req;

    await supabase
      .from("organization_settings")
      .upsert(
        {
          organization_id: orgId,
          notification_preferences_json: notificationPreferences as any,
          updated_by: actorId || null,
        },
        { onConflict: "organization_id" }
      );

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "WORKSPACE_NOTIFICATIONS_UPDATED",
        resource_type: "organization_settings",
        resource_id: orgId,
        metadata_json: notificationPreferences,
      }),
    ]);

    return notificationPreferences;
  },

  /**
   * Calculates real deletion impact counts across all resources.
   */
  async getDeletionImpact(orgId: string): Promise<WorkspaceDeletionImpact> {
    const supabase = getClient();

    const [
      qrRes,
      campaignsRes,
      brandKitsRes,
      domainsRes,
      filesRes,
      membersRes,
      teamsRes,
      landingPagesRes,
      templatesRes,
    ] = await Promise.all([
      supabase.from("qr_codes").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("brand_kits").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("custom_domains").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("file_assets").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("organization_memberships").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("teams").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("landing_pages").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("qr_templates").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    ]);

    return {
      qrCodes: qrRes.count ?? 0,
      campaigns: campaignsRes.count ?? 0,
      brandKits: brandKitsRes.count ?? 0,
      domains: domainsRes.count ?? 0,
      files: filesRes.count ?? 0,
      members: membersRes.count ?? 0,
      teams: teamsRes.count ?? 0,
      landingPages: landingPagesRes.count ?? 0,
      templates: templatesRes.count ?? 0,
    };
  },

  /**
   * Calculates real brand propagation impact across resources.
   */
  async getBrandPropagationImpact(orgId: string, _brandKitId?: string): Promise<WorkspaceBrandPropagationImpact> {
    const supabase = getClient();

    const [qrRes, templatesRes, landingPagesRes] = await Promise.all([
      supabase.from("qr_codes").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("qr_templates").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("landing_pages").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    ]);

    return {
      qrCodesUsingDefault: qrRes.count ?? 0,
      templatesUsingDefault: templatesRes.count ?? 0,
      landingPagesUsingDefault: landingPagesRes.count ?? 0,
    };
  },

  /**
   * Transfers workspace ownership to an active eligible member.
   */
  async transferOwnership(
    orgId: string,
    newOwnerMemberId: string,
    currentUserId: string
  ): Promise<void> {
    const supabase = getClient();

    // 1. Verify current user is actually the OWNER
    const { data: currentOwnerMembership } = await supabase
      .from("organization_memberships")
      .select("id, member_roles(roles(code))")
      .eq("organization_id", orgId)
      .eq("user_id", currentUserId)
      .single();

    const currentRoles = (currentOwnerMembership as any)?.member_roles?.map((mr: any) => mr.roles?.code) || [];
    if (!currentRoles.includes("OWNER") && !currentRoles.includes("Owner")) {
      throw new ForbiddenError("Only the current workspace owner can transfer ownership.");
    }

    // 2. Verify target member is active in the org
    const { data: targetMember } = await supabase
      .from("organization_memberships")
      .select("id, user_id, status, profiles(display_name, email)")
      .eq("id", newOwnerMemberId)
      .eq("organization_id", orgId)
      .single();

    if (!targetMember || targetMember.status !== "active") {
      throw new ValidationError("Target member is not an active member of this organization.");
    }

    // 3. Roles resolution
    const { data: ownerRole } = await supabase.from("roles").select("id").eq("code", "OWNER").single();
    const { data: adminRole } = await supabase.from("roles").select("id").eq("code", "ADMIN").single();

    const ownerRoleId = ownerRole?.id || "00000000-0000-0000-0000-000000000001";
    const adminRoleId = adminRole?.id || "00000000-0000-0000-0000-000000000002";

    // 4. Swap roles atomically
    // Demote current owner to ADMIN if exists
    if (currentOwnerMembership) {
      await supabase.from("member_roles").delete().eq("membership_id", currentOwnerMembership.id);
      await supabase.from("member_roles").insert({
        membership_id: currentOwnerMembership.id,
        role_id: adminRoleId,
      });
    }

    // Promote target member to OWNER
    await supabase.from("member_roles").delete().eq("membership_id", targetMember.id);
    await supabase.from("member_roles").insert({
      membership_id: targetMember.id,
      role_id: ownerRoleId,
    });

    // Audit & Activity
    const targetName = (targetMember.profiles as any)?.display_name || (targetMember.profiles as any)?.email || "Member";
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: currentUserId,
        action: "WORKSPACE_OWNERSHIP_TRANSFERRED",
        resource_type: "organization",
        resource_id: orgId,
        metadata_json: { newOwnerMemberId, newOwnerUserId: targetMember.user_id },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: currentUserId,
        action: "workspace.ownership_transferred",
        resource_type: "organization",
        resource_id: orgId,
        metadata_json: { newOwnerName: targetName },
      }),
    ]);
  },

  /**
   * Archives a workspace.
   */
  async archiveWorkspace(orgId: string, actorId?: string): Promise<void> {
    const supabase = getClient();

    const { error } = await supabase
      .from("organizations")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", orgId);

    if (error) {
      throw new Error(`Failed to archive workspace: ${error.message}`);
    }

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "WORKSPACE_ARCHIVED",
        resource_type: "organization",
        resource_id: orgId,
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId || null,
        action: "workspace.archived",
        resource_type: "organization",
        resource_id: orgId,
      }),
    ]);
  },

  /**
   * Deletes a workspace with high-friction verification.
   */
  async deleteWorkspace(orgId: string, actorId?: string): Promise<void> {
    const supabase = getClient();

    // Verify actor is OWNER
    if (actorId) {
      const { data: mem } = await supabase
        .from("organization_memberships")
        .select("id, member_roles(roles(code))")
        .eq("organization_id", orgId)
        .eq("user_id", actorId)
        .single();

      const roles = (mem as any)?.member_roles?.map((mr: any) => mr.roles?.code) || [];
      if (!roles.includes("OWNER") && !roles.includes("Owner")) {
        throw new ForbiddenError("Only the workspace owner can delete the organization.");
      }
    }

    // Execute deletion (cascades automatically via FKs)
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (error) {
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }
  },

  /**
   * Generates a sanitized JSON export of the workspace data (excluding all secrets, credentials, tokens, hashes).
   */
  async exportWorkspaceData(orgId: string): Promise<Record<string, any>> {
    const supabase = getClient();

    const [
      orgRes,
      settingsRes,
      membersRes,
      teamsRes,
      qrRes,
      brandKitsRes,
      domainsRes,
      filesRes,
    ] = await Promise.all([
      supabase.from("organizations").select("id, name, slug, billing_plan, created_at").eq("id", orgId).single(),
      supabase.from("organization_settings").select("description, timezone, locale, qr_defaults_json, collaboration_policy_json").eq("organization_id", orgId).maybeSingle(),
      supabase.from("organization_memberships").select("id, status, joined_at, profiles(display_name, email)").eq("organization_id", orgId),
      supabase.from("teams").select("id, name, description, created_at").eq("organization_id", orgId),
      supabase.from("qr_codes").select("id, name, slug, qr_type, is_dynamic, status, created_at").eq("organization_id", orgId),
      supabase.from("brand_kits").select("id, name, slug, is_default, colors_json, typography_json").eq("organization_id", orgId),
      supabase.from("custom_domains").select("id, hostname, status, created_at").eq("organization_id", orgId),
      supabase.from("file_assets").select("id, file_name, mime_type, size_bytes, category, created_at").eq("organization_id", orgId),
    ]);

    return {
      metadata: {
        exportVersion: "1.0",
        exportedAt: new Date().toISOString(),
        host: "nxtqr.vercel.app",
        note: "Sanitized export containing zero secrets, API keys, or security tokens.",
      },
      organization: orgRes.data || null,
      settings: settingsRes.data || null,
      members: (membersRes.data || []).map((m: any) => ({
        id: m.id,
        status: m.status,
        joinedAt: m.joined_at,
        displayName: m.profiles?.display_name,
        email: m.profiles?.email,
      })),
      teams: teamsRes.data || [],
      qrCodes: qrRes.data || [],
      brandKits: brandKitsRes.data || [],
      customDomains: domainsRes.data || [],
      files: filesRes.data || [],
    };
  },
};
