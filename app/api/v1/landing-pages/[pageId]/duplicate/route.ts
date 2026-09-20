import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * POST /api/v1/landing-pages/[pageId]/duplicate
 * Duplicates a landing page and draft into a fresh landing page.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  let ctx;
  try {
    const { pageId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:write",
      permission: "landing_pages.create",
    });

    const body = await request.json().catch(() => ({}));
    const newPage = await SupabaseLandingPageRepository.duplicatePage(
      ctx.organizationId,
      pageId,
      ctx.principal.actorId,
      body.name
    );

    return apiSuccess(newPage, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
