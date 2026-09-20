import { NextRequest } from "next/server";
import { UpdateLandingPageRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * GET /api/v1/landing-pages/[pageId] — Get landing page details and draft
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
 * PATCH /api/v1/landing-pages/[pageId] — Update landing page metadata
 */
export async function PATCH(
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
    const payload = UpdateLandingPageRequestV1Schema.parse(rawBody);

    const updated = await SupabaseLandingPageRepository.updatePage(
      ctx.organizationId,
      pageId,
      payload
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/landing-pages/[pageId] — Dependency-guarded landing page deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  let ctx;
  try {
    const { pageId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:delete",
      permission: "landing_pages.delete",
    });

    const force = request.nextUrl.searchParams.get("force") === "true";
    const result = await SupabaseLandingPageRepository.deletePage(
      ctx.organizationId,
      pageId,
      force
    );

    if (result.blocked) {
      return Response.json(
        {
          error: {
            code: "DEPENDENCY_BLOCKED",
            message: `This landing page is used by ${result.connectedQrCount} QR code${
              result.connectedQrCount === 1 ? "" : "s"
            }. Deleting it could break active destinations.`,
            connectedQrCount: result.connectedQrCount,
          },
        },
        { status: 409 }
      );
    }

    return apiSuccess(
      {
        deleted: true,
        pageId,
        message: "Landing page deleted cleanly. Associated QR assets remain intact.",
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
