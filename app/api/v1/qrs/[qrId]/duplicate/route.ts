import { NextRequest } from "next/server";
import { DuplicateQrRequestV1Schema, QrResponseV1 } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * POST /api/v1/qrs/:qrId/duplicate — Duplicate an existing QR
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.create",
      entitlement: "qr.create",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = DuplicateQrRequestV1Schema.parse(rawBody);

    const row = await QrStore.duplicateQr(
      qrId,
      ctx.organizationId,
      ctx.principal.actorId,
      payload.name,
      ctx.db
    );

    const qr: QrResponseV1 = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: (row.qrType as any) || "url",
      mode: row.isDynamic ? "dynamic" : "static",
      status: row.status,
      destinationUrl: row.destinationUrl || "",
      fallbackUrl: row.fallbackUrl || undefined,
      scanUrl: `https://nxtqr.vercel.app/s/${row.slug}`,
      campaignId: row.campaignId || undefined,
      campaignName: row.campaignName || undefined,
      folderId: row.folderId || undefined,
      ownerId: row.ownerId || undefined,
      ownerName: row.ownerName || undefined,
      ownerEmail: row.ownerEmail || undefined,
      ownerAvatarUrl: row.ownerAvatarUrl || undefined,
      design: row.design || CANONICAL_QR_DESIGN_DEFAULTS,
      createdAt: new Date(row.createdAt * 1000).toISOString(),
      updatedAt: new Date(row.updatedAt * 1000).toISOString(),
    };

    return apiSuccess(qr, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
