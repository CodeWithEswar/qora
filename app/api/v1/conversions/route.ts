import { NextRequest } from "next/server";
import {
  RecordConversionRequestV1Schema,
  ConversionResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  handleApiError,
  checkIdempotency,
  recordIdempotentResponse,
} from "@/lib/api";
import { generateOpaqueId } from "@nxtqr/db";

/**
 * POST /api/v1/conversions — Record Conversion Occurrence
 * Invariants:
 * - Deduplicated via deduplicationId or Idempotency-Key.
 * - No persistent cross-site fingerprinting; zero raw IP stored.
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "conversions:write",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = RecordConversionRequestV1Schema.parse(rawBody);

    // Idempotency check
    const idempotencyKey = request.headers.get("idempotency-key") || payload.deduplicationId || null;
    const reservation = await checkIdempotency(
      ctx.db,
      ctx.principal,
      "/api/v1/conversions",
      "POST",
      idempotencyKey,
      payload
    );
    if (reservation.cachedResponse) {
      return reservation.cachedResponse;
    }

    const d1 = ctx.db;
    let isDuplicate = false;

    if (d1) {
      // 1. Verify QR ownership
      const checkSql = `SELECT id FROM qr_codes WHERE id = ? AND organization_id = ?`;
      const qr = await d1.prepare(checkSql).bind(payload.qrId, ctx.organizationId).first();
      if (!qr) {
        throw new NotFoundError(`Target QR code '${payload.qrId}' not found.`);
      }

      // 2. Check deduplicationId if provided
      if (payload.deduplicationId) {
        const dedupeSql = `SELECT id FROM conversion_events WHERE qr_id = ? AND event_name = ? AND order_id = ? LIMIT 1`;
        const existing = await d1.prepare(dedupeSql).bind(payload.qrId, payload.eventName, payload.deduplicationId).first();
        if (existing) {
          isDuplicate = true;
        }
      }
    }

    const convId = generateOpaqueId("conv");
    const now = Math.floor(Date.now() / 1000);

    if (d1 && !isDuplicate) {
      const insertSql = `
        INSERT INTO conversion_events (
          id, qr_id, organization_id, event_name, event_value, currency, order_id, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await d1.prepare(insertSql).bind(
        convId,
        payload.qrId,
        ctx.organizationId,
        payload.eventName,
        payload.eventValue || null,
        payload.currency || null,
        payload.orderId || payload.deduplicationId || null,
        payload.metadata ? JSON.stringify(payload.metadata) : "{}",
        now
      ).run();
    }

    const response: ConversionResponseV1 = {
      id: convId,
      qrId: payload.qrId,
      eventName: payload.eventName,
      eventValue: payload.eventValue,
      currency: payload.currency,
      recordedAt: new Date(now * 1000).toISOString(),
      isDuplicate,
    };

    await recordIdempotentResponse(
      ctx.db,
      ctx.principal,
      "/api/v1/conversions",
      reservation.key,
      201,
      { data: response }
    );

    return apiCreated(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
