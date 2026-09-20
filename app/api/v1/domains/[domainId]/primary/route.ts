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
 * POST /api/v1/domains/[domainId]/primary — Designates as primary workspace domain
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { domainId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "domains:manage",
      permission: "domains.manage",
    });

    const updated = await SupabaseDomainRepository.setPrimary(
      ctx.organizationId,
      domainId,
      ctx.principal.actorId
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
