import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseAnalyticsRepository } from "@/lib/supabase/repositories/analytics";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/analytics
 * Authoritative organization scan telemetry & routing intelligence from Supabase.
 * Respects strict multi-tenancy, scopes, and RLS.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "analytics:read",
      permission: "analytics.read",
    });

    // Verify tenant ownership
    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org || (ctx.organizationId && org.id !== ctx.organizationId)) {
      throw new NotFoundError(`Organization '${orgSlug}' not found or access denied.`);
    }

    const url = new URL(request.url);
    const range = (url.searchParams.get("range") || "30d") as "24h" | "7d" | "30d" | "90d" | "custom";
    const dateFrom = url.searchParams.get("from") || undefined;
    const dateTo = url.searchParams.get("to") || undefined;
    const qrId = url.searchParams.get("qrId") || undefined;
    const campaignId = url.searchParams.get("campaignId") || undefined;
    const country = url.searchParams.get("country") || undefined;
    const device = url.searchParams.get("device") || undefined;
    const os = url.searchParams.get("os") || undefined;
    const browser = url.searchParams.get("browser") || undefined;
    const ruleId = url.searchParams.get("ruleId") || undefined;
    const trafficQuality = url.searchParams.get("trafficQuality") || undefined;
    const timezone = url.searchParams.get("timezone") || "UTC";

    const analytics = await SupabaseAnalyticsRepository.getOrganizationAnalytics(org.id, {
      range,
      dateFrom,
      dateTo,
      qrId,
      campaignId,
      country,
      device,
      os,
      browser,
      ruleId,
      trafficQuality,
      timezone,
    });

    return apiSuccess(analytics, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_analytics");
  }
}
