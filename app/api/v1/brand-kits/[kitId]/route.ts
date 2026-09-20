import { NextRequest } from "next/server";
import { UpdateBrandKitRequestV1Schema } from "@nxtqr/contracts";
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
 * GET /api/v1/brand-kits/[kitId] — Retrieves a detailed brand kit
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:read",
      permission: "brand.read",
    });

    const kit = await SupabaseBrandKitRepository.getById(ctx.organizationId, kitId);
    return apiSuccess(kit, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/brand-kits/[kitId] — Updates brand kit tokens, typography, logos, etc.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:write",
      permission: "brand.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = UpdateBrandKitRequestV1Schema.parse(rawBody);

    const updated = await SupabaseBrandKitRepository.update(
      ctx.organizationId,
      kitId,
      ctx.principal.actorId,
      payload
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/brand-kits/[kitId] — Deletes or archives a brand kit
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:write",
      permission: "brand.delete",
    });

    const url = new URL(request.url);
    const hardDelete = url.searchParams.get("hard") === "true" || url.searchParams.get("action") === "delete";

    if (hardDelete) {
      await SupabaseBrandKitRepository.delete(
        ctx.organizationId,
        kitId,
        ctx.principal.actorId
      );
      return apiSuccess({ deleted: true, kitId }, ctx.requestId);
    } else {
      const archived = await SupabaseBrandKitRepository.archive(
        ctx.organizationId,
        kitId,
        ctx.principal.actorId
      );
      return apiSuccess(archived, ctx.requestId);
    }
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
