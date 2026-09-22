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
 * POST /api/v1/bulk/batches/:batchId/process
 * Executes a single bounded chunk of pending rows for the batch.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.create",
    });

    const { batchId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chunkSize = Math.min(100, Math.max(5, parseInt(searchParams.get("chunkSize") || "25", 10)));

    const result = await BulkQrProcessor.processBatchChunk(
      batchId,
      ctx.organizationId,
      ctx.principal.actorId,
      chunkSize
    );

    return apiSuccess(result, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_process");
  }
}
