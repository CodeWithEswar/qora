/**
 * NXTQR — Cloudflare D1 Campaigns Repository
 * Authoritative tenant-safe relational persistence for campaigns, QR associations, and aggregated scan signals.
 * Invariants:
 * - Organization isolation is mandatory on every query (organization_id = ?).
 * - Removing a QR code from a campaign or deleting a campaign never deletes the QR code asset.
 * - Zero fake/demo data fallback.
 */

import type { D1Database } from "../index";
import { generateOpaqueId } from "../index";
import { CampaignStatus, CampaignAnalyticsV1 } from "@nxtqr/contracts";

export interface CampaignRecord {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  startDate?: number | null;
  endDate?: number | null;
  budgetInr?: number | null;
  budgetMinor?: number | null;
  status: CampaignStatus;
  createdBy?: string | null;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number | null;
  qrCount: number;
  totalScans: number;
  creatorName?: string;
}

export interface ListCampaignsOptions {
  search?: string;
  status?: CampaignStatus;
  hasQrs?: "true" | "false" | "all";
  hasScans?: "true" | "false" | "all";
  dateRange?: "today" | "7d" | "30d" | "all";
  sortBy?: "updatedAt" | "createdAt" | "name" | "totalScans";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CreateCampaignInput {
  name: string;
  description?: string | null;
  emoji?: string | null;
  status?: CampaignStatus;
  startDate?: number | null;
  endDate?: number | null;
  qrIds?: string[];
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string | null;
  emoji?: string | null;
  status?: CampaignStatus;
  startDate?: number | null;
  endDate?: number | null;
}

export class CampaignsRepository {
  /**
   * List campaigns for an organization with real relational counts and telemetry rollups.
   */
  static async listCampaigns(
    db: D1Database,
    orgId: string,
    options: ListCampaignsOptions = {}
  ): Promise<{ items: CampaignRecord[]; totalCount: number }> {
    const {
      search,
      status,
      hasQrs,
      hasScans,
      dateRange,
      sortBy = "updatedAt",
      order = "desc",
      limit = 50,
      offset = 0,
    } = options;

    const conditions: string[] = ["c.organization_id = ?"];
    const params: any[] = [orgId];

    if (status) {
      conditions.push("c.status = ?");
      params.push(status);
    } else {
      // By default, exclude archived campaigns from main list
      conditions.push("c.status != 'archived'");
    }

    if (search && search.trim()) {
      conditions.push("(c.name LIKE ? OR c.description LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (dateRange && dateRange !== "all") {
      const now = Math.floor(Date.now() / 1000);
      let threshold = 0;
      if (dateRange === "today") threshold = now - 86400;
      else if (dateRange === "7d") threshold = now - 7 * 86400;
      else if (dateRange === "30d") threshold = now - 30 * 86400;
      if (threshold > 0) {
        conditions.push("c.created_at >= ?");
        params.push(threshold);
      }
    }

    // Direction
    const dir = order.toLowerCase() === "asc" ? "ASC" : "DESC";
    let sortColumn = "updatedAt";
    if (sortBy === "createdAt") sortColumn = "createdAt";
    else if (sortBy === "name") sortColumn = "name";
    else if (sortBy === "totalScans") sortColumn = "totalScans";

    // Subqueries for QR count and scans ensure accurate aggregations without duplicate row multiplication
    const query = `
      SELECT 
        c.id, c.organization_id, c.name, c.description, c.emoji,
        c.start_date as startDate, c.end_date as endDate,
        c.budget_inr as budgetInr, c.budget_minor as budgetMinor,
        c.status, c.created_by as createdBy,
        c.created_at as createdAt, c.updated_at as updatedAt, c.archived_at as archivedAt,
        u.name as creatorName,
        (SELECT COUNT(*) FROM qr_codes q WHERE q.campaign_id = c.id AND q.organization_id = c.organization_id) as qrCount,
        COALESCE((
          SELECT SUM(s.total_scans) 
          FROM scan_events_hourly s
          JOIN qr_codes q ON q.id = s.qr_id
          WHERE q.campaign_id = c.id AND q.organization_id = c.organization_id
        ), 0) as totalScans
      FROM campaigns c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE ${conditions.join(" AND ")}
    `;

    // Having filters for hasQrs / hasScans
    let wrappedQuery = `SELECT * FROM (${query}) AS sub`;
    const wrappedConditions: string[] = [];
    if (hasQrs === "true") wrappedConditions.push("qrCount > 0");
    if (hasQrs === "false") wrappedConditions.push("qrCount = 0");
    if (hasScans === "true") wrappedConditions.push("totalScans > 0");
    if (hasScans === "false") wrappedConditions.push("totalScans = 0");

    if (wrappedConditions.length > 0) {
      wrappedQuery += ` WHERE ${wrappedConditions.join(" AND ")}`;
    }

    wrappedQuery += ` ORDER BY ${sortColumn} ${dir}, id DESC LIMIT ? OFFSET ?`;
    const queryParams = [...params, limit, offset];

    const res = (await db.prepare(wrappedQuery).bind(...queryParams).all()) as any;
    const rows = (res?.results || []) as any[];

    const items: CampaignRecord[] = rows.map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      name: r.name,
      description: r.description || null,
      emoji: r.emoji || null,
      startDate: r.startDate ? Number(r.startDate) : null,
      endDate: r.endDate ? Number(r.endDate) : null,
      budgetInr: r.budgetInr ? Number(r.budgetInr) : null,
      budgetMinor: r.budgetMinor ? Number(r.budgetMinor) : null,
      status: r.status as CampaignStatus,
      createdBy: r.createdBy || null,
      creatorName: r.creatorName || undefined,
      createdAt: Number(r.createdAt),
      updatedAt: Number(r.updatedAt),
      archivedAt: r.archivedAt ? Number(r.archivedAt) : null,
      qrCount: Number(r.qrCount || 0),
      totalScans: Number(r.totalScans || 0),
    }));

