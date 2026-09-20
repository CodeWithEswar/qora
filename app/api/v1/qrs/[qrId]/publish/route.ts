import { NextRequest } from "next/server";
import {
  PublishQrRequestV1Schema,
  QrResponseV1,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { ResolverPublisher } from "@/lib/domains/resolver-publisher";
import { QrStore } from "@/lib/domains/qr-store";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * POST /api/v1/qrs/:id/publish — Explicit Command Endpoint
 * Commits to D1 immutable versions, compiles snapshot, and publishes to Cloudflare KV.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.publish",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = PublishQrRequestV1Schema.parse(rawBody);

    const kv = (request as any).env?.REDIRECT_KV;

    // Delegate to canonical ResolverPublisher service
    const pubResult = await ResolverPublisher.publishResolverSnapshot({
      qrId,
      organizationId: ctx.organizationId,
      actorId: ctx.principal.actorId,
      actorType: ctx.principal.type === "session" ? "user" : "api_key",
      expectedVersion: payload.expectedVersion,
      changeSummary: payload.changeSummary || "Published revision to Edge",
      db: ctx.db,
      kv,
    });

    // Re-fetch updated QR for complete response
    const updated = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);

    const response: QrResponseV1 = {
      id: qrId,
      slug: pubResult.slug,
      name: updated?.name || "QR Asset",
      type: updated?.qrType || "url",
      mode: updated?.isDynamic ? "dynamic" : "static",
      status: "ACTIVE",
      destinationUrl: pubResult.destinationUrl,
      draftDestination: pubResult.destinationUrl,
      hasUnpublishedChanges: false,
      scanUrl: pubResult.resolverUrl,
      currentVersion: pubResult.publishedRevision,
      publishedVersion: pubResult.publishedRevision,
      design: updated?.design || CANONICAL_QR_DESIGN_DEFAULTS,
      createdAt: updated ? new Date(updated.createdAt * 1000).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return apiSuccess(response, ctx.requestId, 200, {
      published: true,
      revision: pubResult.publishedRevision,
      edgeUpdated: pubResult.edgeUpdated,
      edgeUpdatePending: pubResult.edgeUpdatePending,
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
