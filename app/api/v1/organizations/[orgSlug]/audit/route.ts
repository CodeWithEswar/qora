import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseAuditRepository } from "@/lib/supabase/repositories/audit";
import { AuditFilterParamsSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/audit
 * Retrieves cursor-paginated audit records, signal rail metrics, and temporal density.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "audit.read",
    });

    const searchParams = request.nextUrl.searchParams;
    const filterInput = {
      range: searchParams.get("range") || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      lens: searchParams.get("lens") || "all",
      actorId: searchParams.get("actorId") || undefined,
      actorType: searchParams.get("actorType") || undefined,
      action: searchParams.get("action") || undefined,
      resourceType: searchParams.get("resourceType") || undefined,
      resourceId: searchParams.get("resourceId") || undefined,
      result: searchParams.get("result") || "all",
      search: searchParams.get("search") || undefined,
      myActions: searchParams.get("myActions") === "true",
      hasChanges: searchParams.get("hasChanges") === "true",
      correlationId: searchParams.get("correlationId") || undefined,
      eventId: searchParams.get("eventId") || undefined,
      cursor: searchParams.get("cursor") || undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 25,
    };

    const validatedFilters = AuditFilterParamsSchema.parse(filterInput);

    const overview = await SupabaseAuditRepository.getAuditLedgerOverview(
      orgSlug,
      validatedFilters,
      ctx.principal.actorId
    );

    return apiSuccess(overview, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
