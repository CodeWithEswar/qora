import { NextRequest } from "next/server";
import { PublishBrandKitRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";

interface RouteParams {
  params: Promise<{ kitId: string }>;
}

/**
 * POST /api/v1/brand-kits/[kitId]/publish — Publishes an immutable brand kit revision
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:write",
      permission: "brand.publish",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = PublishBrandKitRequestV1Schema.parse(rawBody);

    const version = await SupabaseBrandKitRepository.publishVersion(
      ctx.organizationId,
      kitId,
      ctx.principal.actorId,
      payload.changeSummary
    );

    return apiSuccess(version, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
