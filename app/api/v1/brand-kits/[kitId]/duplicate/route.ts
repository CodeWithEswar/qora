import { NextRequest } from "next/server";
import { DuplicateBrandKitRequestV1Schema } from "@nxtqr/contracts";
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
 * POST /api/v1/brand-kits/[kitId]/duplicate — Duplicates an existing brand kit
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:write",
      permission: "brand.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = DuplicateBrandKitRequestV1Schema.parse(rawBody);

    const duplicated = await SupabaseBrandKitRepository.duplicate(
      ctx.organizationId,
      kitId,
      ctx.principal.actorId,
      payload.name
    );

    return apiSuccess(duplicated, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
