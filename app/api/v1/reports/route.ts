import { NextRequest } from "next/server";
import {
  CreateReportRequestV1Schema,
  ReportJobCreatedResponseV1,
  ReportJobV1,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiAccepted,
  handleApiError,
  checkIdempotency,
  recordIdempotentResponse,
} from "@/lib/api";
import { generateOpaqueId } from "@nxtqr/db";

/**
 * POST /api/v1/reports — Submit Asynchronous Report Job (HTTP 202 Accepted)
 * Pipeline: Auth -> Entitlement -> Validate -> Create D1 Job -> Enqueue ReportJobV1 -> 202.
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "reports:write",
      permission: "analytics.export",
      entitlement: "analytics.export",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateReportRequestV1Schema.parse(rawBody);

    // Idempotency check
    const idempotencyKey = request.headers.get("idempotency-key");
    const reservation = await checkIdempotency(
      ctx.db,
      ctx.principal,
      "/api/v1/reports",
      "POST",
      idempotencyKey,
      payload
    );
    if (reservation.cachedResponse) {
      return reservation.cachedResponse;
    }

    const jobId = generateOpaqueId("rep");
    const now = Math.floor(Date.now() / 1000);
    const fromSec = Math.floor(new Date(payload.from).getTime() / 1000);
    const toSec = Math.floor(new Date(payload.to).getTime() / 1000);

    const d1 = ctx.db;
    if (d1) {
      const insertSql = `
        INSERT INTO report_jobs (
          id, organization_id, name, format, status, range_from, range_to, created_by, created_at
        ) VALUES (?, ?, ?, ?, 'QUEUED', ?, ?, ?, ?)
      `;
      await d1.prepare(insertSql).bind(
        jobId,
        ctx.organizationId,
        `${payload.reportType.toUpperCase()} Export`,
        payload.format,
        fromSec,
        toSec,
        ctx.principal.actorId,
        now
      ).run();
    }

    // 1. Dispatch Queue Job: ReportJobV1 (if Cloudflare Queue is bound)
    const reportQueue = (request as any).env?.REPORT_QUEUE;
    const queueMessage: ReportJobV1 = {
      schemaVersion: 1,
      jobId,
      organizationId: ctx.organizationId,
      reportId: jobId,
      reportType: payload.reportType,
      format: payload.format,
      dateRange: { start: fromSec, end: toSec },
      filters: { qrId: payload.qrId, campaignId: payload.campaignId },
      requestedBy: ctx.principal.actorId,
      enqueuedAt: now,
    };

    if (reportQueue && typeof reportQueue.send === "function") {
      try {
        await reportQueue.send(queueMessage);
      } catch (err) {
        console.warn("Failed to enqueue ReportJobV1 to Cloudflare Queue:", err);
      }
    }

    // 2. Emit internal domain event: report.requested
    const event = createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.REPORT_REQUESTED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "report", id: jobId },
      data: {
        reportId: jobId,
        organizationId: ctx.organizationId,
        reportType: payload.reportType,
        format: payload.format,
        requestedBy: ctx.principal.actorId,
      },
    });

    const response: ReportJobCreatedResponseV1 = {
      jobId,
      status: "queued",
      reportType: payload.reportType,
      format: payload.format,
      enqueuedAt: new Date(now * 1000).toISOString(),
      checkStatusUrl: `/api/v1/reports/${jobId}`,
    };

    await recordIdempotentResponse(
      ctx.db,
      ctx.principal,
      "/api/v1/reports",
      reservation.key,
      202,
      { data: response }
    );

    return apiAccepted(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
