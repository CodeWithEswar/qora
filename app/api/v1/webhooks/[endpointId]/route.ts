import { NextRequest } from "next/server";
import { NotFoundError } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiNoContent,
  handleApiError,
} from "@/lib/api";

interface Params {
  params: Promise<{ endpointId: string }>;
}

/**
 * DELETE /api/v1/webhooks/:id — Delete/Disable Webhook Endpoint
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "webhooks:manage",
      permission: "api_keys.manage",
    });

    const { endpointId } = await params;
    const d1 = ctx.db;

    if (d1) {
      const checkSql = `SELECT id FROM webhook_endpoints WHERE id = ? AND organization_id = ?`;
      const ep = await d1.prepare(checkSql).bind(endpointId, ctx.organizationId).first();
      if (!ep) {
        throw new NotFoundError(`Webhook endpoint '${endpointId}' was not found.`);
      }

      await d1.prepare(`DELETE FROM webhook_endpoints WHERE id = ? AND organization_id = ?`).bind(endpointId, ctx.organizationId).run();
    }

    return apiNoContent(ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
