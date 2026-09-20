import { NextRequest } from "next/server";
import {
  NotFoundError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository, recordActivityEvent } from "@nxtqr/db";

/**
 * POST /api/v1/campaigns/[campaignId]/archive — Archive Campaign safely
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

    const d1 = ctx.db;
    if (!d1) {
      throw new Error("Cloudflare D1 authoritative database binding is required.");
    }

    const existing = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
    if (!existing) {
      throw new NotFoundError(`Campaign '${campaignId}' not found.`);
    }

    await CampaignsRepository.archiveCampaign(d1, ctx.organizationId, campaignId);

    // Record activity event
    await recordActivityEvent(d1, {
      organizationId: ctx.organizationId,
      actorId: ctx.principal.actorId,
      action: "campaign.archived",
      resourceType: "campaign",
      resourceId: campaignId,
      metadata: { name: existing.name },
    }).catch((err) => console.warn("[CampaignsAPI] Failed to record activity:", err));

    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.CAMPAIGN_ARCHIVED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "campaign", id: campaignId },
      data: {
        campaignId,
        archivedBy: ctx.principal.actorId,
      },
    });

    return apiSuccess({ success: true, message: `Campaign '${existing.name}' archived.` }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
