import { NextRequest } from "next/server";
import {
  UpdateQrMetadataRequestV1Schema,
  QrResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import { buildQrResolverUrl } from "@nxtqr/config";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * GET /api/v1/qrs/:id — Read Single QR Asset
 * Safe 404: Returns 404 for cross-tenant lookups rather than revealing existence.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const { qrId } = await params;
    const row = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!row) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const qr: QrResponseV1 = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: (row.qrType as any) || "url",
      mode: row.isDynamic ? "dynamic" : "static",
      status: row.status,
      destinationUrl: row.destinationUrl || "",
      draftDestination: row.draftDestination || row.destinationUrl || "",
      hasUnpublishedChanges: row.hasUnpublishedChanges ?? false,
      fallbackUrl: row.fallbackUrl || undefined,
      scanUrl: buildQrResolverUrl(row.slug),
      currentVersion: row.publishedRevision || 1,
      publishedVersion: row.publishedRevision || 1,
      scans: row.totalScans ?? 0,
      uniqueScans: row.uniqueScans ?? 0,
      campaignId: row.campaignId || undefined,
      folderId: row.folderId || undefined,
      design: row.design || CANONICAL_QR_DESIGN_DEFAULTS,
      createdAt: new Date(row.createdAt * 1000).toISOString(),
      updatedAt: new Date(row.updatedAt * 1000).toISOString(),
    };

    return apiSuccess(qr, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/qrs/:id — Update Metadata
 * Updates metadata only (name, campaign, folder). Does NOT alter published destination or security rules.
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
    const payload = UpdateQrMetadataRequestV1Schema.parse(rawBody);

    const d1 = ctx.db;
    if (d1) {
      // First verify ownership
      const checkSql = `SELECT id, slug, name, qr_type, status, created_at FROM qr_codes WHERE id = ? AND organization_id = ?`;
      const existing = (await d1.prepare(checkSql).bind(qrId, ctx.organizationId).first()) as any;

      if (!existing) {
        throw new NotFoundError(`QR code '${qrId}' was not found.`);
      }

      const now = Math.floor(Date.now() / 1000);
      const updateSql = `
        UPDATE qr_codes
        SET 
          name = COALESCE(?, name),
          status = COALESCE(?, status),
          campaign_id = CASE WHEN ? IS NOT NULL THEN ? ELSE campaign_id END,
          folder_id = CASE WHEN ? IS NOT NULL THEN ? ELSE folder_id END,
          updated_at = ?
        WHERE id = ? AND organization_id = ?
      `;

      await d1.prepare(updateSql).bind(
        payload.name || null,
        payload.status || null,
        payload.campaignId !== undefined ? 1 : null,
        payload.campaignId || null,
        payload.folderId !== undefined ? 1 : null,
        payload.folderId || null,
        now,
        qrId,
        ctx.organizationId
      ).run();
    }

    const row = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!row) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const updated: QrResponseV1 = {
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

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/qrs/:id — Archive or Delete QR Asset
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.delete",
    });

    const { qrId } = await params;
    const url = new URL(request.url);
    const hard = url.searchParams.get("hard") === "true";

    if (hard) {
      await QrStore.deleteQr(qrId, ctx.organizationId, ctx.db);
      return apiSuccess({ id: qrId, deleted: true, status: "DELETED" }, ctx.requestId);
    } else {
      await QrStore.archiveQr(qrId, ctx.organizationId, ctx.db);
      return apiSuccess({ id: qrId, status: "ARCHIVED" }, ctx.requestId);
    }
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

