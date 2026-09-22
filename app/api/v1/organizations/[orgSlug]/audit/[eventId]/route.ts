import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseAuditRepository } from "@/lib/supabase/repositories/audit";

interface Params {
  params: Promise<{ orgSlug: string; eventId: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/audit/:eventId
 * Retrieves comprehensive forensic detail for a single audit event.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { eventId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "audit.read",
    });

    const event = await SupabaseAuditRepository.getAuditEventDetail(
      ctx.organizationId,
      eventId
    );

    return apiSuccess({ event }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
