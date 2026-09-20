import { NextRequest } from "next/server";
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
 * POST /api/v1/guardian/[monitorId]/check — Triggers an immediate server-side health probe
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:manage",
      permission: "guardian.manage",
    });

    const { monitorId } = await params;
    const result = await SupabaseGuardianRepository.runManualCheck(
      ctx.organizationId,
      monitorId
    );

    return apiSuccess(result, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
