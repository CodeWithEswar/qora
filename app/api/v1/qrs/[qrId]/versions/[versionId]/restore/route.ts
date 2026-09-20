import { NextRequest } from "next/server";
import { NotFoundError } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";

interface Params {
  params: Promise<{ qrId: string; versionId: string }>;
}

/**
 * POST /api/v1/qrs/:qrId/versions/:versionId/restore — Restore historical version
 * Invariant 13 & Rule 67: RESTORE MUST NOT MUTATE HISTORY.
 * Restoring loads the historical version snapshot into a NEW working draft.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.update",
    });

    const { qrId, versionId } = await params;

    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const result = await QrStore.restoreVersion(
      qrId,
      versionId,
      ctx.organizationId,
      ctx.principal.actorId,
      ctx.db
    );

    return apiSuccess(
      {
        restored: true,
        qrId,
        newDraftVersion: result.draftVersion,
        content: result.content,
        design: result.design,
        updatedAt: new Date().toISOString(),
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
