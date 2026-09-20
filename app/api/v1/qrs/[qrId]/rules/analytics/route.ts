import { NextRequest } from "next/server";
import {
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { getRuleAnalytics } from "@/lib/domains/routing";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * GET /api/v1/qrs/:id/rules/analytics — Rule-Level Scan Analytics
 * Aggregates real scan telemetry from D1 scan_events_hourly for this QR.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "routing.read",
      entitlement: "routing.rules",
    });

    const { qrId } = await params;
    const url = new URL(request.url);
    const periodDays = parseInt(url.searchParams.get("period") || "30", 10);

    const report = await getRuleAnalytics(qrId, ctx.organizationId, ctx.db, periodDays);

    return apiSuccess(report, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
