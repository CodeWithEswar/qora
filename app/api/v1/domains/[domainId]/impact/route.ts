import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseDomainRepository } from "@/lib/supabase/repositories/domains";

interface RouteParams {
  params: Promise<{ domainId: string }>;
}

/**
 * GET /api/v1/domains/[domainId]/impact — Retrieves real dependency counts before change/deletion
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { domainId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "domains:read",
      permission: "domains.read",
    });

    const impact = await SupabaseDomainRepository.getImpact(ctx.organizationId, domainId);
    return apiSuccess(impact, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
