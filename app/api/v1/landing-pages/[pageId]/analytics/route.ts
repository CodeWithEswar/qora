import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * GET /api/v1/landing-pages/[pageId]/analytics — Real telemetry for landing page performance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  let ctx;
  try {
    const { pageId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:read",
      permission: "landing_pages.read",
    });

    const analytics = await SupabaseLandingPageRepository.getAnalytics(
      ctx.organizationId,
      pageId
    );

    return apiSuccess(analytics, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
