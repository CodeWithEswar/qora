import "server-only";
import { createAdminClient } from "../admin";
import {
  BrandKitSummaryV1,
  BrandKitDetailV1,
  BrandKitVersionV1,
  BrandKitPulseMetrics,
  BrandColorToken,
  BrandTypographyConfig,
  BrandLogoAsset,
  BrandQrPreset,
  BrandGuidelines,
  BrandGovernance,
  CreateBrandKitRequestV1,
  UpdateBrandKitRequestV1,
  BrandKitCollectionQuery,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "@nxtqr/contracts";

function getClient() {
  return createAdminClient();
}

/**
 * Helper to generate a URL-safe unique slug within an organization
 */
async function generateUniqueSlug(
  supabase: any,
  orgId: string,
  baseName: string,
  excludeId?: string
): Promise<string> {
  const base = baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "brand";

  let slug = base;
  let attempt = 1;

  while (true) {
    let query = supabase
      .from("brand_kits")
      .select("id")
      .eq("organization_id", orgId)
      .eq("slug", slug)
      .neq("status", "ARCHIVED");

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.limit(1);

    if (!data || data.length === 0) {
      return slug;
    }

    attempt++;
    slug = `${base}-${attempt}`;
  }
}

/**
 * Safely validates whether an actorId exists in public.profiles.
 * If not present, returns null to avoid violating foreign key constraint "brand_kits_created_by_fkey".
 */
async function resolveValidProfileId(supabase: any, actorId: string | null): Promise<string | null> {
  if (!actorId) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actorId)) {
    return null;
  }
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", actorId)
      .maybeSingle();
    return data ? data.id : null;
  } catch {
    return null;
  }
}

