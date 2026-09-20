import "server-only";
import { createAdminClient } from "../admin";
import { getSession } from "@/lib/auth/session";
import {
  FolderResponseV1,
  FolderPulseMetrics,
  FolderSummarySignal,
  FolderQrAssetV1,
  ConflictError,
} from "@nxtqr/contracts";

function getClient() {
  return createAdminClient();
}

export interface FolderRecord {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  accentKey: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  createdBy?: string | null;
  qrAssetCount: number;
}

export const SupabaseFolderRepository = {
  /**
   * Lists folders for an organization with attached real QR counts.
   * STRICT ZERO FAKE DATA: Returns empty array if 0 rows in database.
   */
  async listByOrg(
    orgId: string,
    filter?: {
      status?: "active" | "archived" | "all";
      search?: string;
      sortBy?: "updatedAt" | "createdAt" | "name" | "qrCount";
      order?: "asc" | "desc";
      limit?: number;
      offset?: number;
    }
  ): Promise<FolderRecord[]> {
    const supabase = await getClient();
    let query = supabase
      .from("folders")
      .select("*, qr_codes(count)")
      .eq("organization_id", orgId);

    const statusFilter = filter?.status || "active";
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (filter?.search?.trim()) {
      query = query.ilike("name", `%${filter.search.trim()}%`);
    }

    const sortCol =
      filter?.sortBy === "name"
        ? "name"
        : filter?.sortBy === "createdAt"
        ? "created_at"
        : "updated_at";
    query = query.order(sortCol, { ascending: filter?.order === "asc" });

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    if (filter?.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const mapped = data.map((f: any) => ({
      id: f.id,
      organizationId: f.organization_id,
      name: f.name,
      description: f.description,
      emoji: f.emoji,
      accentKey: f.accent_key || "Graphite",
      status: (f.status || "active") as "active" | "archived",
      createdAt: f.created_at,
      updatedAt: f.updated_at,
      archivedAt: f.archived_at,
      createdBy: f.created_by,
      qrAssetCount: f.qr_codes?.[0]?.count || 0,
    }));

    if (filter?.sortBy === "qrCount") {
      mapped.sort((a, b) =>
        filter.order === "asc"
          ? a.qrAssetCount - b.qrAssetCount
          : b.qrAssetCount - a.qrAssetCount
      );
    }

    return mapped;
  },

  /**
   * Retrieves single folder by ID with QR count.
   */
  async getById(orgId: string, folderId: string): Promise<FolderRecord | null> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(folderId);

    let query = supabase
      .from("folders")
      .select("*, qr_codes(count)")
      .eq("organization_id", orgId);

    const { data, error } = isUuid
      ? await query.eq("id", folderId).maybeSingle()
      : await query.eq("legacy_id", folderId).maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      accentKey: data.accent_key || "Graphite",
      status: (data.status || "active") as "active" | "archived",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
      createdBy: data.created_by,
      qrAssetCount: (data as any).qr_codes?.[0]?.count || 0,
    };
  },

  /**
   * Summary counts across organization: folders, filed QRs, unfiled QRs.
   */
  async getSummary(orgId: string): Promise<FolderSummarySignal> {
    const supabase = await getClient();

    const [foldersRes, activeFoldersRes, filedRes, unfiledRes] = await Promise.all([
      supabase
        .from("folders")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId),
      supabase
        .from("folders")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "active"),
      supabase
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .not("folder_id", "is", null),
      supabase
        .from("qr_codes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .is("folder_id", null),
    ]);

    return {
      totalFolders: foldersRes.count || 0,
      activeFolders: activeFoldersRes.count || 0,
      totalFiledQrs: filedRes.count || 0,
      totalUnfiledQrs: unfiledRes.count || 0,
    };
  },

  /**
   * Pulse metrics for a specific folder or unfiled space.
   */
  async getFolderPulse(orgId: string, folderId: string | null): Promise<FolderPulseMetrics> {
    const supabase = await getClient();
    const isUnfiled = !folderId || folderId === "unfiled";

    let qrQuery = supabase
      .from("qr_codes")
      .select("id, is_dynamic, qr_drafts(destination_json, content_json)")
      .eq("organization_id", orgId);

    if (isUnfiled) {
      qrQuery = qrQuery.is("folder_id", null);
    } else {
      qrQuery = qrQuery.eq("folder_id", folderId);
    }

    const { data: qrs } = await qrQuery;
    if (!qrs || qrs.length === 0) {
      return {
        qrCount: 0,
        dynamicCount: 0,
        staticCount: 0,
        destinationCount: 0,
        scanCount: 0,
      };
    }

    let dynamicCount = 0;
    let staticCount = 0;
    const destinations = new Set<string>();
    const qrIds: string[] = [];

    for (const q of qrs) {
      qrIds.push(q.id);
      if (q.is_dynamic) dynamicCount++;
      else staticCount++;

      const draft = Array.isArray(q.qr_drafts) ? q.qr_drafts[0] : q.qr_drafts;
      const url =
        (draft as any)?.destination_json?.defaultUrl ||
        (draft as any)?.destination_json?.destinationUrl ||
        (draft as any)?.content_json?.url ||
        (draft as any)?.content_json?.destination ||
        (draft as any)?.content_json?.targetUrl;
      if (url) destinations.add(url);
    }

    // Scans aggregate from scan_events_hourly
    let scanCount = 0;
    try {
      const { data: rollups } = await supabase
        .from("scan_events_hourly")
        .select("total_scans")
        .eq("organization_id", orgId)
        .in("qr_id", qrIds);

      if (rollups) {
        for (const r of rollups) {
          scanCount += Number(r.total_scans || 0);
        }
      }
    } catch {}

    return {
      qrCount: qrs.length,
      dynamicCount,
      staticCount,
      destinationCount: destinations.size,
      scanCount,
    };
  },

  /**
   * Creates a new folder.
   */
  async createFolder(
    orgId: string,
    data: {
      name: string;
      description?: string | null;
      emoji?: string | null;
      accentKey?: string;
      createdBy?: string | null;
    }
  ): Promise<FolderRecord> {
    const supabase = await getClient();
    const session = await getSession();
    let userId = data.createdBy || session?.user?.id || null;

    if (userId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      const query = isUuid
        ? supabase.from("profiles").select("id").or(`id.eq.${userId},legacy_id.eq.${userId}`)
        : supabase.from("profiles").select("id").eq("legacy_id", userId);
      const { data: p } = await query.maybeSingle();
      userId = p?.id || null;
    }

    const { data: created, error } = await supabase
      .from("folders")
      .insert({
        organization_id: orgId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        emoji: data.emoji?.trim() || null,
        accent_key: data.accentKey || "Graphite",
        status: "active",
        created_by: userId,
      })
      .select()
      .single();

    if (error || !created) {
      if (error?.code === "23505" || error?.message?.includes("idx_folders_org_name_active")) {
        throw new ConflictError(`A folder named "${data.name.trim()}" already exists in this organization.`);
      }
      throw new Error(`Failed to create folder: ${error?.message}`);
    }

    return {
      id: created.id,
      organizationId: created.organization_id,
      name: created.name,
      description: created.description,
      emoji: created.emoji,
      accentKey: created.accent_key || "Graphite",
      status: "active",
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      archivedAt: null,
      createdBy: created.created_by,
      qrAssetCount: 0,
    };
  },

  /**
   * Updates an existing folder.
   */
  async updateFolder(
    orgId: string,
    folderId: string,
    data: {
      name?: string;
      description?: string | null;
      emoji?: string | null;
      accentKey?: string;
      status?: "active" | "archived";
    }
  ): Promise<FolderRecord> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(folderId);

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
    if (data.emoji !== undefined) updatePayload.emoji = data.emoji?.trim() || null;
    if (data.accentKey !== undefined) updatePayload.accent_key = data.accentKey;
    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (data.status === "archived") {
        updatePayload.archived_at = new Date().toISOString();
      } else {
        updatePayload.archived_at = null;
      }
    }

    let query = supabase
      .from("folders")
      .update(updatePayload as any)
      .eq("organization_id", orgId);

    query = isUuid ? query.eq("id", folderId) : query.eq("legacy_id", folderId);

    const { data: updated, error } = await query
      .select("*, qr_codes(count)")
      .single();

    if (error || !updated) {
      if (error?.code === "23505" || error?.message?.includes("idx_folders_org_name_active")) {
        throw new ConflictError(`A folder named "${data.name?.trim()}" already exists in this organization.`);
      }
      throw new Error(`Failed to update folder: ${error?.message}`);
    }

    return {
      id: updated.id,
      organizationId: updated.organization_id,
      name: updated.name,
      description: updated.description,
      emoji: updated.emoji,
      accentKey: updated.accent_key || "Graphite",
      status: updated.status as "active" | "archived",
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      archivedAt: updated.archived_at,
      createdBy: updated.created_by,
      qrAssetCount: (updated as any).qr_codes?.[0]?.count || 0,
    };
  },

  /**
   * Deletes a folder safely.
   * STRICT CASCADE RULE:
   * NEVER DELETES QR CODES.
   * First unlinks all QRs in this folder to Unfiled (folder_id = NULL).
   * Then deletes the folder record itself.
   */
  async deleteFolder(orgId: string, folderId: string): Promise<boolean> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(folderId);

    let resolvedFolderId = folderId;
    if (!isUuid) {
      const { data: f } = await supabase
        .from("folders")
        .select("id")
        .eq("organization_id", orgId)
        .eq("legacy_id", folderId)
        .maybeSingle();
      if (!f) return false;
      resolvedFolderId = f.id;
    }

    // 1. Explicitly unlink QR assets to NULL (safe move to Unfiled)
    await supabase
      .from("qr_codes")
      .update({ folder_id: null } as any)
      .eq("organization_id", orgId)
      .eq("folder_id", resolvedFolderId);

    // 2. Delete the folder record
    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("organization_id", orgId)
      .eq("id", resolvedFolderId);

    if (error) {
      throw new Error(`Failed to delete folder: ${error.message}`);
    }

    return true;
  },

  /**
   * Lists QR codes assigned to a folder (or unfiled QR codes).
   */
  async listFolderQrAssets(
    orgId: string,
    folderId: string | null,
    options: {
      search?: string;
      status?: string;
      qrType?: string;
      isDynamic?: "true" | "false" | "all";
      limit?: number;
      offset?: number;
      sortBy?: "updatedAt" | "createdAt" | "name" | "totalScans";
      order?: "asc" | "desc";
    } = {}
  ): Promise<{ items: FolderQrAssetV1[]; totalCount: number }> {
    const supabase = await getClient();
    const isUnfiled = !folderId || folderId === "unfiled";

    let query = supabase
      .from("qr_codes")
      .select(
        "id, slug, name, qr_type, is_dynamic, status, updated_at, folder_id, qr_drafts(content_json, destination_json)",
        { count: "exact" }
      )
      .eq("organization_id", orgId);

    if (isUnfiled) {
      query = query.is("folder_id", null);
    } else {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(folderId);
      if (!isUuid) {
        const { data: f } = await supabase
          .from("folders")
          .select("id")
          .eq("organization_id", orgId)
          .eq("legacy_id", folderId)
          .maybeSingle();
        if (f) {
          query = query.eq("folder_id", f.id);
        } else {
          return { items: [], totalCount: 0 };
        }
      } else {
        query = query.eq("folder_id", folderId);
      }
    }

    if (options.search?.trim()) {
      query = query.or(`name.ilike.%${options.search.trim()}%,slug.ilike.%${options.search.trim()}%`);
    }

    if (options.status && options.status !== "all") {
      query = query.eq("status", options.status.toUpperCase() as any);
    }

    if (options.qrType && options.qrType !== "all") {
      query = query.eq("qr_type", options.qrType as any);
    }

    if (options.isDynamic && options.isDynamic !== "all") {
      query = query.eq("is_dynamic", options.isDynamic === "true");
    }

    const sortCol =
      options.sortBy === "name"
        ? "name"
        : options.sortBy === "createdAt"
        ? "created_at"
        : "updated_at";
    query = query.order(sortCol, { ascending: options.order === "asc" });

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data: qrs, count, error } = await query;
    if (error || !qrs) return { items: [], totalCount: 0 };

    const qrIds = qrs.map((q) => q.id);

    // Scan totals map
    const scanMap = new Map<string, { total: number; unique: number }>();
    if (qrIds.length > 0) {
      try {
        const { data: rollups } = await supabase
          .from("scan_events_hourly")
          .select("qr_id, total_scans, unique_scans")
          .eq("organization_id", orgId)
          .in("qr_id", qrIds);

        if (rollups) {
          for (const r of rollups) {
            const cur = scanMap.get(r.qr_id) || { total: 0, unique: 0 };
            cur.total += Number(r.total_scans || 0);
            cur.unique += Number(r.unique_scans || 0);
            scanMap.set(r.qr_id, cur);
          }
        }
      } catch {}
    }

    // Folders map to display current folder name if needed
    const folderNamesMap = new Map<string, string>();
    const distinctFolderIds = Array.from(new Set(qrs.map((q) => q.folder_id).filter(Boolean))) as string[];
    if (distinctFolderIds.length > 0) {
      const { data: fRows } = await supabase
        .from("folders")
        .select("id, name")
        .eq("organization_id", orgId)
        .in("id", distinctFolderIds);
      if (fRows) {
        for (const f of fRows) {
          folderNamesMap.set(f.id, f.name);
        }
      }
    }

    const items: FolderQrAssetV1[] = qrs.map((q: any) => {
      const draft = Array.isArray(q.qr_drafts) ? q.qr_drafts[0] : q.qr_drafts;
      const destinationUrl =
        draft?.destination_json?.defaultUrl ||
        draft?.destination_json?.destinationUrl ||
        draft?.content_json?.url ||
        draft?.content_json?.destination ||
        draft?.content_json?.targetUrl ||
        "";
      const scans = scanMap.get(q.id) || { total: 0, unique: 0 };

      return {
        id: q.id,
        slug: q.slug,
        name: q.name,
        qrType: q.qr_type || "url",
        isDynamic: q.is_dynamic,
        status: q.status,
        destinationUrl,
        totalScans: scans.total,
        uniqueScans: scans.unique,
        currentFolderId: q.folder_id || null,
        currentFolderName: q.folder_id ? folderNamesMap.get(q.folder_id) || null : null,
        updatedAt: q.updated_at,
      };
    });

    if (options.sortBy === "totalScans") {
      items.sort((a, b) =>
        options.order === "asc" ? a.totalScans - b.totalScans : b.totalScans - a.totalScans
      );
    }

    return {
      items,
      totalCount: count || items.length,
    };
  },

  /**
   * Moves QR codes to a folder (or unfiled if targetFolderId is null).
   * STRICT TENANT INTEGRITY:
   * Validates every QR code belongs to orgId.
   * If targetFolderId is provided, validates target folder belongs to orgId.
   */
  async moveQrsToFolder(
    orgId: string,
    qrIds: string[],
    targetFolderId: string | null
  ): Promise<number> {
    if (qrIds.length === 0) return 0;
    const supabase = await getClient();

    // 1. Verify target folder if specified
    if (targetFolderId !== null) {
      const { data: targetFolder } = await supabase
        .from("folders")
        .select("id")
        .eq("organization_id", orgId)
        .eq("id", targetFolderId)
        .maybeSingle();

      if (!targetFolder) {
        throw new Error("Target folder not found in this organization.");
      }
    }

    // 2. Perform atomic batch update scoped by organization_id
    const { data: updated, error } = await supabase
      .from("qr_codes")
      .update({ folder_id: targetFolderId } as any)
      .eq("organization_id", orgId)
      .in("id", qrIds)
      .select("id");

    if (error) {
      throw new Error(`Failed to move QR codes: ${error.message}`);
    }

    return updated?.length || 0;
  },

  /**
   * Removes a single QR code from its current folder (moves to Unfiled).
   */
  async removeQrFromFolder(orgId: string, qrId: string): Promise<boolean> {
    const supabase = await getClient();
    const { error } = await supabase
      .from("qr_codes")
      .update({ folder_id: null } as any)
      .eq("organization_id", orgId)
      .eq("id", qrId);

    if (error) {
      throw new Error(`Failed to remove QR code from folder: ${error.message}`);
    }
    return true;
  },
};
