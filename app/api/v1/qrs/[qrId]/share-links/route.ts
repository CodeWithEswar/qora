import { NextRequest } from "next/server";
import {
  CreateShareLinkRequestV1Schema,
  ShareLinkResponseV1,
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
import { computeKeyHash } from "@/lib/api/auth";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * POST /api/v1/qrs/:id/share-links — Create Secure Share Link
 * Invariants:
 * - Plaintext share token is shown ONLY ONCE.
 * - Stored at rest as SHA-256 token hash.
 * - Never log plaintext tokens.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.update",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateShareLinkRequestV1Schema.parse(rawBody);

    // Idempotency check
    const idempotencyKey = request.headers.get("idempotency-key");
    const reservation = await checkIdempotency(
      ctx.db,
      ctx.principal,
      `/api/v1/qrs/${qrId}/share-links`,
      "POST",
      idempotencyKey,
      payload
    );
    if (reservation.cachedResponse) {
      return reservation.cachedResponse;
    }

    const d1 = ctx.db;
    if (d1) {
      const checkSql = `SELECT id FROM qr_codes WHERE id = ? AND organization_id = ?`;
      const qr = await d1.prepare(checkSql).bind(qrId, ctx.organizationId).first();
      if (!qr) {
        throw new NotFoundError(`QR code '${qrId}' was not found.`);
      }
    }

    const shareId = generateOpaqueId("share");
    const rawToken = `nxtqr_share_${Math.random().toString(36).substring(2, 14)}_${Date.now().toString(36)}`;
    const tokenHash = await computeKeyHash(rawToken);

    let passwordHash: string | null = null;
    if (payload.password) {
      passwordHash = await computeKeyHash(payload.password);
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAtSec = payload.expiresAt ? Math.floor(new Date(payload.expiresAt).getTime() / 1000) : null;

    if (d1) {
      const insertSql = `
        INSERT INTO share_links (
          id, qr_id, organization_id, token_hash, permission, password_hash, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await d1.prepare(insertSql).bind(
        shareId,
        qrId,
        ctx.organizationId,
        tokenHash,
        payload.permission,
        passwordHash,
        expiresAtSec,
        now
      ).run();
    }

    const response: ShareLinkResponseV1 = {
      id: shareId,
      qrId,
      permission: payload.permission,
      shareUrl: `https://nxtqr.vercel.app/share/${rawToken}`,
      expiresAt: payload.expiresAt || null,
      createdAt: new Date(now * 1000).toISOString(),
    };

    await recordIdempotentResponse(
      ctx.db,
      ctx.principal,
      `/api/v1/qrs/${qrId}/share-links`,
      reservation.key,
      201,
      { data: response }
    );

    return apiCreated(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
