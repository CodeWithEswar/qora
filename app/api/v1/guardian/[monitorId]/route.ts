import { NextRequest } from "next/server";
import { UpdateGuardianMonitorRequestV1Schema, NotFoundError } from "@nxtqr/contracts";
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
 * GET /api/v1/guardian/[monitorId] — Fetches monitor details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:read",
      permission: "guardian.read",
    });

    const { monitorId } = await params;
    const monitor = await SupabaseGuardianRepository.getMonitorById(ctx.organizationId, monitorId);
    if (!monitor) throw new NotFoundError("Guardian monitor not found");

    return apiSuccess(monitor, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/guardian/[monitorId] — Updates monitor policy or status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:manage",
      permission: "guardian.manage",
    });

    const { monitorId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = UpdateGuardianMonitorRequestV1Schema.parse(rawBody);

    const updated = await SupabaseGuardianRepository.updateMonitor(
      ctx.organizationId,
      monitorId,
      payload
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/guardian/[monitorId] — Cascade-safe removal of a monitor
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "guardian:manage",
      permission: "guardian.manage",
    });

    const { monitorId } = await params;
    await SupabaseGuardianRepository.deleteMonitor(ctx.organizationId, monitorId);

    return apiSuccess({ deleted: true, monitorId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
