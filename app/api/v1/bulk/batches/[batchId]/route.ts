import { NextRequest } from "next/server";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { BulkQrStore } from "@/lib/domains/bulk-qr/store";

interface Params {
  params: Promise<{ batchId: string }>;
}

/**
 * GET /api/v1/bulk/batches/:batchId
 * Retrieves detailed batch state, manifest, design policy, and row results.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const { batchId } = await params;
    const batch = await BulkQrStore.getBatch(batchId, ctx.organizationId);

    if (!batch) {
      return handleApiError(new Error("Batch not found or inaccessible"), ctx.requestId);
    }

    return apiSuccess(batch, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_get");
  }
}

/**
 * DELETE /api/v1/bulk/batches/:batchId
 * Deletes batch history tracking. Guaranteed not to delete created QR assets.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.delete",
    });

    const { batchId } = await params;
    const success = await BulkQrStore.deleteBatch(batchId, ctx.organizationId);

    if (!success) {
      return handleApiError(new Error("Failed to delete batch history or batch not found."), ctx.requestId);
    }

    return apiSuccess({ deleted: true, batchId }, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_delete");
  }
}
