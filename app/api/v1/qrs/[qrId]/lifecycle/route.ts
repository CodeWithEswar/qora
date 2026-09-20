import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError, ValidationError, buildResolverKvKey } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";
import { RESOLVER_CONFIG } from "@nxtqr/config";

interface Params {
  params: Promise<{ qrId: string }>;
}

const LifecycleSchema = z.object({
  action: z.enum(["PAUSE", "RESUME", "ARCHIVE"]),
});

/**
 * PATCH /api/v1/qrs/:id/lifecycle
 * Consequentially changes QR operational lifecycle (ACTIVE <-> PAUSED <-> ARCHIVED)
 * and immediately reflects the state at the Cloudflare KV edge resolver.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.update",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const { action } = LifecycleSchema.parse(rawBody);

    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const newStatus = action === "PAUSE" ? "PAUSED" : action === "RESUME" ? "ACTIVE" : "ARCHIVED";

    if (qr.status === newStatus) {
      return apiSuccess({ qrId, status: newStatus, message: `QR is already ${newStatus}` }, ctx.requestId);
    }

    // Update D1
    if (ctx.db) {
      const now = Math.floor(Date.now() / 1000);
      await ctx.db
        .prepare(
          `UPDATE qr_codes
           SET status = ?, updated_at = ?
           WHERE id = ? AND organization_id = ?`
        )
        .bind(newStatus, now, qrId, ctx.organizationId)
        .run();
    }

    // Update KV snapshot lifecycle status so edge immediately responds with 503 Paused or 302 Active
    const kv = (request as any).env?.REDIRECT_KV;
    let edgeUpdated = false;
    if (kv) {
      try {
        const host = RESOLVER_CONFIG.defaultHost;
        const primaryKey = buildResolverKvKey({ host, slug: qr.slug });
        const existingSnapshot = await kv.get(primaryKey, "json");
        if (existingSnapshot) {
          existingSnapshot.status = newStatus;
          if (existingSnapshot.lifecycle) {
            existingSnapshot.lifecycle.status = newStatus;
          }
          await kv.put(primaryKey, JSON.stringify(existingSnapshot));
          edgeUpdated = true;
        }
      } catch (kvErr) {
        console.warn("[lifecycle] KV snapshot update warning:", kvErr);
      }
    }

    return apiSuccess(
      {
        qrId,
        slug: qr.slug,
        status: newStatus,
        edgeUpdated,
        message: `QR code lifecycle set to ${newStatus}.`,
      },
      ctx.requestId,
      200
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
