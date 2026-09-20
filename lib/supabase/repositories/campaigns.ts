import "server-only";
import { createAdminClient } from "../admin";
import { getSession } from "@/lib/auth/session";
import { CampaignAnalyticsV1 } from "@nxtqr/contracts";

function getClient() {
  return createAdminClient();
}

export interface CampaignRecord {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  budgetMinor?: number | null;
  budgetInr?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  createdBy?: string | null;
  qrAssetCount?: number;
}

export interface CampaignQrAsset {
  id: string;
  slug: string;
  name: string;
  qrType: string;
  status: string;
  destinationUrl: string;
  totalScans: number;
  uniqueScans: number;
  updatedAt: string;
  design?: any;
}

export const SupabaseCampaignRepository = {
  /**
   * Lists campaigns for an organization with attached QR count.
   * ZERO FAKE DATA: Returns empty array if 0 rows in database.
   */
  async listByOrg(
    orgId: string,
    filter?: {
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<CampaignRecord[]> {
    const supabase = await getClient();
    let query = supabase
      .from("campaigns")
      .select("*, campaign_qr_codes(count)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status as any);
    }
    if (filter?.search?.trim()) {
      query = query.ilike("name", `%${filter.search.trim()}%`);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    if (filter?.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((c: any) => ({
      id: c.id,
      organizationId: c.organization_id,
      name: c.name,
      description: c.description,
      emoji: c.emoji,
      status: c.status,
      budgetMinor: c.budget_minor,
      budgetInr: c.budget_inr,
      startDate: c.start_date,
      endDate: c.end_date,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      archivedAt: c.archived_at,
      createdBy: c.created_by,
      qrAssetCount: c.campaign_qr_codes?.[0]?.count || 0,
    }));
  },

  /**
   * Retrieves single campaign by ID or legacy ID.
   */
  async getById(orgId: string, id: string): Promise<CampaignRecord | null> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from("campaigns")
      .select("*, campaign_qr_codes(count)")
      .eq("organization_id", orgId);

    const { data, error } = isUuid
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("legacy_id", id).maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      status: data.status as "active" | "draft" | "paused" | "completed" | "archived",
      budgetMinor: data.budget_minor,
      budgetInr: data.budget_inr,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
      createdBy: data.created_by,
      qrAssetCount: (data as any).campaign_qr_codes?.[0]?.count || 0,
    };
  },

  /**
   * Creates a new campaign in Supabase Postgres.
   */
  async createCampaign(
    orgId: string,
    data: {
      name: string;
      description?: string;
      emoji?: string;
      budgetMinor?: number;
      budgetInr?: number;
      startDate?: string;
      endDate?: string;
      status?: "draft" | "active";
      qrIds?: string[];
    }
  ): Promise<CampaignRecord> {
    const supabase = await getClient();
    const session = await getSession();
    let userId = session?.user?.id || null;
    if (userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const { data: p } = await supabase.from("profiles").select("id").eq("legacy_id", userId).maybeSingle();
      userId = p?.id || null;
    }

    const { data: created, error } = await supabase
      .from("campaigns")
      .insert({
        organization_id: orgId,
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || null,
        budget_minor: data.budgetMinor || null,
        budget_inr: data.budgetInr || null,
        status: data.status || "draft",
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create campaign: ${error?.message}`);
    }

    if (data.qrIds && data.qrIds.length > 0) {
      await this.associateQrs(created.id, data.qrIds);
    }

    return {
      id: created.id,
      organizationId: created.organization_id,
      name: created.name,
      description: created.description,
      emoji: created.emoji,
      status: created.status as "active" | "draft" | "paused" | "completed" | "archived",
      budgetMinor: created.budget_minor,
      budgetInr: created.budget_inr,
      startDate: created.start_date,
      endDate: created.end_date,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      archivedAt: null,
      createdBy: created.created_by,
      qrAssetCount: data.qrIds?.length || 0,
    };
  },

  /**
   * Updates an existing campaign.
   */
  async updateCampaign(
    orgId: string,
    id: string,
    data: {
      name?: string;
      description?: string | null;
      emoji?: string | null;
      status?: "draft" | "active" | "paused" | "completed" | "archived";
      startDate?: string | null;
      endDate?: string | null;
      budgetMinor?: number | null;
      budgetInr?: number | null;
    }
  ): Promise<CampaignRecord> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.emoji !== undefined) updatePayload.emoji = data.emoji;
    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (data.status === "archived") {
        updatePayload.archived_at = new Date().toISOString();
      }
    }
    if (data.startDate !== undefined) updatePayload.start_date = data.startDate;
    if (data.endDate !== undefined) updatePayload.end_date = data.endDate;
    if (data.budgetMinor !== undefined) updatePayload.budget_minor = data.budgetMinor;
    if (data.budgetInr !== undefined) updatePayload.budget_inr = data.budgetInr;

    let query = supabase
      .from("campaigns")
      .update(updatePayload as any)
      .eq("organization_id", orgId);

    query = isUuid ? query.eq("id", id) : query.eq("legacy_id", id);

    const { data: updated, error } = await query.select().single();

    if (error || !updated) {
      throw new Error(`Failed to update campaign: ${error?.message}`);
    }

    return {
      id: updated.id,
      organizationId: updated.organization_id,
      name: updated.name,
      description: updated.description,
      emoji: updated.emoji,
      status: updated.status as any,
      budgetMinor: updated.budget_minor,
      budgetInr: updated.budget_inr,
      startDate: updated.start_date,
      endDate: updated.end_date,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      archivedAt: updated.archived_at,
      createdBy: updated.created_by,
      qrAssetCount: 0,
    };
  },

  /**
   * Deletes a campaign.
   * STRICT CASCADE INVARIANT:
   * Only deletes the campaign and association links. QR codes remain 100% untouched.
   */
  async deleteCampaign(orgId: string, id: string): Promise<boolean> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from("campaigns").delete().eq("organization_id", orgId);
    query = isUuid ? query.eq("id", id) : query.eq("legacy_id", id);

    const { error } = await query;
    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
    return true;
  },

  /**
   * Lists QR codes assigned to this campaign.
   */
  async listCampaignQrAssets(
    orgId: string,
    campaignId: string,
    options: { search?: string; limit?: number; offset?: number } = {}
  ): Promise<CampaignQrAsset[]> {
    const supabase = await getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    // 1. Resolve actual campaign UUID if campaignId is a legacy ID
    let resolvedCampaignId = campaignId;
    if (!isUuid) {
      const { data: cRow } = await supabase
        .from("campaigns")
        .select("id")
        .eq("organization_id", orgId)
        .eq("legacy_id", campaignId)
        .maybeSingle();
      if (cRow?.id) {
        resolvedCampaignId = cRow.id;
      }
    }

    // 2. Query campaign_qr_codes associations
    const { data: linkRows } = await supabase
      .from("campaign_qr_codes")
      .select("qr_id")
      .eq("campaign_id", resolvedCampaignId);

    const linkedQrIds = (linkRows || []).map((l: any) => l.qr_id);

    if (linkedQrIds.length === 0) {
      return [];
    }

    let query = supabase
      .from("qr_codes")
      .select("id, slug, name, qr_type, status, updated_at, qr_drafts(content_json, design_json, destination_json)")
      .eq("organization_id", orgId)
      .in("id", linkedQrIds)
      .order("updated_at", { ascending: false });

    if (options.search?.trim()) {
      query = query.or(
        `name.ilike.%${options.search.trim()}%,slug.ilike.%${options.search.trim()}%`
      );
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data: qrs, error } = await query;
    if (error || !qrs) {
      console.warn("[listCampaignQrAssets] Error querying qr_codes:", error);
      return [];
    }

    // Query scan totals from scan_events_hourly if present
    const scanCountMap = new Map<string, { total: number; unique: number }>();
    try {
      const { data: rollups } = await supabase
        .from("scan_events_hourly")
        .select("qr_id, total_scans, unique_scans")
        .eq("organization_id", orgId)
        .in("qr_id", linkedQrIds);

      if (rollups && rollups.length > 0) {
        for (const r of rollups) {
          const existing = scanCountMap.get(r.qr_id) || { total: 0, unique: 0 };
          existing.total += Number(r.total_scans || 0);
          existing.unique += Number(r.unique_scans || 0);
          scanCountMap.set(r.qr_id, existing);
        }
      }
    } catch {}

    return qrs.map((q: any) => {
      const draft = Array.isArray(q.qr_drafts) ? q.qr_drafts[0] : q.qr_drafts;
      const destinationUrl =
        draft?.destination_json?.defaultUrl ||
        draft?.destination_json?.destinationUrl ||
        draft?.content_json?.url ||
        draft?.content_json?.destination ||
        draft?.content_json?.targetUrl ||
        "";
      const scans = scanCountMap.get(q.id) || { total: 0, unique: 0 };

      return {
        id: q.id,
        slug: q.slug,
        name: q.name,
        qrType: q.qr_type || "url",
        status: q.status,
        destinationUrl,
        totalScans: scans.total,
        uniqueScans: scans.unique,
        updatedAt: q.updated_at,
        design: draft?.design_json || null,
      };
    });
  },

  /**
   * Associates QR codes with a campaign.
   */
  async associateQrs(campaignId: string, qrIds: string[]): Promise<void> {
    if (!qrIds.length) return;
    const supabase = await getClient();
    const rows = qrIds.map((qrId) => ({
      campaign_id: campaignId,
      qr_id: qrId,
    }));

    await supabase.from("campaign_qr_codes").upsert(rows, { onConflict: "campaign_id,qr_id" });
  },

  /**
   * Removes a single QR code from a campaign.
   */
  async removeCampaignQrAsset(campaignId: string, qrId: string): Promise<boolean> {
    const supabase = await getClient();
    const { error } = await supabase
      .from("campaign_qr_codes")
      .delete()
      .eq("campaign_id", campaignId)
      .eq("qr_id", qrId);

    return !error;
  },

  /**
   * Get distinct destination topology for a campaign.
   */
  async getCampaignDestinations(
    orgId: string,
    campaignId: string
  ): Promise<Array<{ domain: string; count: number; qrCount: number }>> {
    const qrs = await this.listCampaignQrAssets(orgId, campaignId, { limit: 100 });
    const domainMap = new Map<string, number>();

    for (const q of qrs) {
      let domain = "direct";
      if (q.destinationUrl) {
        try {
          if (q.destinationUrl.startsWith("http")) {
            domain = new URL(q.destinationUrl).hostname;
          } else {
            domain = q.destinationUrl;
          }
        } catch {}
      }
      domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
    }

    return Array.from(domainMap.entries()).map(([domain, count]) => ({
      domain,
      count,
      qrCount: count,
    }));
  },

  /**
   * Get campaign telemetry analytics rollups.
   */
  async getCampaignAnalytics(
    orgId: string,
    campaignId: string,
    period: "7d" | "30d" | "90d" | "all" = "30d"
  ): Promise<CampaignAnalyticsV1> {
    const supabase = await getClient();
    const qrs = await this.listCampaignQrAssets(orgId, campaignId, { limit: 100 });
    const qrIds = qrs.map((q) => q.id);

    let totalScans = 0;
    let uniqueScans = 0;
    const timeSeries: Array<{ date: string; scans: number; uniqueScans: number }> = [];

    if (qrIds.length > 0) {
      const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "all" ? 365 : 30;
      const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

      const { data: rollups } = await supabase
        .from("scan_events_hourly")
        .select("hour_bucket, total_scans, unique_scans")
        .eq("organization_id", orgId)
        .in("qr_id", qrIds)
        .gte("hour_bucket", since)
        .order("hour_bucket", { ascending: true });

      if (rollups && rollups.length > 0) {
        const dayMap = new Map<string, { scans: number; uniqueScans: number }>();
        for (const row of rollups) {
          totalScans += Number(row.total_scans || 0);
          uniqueScans += Number(row.unique_scans || 0);

          const dateStr = new Date(row.hour_bucket).toISOString().split("T")[0];
          const curr = dayMap.get(dateStr) || { scans: 0, uniqueScans: 0 };
          curr.scans += Number(row.total_scans || 0);
          curr.uniqueScans += Number(row.unique_scans || 0);
          dayMap.set(dateStr, curr);
        }

        for (const [date, val] of dayMap.entries()) {
          timeSeries.push({ date, scans: val.scans, uniqueScans: val.uniqueScans });
        }
      }
    }

    const destinations = await this.getCampaignDestinations(orgId, campaignId);

    return {
      period,
      totalScans,
      uniqueScans,
      activeQrs: qrs.filter((q) => q.status === "ACTIVE" || q.status === "active").length,
      timeSeries,
      topQrAssets: qrs.slice(0, 10).map((q) => ({
        id: q.id,
        name: q.name,
        type: q.qrType,
        destinationUrl: q.destinationUrl,
        scans: q.totalScans,
        share: totalScans > 0 ? Math.round((q.totalScans / totalScans) * 100) : 0,
      })),
      destinationDistribution: destinations,
      routingSummary: {
        defaultRoutesCount: qrs.length,
        conditionalRulesCount: 0,
        monitoredCount: qrs.filter((q) => q.status === "ACTIVE" || q.status === "active").length,
      },
    };
  },

  /**
   * Get campaign activity events.
   */
  async getActivity(orgId: string, campaignId: string, limit: number = 50): Promise<any[]> {
    const supabase = await getClient();
    const { data: rows } = await supabase
      .from("activity_events")
      .select("id, action, resource_type, resource_id, metadata_json, created_at, profiles(display_name, email, avatar_url)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!rows) return [];

    return rows.map((r: any) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return {
        id: r.id,
        action: r.action,
        resourceType: r.resource_type,
        resourceId: r.resource_id,
        metadata: r.metadata_json || {},
        createdAt: r.created_at,
        actorName: profile?.display_name || "Workspace Member",
        actorEmail: profile?.email || undefined,
        actorAvatarUrl: profile?.avatar_url || undefined,
      };
    });
  },
};
