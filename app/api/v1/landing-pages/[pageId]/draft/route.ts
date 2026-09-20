import { NextRequest } from "next/server";
import { SaveLandingPageDraftRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * GET /api/v1/landing-pages/[pageId]/draft — Load landing page details and active draft
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

    const result = await SupabaseLandingPageRepository.getById(ctx.organizationId, pageId);
    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PUT /api/v1/landing-pages/[pageId]/draft — Server autosave with optimistic concurrency
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  let ctx;
  try {
    const { pageId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:write",
      permission: "landing_pages.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = SaveLandingPageDraftRequestV1Schema.parse(rawBody);

    const result = await SupabaseLandingPageRepository.saveDraft(
      ctx.organizationId,
      pageId,
      ctx.principal.actorId,
      payload.expectedDraftVersion,
      payload.document
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
