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
 * GET /api/v1/brand-kits/[kitId]/resources — Retrieves real assigned resources (QRs, pages, campaigns)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { kitId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:read",
      permission: "brand.read",
    });

    const resources = await SupabaseBrandKitRepository.getAssignedResources(
      ctx.organizationId,
      kitId
    );

    return apiSuccess(resources, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