export const SupabaseBrandKitRepository = {
  /**
   * Lists brand kits for an organization with pagination, search, and real counts.
   * STRICT ZERO FAKE DATA: Returns empty array if 0 rows exist in the database.
   */
  async listByOrg(
    orgId: string,
    query?: Partial<BrandKitCollectionQuery>
  ): Promise<{ items: BrandKitSummaryV1[]; total: number }> {
    const supabase = await getClient();

    let q = (supabase as any)
      .from("brand_kits")
      .select(
        "id, organization_id, name, slug, description, status, is_default, primary_color, logo_url, published_revision, logos_json, created_at, updated_at, archived_at",
        { count: "exact" }
      )
      .eq("organization_id", orgId);

    const statusFilter = query?.status || "active";
    if (statusFilter === "active") {
      q = q.eq("status", "ACTIVE");
    } else if (statusFilter === "archived") {
      q = q.eq("status", "ARCHIVED");
    }

    if (query?.isDefault !== undefined) {
      q = q.eq("is_default", query.isDefault);
    }

    if (query?.search?.trim()) {
      const s = query.search.trim();
      q = q.or(`name.ilike.%${s}%,slug.ilike.%${s}%,description.ilike.%${s}%`);
    }

    const sortCol =
      query?.sortBy === "name"
        ? "name"
        : query?.sortBy === "createdAt"
        ? "created_at"
        : "updated_at";
    const sortAsc = query?.order === "asc";

    q = q.order(sortCol, { ascending: sortAsc });

    const limit = Math.min(query?.limit || 50, 100);
    const offset = Math.max(query?.offset || 0, 0);
    q = q.range(offset, offset + limit - 1);

    const { data, count, error } = await q;
    if (error) {
      throw new Error(`Failed to list brand kits: ${error.message}`);
    }

    const rows = data || [];
    const kitIds = rows.map((r: any) => r.id);

    // Fetch real QR counts linked to these brand kits
    let qrCountMap: Record<string, number> = {};
    if (kitIds.length > 0) {
      const { data: qrData } = await (supabase as any)
        .from("qr_codes")
        .select("brand_kit_id")
        .in("brand_kit_id", kitIds);

      if (qrData) {
        for (const qr of qrData) {
          if (qr.brand_kit_id) {
            qrCountMap[qr.brand_kit_id] = (qrCountMap[qr.brand_kit_id] || 0) + 1;
          }
        }
      }
    }

    const items: BrandKitSummaryV1[] = rows.map((r: any) => {
      const logos = Array.isArray(r.logos_json) ? r.logos_json : [];
      return {
        id: r.id,
        organizationId: r.organization_id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        status: r.status,
        isDefault: r.is_default,
        primaryColor: r.primary_color,
        logoUrl: r.logo_url,
        publishedRevision: r.published_revision || 1,
        qrCount: qrCountMap[r.id] || 0,
        assetCount: logos.length,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        archivedAt: r.archived_at,
      };
    });

    return {
      items,
      total: count || 0,
    };
  },

  /**
   * Fetches detailed Brand Kit by ID with full token and resource assignments.
   */
  async getById(orgId: string, brandKitId: string): Promise<BrandKitDetailV1> {
    const supabase = await getClient();

    const { data, error } = await (supabase as any)
      .from("brand_kits")
      .select("*")
      .eq("id", brandKitId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to retrieve brand kit: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError(`Brand Kit '${brandKitId}' not found in workspace`);
    }

    // Query real resource dependency counts concurrently
    const [qrsRes, lpsRes, campaignsRes, fileUsagesRes] = await Promise.all([
      (supabase as any)
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("brand_kit_id", brandKitId),
      (supabase as any)
        .from("landing_pages")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("brand_kit_id", brandKitId),
      (supabase as any)
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("brand_kit_id", brandKitId),
      (supabase as any)
        .from("file_usages")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("resource_type", "BRAND_KIT")
        .eq("resource_id", brandKitId),
    ]);

    const connectedQrs = qrsRes.count || 0;
    const connectedLandingPages = lpsRes.count || 0;
    const connectedCampaigns = campaignsRes.count || 0;
    const logos = Array.isArray(data.logos_json) ? data.logos_json : [];
    const connectedAssets = Math.max(logos.length, fileUsagesRes.count || 0);

    const colors = Array.isArray(data.colors_json) ? data.colors_json : [];
    const qrPresets = Array.isArray(data.qr_presets_json) ? data.qr_presets_json : [];
    const typography = data.typography_json && typeof data.typography_json === "object" ? data.typography_json : {};
    const guidelines = data.guidelines_json && typeof data.guidelines_json === "object" ? data.guidelines_json : {};
    const governance = data.governance_json && typeof data.governance_json === "object" ? data.governance_json : {};

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status,
      isDefault: data.is_default,
      primaryColor: data.primary_color,
      logoUrl: data.logo_url,
      publishedRevision: data.published_revision || 1,
      qrCount: connectedQrs,
      assetCount: connectedAssets,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
      colors,
      typography,
      logos,
      qrPresets,
      guidelines,
      governance,
      resourceSummary: {
        connectedQrs,
        connectedLandingPages,
        connectedCampaigns,
        connectedAssets,
      },
    };
  },

  /**
   * Resolves a Brand Kit by organization slug/ID and kit slug.
   */
  async getBySlug(orgId: string, slug: string): Promise<BrandKitDetailV1> {
    const supabase = await getClient();
    const { data } = await (supabase as any)
      .from("brand_kits")
      .select("id")
      .eq("organization_id", orgId)
      .eq("slug", slug.toLowerCase().trim())
      .neq("status", "ARCHIVED")
      .maybeSingle();

    if (!data) {
      throw new NotFoundError(`Brand Kit with slug '${slug}' not found`);
    }

    return this.getById(orgId, data.id);
  },

  /**
   * Retrieves the designated default brand kit for the organization.
   */
  async getDefault(orgId: string): Promise<BrandKitDetailV1 | null> {
    const supabase = await getClient();
    const { data } = await (supabase as any)
      .from("brand_kits")
      .select("id")
      .eq("organization_id", orgId)
      .eq("is_default", true)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (!data) return null;
    return this.getById(orgId, data.id);
  },

  /**
   * Creates a new brand kit.
   * STRICT: If initialTemplate is blank, initializes clean without fake starter artifacts.
   */
  async create(
    orgId: string,
    actorId: string | null,
    payload: CreateBrandKitRequestV1
  ): Promise<BrandKitDetailV1> {
    const supabase = await getClient();

    const slug = await generateUniqueSlug(supabase, orgId, payload.name);

    // If marked as default, atomically clear existing defaults in this org
    if (payload.isDefault) {
      await (supabase as any)
        .from("brand_kits")
        .update({ is_default: false })
        .eq("organization_id", orgId);
    }

    const primaryHex = payload.primaryColor.toUpperCase();
    const secondaryHex = payload.secondaryColor ? payload.secondaryColor.toUpperCase() : "#1F1F1F";

    // Build initial tokens
    const initialColors: BrandColorToken[] = [
      {
        id: `col_${Date.now()}_pri`,
        name: "Primary Brand",
        role: "primary",
        hex: primaryHex,
        description: "Primary visual identity and signature anchor",
      },
      {
        id: `col_${Date.now()}_sec`,
        name: "Secondary",
        role: "secondary",
        hex: secondaryHex,
        description: "Secondary accent and typography tone",
      },
      {
        id: `col_${Date.now()}_qrf`,
        name: "QR Foreground",
        role: "qr_foreground",
        hex: primaryHex,
        description: "Default scannable module color",
      },
      {
        id: `col_${Date.now()}_qrb`,
        name: "QR Background",
        role: "qr_background",
        hex: "#FFFFFF",
        description: "Standard scannable high-contrast quiet zone",
      },
      {
        id: `col_${Date.now()}_acc`,
        name: "Signal Accent",
        role: "accent",
        hex: "#FFB83E",
        description: "Callouts, active indicators, and highlights",
      },
    ];

    const initialTypography: BrandTypographyConfig = {
      display: {
        fontFamily: "var(--font-editorial, 'Instrument Serif', Georgia, serif)",
        label: "Instrument Serif",
        sampleText: "Intelligence behind every scan.",
      },
      ui: {
        fontFamily: "var(--font-sans, 'Inter', -apple-system, sans-serif)",
        label: "Inter",
        sampleText: "Dynamic QR Routing & Digital Infrastructure",
      },
      mono: {
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        label: "JetBrains Mono",
        sampleText: "HEX #FA520F | 28.00mm x 28.00mm",
      },
    };

    const initialLogos: BrandLogoAsset[] = payload.logoUrl
      ? [
          {
            id: `logo_${Date.now()}`,
            name: `${payload.name} Primary Mark`,
            variant: "primary",
            url: payload.logoUrl,
            format: payload.logoUrl.endsWith(".svg") ? "svg" : "png",
            isPrimary: true,
            safeAreaPadding: 8,
          },
        ]
      : [];

    const initialQrPresets: BrandQrPreset[] = [
      {
        id: `preset_${Date.now()}_default`,
        name: "Default Branded Preset",
        description: "Clean scannable configuration matching primary identity",
        isDefault: true,
        design: {
          schemaVersion: 1,
          moduleStyle: "squares",
          eyeOuterStyle: "square",
          eyeInnerStyle: "square",
          fgColor: primaryHex,
          bgColor: "#FFFFFF",
          frame: {
            style: "none",
            text: "SCAN ME",
            bgColor: "#1F1F1F",
            textColor: "#FFFFFF",
          },
          errorCorrection: "M",
          quietZone: 4,
          logo: payload.logoUrl
            ? {
                url: payload.logoUrl,
                scale: 0.24,
                padding: 4,
                shape: "square",
              }
            : undefined,
        },
      },
    ];

    const initialGuidelines: BrandGuidelines = {
      brandVoice: "Authoritative, modern, precision-engineered digital identity.",
      logoUsage: "Ensure minimum 8px quiet zone padding when embedding logos into QR centers.",
      colorUsage: "Maintain minimum 4.5:1 contrast ratio between QR foreground and background.",
      qrUsage: "Use high error correction (Level Q or H) when placing center brand marks.",
      doRules: [
        "Always test scanability before production print runs",
        "Keep brand mark scaled within 24% of the QR matrix",
      ],
      dontRules: [
        "Do not invert background to be darker than foreground on physical print without testing",
        "Never stretch or distort the vector aspect ratio",
      ],
    };

    const initialGovernance: BrandGovernance = {
      allowCustomColors: true,
      allowCustomLogos: true,
      allowQrStyleOverrides: true,
      requireApprovedTemplate: false,
      enforceScanabilityLevel: "warning",
      lockedFields: [],
    };

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    const { data: inserted, error } = await (supabase as any)
      .from("brand_kits")
      .insert({
        organization_id: orgId,
        name: payload.name.trim(),
        slug,
        description: payload.description?.trim() || null,
        status: "ACTIVE",
        is_default: payload.isDefault,
        primary_color: primaryHex,
        logo_url: payload.logoUrl || null,
        colors_json: initialColors,
        typography_json: initialTypography,
        logos_json: initialLogos,
        qr_presets_json: initialQrPresets,
        guidelines_json: initialGuidelines,
        governance_json: initialGovernance,
        published_revision: 1,
        created_by: safeActorId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create brand kit: ${error.message}`);
    }

    // Create Revision 1 in immutable brand_kit_versions
    await (supabase as any).from("brand_kit_versions").insert({
      organization_id: orgId,
      brand_kit_id: inserted.id,
      version_number: 1,
      name: `Revision 1 — ${payload.name}`,
      snapshot_json: {
        name: inserted.name,
        colors: initialColors,
        typography: initialTypography,
        logos: initialLogos,
        qrPresets: initialQrPresets,
        guidelines: initialGuidelines,
        governance: initialGovernance,
      },
      change_summary: "Initial brand kit created.",
      created_by: safeActorId,
    });

    // Audit log & activity event
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId,
        action: "BRAND_KIT_CREATED",
        resource_type: "brand_kit",
        resource_id: inserted.id,
        metadata_json: { name: inserted.name, slug: inserted.slug },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId,
        action: "brand_kit.created",
        resource_type: "brand_kit",
        resource_id: inserted.id,
        metadata_json: { name: inserted.name },
      }),
    ]);

    return this.getById(orgId, inserted.id);
  },

  /**
   * Updates working draft properties of an existing brand kit.
   */
  async update(
    orgId: string,
    brandKitId: string,
    actorId: string | null,
    payload: UpdateBrandKitRequestV1
  ): Promise<BrandKitDetailV1> {
    const supabase = await getClient();

    // Verify existence & ownership
    const existing = await this.getById(orgId, brandKitId);

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name && payload.name.trim() !== existing.name) {
      updates.name = payload.name.trim();
      updates.slug = await generateUniqueSlug(supabase, orgId, payload.name, brandKitId);
    }

    if (payload.description !== undefined) {
      updates.description = payload.description ? payload.description.trim() : null;
    }

    if (payload.primaryColor) {
      updates.primary_color = payload.primaryColor.toUpperCase();
    }

    if (payload.logoUrl !== undefined) {
      updates.logo_url = payload.logoUrl;
    }

    if (payload.isDefault !== undefined && payload.isDefault !== existing.isDefault) {
      if (payload.isDefault) {
        // Atomically unset other defaults in org
        await (supabase as any)
          .from("brand_kits")
          .update({ is_default: false })
          .eq("organization_id", orgId);
      }
      updates.is_default = payload.isDefault;
    }

    if (payload.colors) {
      updates.colors_json = payload.colors;
    }

    if (payload.typography) {
      updates.typography_json = payload.typography;
    }

    if (payload.logos) {
      updates.logos_json = payload.logos;
    }

    if (payload.qrPresets) {
      updates.qr_presets_json = payload.qrPresets;
    }

    if (payload.guidelines) {
      updates.guidelines_json = payload.guidelines;
    }

    if (payload.governance) {
      updates.governance_json = payload.governance;
    }

    const { error } = await (supabase as any)
      .from("brand_kits")
      .update(updates)
      .eq("id", brandKitId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to update brand kit: ${error.message}`);
    }

    // Log update audit event
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId,
        action: "BRAND_KIT_UPDATED",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: { updatedFields: Object.keys(updates) },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId,
        action: "brand_kit.updated",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: { name: updates.name || existing.name },
      }),
    ]);

    return this.getById(orgId, brandKitId);
  },

  /**
   * Duplicates an existing brand kit.
   */
  async duplicate(
    orgId: string,
    brandKitId: string,
    actorId: string | null,
    newName: string
  ): Promise<BrandKitDetailV1> {
    const supabase = await getClient();
    const source = await this.getById(orgId, brandKitId);

    const slug = await generateUniqueSlug(supabase, orgId, newName);

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    const { data: inserted, error } = await (supabase as any)
      .from("brand_kits")
      .insert({
        organization_id: orgId,
        name: newName.trim(),
        slug,
        description: source.description ? `Copy of ${source.name}: ${source.description}` : `Copy of ${source.name}`,
        status: "ACTIVE",
        is_default: false,
        primary_color: source.primaryColor,
        logo_url: source.logoUrl,
        colors_json: source.colors,
        typography_json: source.typography,
        logos_json: source.logos,
        qr_presets_json: source.qrPresets,
        guidelines_json: source.guidelines,
        governance_json: source.governance,
        published_revision: 1,
        created_by: safeActorId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to duplicate brand kit: ${error.message}`);
    }

    // Version 1 of duplicate
    await (supabase as any).from("brand_kit_versions").insert({
      organization_id: orgId,
      brand_kit_id: inserted.id,
      version_number: 1,
      name: `Revision 1 — ${newName}`,
      snapshot_json: {
        name: inserted.name,
        colors: source.colors,
        typography: source.typography,
        logos: source.logos,
        qrPresets: source.qrPresets,
        guidelines: source.guidelines,
        governance: source.governance,
      },
      change_summary: `Duplicated from '${source.name}'.`,
      created_by: safeActorId,
    });

    return this.getById(orgId, inserted.id);
  },

  /**
   * Atomically sets a brand kit as the organization default.
   */
  async setDefault(
    orgId: string,
    brandKitId: string,
    actorId: string | null
  ): Promise<BrandKitDetailV1> {
    const supabase = await getClient();

    // Verify existence
    const kit = await this.getById(orgId, brandKitId);
    if (kit.status === "ARCHIVED") {
      throw new ValidationError("Cannot set an archived brand kit as default");
    }

    // Clear all defaults in org
    await (supabase as any)
      .from("brand_kits")
      .update({ is_default: false })
      .eq("organization_id", orgId);

    // Set this kit default
    const { error } = await (supabase as any)
      .from("brand_kits")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", brandKitId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to set default brand kit: ${error.message}`);
    }

    return this.getById(orgId, brandKitId);
  },

  /**
   * Archives a brand kit.
   */
  async archive(
    orgId: string,
    brandKitId: string,
    actorId: string | null
  ): Promise<BrandKitDetailV1> {
    const supabase = await getClient();
    const kit = await this.getById(orgId, brandKitId);

    const { error } = await (supabase as any)
      .from("brand_kits")
      .update({
        status: "ARCHIVED",
        is_default: false,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", brandKitId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to archive brand kit: ${error.message}`);
    }

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "BRAND_KIT_ARCHIVED",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: { name: kit.name },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "brand_kit.archived",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: { name: kit.name },
      }),
    ]);

    return this.getById(orgId, brandKitId);
  },

  /**
   * Permanently deletes a brand kit.
   * STRICT CASCADE SAFETY: Linked QR codes, landing pages, and campaigns are PRESERVED (their brand_kit_id becomes NULL).
   */
  async delete(
    orgId: string,
    brandKitId: string,
    actorId: string | null
  ): Promise<void> {
    const supabase = await getClient();
    const kit = await this.getById(orgId, brandKitId);

    // Delete record (database foreign keys SET NULL on qr_codes, landing_pages, campaigns)
    const { error } = await (supabase as any)
      .from("brand_kits")
      .delete()
      .eq("id", brandKitId)
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(`Failed to delete brand kit: ${error.message}`);
    }

    // Clean up file usages referencing this brand kit
    await (supabase as any)
      .from("file_usages")
      .delete()
      .eq("organization_id", orgId)
      .eq("resource_type", "BRAND_KIT")
      .eq("resource_id", brandKitId);

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "BRAND_KIT_DELETED",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: { name: kit.name },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: safeActorId,
        action: "brand_kit.deleted",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: { name: kit.name },
      }),
    ]);
  },

  /**
   * Publishes an immutable revision of the brand kit.
   */
  async publishVersion(
    orgId: string,
    brandKitId: string,
    actorId: string | null,
    changeSummary: string
  ): Promise<BrandKitVersionV1> {
    const supabase = await getClient();
    const current = await this.getById(orgId, brandKitId);

    const nextRevision = current.publishedRevision + 1;

    const safeActorId = await resolveValidProfileId(supabase, actorId);

    // 1. Create immutable snapshot row
    const { data: versionRow, error: versionErr } = await (supabase as any)
      .from("brand_kit_versions")
      .insert({
        organization_id: orgId,
        brand_kit_id: brandKitId,
        version_number: nextRevision,
        name: `Revision ${nextRevision} — ${current.name}`,
        snapshot_json: {
          name: current.name,
          colors: current.colors,
          typography: current.typography,
          logos: current.logos,
          qrPresets: current.qrPresets,
          guidelines: current.guidelines,
          governance: current.governance,
        },
        change_summary: changeSummary.trim(),
        created_by: safeActorId,
      })
      .select()
      .single();

    if (versionErr) {
      throw new Error(`Failed to record published brand kit revision: ${versionErr.message}`);
    }

    // 2. Update published_revision counter on parent brand_kit
    await (supabase as any)
      .from("brand_kits")
      .update({
        published_revision: nextRevision,
        updated_at: new Date().toISOString(),
      })
      .eq("id", brandKitId)
      .eq("organization_id", orgId);

    // 3. Log audit event
    await Promise.allSettled([
      (supabase as any).from("audit_logs").insert({
        organization_id: orgId,
        actor_id: actorId,
        action: "BRAND_KIT_PUBLISHED",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: {
          versionNumber: nextRevision,
          changeSummary: changeSummary.trim(),
        },
      }),
      (supabase as any).from("activity_events").insert({
        organization_id: orgId,
        actor_id: actorId,
        action: "brand_kit.published",
        resource_type: "brand_kit",
        resource_id: brandKitId,
        metadata_json: {
          name: current.name,
          revision: nextRevision,
        },
      }),
    ]);

    return {
      id: versionRow.id,
      organizationId: versionRow.organization_id,
      brandKitId: versionRow.brand_kit_id,
      versionNumber: versionRow.version_number,
      name: versionRow.name,
      snapshot: versionRow.snapshot_json,
      changeSummary: versionRow.change_summary,
      createdBy: versionRow.created_by,
      createdAt: versionRow.created_at,
    };
  },

  /**
   * Lists immutable version history for a brand kit.
   */
  async listVersions(
    orgId: string,
    brandKitId: string
  ): Promise<BrandKitVersionV1[]> {
    const supabase = await getClient();

    const { data, error } = await (supabase as any)
      .from("brand_kit_versions")
      .select("id, organization_id, brand_kit_id, version_number, name, snapshot_json, change_summary, created_by, created_at")
      .eq("organization_id", orgId)
      .eq("brand_kit_id", brandKitId)
      .order("version_number", { ascending: false });

    if (error) {
      throw new Error(`Failed to list brand kit versions: ${error.message}`);
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      brandKitId: r.brand_kit_id,
      versionNumber: r.version_number,
      name: r.name,
      snapshot: r.snapshot_json,
      changeSummary: r.change_summary,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  },

  /**
   * Retrieves real aggregate metrics for the workspace Brand system.
   * ZERO FAKE DATA: Counts come directly from the database.
   */
  async getPulseMetrics(orgId: string): Promise<BrandKitPulseMetrics> {
    const supabase = await getClient();

    const [allKitsRes, activeKitsRes, assignedQrsRes] = await Promise.all([
      (supabase as any)
        .from("brand_kits")
        .select("id, qr_presets_json, logos_json", { count: "exact" })
        .eq("organization_id", orgId),
      (supabase as any)
        .from("brand_kits")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "ACTIVE"),
      (supabase as any)
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .not("brand_kit_id", "is", null),
    ]);

    const kits = allKitsRes.data || [];
    let totalAssets = 0;
    let totalPresets = 0;

    for (const k of kits) {
      if (Array.isArray(k.logos_json)) totalAssets += k.logos_json.length;
      if (Array.isArray(k.qr_presets_json)) totalPresets += k.qr_presets_json.length;
    }

    return {
      totalKits: allKitsRes.count || 0,
      activeKits: activeKitsRes.count || 0,
      totalAssignedQrs: assignedQrsRes.count || 0,
      totalBrandAssets: totalAssets,
      totalQrPresets: totalPresets,
    };
  },

  /**
   * Retrieves real assigned resources linked to a specific brand kit.
   */
  async getAssignedResources(
    orgId: string,
    brandKitId: string
  ): Promise<{
    qrs: Array<{ id: string; name: string; slug: string; status: string; qrType: string; updatedAt: string }>;
    landingPages: Array<{ id: string; name: string; slug: string; status: string; updatedAt: string }>;
    campaigns: Array<{ id: string; name: string; slug: string; status: string; updatedAt: string }>;
  }> {
    const supabase = await getClient();

    const [qrsRes, lpsRes, campaignsRes] = await Promise.all([
      (supabase as any)
        .from("qr_codes")
        .select("id, name, slug, status, qr_type, updated_at")
        .eq("organization_id", orgId)
        .eq("brand_kit_id", brandKitId)
        .order("updated_at", { ascending: false })
        .limit(20),
      (supabase as any)
        .from("landing_pages")
        .select("id, name, slug, status, updated_at")
        .eq("organization_id", orgId)
        .eq("brand_kit_id", brandKitId)
        .order("updated_at", { ascending: false })
        .limit(20),
      (supabase as any)
        .from("campaigns")
        .select("id, name, slug, status, updated_at")
        .eq("organization_id", orgId)
        .eq("brand_kit_id", brandKitId)
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);

    return {
      qrs: (qrsRes.data || []).map((q: any) => ({
        id: q.id,
        name: q.name,
        slug: q.slug,
        status: q.status,
        qrType: q.qr_type,
        updatedAt: q.updated_at,
      })),
      landingPages: (lpsRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        updatedAt: p.updated_at,
      })),
      campaigns: (campaignsRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        updatedAt: c.updated_at,
      })),
    };
  },
};
