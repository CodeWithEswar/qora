/**
 * NXTQR — Scan Event Queue Consumer
 * Ingests ScanEventV1 payloads, writes to Analytics Engine, and updates D1 hourly rollups.
 */

import { ScanEventV1 } from "@nxtqr/contracts";

export async function processScanEventsBatch(
  messages: Array<{ body: ScanEventV1 }>,
  env: { DB?: any; SCAN_ANALYTICS?: any }
): Promise<void> {
  for (const msg of messages) {
    const event = msg.body;
    if (!event || (!event.qrId && !event.eventId)) continue;

    // 1. Emit to Cloudflare Analytics Engine
    if (env.SCAN_ANALYTICS && typeof env.SCAN_ANALYTICS.writeDataPoint === "function") {
      try {
        env.SCAN_ANALYTICS.writeDataPoint({
          blobs: [
            event.organizationId || "unknown_org",
            event.qrId || "unknown_qr",
            event.country || "XX",
            event.deviceClass || "DESKTOP",
            event.osFamily || "UNKNOWN",
            event.browserFamily || "UNKNOWN",
            event.trafficQuality || "NORMAL",
            event.routingRuleId || "none",
            event.experimentVariantId || "none",
          ],
          doubles: [
            1,
            event.trafficQuality === "SUSPECTED_AUTOMATION" ? 1 : 0,
            event.isFallback ? 1 : 0,
          ],
          indexes: [event.organizationId || "unknown_org"],
        });
      } catch (err) {
        console.error("Analytics Engine emit error:", err);
      }
    }

    // 2. Aggregate Rollup into D1 scan_events_hourly
    if (env.DB) {
      const timestamp = event.occurredAt ? new Date(event.occurredAt).getTime() : Date.now();
      const hourBucket = Math.floor(timestamp / 3600000) * 3600000;
      const country = (event.country || "XX").toUpperCase();
      const deviceType = (event.deviceClass || "desktop").toLowerCase();
      const osName = event.osFamily || "Unknown";
      const browserName = event.browserFamily || "Unknown";

      const upsertSql = `
        INSERT INTO scan_events_hourly (
          id, qr_id, organization_id, hour_bucket, total_scans, estimated_unique_scans,
          country_code, device_type, os_name, browser_name
        ) VALUES (
          ?, ?, ?, ?, 1, 1, ?, ?, ?, ?
        )
        ON CONFLICT(qr_id, hour_bucket, country_code, device_type, os_name) DO UPDATE SET
          total_scans = total_scans + 1
      `;

      const id = `scan_${event.qrId}_${hourBucket}_${country}_${deviceType}_${osName.replace(/[^a-zA-Z0-9]/g, "")}`;

      try {
        await env.DB.prepare(upsertSql).bind(
          id,
          event.qrId,
          event.organizationId,
          hourBucket,
          country,
          deviceType,
          osName,
          browserName
        ).run();
      } catch (err) {
        console.error("D1 hourly rollup error:", err);
      }
    }
  }
}
