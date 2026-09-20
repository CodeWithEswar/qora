import { NextRequest } from "next/server";
import {
  NotFoundError,
  CampaignAnalyticsV1,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { CampaignsRepository } from "@nxtqr/db";

/**
 * GET /api/v1/campaigns/[campaignId]/analytics — Aggregated Real Scan Signals
 * Strict Zero Fake Data: Returns real aggregated rollups from scan_events_hourly.
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

    const d1 = ctx.db;
    if (!d1) {
      throw new Error("Cloudflare D1 authoritative database binding is required.");
    }

    const campaign = await CampaignsRepository.getCampaign(d1, ctx.organizationId, campaignId);
    if (!campaign) {
      throw new NotFoundError(`Campaign '${campaignId}' not found.`);
    }

    const url = new URL(request.url);
    const rawPeriod = url.searchParams.get("period") || "7d";
    const period = (["7d", "30d", "90d", "all"].includes(rawPeriod) ? rawPeriod : "7d") as
      | "7d"
      | "30d"
      | "90d"
      | "all";

    const analytics: CampaignAnalyticsV1 = await CampaignsRepository.getCampaignAnalytics(
      d1,
      ctx.organizationId,
      campaignId,
      period
    );

    return apiSuccess(analytics, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
