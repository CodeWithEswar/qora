import { NextRequest } from "next/server";
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
 * POST /api/v1/brand-kits/[kitId]/default — Sets a brand kit as the organization default
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:write",
      permission: "brand.update",
    });

    const kit = await SupabaseBrandKitRepository.setDefault(
      ctx.organizationId,
      kitId,
      ctx.principal.actorId
    );

    return apiSuccess(kit, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
