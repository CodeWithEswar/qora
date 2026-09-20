import "server-only";
import {
  QrContentV1,
  QrDesignV1,
  CANONICAL_QR_DESIGN_DEFAULTS,
  generateSecureSlug,
} from "@nxtqr/qr-core";
import {
  ConflictError,
  NotFoundError,
} from "@nxtqr/contracts";
import { generateOpaqueId } from "@nxtqr/db";
import { getD1Database } from "@/lib/db/d1";

export interface StoredQrRecord {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  qrType: string;
  status: "ACTIVE" | "PAUSED" | "DRAFT" | "SCHEDULED" | "EXPIRED" | "ARCHIVED";
  isDynamic: boolean;
  destinationUrl: string;
  fallbackUrl?: string;
  draftDestination?: string;
  hasUnpublishedChanges?: boolean;
  publishedVersionId?: string;
  publishedRevision?: number;
  currentVersion?: number;
  campaignId?: string;
  campaignName?: string;
  folderId?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerAvatarUrl?: string;
  totalScans?: number;
  uniqueScans?: number;
  design?: QrDesignV1;
  createdAt: number;
  updatedAt: number;
}

export interface ListQrsOptions {
  organizationId: string;
  search?: string;
  status?: string;
  qrType?: string;
  campaignId?: string;
  ownerId?: string;
  sortBy?: "updatedAt" | "createdAt" | "name" | "totalScans";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface QrSummaryMetrics {
  total: number;
  active: number;
  draft: number;
  paused: number;
  archived: number;
}

export interface StoredQrDraft {
  qrId: string;
  organizationId: string;
  draftVersion: number;
  content: QrContentV1;
  design: QrDesignV1;
  destination?: any;
  updatedBy: string;
  updatedAt: number;
}

export interface StoredQrVersion {
  id: string;
  qrId: string;
  organizationId: string;
  versionNumber: number;
  changeSummary: string;
  content: QrContentV1;
  design: QrDesignV1;
  destinationUrl?: string;
  createdBy: string;
  createdAt: number;
}

async function resolveDb(d1?: any) {
  try {
    const db = d1 || (await getD1Database());
    return db;
  } catch {
    return null;
  }
}

export class QrStore {
  /**
   * Generates a collision-resistant unique slug with bounded retry against Cloudflare D1.
   */
  static async generateUniqueSlug(db: any, prefix?: string, maxRetries = 5): Promise<string> {
    if (!db) {
      return generateSecureSlug({ prefix, length: 9 });
    }
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const candidate = generateSecureSlug({ prefix });
      const existing = await db
        .prepare("SELECT id FROM qr_codes WHERE slug = ? LIMIT 1")
        .bind(candidate)
        .first();
      if (!existing) {
        return candidate;
      }
    }
    // Final defensive candidate with higher entropy (9 chars ≈ 7.4e15 combinations)
    return generateSecureSlug({ prefix, length: 9 });
  }

  /**
   * List QRs for an organization directly from Supabase (authoritative) with D1 fallback.
   */
  static async listQrs(
    optionsOrOrgId: string | ListQrsOptions,
    limitOrD1?: number | any,
    d1?: any
  ): Promise<StoredQrRecord[]> {
    let opts: ListQrsOptions;
    let explicitDb: any;

    if (typeof optionsOrOrgId === "string") {
      opts = {
        organizationId: optionsOrOrgId,
        limit: typeof limitOrD1 === "number" ? limitOrD1 : 50,
      };
      explicitDb = typeof limitOrD1 !== "number" ? limitOrD1 : d1;
    } else {
      opts = optionsOrOrgId;
      explicitDb = d1 || (typeof limitOrD1 !== "number" ? limitOrD1 : undefined);
    }

    const {
      organizationId,
      search,
      status,
      qrType,
      campaignId,
      ownerId,
      sortBy = "updatedAt",
      order = "desc",
      limit = 50,
      offset = 0,
    } = opts;

    // 1. Authoritative Supabase retrieval
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      let query = supabase
        .from("qr_codes")
        .select(`
          id, slug, name, qr_type, status, is_dynamic, published_revision,
          folder_id, legacy_id, organization_id, created_at, updated_at,
          qr_drafts(content_json, design_json, destination_json),
          profiles:owner_id(id, display_name, email, avatar_url)
        `)
        .eq("organization_id", organizationId);

      if (status && status !== "ALL") {
        query = query.eq("status", status as any);
      } else if (!status) {
        query = query.neq("status", "ARCHIVED" as any);
      }

      if (qrType && qrType !== "ALL") {
        query = query.eq("qr_type", qrType as any);
      }

      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%`);
      }

      const sortCol = sortBy === "name" ? "name" : sortBy === "createdAt" ? "created_at" : "updated_at";
      query = query.order(sortCol, { ascending: order.toLowerCase() === "asc" });
      query = query.range(offset, offset + limit - 1);

      const { data: rows, error } = await query;

      if (!error && rows) {
        return rows.map((r: any) => {
          const draft = Array.isArray(r.qr_drafts) ? r.qr_drafts[0] : r.qr_drafts;
          let design = CANONICAL_QR_DESIGN_DEFAULTS;
          if (draft?.design_json) {
            try {
              const d = typeof draft.design_json === "string" ? JSON.parse(draft.design_json) : draft.design_json;
              design = { ...CANONICAL_QR_DESIGN_DEFAULTS, ...d };
            } catch {}
          }
          let destUrl = "";
          if (draft?.destination_json?.defaultUrl) {
            destUrl = draft.destination_json.defaultUrl;
          } else if (draft?.content_json?.url) {
            destUrl = draft.content_json.url;
          }
          return {
            id: r.id,
            organizationId,
            slug: r.slug,
            name: r.name,
            qrType: r.qr_type || "url",
            status: r.status,
            isDynamic: Boolean(r.is_dynamic),
            destinationUrl: destUrl,
            fallbackUrl: undefined,
            publishedVersionId: undefined,
            publishedRevision: Number(r.published_revision || 1),
            currentVersion: Number(r.published_revision || 1),
            campaignId: undefined,
            campaignName: undefined,
            folderId: r.folder_id || undefined,
            ownerId: r.profiles?.id || undefined,
            ownerName: r.profiles?.display_name || undefined,
            ownerEmail: r.profiles?.email || undefined,
            ownerAvatarUrl: r.profiles?.avatar_url || undefined,
            totalScans: 0,
            uniqueScans: 0,
            design,
            createdAt: Math.floor(new Date(r.created_at).getTime() / 1000),
            updatedAt: Math.floor(new Date(r.updated_at).getTime() / 1000),
          };
        });
      }
    } catch (err) {
      console.warn("[QrStore.listQrs] Supabase query notice:", err);
    }

    // 2. D1 fallback
    const db = await resolveDb(explicitDb);
    if (!db) return [];

    const conditions: string[] = ["q.organization_id = ?"];
    const params: any[] = [organizationId];

    if (status && status !== "ALL") {
      conditions.push("q.status = ?");
      params.push(status);
    } else if (!status) {
      // By default exclude archived unless explicitly requested
      conditions.push("q.status != 'ARCHIVED'");
    }

    if (search && search.trim()) {
      conditions.push("(q.name LIKE ? OR q.slug LIKE ? OR d.default_url LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (qrType && qrType !== "ALL") {
      conditions.push("q.qr_type = ?");
      params.push(qrType);
    }

    if (campaignId) {
      conditions.push("q.campaign_id = ?");
      params.push(campaignId);
    }

    if (ownerId) {
      conditions.push("q.owner_id = ?");
      params.push(ownerId);
    }

    let orderBy = "q.updated_at DESC, q.created_at DESC";
    const orderDir = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    if (sortBy === "name") {
      orderBy = `q.name ${orderDir}`;
    } else if (sortBy === "createdAt") {
      orderBy = `q.created_at ${orderDir}`;
    } else if (sortBy === "totalScans") {
      orderBy = `totalScans ${orderDir}, q.updated_at DESC`;
    } else if (sortBy === "updatedAt") {
      orderBy = `q.updated_at ${orderDir}`;
    }

    const sql = `
      SELECT 
        q.id, q.slug, q.name, q.qr_type as qrType, q.status, q.is_dynamic as isDynamic,
        d.default_url as destinationUrl, d.fallback_url as fallbackUrl,
        q.campaign_id as campaignId, c.name as campaignName,
        q.folder_id as folderId,
        q.published_version_id as publishedVersionId,
        q.owner_id as ownerId,
        u.name as ownerName,
        u.email as ownerEmail,
        u.avatar_url as ownerAvatarUrl,
        COALESCE(qd.design_json, qv.design_json) as designJson,
        COALESCE((SELECT SUM(total_scans) FROM scan_events_hourly WHERE qr_id = q.id), 0) as totalScans,
        COALESCE((SELECT SUM(unique_scans) FROM scan_events_hourly WHERE qr_id = q.id), 0) as uniqueScans,
        q.created_at as createdAt, q.updated_at as updatedAt
      FROM qr_codes q
      LEFT JOIN qr_destinations d ON d.id = (
        SELECT id FROM qr_destinations WHERE qr_id = q.id ORDER BY created_at DESC LIMIT 1
      )
      LEFT JOIN campaigns c ON c.id = q.campaign_id
      LEFT JOIN users u ON u.id = q.owner_id
      LEFT JOIN qr_drafts qd ON qd.qr_id = q.id
      LEFT JOIN qr_versions qv ON qv.id = COALESCE(q.published_version_id, q.current_version_id)
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const res = (await db.prepare(sql).bind(...params).all()) as any;
    if (!res || !res.results) return [];

    return res.results.map((r: any) => {
      let design: QrDesignV1 = CANONICAL_QR_DESIGN_DEFAULTS;
      if (r.designJson) {
        try {
          const parsed = typeof r.designJson === "string" ? JSON.parse(r.designJson) : r.designJson;
          if (parsed && typeof parsed === "object") {
            design = {
              ...CANONICAL_QR_DESIGN_DEFAULTS,
              ...parsed,
            };
          }
        } catch {
          design = CANONICAL_QR_DESIGN_DEFAULTS;
        }
      }

      return {
        id: r.id,
        organizationId,
        slug: r.slug,
        name: r.name,
        qrType: r.qrType || "url",
        status: r.status,
        isDynamic: Boolean(r.isDynamic),
        destinationUrl: r.destinationUrl || "",
        fallbackUrl: r.fallbackUrl || undefined,
        publishedVersionId: r.publishedVersionId || undefined,
        campaignId: r.campaignId || undefined,
        campaignName: r.campaignName || undefined,
        folderId: r.folderId || undefined,
        ownerId: r.ownerId || undefined,
        ownerName: r.ownerName || undefined,
        ownerEmail: r.ownerEmail || undefined,
        ownerAvatarUrl: r.ownerAvatarUrl || undefined,
        totalScans: Number(r.totalScans || 0),
        uniqueScans: Number(r.uniqueScans || 0),
        design,
        createdAt: Number(r.createdAt),
        updatedAt: Number(r.updatedAt),
      };
    });
  }

