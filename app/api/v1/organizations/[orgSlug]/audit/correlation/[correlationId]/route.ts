import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseAuditRepository } from "@/lib/supabase/repositories/audit";

interface Params {
  params: Promise<{ orgSlug: string; correlationId: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/audit/correlation/:correlationId
 * Retrieves correlated trace events sharing the same correlation ID or request ID.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { correlationId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "audit.read",
    });

    const events = await SupabaseAuditRepository.getCorrelatedTrace(
      ctx.organizationId,
      correlationId
    );

    return apiSuccess({ correlationId, events }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
