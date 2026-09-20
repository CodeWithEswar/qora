import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseGuardianRepository } from "@/lib/supabase/repositories/guardian";

/**
 * GET /api/v1/guardian/incidents — Lists destination health incidents for the organization
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:read",
      permission: "guardian.read",
    });

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";

    const incidents = await SupabaseGuardianRepository.listIncidentsByOrg(
      ctx.organizationId,
      status
    );

    return apiSuccess(incidents, ctx.requestId, 200, { total: incidents.length });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