  /**
   * Get operational signal summary counts for an organization from real Supabase records (authoritative).
   */
  static async getSummaryMetrics(organizationId: string, d1?: any): Promise<QrSummaryMetrics> {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("qr_codes")
        .select("status")
        .eq("organization_id", organizationId);

      if (!error && data) {
        return {
          total: data.length,
          active: data.filter((r) => r.status === "ACTIVE").length,
          draft: data.filter((r) => r.status === "DRAFT").length,
          paused: data.filter((r) => r.status === "PAUSED").length,
          archived: data.filter((r) => r.status === "ARCHIVED").length,
        };
      }
    } catch (err) {
      console.warn("[QrStore.getSummaryMetrics] Supabase notice:", err);
    }

    const db = await resolveDb(d1);
    if (!db) {
      return { total: 0, active: 0, draft: 0, paused: 0, archived: 0 };
    }
    const sql = `
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
        COALESCE(SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END), 0) as draft,
        COALESCE(SUM(CASE WHEN status = 'PAUSED' THEN 1 ELSE 0 END), 0) as paused,
        COALESCE(SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END), 0) as archived
      FROM qr_codes
      WHERE organization_id = ?
    `;
    const res = (await db.prepare(sql).bind(organizationId).first()) as any;
    return {
      total: Number(res?.total || 0),
      active: Number(res?.active || 0),
      draft: Number(res?.draft || 0),
      paused: Number(res?.paused || 0),
      archived: Number(res?.archived || 0),
    };
  }

  static async getQr(qrId: string, organizationId?: string, d1?: any): Promise<StoredQrRecord | null> {
    // 1. Authoritative Supabase retrieval
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let query = supabase
        .from("qr_codes")
        .select(`
          id, slug, name, qr_type, status, is_dynamic, published_revision,
          folder_id, legacy_id, organization_id, created_at, updated_at,
          qr_drafts(content_json, design_json, destination_json),
          profiles:owner_id(id, display_name, email, avatar_url)
        `);

      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data: r, error } = await query.maybeSingle();

      if (!error && r) {
        const draft = Array.isArray(r.qr_drafts) ? r.qr_drafts[0] : r.qr_drafts;
        let design = CANONICAL_QR_DESIGN_DEFAULTS;
        if (draft?.design_json) {
          try {
            const parsed = typeof draft.design_json === "string" ? JSON.parse(draft.design_json) : draft.design_json;
            if (parsed && typeof parsed === "object") {
              design = { ...CANONICAL_QR_DESIGN_DEFAULTS, ...parsed };
            }
          } catch {}
        }

        let destUrl = "";
        if (draft?.destination_json?.defaultUrl) {
          destUrl = draft.destination_json.defaultUrl;
        } else if (draft?.content_json?.url) {
          destUrl = draft.content_json.url;
        }

        return {
          id: r.id,
          organizationId: r.organization_id,
          slug: r.slug,
          name: r.name,
          qrType: r.qr_type || "url",
          status: (r.status || "ACTIVE") as any,
          isDynamic: Boolean(r.is_dynamic),
          destinationUrl: destUrl,
          draftDestination: destUrl,
          hasUnpublishedChanges: false,
          fallbackUrl: undefined,
          publishedVersionId: undefined,
          publishedRevision: Number(r.published_revision || 1),
          currentVersion: Number(r.published_revision || 1),
          campaignId: undefined,
          campaignName: undefined,
          folderId: r.folder_id || undefined,
          ownerId: r.profiles?.id || undefined,
          ownerName: r.profiles?.display_name || undefined,
          ownerEmail: r.profiles?.email || undefined,
          ownerAvatarUrl: r.profiles?.avatar_url || undefined,
          totalScans: 0,
          uniqueScans: 0,
          design,
          createdAt: Math.floor(new Date(r.created_at).getTime() / 1000),
          updatedAt: Math.floor(new Date(r.updated_at).getTime() / 1000),
        };
      }
    } catch (err) {
      console.warn("[QrStore.getQr] Supabase notice:", err);
    }

    const db = await resolveDb(d1);
    if (!db) return null;

    let sql = `
      SELECT 
        q.id, q.organization_id as organizationId, q.slug, q.name, q.qr_type as qrType, q.status, q.is_dynamic as isDynamic,
        d.default_url as destinationUrl, d.fallback_url as fallbackUrl,
        q.campaign_id as campaignId, c.name as campaignName,
        q.folder_id as folderId,
        q.published_version_id as publishedVersionId,
        qv.version_number as publishedRevision,
        q.owner_id as ownerId,
        u.name as ownerName,
        u.email as ownerEmail,
        u.avatar_url as ownerAvatarUrl,
        COALESCE(qd.design_json, qv.design_json) as designJson,
        qd.content_json as draftContentJson,
        qd.destination_json as draftDestinationJson,
        COALESCE((SELECT SUM(total_scans) FROM scan_events_hourly WHERE qr_id = q.id), 0) as totalScans,
        COALESCE((SELECT SUM(unique_scans) FROM scan_events_hourly WHERE qr_id = q.id), 0) as uniqueScans,
        q.created_at as createdAt, q.updated_at as updatedAt
      FROM qr_codes q
      LEFT JOIN qr_destinations d ON d.id = (
        SELECT id FROM qr_destinations WHERE qr_id = q.id ORDER BY created_at DESC LIMIT 1
      )
      LEFT JOIN campaigns c ON c.id = q.campaign_id
      LEFT JOIN users u ON u.id = q.owner_id
      LEFT JOIN qr_drafts qd ON qd.qr_id = q.id
      LEFT JOIN qr_versions qv ON qv.id = COALESCE(q.published_version_id, q.current_version_id)
      WHERE q.id = ? AND q.status != 'ARCHIVED'
    `;
    const params: any[] = [qrId];
    if (organizationId) {
      sql += " AND q.organization_id = ?";
      params.push(organizationId);
    }
    sql += " LIMIT 1";

    const r = (await db.prepare(sql).bind(...params).first()) as any;
    if (!r) {
      return null;
    }

    let design: QrDesignV1 = CANONICAL_QR_DESIGN_DEFAULTS;
    if (r.designJson) {
      try {
        const parsed = typeof r.designJson === "string" ? JSON.parse(r.designJson) : r.designJson;
        if (parsed && typeof parsed === "object") {
          design = {
            ...CANONICAL_QR_DESIGN_DEFAULTS,
            ...parsed,
          };
        }
      } catch {
        design = CANONICAL_QR_DESIGN_DEFAULTS;
      }
    }

    let draftDestination = r.destinationUrl || "";
    if (r.draftDestinationJson) {
      try {
        const parsedDest = typeof r.draftDestinationJson === "string" ? JSON.parse(r.draftDestinationJson) : r.draftDestinationJson;
        if (parsedDest?.defaultUrl) {
          draftDestination = parsedDest.defaultUrl;
        }
      } catch {}
    } else if (r.draftContentJson) {
      try {
        const parsedContent = typeof r.draftContentJson === "string" ? JSON.parse(r.draftContentJson) : r.draftContentJson;
        if (parsedContent?.url) {
          draftDestination = parsedContent.url;
        }
      } catch {}
    }

    const publishedDest = r.destinationUrl || "";
    const hasUnpublishedChanges = Boolean(draftDestination && draftDestination !== publishedDest);

    return {
      id: r.id,
      organizationId: r.organizationId,
      slug: r.slug,
      name: r.name,
      qrType: r.qrType || "url",
      status: r.status,
      isDynamic: Boolean(r.isDynamic),
      destinationUrl: publishedDest,
      draftDestination,
      hasUnpublishedChanges,
      fallbackUrl: r.fallbackUrl || undefined,
      publishedVersionId: r.publishedVersionId || undefined,
      publishedRevision: Number(r.publishedRevision || 1),
      currentVersion: Number(r.publishedRevision || 1),
      campaignId: r.campaignId || undefined,
      campaignName: r.campaignName || undefined,
      folderId: r.folderId || undefined,
      ownerId: r.ownerId || undefined,
      ownerName: r.ownerName || undefined,
      ownerEmail: r.ownerEmail || undefined,
      ownerAvatarUrl: r.ownerAvatarUrl || undefined,
      totalScans: Number(r.totalScans || 0),
      uniqueScans: Number(r.uniqueScans || 0),
      design,
      createdAt: Number(r.createdAt),
      updatedAt: Number(r.updatedAt),
    };
  }

  /**
   * Pause an active QR code
   */
  static async pauseQr(qrId: string, organizationId: string, d1?: any): Promise<void> {
    const db = await resolveDb(d1);
    const now = Math.floor(Date.now() / 1000);
    const res = (await db
      .prepare("UPDATE qr_codes SET status = 'PAUSED', updated_at = ? WHERE id = ? AND organization_id = ?")
      .bind(now, qrId, organizationId)
      .run()) as any;
    if (res?.meta?.changes === 0) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }
  }

  /**
   * Resume a paused QR code
   */
  static async resumeQr(qrId: string, organizationId: string, d1?: any): Promise<void> {
    const db = await resolveDb(d1);
    const now = Math.floor(Date.now() / 1000);
    const res = (await db
      .prepare("UPDATE qr_codes SET status = 'ACTIVE', updated_at = ? WHERE id = ? AND organization_id = ?")
      .bind(now, qrId, organizationId)
      .run()) as any;
    if (res?.meta?.changes === 0) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }
  }

  /**
   * Move QR code to a campaign
   */
  static async moveQrToCampaign(
    qrId: string,
    organizationId: string,
    campaignId: string | null,
    d1?: any
  ): Promise<void> {
    const db = await resolveDb(d1);
    const now = Math.floor(Date.now() / 1000);
    await db
      .prepare("UPDATE qr_codes SET campaign_id = ?, updated_at = ? WHERE id = ? AND organization_id = ?")
      .bind(campaignId, now, qrId, organizationId)
      .run();
  }

  /**
   * Duplicate a QR code along with destination and draft records in D1
   */
  static async duplicateQr(
    qrId: string,
    organizationId: string,
    actorId: string,
    newName?: string,
    d1?: any
  ): Promise<StoredQrRecord> {
    const db = await resolveDb(d1);
    const original = await this.getQr(qrId, organizationId, db);
    if (!original) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const newId = generateOpaqueId("qr");
    const targetName = newName || `Copy of ${original.name}`;
    const newSlug = await this.generateUniqueSlug(db, targetName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 16));
    const now = Math.floor(Date.now() / 1000);

    const originalDraft = await this.getDraft(qrId, organizationId, db);
    const content = originalDraft?.content || {
      type: original.qrType as any,
      url: original.destinationUrl,
      isDynamic: original.isDynamic,
    };
    const design = originalDraft?.design || CANONICAL_QR_DESIGN_DEFAULTS;

    await db.batch([
      db
        .prepare(`
          INSERT INTO qr_codes (id, organization_id, owner_id, slug, name, qr_type, is_dynamic, status, campaign_id, folder_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
        `)
        .bind(
          newId,
          organizationId,
          actorId,
          newSlug,
          targetName,
          original.qrType,
          original.isDynamic ? 1 : 0,
          original.campaignId || null,
          original.folderId || null,
          now,
          now
        ),

      db
        .prepare(`
          INSERT INTO qr_destinations (id, qr_id, default_url, fallback_url, created_at)
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(generateOpaqueId("dest"), newId, original.destinationUrl, original.fallbackUrl || null, now),

      db
        .prepare(`
          INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
          VALUES (?, ?, 1, ?, ?, ?, ?, ?)
        `)
        .bind(
          newId,
          organizationId,
          JSON.stringify(content),
          JSON.stringify(design),
          JSON.stringify({ defaultUrl: original.destinationUrl }),
          actorId,
          now
        ),
    ]);

    const created = await this.getQr(newId, organizationId, db);
    return created!;
  }

  /**
   * Bulk update status for multiple QRs in one atomic operation
   */
  static async bulkUpdateStatus(
    qrIds: string[],
    organizationId: string,
    status: "ACTIVE" | "PAUSED" | "ARCHIVED",
    d1?: any
  ): Promise<number> {
    if (qrIds.length === 0) return 0;
    const db = await resolveDb(d1);
    const now = Math.floor(Date.now() / 1000);
    const placeholders = qrIds.map(() => "?").join(",");
    const sql = `UPDATE qr_codes SET status = ?, updated_at = ? WHERE organization_id = ? AND id IN (${placeholders})`;
    const res = (await db.prepare(sql).bind(status, now, organizationId, ...qrIds).run()) as any;
    return res?.meta?.changes || qrIds.length;
  }

  /**
   * Bulk move QRs to a campaign in one atomic operation
   */
  static async bulkMoveCampaign(
    qrIds: string[],
    organizationId: string,
    campaignId: string | null,
    d1?: any
  ): Promise<number> {
    if (qrIds.length === 0) return 0;
    const db = await resolveDb(d1);
    const now = Math.floor(Date.now() / 1000);
    const placeholders = qrIds.map(() => "?").join(",");
    const sql = `UPDATE qr_codes SET campaign_id = ?, updated_at = ? WHERE organization_id = ? AND id IN (${placeholders})`;
    const res = (await db.prepare(sql).bind(campaignId, now, organizationId, ...qrIds).run()) as any;
    return res?.meta?.changes || qrIds.length;
  }

  /**
   * Bulk delete or archive multiple QRs in one atomic operation
   */
  static async bulkDelete(
    qrIds: string[],
    organizationId: string,
    hard = false,
    d1?: any
  ): Promise<number> {
    if (qrIds.length === 0) return 0;
    const db = await resolveDb(d1);
    const now = Math.floor(Date.now() / 1000);
    const placeholders = qrIds.map(() => "?").join(",");

    if (hard) {
      await db.batch([
        db.prepare(`DELETE FROM qr_drafts WHERE organization_id = ? AND qr_id IN (${placeholders})`).bind(organizationId, ...qrIds),
        db.prepare(`DELETE FROM qr_destinations WHERE qr_id IN (${placeholders})`).bind(...qrIds),
        db.prepare(`DELETE FROM qr_versions WHERE organization_id = ? AND qr_id IN (${placeholders})`).bind(organizationId, ...qrIds),
        db.prepare(`DELETE FROM qr_codes WHERE organization_id = ? AND id IN (${placeholders})`).bind(organizationId, ...qrIds),
      ]);
      return qrIds.length;
    } else {
      const sql = `UPDATE qr_codes SET status = 'ARCHIVED', updated_at = ? WHERE organization_id = ? AND id IN (${placeholders})`;
      const res = (await db.prepare(sql).bind(now, organizationId, ...qrIds).run()) as any;
      return res?.meta?.changes || qrIds.length;
    }
  }

  private static async ensureOrgAndUser(db: any, organizationId: string, ownerId: string) {
    const now = Math.floor(Date.now() / 1000);
    const org = await db.prepare("SELECT id FROM organizations WHERE id = ? LIMIT 1").bind(organizationId).first();
    if (!org) {
      const slug = organizationId.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 32);
      await db
        .prepare(
          "INSERT OR IGNORE INTO organizations (id, name, slug, billing_plan, created_at, updated_at) VALUES (?, ?, ?, 'FREE', ?, ?)"
        )
        .bind(organizationId, "Workspace", slug, now, now)
        .run();
    }
    const user = await db.prepare("SELECT id FROM users WHERE id = ? LIMIT 1").bind(ownerId).first();
    if (!user) {
      await db
        .prepare(
          "INSERT OR IGNORE INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, 'Workspace Owner', ?, ?)"
        )
        .bind(ownerId, `${ownerId}@nxtqr.local`, now, now)
        .run();
    }
    await db
      .prepare(
        "INSERT OR IGNORE INTO users (id, email, name, created_at, updated_at) VALUES ('system', 'system@nxtqr.local', 'System', ?, ?)"
      )
      .bind(now, now)
      .run();
    await db
      .prepare(
        "INSERT OR IGNORE INTO users (id, email, name, created_at, updated_at) VALUES ('creator', 'creator@nxtqr.local', 'Creator', ?, ?)"
      )
      .bind(now, now)
      .run();
  }

  /**
   * Create new QR asset directly in Cloudflare D1
   */
  static async createQr(
    data: {
      id?: string;
      organizationId: string;
      ownerId?: string;
      name: string;
      type?: string;
      mode?: "dynamic" | "static";
      destinationUrl: string;
      fallbackUrl?: string;
      campaignId?: string;
      folderId?: string;
      design?: QrDesignV1 | any;
    },
    d1?: any
  ): Promise<StoredQrRecord> {
    // 1. Authoritative Supabase creation
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id || "");
      const finalId = isUuid ? data.id! : crypto.randomUUID();
      const rawSlug = data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 16);
      const slug = `${rawSlug.length > 2 ? rawSlug : "qr"}-${Math.random().toString(36).slice(2, 6)}`;
      const now = Math.floor(Date.now() / 1000);
      const isDynamic = data.mode === "dynamic";
      const finalDesign = data.design || CANONICAL_QR_DESIGN_DEFAULTS;

      const { data: newQr, error: qrErr } = await supabase
        .from("qr_codes")
        .insert({
          id: finalId,
          organization_id: data.organizationId,
          owner_id: data.ownerId && /^[0-9a-f-]{36}$/i.test(data.ownerId) ? data.ownerId : null,
          slug,
          name: data.name,
          qr_type: (data.type as any) || "url",
          is_dynamic: isDynamic,
          status: "ACTIVE",
          legacy_id: data.id && !isUuid ? data.id : null,
        })
        .select()
        .single();

      if (!qrErr && newQr) {
        const initialContent: QrContentV1 = {
          type: (data.type as any) || "url",
          url: data.destinationUrl,
          isDynamic,
        };

        await supabase.from("qr_drafts").upsert({
          qr_id: newQr.id,
          organization_id: data.organizationId,
          draft_version: 1,
          content_json: initialContent as any,
          design_json: finalDesign as any,
          destination_json: { defaultUrl: data.destinationUrl },
          updated_by: data.ownerId && /^[0-9a-f-]{36}$/i.test(data.ownerId) ? data.ownerId : null,
        });

        // Also publish resolver snapshot
        await supabase.from("qr_resolution_snapshots").upsert({
          qr_id: newQr.id,
          slug: newQr.slug,
          revision: 1,
          snapshot_json: {
            qrId: newQr.id,
            orgId: data.organizationId,
            slug: newQr.slug,
            revision: 1,
            status: "ACTIVE",
            destination: { defaultUrl: data.destinationUrl },
            publishedAt: new Date().toISOString(),
          },
        });

        return {
          id: newQr.id,
          organizationId: data.organizationId,
          slug: newQr.slug,
          name: newQr.name,
          qrType: newQr.qr_type,
          status: "ACTIVE",
          isDynamic,
          destinationUrl: data.destinationUrl,
          fallbackUrl: data.fallbackUrl,
          campaignId: data.campaignId,
          folderId: data.folderId,
          totalScans: 0,
          uniqueScans: 0,
          design: finalDesign,
          createdAt: now,
          updatedAt: now,
        };
      }
    } catch (err) {
      console.warn("[QrStore.createQr] Supabase notice:", err);
    }

    const db = await resolveDb(d1);
    if (!db) {
      throw new Error("Cannot create QR: backend database is unavailable.");
    }

    const qrId = data.id || generateOpaqueId("qr");
    const slug = await this.generateUniqueSlug(db, data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 16));
    const now = Math.floor(Date.now() / 1000);
    const ownerId = data.ownerId || (data as any).ownerId || "usr_1789596094788_oot5k";
    const isDynamic = data.mode === "dynamic";

    await this.ensureOrgAndUser(db, data.organizationId, ownerId);

    const initialContent: QrContentV1 = {
      type: (data.type as any) || "url",
      url: data.destinationUrl,
      isDynamic,
    };

    const finalDesign = data.design || CANONICAL_QR_DESIGN_DEFAULTS;

    const insertQr = `
      INSERT INTO qr_codes (id, organization_id, owner_id, slug, name, qr_type, is_dynamic, status, campaign_id, folder_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        is_dynamic = excluded.is_dynamic,
        updated_at = excluded.updated_at
    `;
    const insertDest = `
      INSERT INTO qr_destinations (id, qr_id, default_url, fallback_url, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        default_url = excluded.default_url,
        created_at = excluded.created_at
    `;
    const insertDraft = `
      INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
      VALUES (?, ?, 1, ?, ?, ?, ?, ?)
      ON CONFLICT(qr_id) DO UPDATE SET
        draft_version = excluded.draft_version,
        content_json = excluded.content_json,
        design_json = excluded.design_json,
        destination_json = excluded.destination_json,
        updated_at = excluded.updated_at
    `;

    await db.batch([
      db.prepare(insertQr).bind(qrId, data.organizationId, ownerId, slug, data.name, data.type, isDynamic ? 1 : 0, data.campaignId || null, data.folderId || null, now, now),
      db.prepare(insertDest).bind(generateOpaqueId("dest"), qrId, data.destinationUrl, data.fallbackUrl || null, now),
      db.prepare(insertDraft).bind(qrId, data.organizationId, JSON.stringify(initialContent), JSON.stringify(finalDesign), JSON.stringify({ defaultUrl: data.destinationUrl }), ownerId, now),
    ]);

    return {
      id: qrId,
      organizationId: data.organizationId,
      slug,
      name: data.name,
      qrType: data.type || "url",
      status: "ACTIVE",
      isDynamic,
      destinationUrl: data.destinationUrl,
      fallbackUrl: data.fallbackUrl,
      campaignId: data.campaignId,
      folderId: data.folderId,
      totalScans: 0,
      uniqueScans: 0,
      design: finalDesign,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get working draft directly from Supabase (authoritative) with D1 fallback.
   */
  static async getDraft(qrId: string, organizationId: string, d1?: any): Promise<StoredQrDraft> {
    // 1. Authoritative Supabase retrieval
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let query = supabase
        .from("qr_codes")
        .select("id, name, slug, qr_type, is_dynamic, qr_drafts(*)")
        .eq("organization_id", organizationId);

      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }

      const { data: qrRow, error } = await query.maybeSingle();

      if (!error && qrRow) {
        const draft = Array.isArray(qrRow.qr_drafts) ? qrRow.qr_drafts[0] : qrRow.qr_drafts;
        if (draft) {
          return {
            qrId: qrRow.id,
            organizationId,
            draftVersion: Number(draft.draft_version || 1),
            content: draft.content_json || { type: qrRow.qr_type, url: "" },
            design: draft.design_json || CANONICAL_QR_DESIGN_DEFAULTS,
            destination: draft.destination_json || undefined,
            updatedBy: draft.updated_by || "user",
            updatedAt: Math.floor(new Date(draft.updated_at).getTime() / 1000),
          };
        } else {
          // Initialize draft in Supabase if missing
          const initialContent: QrContentV1 = {
            type: (qrRow.qr_type as any) || "url",
            url: "",
            isDynamic: qrRow.is_dynamic,
          };
          await supabase.from("qr_drafts").upsert({
            qr_id: qrRow.id,
            organization_id: organizationId,
            draft_version: 1,
            content_json: initialContent as any,
            design_json: CANONICAL_QR_DESIGN_DEFAULTS as any,
            destination_json: null,
            updated_at: new Date().toISOString(),
          });
          return {
            qrId: qrRow.id,
            organizationId,
            draftVersion: 1,
            content: initialContent,
            design: CANONICAL_QR_DESIGN_DEFAULTS,
            destination: undefined,
            updatedBy: "system",
            updatedAt: Math.floor(Date.now() / 1000),
          };
        }
      }
    } catch (err) {
      console.warn("[QrStore.getDraft] Supabase notice:", err);
    }

    const db = await resolveDb(d1);
    if (!db) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const qr = await this.getQr(qrId, organizationId, db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const sql = `
      SELECT draft_version as draftVersion, content_json as contentJson,
             design_json as designJson, destination_json as destinationJson,
             updated_by as updatedBy, updated_at as updatedAt
      FROM qr_drafts
      WHERE qr_id = ? AND organization_id = ?
      LIMIT 1
    `;
    const r = (await db.prepare(sql).bind(qrId, organizationId).first()) as any;
    if (r) {
      return {
        qrId,
        organizationId,
        draftVersion: Number(r.draftVersion),
        content: JSON.parse(r.contentJson),
        design: JSON.parse(r.designJson),
        destination: r.destinationJson ? JSON.parse(r.destinationJson) : undefined,
        updatedBy: r.updatedBy,
        updatedAt: Number(r.updatedAt),
      };
    }

    // Auto-initialize draft in D1 if not present
    const now = Math.floor(Date.now() / 1000);
    const initialContent: QrContentV1 = {
      type: (qr.qrType as any) || "url",
      url: qr.destinationUrl || "",
      isDynamic: qr.isDynamic,
    };
    const draft: StoredQrDraft = {
      qrId,
      organizationId,
      draftVersion: 1,
      content: initialContent,
      design: CANONICAL_QR_DESIGN_DEFAULTS,
      destination: { defaultUrl: qr.destinationUrl },
      updatedBy: "system",
      updatedAt: now,
    };

    const insertDraft = `
      INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
      VALUES (?, ?, 1, ?, ?, ?, 'system', ?)
      ON CONFLICT(qr_id) DO UPDATE SET
        draft_version = excluded.draft_version,
        content_json = excluded.content_json,
        design_json = excluded.design_json,
        destination_json = excluded.destination_json,
        updated_at = excluded.updated_at
    `;
    await db.prepare(insertDraft).bind(
      qrId,
      organizationId,
      JSON.stringify(initialContent),
      JSON.stringify(CANONICAL_QR_DESIGN_DEFAULTS),
      JSON.stringify({ defaultUrl: qr.destinationUrl }),
      now
    ).run();

    return draft;
  }

  /**
   * Save mutable draft with Optimistic Concurrency Control directly in Supabase (authoritative) and D1.
   */
  static async saveDraft(
    qrId: string,
    organizationId: string,
    payload: {
      content: QrContentV1;
      design: QrDesignV1;
      destination?: any;
      name?: string;
      isDynamic?: boolean;
      expectedDraftVersion: number;
      updatedBy: string;
    },
    d1?: any
  ): Promise<{ draftVersion: number; updatedAt: string }> {
    // 1. Authoritative Supabase save
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let query = supabase.from("qr_codes").select("id").eq("organization_id", organizationId);
      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      const { data: qrRow } = await query.maybeSingle();

      if (qrRow) {
        const targetId = qrRow.id;
        const nowIso = new Date().toISOString();
        const nextVersion = payload.expectedDraftVersion + 1;

        const isDynamicBool = payload.isDynamic !== undefined ? Boolean(payload.isDynamic) : undefined;
        const contentToSave = payload.content
          ? {
              ...payload.content,
              ...(isDynamicBool !== undefined ? { isDynamic: isDynamicBool } : {}),
            }
          : payload.content;

        await supabase.from("qr_drafts").upsert({
          qr_id: targetId,
          organization_id: organizationId,
          draft_version: nextVersion,
          content_json: contentToSave as any,
          design_json: payload.design as any,
          destination_json: payload.destination || null,
          updated_by: payload.updatedBy && /^[0-9a-f-]{36}$/i.test(payload.updatedBy) ? payload.updatedBy : null,
          updated_at: nowIso,
        });

        const qrUpdates: any = { updated_at: nowIso };
        if (payload.name) {
          qrUpdates.name = payload.name;
        }
        if (isDynamicBool !== undefined) {
          qrUpdates.is_dynamic = isDynamicBool;
        }
        if (payload.content?.type) {
          qrUpdates.qr_type = payload.content.type;
        }

        await supabase.from("qr_codes").update(qrUpdates).eq("id", targetId);

        return {
          draftVersion: nextVersion,
          updatedAt: nowIso,
        };
      }
    } catch (err) {
      console.warn("[QrStore.saveDraft] Supabase notice:", err);
    }

    const db = await resolveDb(d1);
    if (!db) {
      return {
        draftVersion: payload.expectedDraftVersion + 1,
        updatedAt: new Date().toISOString(),
      };
    }

    const currentDraft = await this.getDraft(qrId, organizationId, db);

    if (payload.expectedDraftVersion > 0 && currentDraft.draftVersion !== payload.expectedDraftVersion) {
      throw new ConflictError(
        `Draft conflict: expected version ${payload.expectedDraftVersion}, but current version is ${currentDraft.draftVersion}. Please reload.`
      );
    }

    const nextDraftVersion = currentDraft.draftVersion + 1;
    const now = Math.floor(Date.now() / 1000);
    const ownerId = payload.updatedBy || "usr_1789596094788_oot5k";
    await this.ensureOrgAndUser(db, organizationId, ownerId);
    const qr = await this.getQr(qrId, organizationId, db);
    const slug = qr?.slug || (await this.generateUniqueSlug(db, "qr"));
    const qrName = payload.name || qr?.name || "New QR Asset";
    const isDyn = payload.isDynamic !== undefined ? (payload.isDynamic ? 1 : 0) : (qr?.isDynamic ? 1 : 0);

    // Resolve effective D1 QR ID to prevent slug collision
    const d1Row = (await db
      .prepare("SELECT id, slug FROM qr_codes WHERE id = ? OR slug = ? LIMIT 1")
      .bind(qrId, slug)
      .first()) as any;
    const effectiveD1QrId = d1Row?.id || qrId;

    const destinationUrl =
      (payload.content?.type === "url" && (payload.content as any).url) ||
      payload.destination?.defaultUrl ||
      "";

    const updateDestSql = `
      INSERT INTO qr_destinations (id, qr_id, default_url, fallback_url, created_at)
      VALUES (?, ?, ?, null, ?)
      ON CONFLICT(id) DO UPDATE SET
        default_url = excluded.default_url,
        created_at = excluded.created_at
    `;

    const updateDraftSql = `
      INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(qr_id) DO UPDATE SET
        draft_version = excluded.draft_version,
        content_json = excluded.content_json,
        design_json = excluded.design_json,
        destination_json = excluded.destination_json,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at
    `;

    const destId = `dest_${effectiveD1QrId.slice(-8)}`;

    const batchStatements: any[] = [];
    if (d1Row) {
      batchStatements.push(
        db.prepare(`
          UPDATE qr_codes
          SET name = COALESCE(?, name),
              is_dynamic = ?,
              updated_at = ?
          WHERE id = ?
        `).bind(payload.name || null, isDyn, now, effectiveD1QrId)
      );
    } else {
      batchStatements.push(
        db.prepare(`
          INSERT INTO qr_codes (id, organization_id, owner_id, slug, name, qr_type, is_dynamic, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'url', ?, 'ACTIVE', ?, ?)
        `).bind(effectiveD1QrId, organizationId, ownerId, slug, qrName, isDyn, now, now)
      );
    }

    batchStatements.push(
      db.prepare(updateDestSql).bind(
        destId,
        effectiveD1QrId,
        destinationUrl || "https://nxtqr.vercel.app",
        now
      ),
      db.prepare(updateDraftSql).bind(
        effectiveD1QrId,
        organizationId,
        nextDraftVersion,
        JSON.stringify(payload.content),
        JSON.stringify(payload.design),
        payload.destination ? JSON.stringify(payload.destination) : null,
        payload.updatedBy,
        now
      )
    );

    await db.batch(batchStatements);

    return {
      draftVersion: nextDraftVersion,
      updatedAt: new Date(now * 1000).toISOString(),
    };
  }

  /**
   * Save immutable version checkpoint directly in Supabase (authoritative) and Cloudflare D1 (mirror)
   */
  static async createVersion(
    qrId: string,
    organizationId: string,
    payload: {
      changeSummary: string;
      createdBy: string;
      content?: QrContentV1;
      design?: QrDesignV1;
    },
    d1?: any
  ): Promise<StoredQrVersion> {
    const db = await resolveDb(d1);

    const qr = await this.getQr(qrId, organizationId, db);
    if (!qr) throw new NotFoundError(`QR code '${qrId}' was not found.`);

    const draft = await this.getDraft(qrId, organizationId, db);
    const content = payload.content || draft.content;
    const design = payload.design || draft.design;

    const destinationUrl =
      (content.type === "url" && (content as any).url) ||
      qr.destinationUrl ||
      "https://nxtqr.vercel.app";

    let targetQrId = qrId;
    let nextVersionNumber = 1;
    let createdVersionId = generateOpaqueId("qrv");
    const now = Math.floor(Date.now() / 1000);
    const nowIso = new Date(now * 1000).toISOString();

    // 1. Authoritative Supabase persistence
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let query = supabase
        .from("qr_codes")
        .select("id, legacy_id, slug, name, qr_type, is_dynamic, published_revision")
        .eq("organization_id", organizationId);

      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      const { data: qrRow } = await query.maybeSingle();

      if (qrRow) {
        targetQrId = qrRow.id;

        // Determine next version number from Supabase
        const { data: latestVer } = await supabase
          .from("qr_versions")
          .select("version_number")
          .eq("qr_id", targetQrId)
          .order("version_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestVer?.version_number) {
          nextVersionNumber = latestVer.version_number + 1;
        } else if (qrRow.published_revision) {
          nextVersionNumber = Number(qrRow.published_revision) + 1;
        } else {
          nextVersionNumber = 1;
        }

        const actorUuid =
          payload.createdBy && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.createdBy)
            ? payload.createdBy
            : null;

        const { data: insertedVer, error: verErr } = await supabase
          .from("qr_versions")
          .insert({
            qr_id: targetQrId,
            version_number: nextVersionNumber,
            content_json: content as any,
            design_json: design as any,
            destination_json: destinationUrl ? { defaultUrl: destinationUrl } : null,
            change_summary: payload.changeSummary || "",
            created_by: actorUuid,
            created_at: nowIso,
          })
          .select()
          .single();

        if (!verErr && insertedVer) {
          createdVersionId = insertedVer.id;
          const qrUpdates: any = {
            published_revision: nextVersionNumber,
            updated_at: nowIso,
          };
          if ((content as any)?.isDynamic !== undefined) {
            qrUpdates.is_dynamic = Boolean((content as any).isDynamic);
          }
          await supabase
            .from("qr_codes")
            .update(qrUpdates)
            .eq("id", targetQrId);
        } else if (verErr) {
          console.warn("[QrStore.createVersion] Supabase insert notice:", verErr);
        }
      }
    } catch (err) {
      console.warn("[QrStore.createVersion] Supabase notice:", err);
    }

    // 2. Cloudflare D1 mirror synchronization
    if (db) {
      try {
        const ownerId = payload.createdBy || "usr_1789596094788_oot5k";
        await this.ensureOrgAndUser(db, organizationId, ownerId);

        const slug = qr.slug || (await this.generateUniqueSlug(db, "qr"));
        const qrName = qr.name || "New QR Asset";
        const isDyn = qr.isDynamic ? 1 : 0;

        // Resolve effective D1 QR row to prevent UNIQUE slug collision
        const d1Row = (await db
          .prepare("SELECT id, slug FROM qr_codes WHERE id = ? OR id = ? OR slug = ? LIMIT 1")
          .bind(qrId, targetQrId, slug)
          .first()) as any;

        const effectiveD1QrId = d1Row?.id || targetQrId || qrId;

        const modStyle = String(design.moduleStyle || "");
        const pixelStyle =
          modStyle === "extra_rounded" || modStyle === "rounded" ? "rounded" :
          modStyle === "dots" ? "dots" : "squares";
        const outerEye = String(design.eyeOuterStyle || "");
        const eyeStyle =
          outerEye === "rounded" ? "rounded" :
          outerEye === "leaf" ? "leaf" : "square";
        const fStyle = String(design.frame?.style || "");
        const frameStyle =
          fStyle === "card" || fStyle === "simple" ? "simple" :
          fStyle === "signal_bar" || fStyle === "badge" ? "badge" :
          fStyle === "callout" ? "callout" : "none";
        const errorCorrection = ["L", "M", "Q", "H"].includes(design.errorCorrection || "")
          ? (design.errorCorrection as string)
          : "Q";

        const destId = generateOpaqueId("dest");
        const designId = generateOpaqueId("dsg");
        const d1VersionId = createdVersionId;

        const insertDestSql = `
          INSERT INTO qr_destinations (id, qr_id, default_url, fallback_url, created_at)
          VALUES (?, ?, ?, null, ?)
          ON CONFLICT(id) DO UPDATE SET default_url = excluded.default_url
        `;

        const insertDesignSql = `
          INSERT INTO qr_designs (
            id, qr_id, pixel_style, eye_style, eye_color, fg_color, bg_color,
            gradient_json, logo_url, logo_scale, logo_padding, frame_style,
            frame_text, frame_bg_color, frame_text_color, error_correction, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertVersionSql = `
          INSERT INTO qr_versions (
            id, qr_id, version_number, destination_id, design_id,
            change_summary, payload_json, content_json, design_json, created_by, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(qr_id, version_number) DO UPDATE SET
            change_summary = excluded.change_summary,
            payload_json = excluded.payload_json,
            content_json = excluded.content_json,
            design_json = excluded.design_json,
            created_at = excluded.created_at
        `;

        const d1Batch: any[] = [];
        if (d1Row) {
          d1Batch.push(
            db.prepare(`
              UPDATE qr_codes
              SET current_version_id = ?, updated_at = ?
              WHERE id = ?
            `).bind(d1VersionId, now, effectiveD1QrId)
          );
        } else {
          d1Batch.push(
            db.prepare(`
              INSERT INTO qr_codes (id, organization_id, owner_id, slug, name, qr_type, is_dynamic, status, current_version_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, 'url', ?, 'ACTIVE', ?, ?, ?)
            `).bind(effectiveD1QrId, organizationId, ownerId, slug, qrName, isDyn, d1VersionId, now, now)
          );
        }

        d1Batch.push(
          db.prepare(insertDestSql).bind(destId, effectiveD1QrId, destinationUrl, now),
          db.prepare(insertDesignSql).bind(
            designId,
            effectiveD1QrId,
            pixelStyle,
            eyeStyle,
            design.eyeColor || design.fgColor,
            design.fgColor,
            design.bgColor,
            design.gradient ? JSON.stringify(design.gradient) : null,
            design.logo?.url || null,
            design.logo?.scale || null,
            design.logo?.padding || null,
            frameStyle,
            design.frame?.text || "SCAN ME",
            design.frame?.bgColor || design.fgColor,
            design.frame?.textColor || design.bgColor,
            errorCorrection,
            now
          ),
          db.prepare(insertVersionSql).bind(
            d1VersionId,
            effectiveD1QrId,
            nextVersionNumber,
            destId,
            designId,
            payload.changeSummary,
            JSON.stringify(content),
            JSON.stringify(content),
            JSON.stringify(design),
            payload.createdBy,
            now
          )
        );

        await db.batch(d1Batch);
      } catch (d1Err) {
        console.warn("[QrStore.createVersion] D1 mirror synchronization notice:", d1Err);
      }
    }

    return {
      id: createdVersionId,
      qrId: targetQrId,
      organizationId,
      versionNumber: nextVersionNumber,
      changeSummary: payload.changeSummary,
      content,
      design,
      destinationUrl,
      createdBy: payload.createdBy,
      createdAt: now,
    };
  }

  /**
   * List immutable versions for QR directly from Supabase (authoritative) with D1 fallback
   */
  static async listVersions(qrId: string, organizationId?: string, d1?: any): Promise<StoredQrVersion[]> {
    // 1. Authoritative Supabase retrieval
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let query = supabase.from("qr_codes").select("id, organization_id").limit(1);
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      const { data: qrRow } = await query.maybeSingle();

      const targetQrId = qrRow?.id || (isUuid ? qrId : null);

      if (targetQrId) {
        const { data: verRows, error: verErr } = await supabase
          .from("qr_versions")
          .select("id, qr_id, version_number, change_summary, content_json, design_json, destination_json, created_by, created_at")
          .eq("qr_id", targetQrId)
          .order("version_number", { ascending: false });

        if (!verErr && verRows && verRows.length > 0) {
          return verRows.map((r: any) => ({
            id: r.id,
            qrId: targetQrId,
            organizationId: qrRow?.organization_id || organizationId || "",
            versionNumber: Number(r.version_number),
            changeSummary: r.change_summary || "",
            content: r.content_json || { type: "url", url: "" },
            design: r.design_json || CANONICAL_QR_DESIGN_DEFAULTS,
            destinationUrl: r.destination_json?.defaultUrl || (r.content_json?.url || ""),
            createdBy: r.created_by || "Workspace Member",
            createdAt: Math.floor(new Date(r.created_at).getTime() / 1000),
          }));
        }
      }
    } catch (err) {
      console.warn("[QrStore.listVersions] Supabase notice:", err);
    }

    // 2. D1 fallback
    const db = await resolveDb(d1);
    if (!db) return [];

    let effectiveD1QrId = qrId;
    try {
      const d1Row = (await db
        .prepare("SELECT id FROM qr_codes WHERE id = ? OR slug = ? LIMIT 1")
        .bind(qrId, qrId)
        .first()) as any;
      if (d1Row?.id) effectiveD1QrId = d1Row.id;
    } catch {}

    const sql = `
      SELECT v.id, v.qr_id as qrId, v.version_number as versionNumber,
             v.change_summary as changeSummary,
             COALESCE(v.content_json, v.payload_json) as contentJson,
             v.design_json as designJson,
             v.created_by as createdBy, v.created_at as createdAt
      FROM qr_versions v
      JOIN qr_codes q ON q.id = v.qr_id
      WHERE (v.qr_id = ? OR v.qr_id = ?)
      ${organizationId ? "AND q.organization_id = ?" : ""}
      ORDER BY v.version_number DESC
    `;
    const params = organizationId ? [effectiveD1QrId, qrId, organizationId] : [effectiveD1QrId, qrId];
    const res = (await db.prepare(sql).bind(...params).all()) as any;
    if (!res || !res.results) return [];

    return res.results.map((r: any) => ({
      id: r.id,
      qrId,
      organizationId: organizationId || "",
      versionNumber: Number(r.versionNumber),
      changeSummary: r.changeSummary,
      content: r.contentJson ? JSON.parse(r.contentJson) : { type: "url", url: "" },
      design: r.designJson ? JSON.parse(r.designJson) : CANONICAL_QR_DESIGN_DEFAULTS,
      createdBy: r.createdBy,
      createdAt: Number(r.createdAt),
    }));
  }

  /**
   * Restore version snapshot as a new working draft directly in Supabase and Cloudflare D1
   */
  static async restoreVersion(
    qrId: string,
    versionId: string,
    organizationId: string,
    updatedBy: string,
    d1?: any
  ): Promise<{ draftVersion: number; content: QrContentV1; design: QrDesignV1 }> {
    const versions = await this.listVersions(qrId, organizationId, d1);
    const targetVersion = versions.find((v) => v.id === versionId || String(v.versionNumber) === versionId);

    if (!targetVersion) {
      throw new NotFoundError(`Version checkpoint '${versionId}' was not found.`);
    }

    const currentDraft = await this.getDraft(qrId, organizationId, d1);
    const nextDraftVersion = currentDraft.draftVersion + 1;
    const targetUrl = (targetVersion.content as any)?.url || targetVersion.destinationUrl || "";
    const destinationJson = targetUrl ? { defaultUrl: targetUrl } : null;

    // 1. Authoritative Supabase save
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

      let query = supabase.from("qr_codes").select("id").eq("organization_id", organizationId);
      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      const { data: qrRow } = await query.maybeSingle();

      if (qrRow) {
        const targetId = qrRow.id;
        const nowIso = new Date().toISOString();

        await supabase.from("qr_drafts").upsert({
          qr_id: targetId,
          organization_id: organizationId,
          draft_version: nextDraftVersion,
          content_json: targetVersion.content as any,
          design_json: targetVersion.design as any,
          destination_json: destinationJson,
          updated_by: updatedBy && /^[0-9a-f-]{36}$/i.test(updatedBy) ? updatedBy : null,
          updated_at: nowIso,
        });

        // Also sync to D1 if available
        const db = await resolveDb(d1);
        if (db) {
          try {
            const d1Row = (await db
              .prepare("SELECT id FROM qr_codes WHERE id = ? OR id = ? LIMIT 1")
              .bind(qrId, targetId)
              .first()) as any;
            const effectiveD1QrId = d1Row?.id || targetId;
            const now = Math.floor(Date.now() / 1000);
            await db.prepare(`
              INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(qr_id) DO UPDATE SET
                draft_version = excluded.draft_version,
                content_json = excluded.content_json,
                design_json = excluded.design_json,
                destination_json = excluded.destination_json,
                updated_by = excluded.updated_by,
                updated_at = excluded.updated_at
            `).bind(
              effectiveD1QrId,
              organizationId,
              nextDraftVersion,
              JSON.stringify(targetVersion.content),
              JSON.stringify(targetVersion.design),
              destinationJson ? JSON.stringify(destinationJson) : null,
              updatedBy,
              now
            ).run();
          } catch {}
        }

        return {
          draftVersion: nextDraftVersion,
          content: targetVersion.content,
          design: targetVersion.design,
        };
      }
    } catch (err) {
      console.warn("[QrStore.restoreVersion] Supabase notice:", err);
    }

    // 2. D1 fallback
    const db = await resolveDb(d1);
    if (!db) {
      return {
        draftVersion: nextDraftVersion,
        content: targetVersion.content,
        design: targetVersion.design,
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const d1Row = (await db
      .prepare("SELECT id FROM qr_codes WHERE id = ? LIMIT 1")
      .bind(qrId)
      .first()) as any;
    const effectiveD1QrId = d1Row?.id || qrId;

    const updateSql = `
      INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(qr_id) DO UPDATE SET
        draft_version = excluded.draft_version,
        content_json = excluded.content_json,
        design_json = excluded.design_json,
        destination_json = excluded.destination_json,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at
    `;
    await db.prepare(updateSql).bind(
      effectiveD1QrId,
      organizationId,
      nextDraftVersion,
      JSON.stringify(targetVersion.content),
      JSON.stringify(targetVersion.design),
      destinationJson ? JSON.stringify(destinationJson) : null,
      updatedBy,
      now
    ).run();

    return {
      draftVersion: nextDraftVersion,
      content: targetVersion.content,
      design: targetVersion.design,
    };
  }

  /**
   * Archive QR asset directly in Supabase (authoritative) and Cloudflare D1
   */
  static async archiveQr(qrId: string, organizationId: string, d1?: any): Promise<boolean> {
    // 1. Authoritative Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);
      let query = supabase.from("qr_codes").update({ status: "ARCHIVED", archived_at: new Date().toISOString() });
      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      await query;
    } catch (err) {
      console.warn("[QrStore.archiveQr] Supabase notice:", err);
    }

    // 2. D1 fallback
    const db = await resolveDb(d1);
    if (!db) return true;

    const now = Math.floor(Date.now() / 1000);
    const sql = `
      UPDATE qr_codes
      SET status = 'ARCHIVED', updated_at = ?
      WHERE (id = ? OR slug = ?) AND organization_id = ?
    `;
    const res = await db.prepare(sql).bind(now, qrId, qrId, organizationId).run();
    return Boolean(res?.success);
  }

  /**
   * Hard delete QR asset and related dependent records from Supabase (authoritative) and Cloudflare D1
   */
  static async deleteQr(qrId: string, organizationId: string, d1?: any): Promise<boolean> {
    // 1. Authoritative Supabase delete
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);
      let query = supabase.from("qr_codes").delete();
      if (isUuid) {
        query = query.eq("id", qrId);
      } else {
        query = query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`);
      }
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      await query;
    } catch (err) {
      console.warn("[QrStore.deleteQr] Supabase notice:", err);
    }

    // 2. D1 fallback
    const db = await resolveDb(d1);
    if (!db) return true;

    let effectiveD1QrId = qrId;
    try {
      const d1Row = (await db
        .prepare("SELECT id FROM qr_codes WHERE id = ? OR slug = ? LIMIT 1")
        .bind(qrId, qrId)
        .first()) as any;
      if (d1Row?.id) effectiveD1QrId = d1Row.id;
    } catch {}

    await db.batch([
      db.prepare("DELETE FROM qr_drafts WHERE (qr_id = ? OR qr_id = ?) AND organization_id = ?").bind(effectiveD1QrId, qrId, organizationId),
      db.prepare("UPDATE qr_codes SET current_version_id = NULL WHERE (id = ? OR id = ?) AND organization_id = ?").bind(effectiveD1QrId, qrId, organizationId),
      db.prepare("DELETE FROM qr_versions WHERE qr_id = ? OR qr_id = ?").bind(effectiveD1QrId, qrId),
      db.prepare("DELETE FROM qr_destinations WHERE qr_id = ? OR qr_id = ?").bind(effectiveD1QrId, qrId),
      db.prepare("DELETE FROM qr_designs WHERE qr_id = ? OR qr_id = ?").bind(effectiveD1QrId, qrId),
      db.prepare("DELETE FROM qr_codes WHERE (id = ? OR id = ?) AND organization_id = ?").bind(effectiveD1QrId, qrId, organizationId),
    ]);
    return true;
  }
}
