import { NextRequest } from "next/server";
import {
  QrAnalyticsQuerySchema,
  QrAnalyticsResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * GET /api/v1/qrs/:id/analytics — Aggregate Analytics
 * Returns privacy-aware aggregate metrics. Never exposes raw IPs or full user-agent strings.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "analytics:read",
      permission: "analytics.read",
    });

    const { qrId } = await params;
    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = QrAnalyticsQuerySchema.parse(rawQuery);

    const d1 = ctx.db;
    let totalScans = 0;
    let estimatedUniqueScans = 0;
    let timeseries: Array<{ timestamp: string; scans: number; estimatedUniqueScans: number }> = [];
    const devices: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const operatingSystems: Record<string, number> = {};

    if (d1) {
      // 1. Verify QR ownership
      const checkSql = `SELECT id FROM qr_codes WHERE id = ? AND organization_id = ?`;
      const qr = await d1.prepare(checkSql).bind(qrId, ctx.organizationId).first();
      if (!qr) {
        throw new NotFoundError(`QR code '${qrId}' was not found.`);
      }

      // 2. Query aggregate rollups from scan_events_hourly
      const rollupSql = `
        SELECT 
          hour_bucket as hourBucket,
          SUM(total_scans) as scans,
          SUM(unique_scans) as uniques,
          device_type as device,
          country_code as country,
          os_name as os
        FROM scan_events_hourly
        WHERE qr_id = ? AND organization_id = ?
        GROUP BY hour_bucket, device_type, country_code, os_name
        ORDER BY hour_bucket ASC
        LIMIT 500
      `;
      const rollups = ((await d1.prepare(rollupSql).bind(qrId, ctx.organizationId).all()) as any) || {};
      const results = rollups.results || [];

      for (const row of results) {
        const sc = Number(row.scans) || 0;
        const un = Number(row.uniques) || 0;
        totalScans += sc;
        estimatedUniqueScans += un;

        if (row.device) devices[row.device] = (devices[row.device] || 0) + sc;
        if (row.country) countries[row.country] = (countries[row.country] || 0) + sc;
        if (row.os) operatingSystems[row.os] = (operatingSystems[row.os] || 0) + sc;

        timeseries.push({
          timestamp: new Date(Number(row.hourBucket)).toISOString(),
          scans: sc,
          estimatedUniqueScans: un,
        });
      }
    }

    const response: QrAnalyticsResponseV1 = {
      qrId,
      period: {
        from: query.from || new Date(Date.now() - 30 * 86400000).toISOString(),
        to: query.to || new Date().toISOString(),
        granularity: query.granularity,
        timezone: query.timezone,
      },
      metrics: {
        totalScans,
        estimatedUniqueScans,
      },
      timeseries,
      breakdowns: {
        devices,
        countries,
        operatingSystems,
      },
    };

    return apiSuccess(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
