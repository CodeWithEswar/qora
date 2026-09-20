import { NextRequest } from "next/server";
import {
  ReportStatusResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";

interface Params {
  params: Promise<{ reportId: string }>;
}

/**
 * GET /api/v1/reports/:id — Poll Report Status
 * Invariants:
 * - Scoped strictly to authenticated organization.
 * - Raw R2 bucket keys are NEVER exposed directly.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "reports:read",
    });

    const { reportId } = await params;
    const d1 = ctx.db;

    if (d1) {
      const sql = `
        SELECT 
          id, format, status, r2_asset_id as r2AssetId, error_message as errorMessage,
          created_at as createdAt, completed_at as completedAt
        FROM report_jobs
        WHERE id = ? AND organization_id = ?
        LIMIT 1
      `;
      const row = (await d1.prepare(sql).bind(reportId, ctx.organizationId).first()) as any;

      if (!row) {
        throw new NotFoundError(`Report '${reportId}' was not found.`);
      }

      const status = (row.status?.toLowerCase() || "queued") as any;
      const downloadUrl = row.r2AssetId ? `https://nxtqr.vercel.app/api/v1/reports/${reportId}/download` : null;

      const response: ReportStatusResponseV1 = {
        jobId: row.id,
        status,
        reportType: "scans",
        format: (row.format?.toLowerCase() || "csv") as any,
        downloadUrl,
        error: row.errorMessage || null,
        createdAt: new Date(Number(row.createdAt) * 1000).toISOString(),
        completedAt: row.completedAt ? new Date(Number(row.completedAt) * 1000).toISOString() : null,
      };

      return apiSuccess(response, ctx.requestId);
    }

    throw new NotFoundError(`Report '${reportId}' was not found.`);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
