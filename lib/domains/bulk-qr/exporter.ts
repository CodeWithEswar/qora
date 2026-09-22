/**
 * NXTQR — Bulk Results CSV Exporter
 * Formats and streams execution results report for any completed or partial batch.
 */

import { buildQrResolverUrl } from "@nxtqr/config";

/**
 * Generates an RFC 4180-compliant CSV report of batch execution results.
 */
export function generateBulkResultsCsv(
  batchNameOrRows: string | any[],
  maybeRows?: any[]
): string {
  const rows: any[] = Array.isArray(batchNameOrRows)
    ? batchNameOrRows
    : Array.isArray(maybeRows)
    ? maybeRows
    : [];

  const headers = [
    "Row Number",
    "QR Name",
    "QR ID",
    "Status",
    "Stable Resolver URL",
    "Destination URL",
    "QR Type",
    "Campaign",
    "Folder",
    "Error Code",
    "Error Message",
  ];

  const lines = [headers.join(",")];

  for (const r of rows) {
    const rowNumber = r.sourceRowNumber || r.source_row_number || "";
    const name = r.name || r.normalized_payload?.name || "";
    const qrId = r.qrId || r.qr_id || "";
    const slug = r.slug || r.customSlug || r.custom_slug || (qrId ? qrId : "");
    const resolverUrl = slug ? buildQrResolverUrl(slug) : "";
    const status = r.executionStatus || r.execution_status || r.validationStatus || r.validation_status || "PENDING";
    const destUrl = r.destinationUrl || r.destination_url || r.normalized_payload?.destination_url || "";
    const qrType = r.type || r.qr_type || r.normalized_payload?.qr_type || "url";
    const campaign = r.campaignName || r.campaign_id || "";
    const folder = r.folderName || r.folder_id || "";
    const errorCode = r.errorCode || r.error_code || "";
    const errorMessage = r.errorMessage || (r.validation_errors?.[0]?.message) || "";

    const values = [
      String(rowNumber),
      name,
      qrId,
      status,
      resolverUrl,
      destUrl,
      qrType,
      campaign,
      folder,
      errorCode,
      errorMessage,
    ];

    const escaped = values.map((val) => `"${String(val).replace(/"/g, '""')}"`);
    lines.push(escaped.join(","));
  }

  return lines.join("\r\n");
}
