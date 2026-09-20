import { NextRequest } from "next/server";
import { PublishLandingPageRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * POST /api/v1/landing-pages/[pageId]/publish — Commits active draft into immutable version and updates live pointer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  let ctx;
  try {
    const { pageId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:publish",
      permission: "landing_pages.publish",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = PublishLandingPageRequestV1Schema.parse(rawBody);

    const result = await SupabaseLandingPageRepository.publishPage(
      ctx.organizationId,
      pageId,
      ctx.principal.actorId,
      payload.changeSummary
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
