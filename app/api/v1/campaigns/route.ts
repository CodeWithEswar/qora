import { NextRequest } from "next/server";
import {
  CreateCampaignRequestV1Schema,
  CampaignCollectionQuerySchema,
  CampaignResponseV1,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository, recordActivityEvent } from "@nxtqr/db";
import { validateCampaignEmoji } from "@/lib/domains/campaigns";
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";

/**
 * GET /api/v1/campaigns — List Campaigns with real relational metrics and summary signal
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:read",
      permission: "campaigns.read",
    });

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = CampaignCollectionQuerySchema.parse(rawQuery);

    // 1. Authoritative Supabase retrieval
    try {
      const sbRows = await SupabaseCampaignRepository.listByOrg(ctx.organizationId, {
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
      console.warn("[GET /api/v1/campaigns] Supabase listing notice:", err);
    }

    // 2. D1 fallback if available
    const d1 = ctx.db;
    if (d1) {
      const [{ items: rows, totalCount }, summary] = await Promise.all([
        CampaignsRepository.listCampaigns(d1, ctx.organizationId, {
          search: query.search,
          status: query.status,
          hasQrs: query.hasQrs,
          hasScans: query.hasScans,
          dateRange: query.dateRange,
          sortBy: query.sortBy,
          order: query.order,
          limit: query.limit,
        }),
        CampaignsRepository.getCampaignSummarySignal(d1, ctx.organizationId),
      ]);

      const items: CampaignResponseV1[] = rows.map((r) => ({
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

    // Zero Fake Data Policy: return empty collection when no records
    return apiCollection([], { nextCursor: null, hasMore: false, totalCount: 0 }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/campaigns — Create Campaign in Supabase Postgres & Cloudflare D1
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:write",
      permission: "campaigns.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateCampaignRequestV1Schema.parse(rawBody);

    const validatedEmoji = validateCampaignEmoji(payload.emoji);

    // 1. Authoritative Supabase Creation
    const sbCreated = await SupabaseCampaignRepository.createCampaign(ctx.organizationId, {
      name: payload.name,
      description: payload.description || undefined,
      emoji: validatedEmoji || undefined,
      status: payload.status as any,
      startDate: payload.startsAt || undefined,
      endDate: payload.endsAt || undefined,
      qrIds: payload.qrIds,
    });

    // 2. Dual-write to D1 if D1 is active
    const d1 = ctx.db;
    if (d1) {
      try {
        const startsAt = payload.startsAt ? Math.floor(new Date(payload.startsAt).getTime() / 1000) : null;
        const endsAt = payload.endsAt ? Math.floor(new Date(payload.endsAt).getTime() / 1000) : null;

        await CampaignsRepository.createCampaign(
          d1,
          ctx.organizationId,
          {
            name: payload.name,
            description: payload.description || null,
            emoji: validatedEmoji,
            status: payload.status,
            startDate: startsAt,
            endDate: endsAt,
            qrIds: payload.qrIds,
          },
          ctx.principal.actorId
        );

        await recordActivityEvent(d1, {
          organizationId: ctx.organizationId,
          actorId: ctx.principal.actorId,
          action: "campaign.created",
          resourceType: "campaign",
          resourceId: sbCreated.id,
          metadata: { name: payload.name, emoji: validatedEmoji, status: payload.status },
        });
      } catch (d1Err) {
        console.warn("[POST /api/v1/campaigns] D1 sync notice:", d1Err);
      }
    }

    // 3. Emit internal event: campaign.created
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.CAMPAIGN_CREATED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "campaign", id: sbCreated.id },
      data: {
        campaignId: sbCreated.id,
        name: sbCreated.name,
        status: sbCreated.status,
        qrCount: payload.qrIds?.length || 0,
      },
    });

    const response: CampaignResponseV1 = {
      id: sbCreated.id,
      name: sbCreated.name,
      description: sbCreated.description || undefined,
      emoji: sbCreated.emoji || null,
      status: sbCreated.status as any,
      startsAt: sbCreated.startDate || null,
      endsAt: sbCreated.endDate || null,
      qrCount: sbCreated.qrAssetCount || 0,
      totalScans: 0,
      createdAt: sbCreated.createdAt,
      updatedAt: sbCreated.updatedAt,
      archivedAt: null,
      creatorName: sbCreated.createdBy || undefined,
    };

    return apiCreated(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
