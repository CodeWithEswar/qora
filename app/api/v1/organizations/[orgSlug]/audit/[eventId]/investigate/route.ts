import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseAuditRepository } from "@/lib/supabase/repositories/audit";

interface Params {
  params: Promise<{ orgSlug: string; eventId: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/audit/:eventId/investigate
 * Retrieves investigation context: preceding, succeeding, same actor, and same target events.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { eventId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "audit.read",
    });

    const context = await SupabaseAuditRepository.getInvestigationContext(
      ctx.organizationId,
      eventId
    );

    return apiSuccess({ investigation: context }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
