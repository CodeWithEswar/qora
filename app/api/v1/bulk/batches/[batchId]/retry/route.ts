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
 * POST /api/v1/bulk/batches/:batchId/retry
 * Resets all FAILED rows back to PENDING for re-processing.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.create",
    });

    const { batchId } = await params;
    const retriedCount = await BulkQrProcessor.retryFailedRows(batchId, ctx.organizationId);

    return apiSuccess({ retriedCount, batchId }, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_retry");
  }
}
