import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { BulkQrProcessor } from "@/lib/domains/bulk-qr/processor";

interface Params {
  params: Promise<{ batchId: string }>;
}

/**
 * POST /api/v1/bulk/batches/:batchId/cancel
 * Cancels execution for any remaining pending rows in the batch.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.update",
    });

    const { batchId } = await params;
    await BulkQrProcessor.cancelBatch(batchId, ctx.organizationId);

    return apiSuccess({ cancelled: true, batchId }, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_cancel");
  }
}
