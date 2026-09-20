import { NextRequest } from "next/server";
import { CreateGuardianMonitorRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  apiCreated,
  handleApiError,
} from "@/lib/api";
import { SupabaseGuardianRepository } from "@/lib/supabase/repositories/guardian";

/**
 * GET /api/v1/guardian — Lists destination monitors and pulse metrics for the authenticated workspace
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:read",
      permission: "guardian.read",
    });

    const url = new URL(request.url);
    const health = url.searchParams.get("health") || "all";
    const search = url.searchParams.get("search") || "";

    const [{ items, total }, pulse] = await Promise.all([
      SupabaseGuardianRepository.listMonitorsByOrg(ctx.organizationId, { health, search }),
      SupabaseGuardianRepository.getPulseMetrics(ctx.organizationId),
    ]);

    return apiSuccess(items, ctx.requestId, 200, { total, pulse });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/guardian — Enrolls a new destination into Guardian monitoring
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:manage",
      permission: "guardian.manage",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateGuardianMonitorRequestV1Schema.parse(rawBody);

    const created = await SupabaseGuardianRepository.createMonitor(
      ctx.organizationId,
      ctx.principal.actorId,
      payload
    );

    return apiCreated(created, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
