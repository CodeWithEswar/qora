import { NextRequest } from "next/server";
import {
  CampaignCollectionQuerySchema,
  CampaignResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository } from "@nxtqr/db";
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/campaigns — Lists workspace campaigns
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:read",
      permission: "campaigns.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = CampaignCollectionQuerySchema.parse(rawQuery);

    // 1. Authoritative Supabase retrieval
    try {
      const sbRows = await SupabaseCampaignRepository.listByOrg(org.id, {
        status: query.status,
        search: query.search,
        limit: query.limit,
      });

      if (sbRows && sbRows.length > 0) {
        const items: CampaignResponseV1[] = sbRows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || undefined,
          emoji: r.emoji || null,
          status: r.status as any,
          startsAt: r.startDate || null,
          endsAt: r.endDate || null,
          qrCount: r.qrAssetCount || 0,
          totalScans: 0,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          archivedAt: r.archivedAt || null,
          createdBy: r.createdBy || undefined,
        }));

        const hasMore = items.length === query.limit;
        const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;
        const activeCount = sbRows.filter((c) => c.status === "active").length;

        return apiCollection(items, { nextCursor, hasMore, totalCount: items.length }, ctx.requestId, 200, {
          signal: {
            activeCampaigns: activeCount,
            qrAssetsInCampaigns: sbRows.reduce((acc, c) => acc + (c.qrAssetCount || 0), 0),
            scanActivity: 0,
            destinations: 0,
          } as unknown as Record<string, unknown>,
        });
      }
    } catch (err) {
      console.warn("[GET /api/v1/organizations/:orgSlug/campaigns] Supabase listing notice:", err);
    }

    // 2. D1 fallback if available
    const d1 = ctx.db;
    if (d1) {
      const [{ items: rows, totalCount }, summary] = await Promise.all([
        CampaignsRepository.listCampaigns(d1, org.id, {
          search: query.search,
          status: query.status,
          hasQrs: query.hasQrs,
          hasScans: query.hasScans,
          dateRange: query.dateRange,
          sortBy: query.sortBy,
          order: query.order,
          limit: query.limit,
        }),
        CampaignsRepository.getCampaignSummarySignal(d1, org.id),
      ]);

      const items: CampaignResponseV1[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || undefined,
        emoji: r.emoji || null,
        status: r.status,
        startsAt: r.startDate ? new Date(r.startDate * 1000).toISOString() : null,
        endsAt: r.endDate ? new Date(r.endDate * 1000).toISOString() : null,
        qrCount: r.qrCount,
        totalScans: r.totalScans,
        createdAt: new Date(r.createdAt * 1000).toISOString(),
        updatedAt: new Date(r.updatedAt * 1000).toISOString(),
        archivedAt: r.archivedAt ? new Date(r.archivedAt * 1000).toISOString() : null,
        creatorName: r.creatorName || undefined,
      }));

      const hasMore = items.length === query.limit;
      const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

      return apiCollection(items, { nextCursor, hasMore, totalCount }, ctx.requestId, 200, {
        signal: summary as unknown as Record<string, unknown>,
      });
    }

    return apiCollection([], { nextCursor: null, hasMore: false, totalCount: 0 }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
