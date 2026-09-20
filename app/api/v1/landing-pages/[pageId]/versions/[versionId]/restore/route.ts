import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * POST /api/v1/landing-pages/[pageId]/versions/[versionId]/restore
 * Restores a historical snapshot into a NEW draft without mutating history.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string; versionId: string }> }
) {
  let ctx;
  try {
    const { pageId, versionId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:write",
      permission: "landing_pages.update",
    });

    const result = await SupabaseLandingPageRepository.restoreVersion(
      ctx.organizationId,
      pageId,
      ctx.principal.actorId,
      versionId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
