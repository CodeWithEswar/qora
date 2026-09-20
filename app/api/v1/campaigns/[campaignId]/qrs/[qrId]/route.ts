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
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";

/**
 * DELETE /api/v1/campaigns/[campaignId]/qrs/[qrId] — Remove QR Asset from Campaign
 * Invariant: Never deletes the QR code!
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; qrId: string }> }
) {
  let ctx;
  try {
    const { campaignId, qrId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "campaigns:write",
      permission: "campaigns.update",
    });

    let removed = false;

    // 1. Authoritative Supabase removal
    try {
      removed = await SupabaseCampaignRepository.removeCampaignQrAsset(campaignId, qrId);
    } catch (sbErr) {
      console.warn("[DELETE /api/v1/campaigns/[campaignId]/qrs/[qrId]] Supabase notice:", sbErr);
    }

    // 2. D1 removal if active
    const d1 = ctx.db;
    if (d1) {
      try {
        const d1Removed = await CampaignsRepository.removeCampaignQrAsset(
          d1,
          ctx.organizationId,
          campaignId,
          qrId
        );
        if (d1Removed) removed = true;

        await recordActivityEvent(d1, {
          organizationId: ctx.organizationId,
          actorId: ctx.principal.actorId,
          action: "campaign.qr_removed",
          resourceType: "campaign",
          resourceId: campaignId,
          metadata: { qrId },
        }).catch((err) => console.warn("[CampaignsAPI] Failed to record activity:", err));
      } catch (d1Err) {
        console.warn("[DELETE /api/v1/campaigns/[campaignId]/qrs/[qrId]] D1 sync notice:", d1Err);
      }
    }

    if (!removed) {
      throw new NotFoundError(`QR asset '${qrId}' not found in campaign '${campaignId}'.`);
    }

    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.CAMPAIGN_QR_REMOVED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "campaign", id: campaignId },
      data: {
        campaignId,
        qrId,
        removedBy: ctx.principal.actorId,
      },
    });

    return apiSuccess({ success: true, message: `QR '${qrId}' removed from campaign.` }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
