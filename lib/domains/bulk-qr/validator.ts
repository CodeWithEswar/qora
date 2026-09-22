/**
 * NXTQR — Bulk Row Validation & Scanability Engine
 * Reuses authoritative schemas from @nxtqr/qr-core and validates against SSRF risks.
 */

import {
  evaluateScanability,
  CANONICAL_QR_DESIGN_DEFAULTS,
  QrDesignV1,
} from "@nxtqr/qr-core";
import {
  ValidatedBulkRow,
  RowValidationError,
  BulkValidationStatus,
  BatchManifest,
  BulkSourceType,
  BulkCreationMode,
} from "./types";
import { NormalizedRow } from "./normalizer";

// Prohibited SSRF destinations
const PROHIBITED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254", // Cloud metadata
  "::1",
];

const PROHIBITED_PATTERNS = [
  /^10\./, // 10.0.0.0/8
  /^192\.168\./, // 192.168.0.0/16
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /\.local$/i,
  /\.internal$/i,
];

/**
 * Validates a single destination URL for safety and format.
 */
export function validateDestinationSafety(url: string): { valid: boolean; reason?: string } {
  if (!url || !url.trim()) {
    return { valid: false, reason: "Destination URL cannot be empty." };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, reason: `Protocol '${parsed.protocol}' is not allowed. Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (PROHIBITED_HOSTS.includes(hostname)) {
      return { valid: false, reason: `Host '${hostname}' is prohibited (internal loopback or cloud metadata address).` };
    }

    for (const pattern of PROHIBITED_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, reason: `Internal private network address '${hostname}' cannot be used as a public QR destination.` };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Malformed URL syntax. Please ensure the destination is a valid web address." };
  }
}

/**
 * Validates a single normalized bulk row and runs scanability diagnostics.
 */
export function validateBulkRow(
  row: NormalizedRow,
  design: QrDesignV1 = CANONICAL_QR_DESIGN_DEFAULTS
): ValidatedBulkRow {
  const errors: RowValidationError[] = [];

  // 1. Name Check
  if (!row.name || !row.name.trim()) {
    errors.push({
      field: "name",
      message: "QR asset name is required.",
      severity: "block",
      code: "MISSING_NAME",
    });
  } else if (row.name.length > 120) {
    errors.push({
      field: "name",
      message: "Name exceeds 120 characters.",
      severity: "warning",
      code: "LONG_NAME",
    });
  }

  // 2. Type & Destination Check
  const webTypes = ["url", "platform_link", "app", "file"];
  if (webTypes.includes(row.type) || !row.type) {
    if (!row.destinationUrl) {
      errors.push({
        field: "destinationUrl",
        message: "Destination URL is required for web-routable QR codes.",
        severity: "block",
        code: "MISSING_DESTINATION",
      });
    } else {
      const safety = validateDestinationSafety(row.destinationUrl);
      if (!safety.valid) {
        errors.push({
          field: "destinationUrl",
          message: safety.reason || "Invalid destination URL.",
          severity: "block",
          code: "INVALID_DESTINATION",
        });
      } else if (row.destinationUrl.length > 800) {
        errors.push({
          field: "destinationUrl",
          message: "URL is very long (>800 chars). High module density may reduce scanability in challenging lighting.",
          severity: "warning",
          code: "HIGH_DENSITY_URL",
        });
      }
    }

    // Fallback URL if specified
    if (row.fallbackUrl) {
      const fbSafety = validateDestinationSafety(row.fallbackUrl);
      if (!fbSafety.valid) {
        errors.push({
          field: "fallbackUrl",
          message: `Fallback URL error: ${fbSafety.reason}`,
          severity: "warning",
          code: "INVALID_FALLBACK",
        });
      }
    }
  } else if (row.type === "text") {
    if (!row.destinationUrl) {
      errors.push({
        field: "destinationUrl",
        message: "Text message content is required.",
        severity: "block",
        code: "MISSING_TEXT_CONTENT",
      });
    } else if (row.destinationUrl.length > 1500) {
      errors.push({
        field: "destinationUrl",
        message: "Text is very long (>1500 chars). High module density may degrade smartphone scan speeds.",
        severity: "warning",
        code: "HIGH_DENSITY_TEXT",
      });
    }
  }

  // 3. Custom Slug Check (if provided)
  if (row.customSlug) {
    if (!/^[a-z0-9-]+$/i.test(row.customSlug)) {
      errors.push({
        field: "customSlug",
        message: "Custom slug may only contain alphanumeric characters and hyphens.",
        severity: "block",
        code: "INVALID_SLUG_FORMAT",
      });
    } else if (row.customSlug.length < 3 || row.customSlug.length > 48) {
      errors.push({
        field: "customSlug",
        message: "Custom slug must be between 3 and 48 characters.",
        severity: "block",
        code: "INVALID_SLUG_LENGTH",
      });
    }
  }

  // 4. Pure Mathematical Scanability Evaluation
  let scanabilityScore = 100;
  let scanabilityGrade: "A" | "B" | "C" | "D" | "F" = "A";
  const scanabilityIssues: string[] = [];

  try {
    const rawContent = row.destinationUrl || "https://nxtqr.vercel.app/s/preview";
    const scanResult = evaluateScanability(rawContent, design);
    scanabilityScore = scanResult.score ?? 100;
    scanabilityGrade =
      scanabilityScore >= 90
        ? "A"
        : scanabilityScore >= 75
        ? "B"
        : scanabilityScore >= 60
        ? "C"
        : scanabilityScore >= 40
        ? "D"
        : "F";

    if (scanResult.findings && scanResult.findings.length > 0) {
      for (const finding of scanResult.findings) {
        if (finding.severity === "blocking") {
          errors.push({
            field: "design",
            message: `Scanability blocking issue: ${finding.title}`,
            severity: "block",
            code: finding.code || "SCANABILITY_BLOCKED",
          });
          scanabilityIssues.push(finding.title);
        } else if (finding.severity === "warning") {
          errors.push({
            field: "design",
            message: `Scanability alert: ${finding.title}`,
            severity: "warning",
            code: finding.code || "SCANABILITY_WARNING",
          });
          scanabilityIssues.push(finding.title);
        }
      }
    }
  } catch (err) {
    console.warn("[validateBulkRow] Scanability evaluation notice:", err);
  }

  // 5. Derive Final Validation Status
  let validationStatus: BulkValidationStatus = "READY";
  const hasBlock = errors.some((e) => e.severity === "block");
  const hasWarning = errors.some((e) => e.severity === "warning");

  if (hasBlock) {
    validationStatus = "BLOCKED";
  } else if (hasWarning) {
    validationStatus = "WARNING";
  }

  return {
    id: `temp_row_${row.sourceRowNumber}_${Math.random().toString(36).slice(2, 7)}`,
    ...row,
    validationStatus,
    errors,
    scanabilityScore,
    scanabilityGrade,
    scanabilityIssues,
    executionStatus: "PENDING",
  };
}

/**
 * Validates an entire batch of normalized rows and computes the Batch Manifest.
 */
export function validateBulkBatch(
  normalizedRows: NormalizedRow[],
  options: {
    sourceType: BulkSourceType;
    fileName?: string;
    designPolicy?: "default" | "brand_kit" | "template" | "custom";
    design?: QrDesignV1;
    campaignId?: string;
    campaignName?: string;
    folderId?: string;
    folderName?: string;
    creationMode?: BulkCreationMode;
  }
): { rows: ValidatedBulkRow[]; manifest: BatchManifest } {
  const design = options.design || CANONICAL_QR_DESIGN_DEFAULTS;
  const validatedRows = normalizedRows.map((r) => validateBulkRow(r, design));

  let readyRows = 0;
  let warningRows = 0;
  let blockedRows = 0;
  const typeBreakdown: Record<string, number> = {};

  for (const r of validatedRows) {
    if (r.validationStatus === "READY") readyRows++;
    else if (r.validationStatus === "WARNING") warningRows++;
    else if (r.validationStatus === "BLOCKED") blockedRows++;

    const t = r.type || "url";
    typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
  }

  const manifest: BatchManifest = {
    sourceType: options.sourceType,
    fileName: options.fileName,
    totalRows: validatedRows.length,
    readyRows,
    warningRows,
    blockedRows,
    typeBreakdown,
    campaignId: options.campaignId,
    campaignName: options.campaignName,
    folderId: options.folderId,
    folderName: options.folderName,
    designPolicy: options.designPolicy || "default",
    design,
    creationMode: options.creationMode || "DRAFT",
  };

  return {
    rows: validatedRows,
    manifest,
  };
}

/**
 * Validates a single user-facing row payload for the UI Validation Step.
 */
export function validateBulkRowPayload(
  payload: {
    name?: string;
    qr_type?: string;
    destination_url?: string;
    content?: Record<string, any>;
    campaign_id?: string;
    folder_id?: string;
    custom_slug?: string;
  },
  rowNumber: number,
  design: QrDesignV1 = CANONICAL_QR_DESIGN_DEFAULTS
): {
  rowNumber: number;
  row: {
    name: string;
    qr_type: string;
    destination_url: string;
    content?: Record<string, any>;
    campaign_id?: string;
    folder_id?: string;
    custom_slug?: string;
  };
  validationStatus: BulkValidationStatus;
  errors: RowValidationError[];
  scanabilityScore?: number;
} {
  const normRow: NormalizedRow = {
    sourceRowNumber: rowNumber,
    name: payload.name?.trim() || "",
    type: payload.qr_type || "url",
    destinationUrl: payload.destination_url?.trim() || "",
    campaignId: payload.campaign_id,
    folderId: payload.folder_id,
    customSlug: payload.custom_slug?.trim(),
    rawPayload: payload as any,
  };

  const validated = validateBulkRow(normRow, design);

  return {
    rowNumber,
    row: {
      name: normRow.name,
      qr_type: normRow.type,
      destination_url: normRow.destinationUrl,
      content: payload.content,
      campaign_id: payload.campaign_id,
      folder_id: payload.folder_id,
      custom_slug: payload.custom_slug,
    },
    validationStatus: validated.validationStatus,
    errors: validated.errors,
    scanabilityScore: validated.scanabilityScore,
  };
}

/**
 * Computes Validation Gate aggregate counts from row validation results.
 */
export function computeValidationGateMetrics(
  results: Array<{ validationStatus: BulkValidationStatus }>
): {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  blockedRows: number;
} {
  let readyRows = 0;
  let warningRows = 0;
  let blockedRows = 0;

  for (const r of results) {
    if (r.validationStatus === "READY") readyRows++;
    else if (r.validationStatus === "WARNING") warningRows++;
    else if (r.validationStatus === "BLOCKED") blockedRows++;
  }

  return {
    totalRows: results.length,
    readyRows,
    warningRows,
    blockedRows,
  };
}

/**
 * Generates the Manifest Summary for the Review Step.
 */
export function generateBulkManifestSummary(
  results: Array<{ row: { qr_type?: string }; validationStatus: BulkValidationStatus }>
): {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  blockedRows: number;
  qrTypesBreakdown: Record<string, number>;
} {
  const metrics = computeValidationGateMetrics(results);
  const qrTypesBreakdown: Record<string, number> = {};

  for (const r of results) {
    const type = r.row.qr_type || "url";
    qrTypesBreakdown[type] = (qrTypesBreakdown[type] || 0) + 1;
  }

  return {
    ...metrics,
    qrTypesBreakdown,
  };
}