    return { items, totalCount: items.length };
  }

  /**
   * Get single campaign by ID with organization isolation.
   */
  static async getCampaign(
    db: D1Database,
    orgId: string,
    campaignId: string
  ): Promise<CampaignRecord | null> {
    const query = `
      SELECT 
        c.id, c.organization_id, c.name, c.description, c.emoji,
        c.start_date as startDate, c.end_date as endDate,
        c.budget_inr as budgetInr, c.budget_minor as budgetMinor,
        c.status, c.created_by as createdBy,
        c.created_at as createdAt, c.updated_at as updatedAt, c.archived_at as archivedAt,
        u.name as creatorName,
        (SELECT COUNT(*) FROM qr_codes q WHERE q.campaign_id = c.id AND q.organization_id = c.organization_id) as qrCount,
        COALESCE((
          SELECT SUM(s.total_scans) 
          FROM scan_events_hourly s
          JOIN qr_codes q ON q.id = s.qr_id
          WHERE q.campaign_id = c.id AND q.organization_id = c.organization_id
        ), 0) as totalScans
      FROM campaigns c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id = ? AND c.organization_id = ?
      LIMIT 1
    `;

    const res = (await db.prepare(query).bind(campaignId, orgId).all()) as any;
    const r = res?.results?.[0];
    if (!r) return null;

    return {
      id: r.id,
      organizationId: r.organization_id,
      name: r.name,
      description: r.description || null,
      emoji: r.emoji || null,
      startDate: r.startDate ? Number(r.startDate) : null,
      endDate: r.endDate ? Number(r.endDate) : null,
      budgetInr: r.budgetInr ? Number(r.budgetInr) : null,
      budgetMinor: r.budgetMinor ? Number(r.budgetMinor) : null,
      status: r.status as CampaignStatus,
      createdBy: r.createdBy || null,
      creatorName: r.creatorName || undefined,
      createdAt: Number(r.createdAt),
      updatedAt: Number(r.updatedAt),
      archivedAt: r.archivedAt ? Number(r.archivedAt) : null,
      qrCount: Number(r.qrCount || 0),
      totalScans: Number(r.totalScans || 0),
    };
  }

  /**
   * Create a new campaign and optionally attach initial QR assets.
   */
  static async createCampaign(
    db: D1Database,
    orgId: string,
    input: CreateCampaignInput,
    actorId?: string
  ): Promise<CampaignRecord> {
    const campaignId = generateOpaqueId("camp");
    const now = Math.floor(Date.now() / 1000);
    const status = input.status || "draft";

    const insertSql = `
      INSERT INTO campaigns (
        id, organization_id, name, description, emoji,
        start_date, end_date, status, created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmts: any[] = [
      db.prepare(insertSql).bind(
        campaignId,
        orgId,
        input.name,
        input.description || null,
        input.emoji || null,
        input.startDate || null,
        input.endDate || null,
        status,
        actorId || null,
        now,
        now
      ),
    ];

    // If initial QR codes specified, attach them in the same transaction
    if (input.qrIds && input.qrIds.length > 0) {
      for (const qrId of input.qrIds) {
        stmts.push(
          db
            .prepare(
              "UPDATE qr_codes SET campaign_id = ?, updated_at = ? WHERE id = ? AND organization_id = ?"
            )
            .bind(campaignId, now, qrId, orgId)
        );
      }
    }

    await db.batch(stmts);

    return {
      id: campaignId,
      organizationId: orgId,
      name: input.name,
      description: input.description || null,
      emoji: input.emoji || null,
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      status,
      createdBy: actorId || null,
      createdAt: now,
      updatedAt: now,
      qrCount: input.qrIds ? input.qrIds.length : 0,
      totalScans: 0,
    };
  }

  /**
   * Update campaign details.
   */
  static async updateCampaign(
    db: D1Database,
    orgId: string,
    campaignId: string,
    input: UpdateCampaignInput
  ): Promise<CampaignRecord | null> {
    const existing = await this.getCampaign(db, orgId, campaignId);
    if (!existing) return null;

    const updates: string[] = ["updated_at = ?"];
    const now = Math.floor(Date.now() / 1000);
    const params: any[] = [now];

    if (input.name !== undefined) {
      updates.push("name = ?");
      params.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push("description = ?");
      params.push(input.description);
    }
    if (input.emoji !== undefined) {
      updates.push("emoji = ?");
      params.push(input.emoji);
    }
    if (input.status !== undefined) {
      updates.push("status = ?");
      params.push(input.status);
      if (input.status === "archived" && !existing.archivedAt) {
        updates.push("archived_at = ?");
        params.push(now);
      }
    }
    if (input.startDate !== undefined) {
      updates.push("start_date = ?");
      params.push(input.startDate);
    }
    if (input.endDate !== undefined) {
      updates.push("end_date = ?");
      params.push(input.endDate);
    }

    params.push(campaignId, orgId);

    const query = `
      UPDATE campaigns
      SET ${updates.join(", ")}
      WHERE id = ? AND organization_id = ?
    `;

    await db.prepare(query).bind(...params).run();
    return this.getCampaign(db, orgId, campaignId);
  }

  /**
   * Archive campaign without touching QR codes.
   */
  static async archiveCampaign(
    db: D1Database,
    orgId: string,
    campaignId: string
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const res = await db
      .prepare(
        "UPDATE campaigns SET status = 'archived', archived_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?"
      )
      .bind(now, now, campaignId, orgId)
      .run();

    return ((res?.meta as any)?.changes || 0) > 0;
  }

  /**
   * Delete campaign: unlinks all associated QR codes first, then deletes campaign record.
   * Invariant: Never deletes QR codes!
   */
  static async deleteCampaign(
    db: D1Database,
    orgId: string,
    campaignId: string
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    await db.batch([
      db
        .prepare(
          "UPDATE qr_codes SET campaign_id = NULL, updated_at = ? WHERE campaign_id = ? AND organization_id = ?"
        )
        .bind(now, campaignId, orgId),
      db
        .prepare("DELETE FROM campaigns WHERE id = ? AND organization_id = ?")
        .bind(campaignId, orgId),
    ]);

    return true;
  }

  /**
   * Get connected campaign signal rail metrics for the organization.
   */
  static async getCampaignSummarySignal(
    db: D1Database,
    orgId: string
  ): Promise<{
    activeCampaigns: number;
    qrAssetsInCampaigns: number;
    scanActivity: number;
    destinations: number;
  }> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM campaigns WHERE organization_id = ? AND status = 'active') as activeCampaigns,
        (SELECT COUNT(*) FROM qr_codes WHERE organization_id = ? AND campaign_id IS NOT NULL AND status != 'ARCHIVED') as qrAssetsInCampaigns,
        COALESCE((
          SELECT SUM(s.total_scans) 
          FROM scan_events_hourly s
          JOIN qr_codes q ON q.id = s.qr_id
          WHERE q.organization_id = ? AND q.campaign_id IS NOT NULL
        ), 0) as scanActivity,
        COALESCE((
          SELECT COUNT(DISTINCT d.default_url)
          FROM qr_destinations d
          JOIN qr_codes q ON q.id = d.qr_id
          WHERE q.organization_id = ? AND q.campaign_id IS NOT NULL AND d.default_url IS NOT NULL AND d.default_url != ''
        ), 0) as destinations
    `;

    const res = (await db.prepare(query).bind(orgId, orgId, orgId, orgId).all()) as any;
    const r = res?.results?.[0];
    return {
      activeCampaigns: Number(r?.activeCampaigns || 0),
      qrAssetsInCampaigns: Number(r?.qrAssetsInCampaigns || 0),
      scanActivity: Number(r?.scanActivity || 0),
      destinations: Number(r?.destinations || 0),
    };
  }

  /**
   * List QR codes currently assigned to a campaign.
   */
  static async listCampaignQrAssets(
    db: D1Database,
    orgId: string,
    campaignId: string,
    options: { search?: string; limit?: number; offset?: number } = {}
  ): Promise<any[]> {
    const { search, limit = 50, offset = 0 } = options;
    const conditions: string[] = ["q.campaign_id = ?", "q.organization_id = ?"];
    const params: any[] = [campaignId, orgId];

    if (search && search.trim()) {
      conditions.push("(q.name LIKE ? OR q.slug LIKE ? OR d.default_url LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const query = `
      SELECT 
        q.id, q.slug, q.name, q.qr_type as qrType, q.status,
        d.default_url as destinationUrl,
        COALESCE(qd.design_json, qv.design_json) as designJson,
        COALESCE((SELECT SUM(total_scans) FROM scan_events_hourly WHERE qr_id = q.id), 0) as totalScans,
        COALESCE((SELECT SUM(unique_scans) FROM scan_events_hourly WHERE qr_id = q.id), 0) as uniqueScans,
        q.updated_at as updatedAt
      FROM qr_codes q
      LEFT JOIN qr_destinations d ON d.id = (
        SELECT id FROM qr_destinations WHERE qr_id = q.id ORDER BY created_at DESC LIMIT 1
      )
      LEFT JOIN qr_drafts qd ON qd.qr_id = q.id
      LEFT JOIN qr_versions qv ON qv.id = COALESCE(q.published_version_id, q.current_version_id)
      WHERE ${conditions.join(" AND ")}
      ORDER BY q.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const res = (await db.prepare(query).bind(...params).all()) as any;
    const rows = (res?.results || []) as any[];

    return rows.map((r) => {
      let design: any = null;
      if (r.designJson) {
        try {
          design = typeof r.designJson === "string" ? JSON.parse(r.designJson) : r.designJson;
        } catch {}
      }
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        qrType: r.qrType || "url",
        status: r.status,
        destinationUrl: r.destinationUrl || "",
        totalScans: Number(r.totalScans || 0),
        uniqueScans: Number(r.uniqueScans || 0),
        updatedAt: new Date(Number(r.updatedAt) * 1000).toISOString(),
        design,
      };
    });
  }

  /**
   * Assign QR codes to a campaign.
   * Returns list of any QRs that were previously in another campaign (conflict detection).
   */
  static async addCampaignQrAssets(
    db: D1Database,
    orgId: string,
    campaignId: string,
    qrIds: string[]
  ): Promise<{ reassigned: Array<{ qrId: string; qrName: string; prevCampaignName?: string }> }> {
    if (!qrIds.length) return { reassigned: [] };

    const placeholders = qrIds.map(() => "?").join(",");
    const checkSql = `
      SELECT q.id, q.name, q.campaign_id, c.name as prevCampaignName
      FROM qr_codes q
      LEFT JOIN campaigns c ON c.id = q.campaign_id
      WHERE q.id IN (${placeholders}) AND q.organization_id = ?
    `;

    const checkRes = (await db.prepare(checkSql).bind(...qrIds, orgId).all()) as any;
    const existing = (checkRes?.results || []) as any[];

    const reassigned = existing
      .filter((q) => q.campaign_id && q.campaign_id !== campaignId)
      .map((q) => ({
        qrId: q.id,
        qrName: q.name,
        prevCampaignName: q.prevCampaignName || "Another campaign",
      }));

    const now = Math.floor(Date.now() / 1000);
    const updateSql = `
      UPDATE qr_codes 
      SET campaign_id = ?, updated_at = ?
      WHERE id IN (${placeholders}) AND organization_id = ?
    `;

    await db.prepare(updateSql).bind(campaignId, now, ...qrIds, orgId).run();

    return { reassigned };
  }

  /**
   * Remove a single QR code from a campaign.
   * Invariant: Never deletes the QR code!
   */
  static async removeCampaignQrAsset(
    db: D1Database,
    orgId: string,
    campaignId: string,
    qrId: string
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const res = await db
      .prepare(
        "UPDATE qr_codes SET campaign_id = NULL, updated_at = ? WHERE id = ? AND campaign_id = ? AND organization_id = ?"
      )
      .bind(now, qrId, campaignId, orgId)
      .run();

    return ((res?.meta as any)?.changes || 0) > 0;
  }

  /**
   * Compute aggregated real scan analytics for a campaign.
   */
  static async getCampaignAnalytics(
    db: D1Database,
    orgId: string,
    campaignId: string,
    period: "7d" | "30d" | "90d" | "all" = "7d"
  ): Promise<CampaignAnalyticsV1> {
    const now = Math.floor(Date.now() / 1000);
    let startThreshold = 0;
    if (period === "7d") startThreshold = now - 7 * 86400;
    else if (period === "30d") startThreshold = now - 30 * 86400;
    else if (period === "90d") startThreshold = now - 90 * 86400;

    // 1. Overall aggregated metrics
    const overallSql = `
      SELECT 
        COALESCE(SUM(s.total_scans), 0) as totalScans,
        COALESCE(SUM(s.unique_scans), 0) as uniqueScans,
        COUNT(DISTINCT s.qr_id) as activeQrs
      FROM scan_events_hourly s
      JOIN qr_codes q ON q.id = s.qr_id
      WHERE q.campaign_id = ? AND q.organization_id = ? ${startThreshold > 0 ? "AND s.hour_bucket >= ?" : ""}
    `;
    const overallParams = startThreshold > 0 ? [campaignId, orgId, startThreshold] : [campaignId, orgId];
    const overallRes = (await db.prepare(overallSql).bind(...overallParams).all()) as any;
    const overall = overallRes?.results?.[0];

    const totalScans = Number(overall?.totalScans || 0);
    const uniqueScans = Number(overall?.uniqueScans || 0);
    const activeQrs = Number(overall?.activeQrs || 0);

    // 2. Time-series daily rollups
    const seriesSql = `
      SELECT 
        (s.hour_bucket / 86400) * 86400 as dateBucket,
        SUM(s.total_scans) as scans,
        SUM(s.unique_scans) as uniqueScans
      FROM scan_events_hourly s
      JOIN qr_codes q ON q.id = s.qr_id
      WHERE q.campaign_id = ? AND q.organization_id = ? ${startThreshold > 0 ? "AND s.hour_bucket >= ?" : ""}
      GROUP BY dateBucket
      ORDER BY dateBucket ASC
    `;
    const seriesRes = (await db.prepare(seriesSql).bind(...overallParams).all()) as any;
    const timeSeries = ((seriesRes?.results || []) as any[]).map((row) => ({
      date: new Date(Number(row.dateBucket) * 1000).toISOString().split("T")[0],
      scans: Number(row.scans || 0),
      uniqueScans: Number(row.uniqueScans || 0),
    }));

    // 3. Top QR Assets in this campaign
    const topQrSql = `
      SELECT 
        q.id, q.name, q.qr_type as qrType,
        d.default_url as destinationUrl,
        COALESCE(SUM(s.total_scans), 0) as scans
      FROM qr_codes q
      LEFT JOIN qr_destinations d ON d.id = (
        SELECT id FROM qr_destinations WHERE qr_id = q.id ORDER BY created_at DESC LIMIT 1
      )
      LEFT JOIN scan_events_hourly s ON s.qr_id = q.id ${startThreshold > 0 ? "AND s.hour_bucket >= " + startThreshold : ""}
      WHERE q.campaign_id = ? AND q.organization_id = ?
      GROUP BY q.id
      ORDER BY scans DESC
      LIMIT 10
    `;
    const topQrRes = (await db.prepare(topQrSql).bind(campaignId, orgId).all()) as any;
    const topQrAssets = ((topQrRes?.results || []) as any[]).map((r) => {
      const scans = Number(r.scans || 0);
      const share = totalScans > 0 ? Math.round((scans / totalScans) * 100) : 0;
      return {
        id: r.id,
        name: r.name,
        type: r.qrType || "url",
        destinationUrl: r.destinationUrl || "",
        scans,
        share,
      };
    });

    // 4. Destination Distribution
    const destSql = `
      SELECT 
        d.default_url as destinationUrl,
        COUNT(DISTINCT q.id) as qrCount,
        COALESCE(SUM(s.total_scans), 0) as count
      FROM qr_codes q
      JOIN qr_destinations d ON d.id = (
        SELECT id FROM qr_destinations WHERE qr_id = q.id ORDER BY created_at DESC LIMIT 1
      )
      LEFT JOIN scan_events_hourly s ON s.qr_id = q.id ${startThreshold > 0 ? "AND s.hour_bucket >= " + startThreshold : ""}
      WHERE q.campaign_id = ? AND q.organization_id = ? AND d.default_url IS NOT NULL
      GROUP BY d.default_url
      ORDER BY count DESC
      LIMIT 10
    `;
    const destRes = (await db.prepare(destSql).bind(campaignId, orgId).all()) as any;
    const destinationDistribution = ((destRes?.results || []) as any[]).map((r) => {
      let domain = "direct";
      try {
        if (r.destinationUrl.startsWith("http")) {
          domain = new URL(r.destinationUrl).hostname;
        } else {
          domain = r.destinationUrl;
        }
      } catch {}
      return {
        domain,
        count: Number(r.count || 0),
        qrCount: Number(r.qrCount || 0),
      };
    });

    // 5. Routing summary
    const routingSql = `
      SELECT 
        (SELECT COUNT(*) FROM qr_codes WHERE campaign_id = ? AND organization_id = ?) as totalQrs,
        (SELECT COUNT(DISTINCT r.qr_id) FROM qr_rules r JOIN qr_codes q ON q.id = r.qr_id WHERE q.campaign_id = ? AND q.organization_id = ?) as conditionalRulesCount,
        (SELECT COUNT(DISTINCT l.qr_id) FROM link_checks l JOIN qr_codes q ON q.id = l.qr_id WHERE q.campaign_id = ? AND q.organization_id = ?) as monitoredCount
    `;
    const routingRes = (await db
      .prepare(routingSql)
      .bind(campaignId, orgId, campaignId, orgId, campaignId, orgId)
      .all()) as any;
    const routing = routingRes?.results?.[0];

    const totalQrs = Number(routing?.totalQrs || 0);
    const conditionalRulesCount = Number(routing?.conditionalRulesCount || 0);
    const monitoredCount = Number(routing?.monitoredCount || 0);
    const defaultRoutesCount = Math.max(0, totalQrs - conditionalRulesCount);

    return {
      period,
      totalScans,
      uniqueScans,
      activeQrs,
      timeSeries,
      topQrAssets,
      destinationDistribution,
      routingSummary: {
        defaultRoutesCount,
        conditionalRulesCount,
        monitoredCount,
      },
    };
  }

  /**
   * Get real destination topology for a campaign.
   */
  static async getCampaignDestinations(
    db: D1Database,
    orgId: string,
    campaignId: string
  ): Promise<Array<{ domain: string; destinationUrl: string; qrCount: number; qrIds: string[] }>> {
    const query = `
      SELECT 
        d.default_url as destinationUrl,
        GROUP_CONCAT(q.id) as qrIds,
        COUNT(q.id) as qrCount
      FROM qr_codes q
      JOIN qr_destinations d ON d.id = (
        SELECT id FROM qr_destinations WHERE qr_id = q.id ORDER BY created_at DESC LIMIT 1
      )
      WHERE q.campaign_id = ? AND q.organization_id = ? AND d.default_url IS NOT NULL
      GROUP BY d.default_url
      ORDER BY qrCount DESC
    `;

    const res = (await db.prepare(query).bind(campaignId, orgId).all()) as any;
    const rows = (res?.results || []) as any[];

    return rows.map((r) => {
      let domain = "Direct";
      try {
        if (r.destinationUrl.startsWith("http")) {
          domain = new URL(r.destinationUrl).hostname;
        }
      } catch {}
      return {
        domain,
        destinationUrl: r.destinationUrl,
        qrCount: Number(r.qrCount || 0),
        qrIds: (r.qrIds || "").split(",").filter(Boolean),
      };
    });
  }
}
