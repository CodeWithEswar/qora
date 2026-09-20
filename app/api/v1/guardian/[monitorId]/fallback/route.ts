import { NextRequest } from "next/server";
import { ConfigureFallbackRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseGuardianRepository } from "@/lib/supabase/repositories/guardian";

interface RouteParams {
  params: Promise<{ monitorId: string }>;
}

/**
 * POST /api/v1/guardian/[monitorId]/fallback — Configures or updates automated fallback policy
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:manage",
      permission: "guardian.manage",
    });

    const { monitorId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = ConfigureFallbackRequestV1Schema.parse(rawBody);

    await SupabaseGuardianRepository.configureFallback(
      ctx.organizationId,
      monitorId,
      payload
    );

    const updated = await SupabaseGuardianRepository.getMonitorById(
      ctx.organizationId,
      monitorId
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
