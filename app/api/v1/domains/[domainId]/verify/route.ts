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
 * POST /api/v1/domains/[domainId]/verify — Triggers real DNS verification
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { domainId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "domains:manage",
      permission: "domains.manage",
    });

    const result = await SupabaseDomainRepository.verify(
      ctx.organizationId,
      domainId,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
