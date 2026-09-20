import { NextRequest } from "next/server";
import { BulkQrActionRequestV1Schema } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";

/**
 * POST /api/v1/qrs/bulk — Atomic bulk QR lifecycle operations
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    const rawBody = await request.json().catch(() => ({}));
    const payload = BulkQrActionRequestV1Schema.parse(rawBody);

    const requiredPermission =
      payload.action === "delete" || payload.action === "archive"
        ? "qr.delete"
        : "qr.update";

    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: requiredPermission,
    });

    let affectedCount = 0;

    switch (payload.action) {
      case "pause":
        affectedCount = await QrStore.bulkUpdateStatus(
          payload.qrIds,
          ctx.organizationId,
          "PAUSED",
          ctx.db
        );
        break;

      case "resume":
        affectedCount = await QrStore.bulkUpdateStatus(
          payload.qrIds,
          ctx.organizationId,
          "ACTIVE",
          ctx.db
        );
        break;

      case "archive":
        affectedCount = await QrStore.bulkDelete(
          payload.qrIds,
          ctx.organizationId,
          false,
          ctx.db
        );
        break;

      case "delete":
        affectedCount = await QrStore.bulkDelete(
          payload.qrIds,
          ctx.organizationId,
          true,
          ctx.db
        );
        break;

      case "move_campaign":
        affectedCount = await QrStore.bulkMoveCampaign(
          payload.qrIds,
          ctx.organizationId,
          payload.campaignId || null,
          ctx.db
        );
        break;
    }

    return apiSuccess(
      {
        action: payload.action,
        affectedCount,
        qrIds: payload.qrIds,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
