import { NextRequest } from "next/server";
import { ConnectQrRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
  ValidationError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * GET /api/v1/landing-pages/[pageId]/qrs — Lists connected QR codes
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

    const qrs = await SupabaseLandingPageRepository.listConnectedQrs(
      ctx.organizationId,
      pageId
    );

    return apiSuccess(qrs, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/landing-pages/[pageId]/qrs — Connects a QR code to this landing page
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
      permission: "landing_pages.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = ConnectQrRequestV1Schema.parse(rawBody);

    const result = await SupabaseLandingPageRepository.connectQr(
      ctx.organizationId,
      pageId,
      payload.qrId,
      payload.setAsDestination
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/landing-pages/[pageId]/qrs — Disconnects a QR code from this landing page
 */
export async function DELETE(
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

    const qrId = request.nextUrl.searchParams.get("qrId");
    if (!qrId) {
      throw new ValidationError("Missing required qrId parameter.");
    }

    await SupabaseLandingPageRepository.disconnectQr(
      ctx.organizationId,
      pageId,
      qrId
    );

    return apiSuccess({ disconnected: true, qrId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
