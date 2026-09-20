import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";

interface Params {
  params: Promise<{ qrId: string }>;
}

const RestoreVersionSchema = z.object({
  versionId: z.string().min(1, "Version ID is required"),
});

/**
 * POST /api/v1/qrs/:id/restore
 * Restores a historical immutable version as a new working draft in D1.
 * Invariant: Restoring never overwrites history and does not auto-publish to live edge.
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
    const { versionId } = RestoreVersionSchema.parse(rawBody);

    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const restored = await QrStore.restoreVersion(
      qrId,
      versionId,
      ctx.organizationId,
      ctx.principal.actorId,
      ctx.db
    );

    const draftDestination = (restored.content as any)?.url || qr.destinationUrl;

    return apiSuccess(
      {
        qrId,
        restoredVersionId: versionId,
        draftVersion: restored.draftVersion,
        draftDestination,
        publishedDestination: qr.destinationUrl,
        hasUnpublishedChanges: draftDestination !== qr.destinationUrl,
        message: "Historical revision restored as working draft. Review and publish to make live at edge.",
      },
      ctx.requestId,
      200
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
