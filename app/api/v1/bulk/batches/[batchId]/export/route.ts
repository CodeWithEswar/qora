import { NextRequest, NextResponse } from "next/server";
import {
  authorizeApiRequest,
  handleApiError,
} from "@/lib/api";
import { BulkQrStore } from "@/lib/domains/bulk-qr/store";
import { generateBulkResultsCsv } from "@/lib/domains/bulk-qr/exporter";

interface Params {
  params: Promise<{ batchId: string }>;
}

/**
 * GET /api/v1/bulk/batches/:batchId/export
 * Downloads the complete CSV execution results report for the batch.
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

    const csvData = generateBulkResultsCsv(batch.name, batch.rows);
    const cleanFilename = `nxtqr-batch-${batch.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}-results.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${cleanFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_export");
  }
}
