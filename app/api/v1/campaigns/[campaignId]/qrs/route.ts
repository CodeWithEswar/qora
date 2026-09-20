import { NextRequest } from "next/server";
import {
  AssignCampaignQrsRequestV1Schema,
  NotFoundError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  apiCreated,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository, recordActivityEvent } from "@nxtqr/db";
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";

/**
 * GET /api/v1/campaigns/[campaignId]/qrs — List QR Assets in Campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  let ctx;
  try {
    const { campaignId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:read",
      permission: "campaigns.read",
    });

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);

    // 1. Authoritative Supabase retrieval
    try {
      const qrs = await SupabaseCampaignRepository.listCampaignQrAssets(
        ctx.organizationId,
        campaignId,
        { search, limit, offset }
      );
      if (qrs) {
        return apiSuccess({ items: qrs, totalCount: qrs.length }, ctx.requestId);
      }
    } catch (sbErr) {
      console.warn("[GET /api/v1/campaigns/[campaignId]/qrs] Supabase notice:", sbErr);
    }

    // 2. D1 fallback
    const d1 = ctx.db;
    if (d1) {
      const campaign = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
      if (!campaign) {
        throw new NotFoundError(`Campaign '${campaignId}' not found.`);
      }

      const qrs = await CampaignsRepository.listCampaignQrAssets(d1, ctx.organizationId, campaignId, {
        search,
        limit,
        offset,
      });

      return apiSuccess({ items: qrs, totalCount: qrs.length }, ctx.requestId);
    }

    return apiSuccess({ items: [], totalCount: 0 }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/campaigns/[campaignId]/qrs — Assign QR Assets to Campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  let ctx;
  try {
    const { campaignId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:write",
      permission: "campaigns.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = AssignCampaignQrsRequestV1Schema.parse(rawBody);

    // 1. Authoritative Supabase association
    await SupabaseCampaignRepository.associateQrs(campaignId, payload.qrIds);

    // 2. D1 association if active
    const d1 = ctx.db;
    let reassigned: any[] = [];
    if (d1) {
      try {
        const result = await CampaignsRepository.addCampaignQrAssets(
          d1,
          ctx.organizationId,
          campaignId,
          payload.qrIds
        );
        reassigned = result.reassigned;

        await recordActivityEvent(d1, {
          organizationId: ctx.organizationId,
          actorId: ctx.principal.actorId,
          action: "campaign.qr_added",
          resourceType: "campaign",
          resourceId: campaignId,
          metadata: {
            qrCount: payload.qrIds.length,
            qrIds: payload.qrIds,
          },
        }).catch((err) => console.warn("[CampaignsAPI] Failed to record activity:", err));
      } catch (d1Err) {
        console.warn("[POST /api/v1/campaigns/[campaignId]/qrs] D1 sync notice:", d1Err);
      }
    }

    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.CAMPAIGN_QR_ADDED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "campaign", id: campaignId },
      data: {
        campaignId,
        qrIds: payload.qrIds,
        addedBy: ctx.principal.actorId,
      },
    });

    return apiCreated(
      {
        success: true,
        assignedCount: payload.qrIds.length,
        reassigned,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
