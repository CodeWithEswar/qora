import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * GET /api/v1/landing-pages/[pageId]/versions — Lists immutable version timeline
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

    const versions = await SupabaseLandingPageRepository.listVersions(
      ctx.organizationId,
      pageId
    );

    return apiSuccess(versions, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
