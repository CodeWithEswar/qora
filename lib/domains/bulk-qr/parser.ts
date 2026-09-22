/**
 * NXTQR — Bulk Source Ingestion & CSV Parsing
 * Security-first parser compliant with RFC 4180, formula sanitization, and auto-mapping.
 */

import Papa from "papaparse";
import {
  RawParsedSource,
  BulkColumnMapping,
  CanonicalBulkField,
} from "./types";

const MAX_CSV_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const MAX_ROW_LIMIT = 10000;

export interface CsvParseOptions {
  maxRows?: number;
  fileName?: string;
  fileSize?: number;
}

/**
 * Sanitizes potentially dangerous formula injection in spreadsheet data.
 * Prepends a single quote if string begins with =, +, -, @, \t, or \r.
 */
export function sanitizeSpreadsheetCell(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    // Dangerous formula prefix detected
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Parses raw CSV string or buffer securely using PapaParse.
 */
export function parseBulkCsv(
  csvText: string,
  options: CsvParseOptions = {}
): RawParsedSource {
  if (!csvText || !csvText.trim()) {
    throw new Error("Uploaded CSV file is empty. Please provide a file with valid headers and data rows.");
  }

  if (options.fileSize && options.fileSize > MAX_CSV_SIZE_BYTES) {
    throw new Error(
      `File size (${Math.round(options.fileSize / 1024 / 1024)}MB) exceeds maximum permitted limit of 10MB.`
    );
  }

  // Parse using PapaParse with header detection and comment support
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => sanitizeSpreadsheetCell(value),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    const fatal = parsed.errors.find((e) => e.type === "Quotes" || e.code === "UndetectableDelimiter");
    if (fatal) {
      throw new Error(`Malformed CSV format on line ${fatal.row || "unknown"}: ${fatal.message}`);
    }
  }

  const rawHeaders = (parsed.meta.fields || []).filter(Boolean);
  if (rawHeaders.length === 0) {
    throw new Error("No column headers detected in CSV. The first row must define column titles.");
  }

  const maxRows = options.maxRows || MAX_ROW_LIMIT;
  const dataRows = parsed.data || [];

  if (dataRows.length === 0) {
    throw new Error("The CSV file contains column headers but zero data rows.");
  }

  if (dataRows.length > maxRows) {
    throw new Error(
      `The file contains ${dataRows.length} rows, which exceeds your maximum allowed limit of ${maxRows} rows per batch.`
    );
  }

  return {
    headers: rawHeaders,
    rows: dataRows,
    totalRows: dataRows.length,
    fileName: options.fileName,
    fileSize: options.fileSize,
  };
}

/**
 * Deterministically auto-suggests column mappings based on common header names.
 */
export function suggestColumnMappings(
  headers: string[],
  sampleRows: Record<string, string>[] = []
): BulkColumnMapping[] {
  return headers.map((header) => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");
    let targetField: CanonicalBulkField = "ignore";
    let confidence: "exact" | "suggested" | "manual" | "unmapped" = "unmapped";

    // 1. Name matches
    if (
      normalized === "name" ||
      normalized === "qrname" ||
      normalized === "title" ||
      normalized === "qrtitle" ||
      normalized === "assetname" ||
      normalized === "label"
    ) {
      targetField = "name";
      confidence = normalized === "name" ? "exact" : "suggested";
    }
    // 2. Destination / URL matches
    else if (
      normalized === "destination" ||
      normalized === "url" ||
      normalized === "link" ||
      normalized === "targeturl" ||
      normalized === "website" ||
      normalized === "websiteurl" ||
      normalized === "destinationurl" ||
      normalized === "target" ||
      normalized === "content"
    ) {
      targetField = "destination";
      confidence = normalized === "destination" || normalized === "url" ? "exact" : "suggested";
    }
    // 3. QR Type matches
    else if (
      normalized === "type" ||
      normalized === "qrtype" ||
      normalized === "category" ||
      normalized === "format"
    ) {
      targetField = "type";
      confidence = normalized === "type" ? "exact" : "suggested";
    }
    // 4. Campaign matches
    else if (
      normalized === "campaign" ||
      normalized === "campaignname" ||
      normalized === "campaignid"
    ) {
      targetField = "campaign";
      confidence = normalized === "campaign" ? "exact" : "suggested";
    }
    // 5. Folder matches
    else if (
      normalized === "folder" ||
      normalized === "foldername" ||
      normalized === "folderid" ||
      normalized === "directory"
    ) {
      targetField = "folder";
      confidence = normalized === "folder" ? "exact" : "suggested";
    }
    // 6. Fallback URL
    else if (normalized === "fallback" || normalized === "fallbackurl" || normalized === "backupurl") {
      targetField = "fallbackUrl";
      confidence = normalized === "fallbackurl" ? "exact" : "suggested";
    }
    // 7. Slug matches
    else if (normalized === "slug" || normalized === "customslug" || normalized === "shortcode") {
      targetField = "slug";
      confidence = normalized === "slug" ? "exact" : "suggested";
    }
    // 8. Notes
    else if (normalized === "notes" || normalized === "note" || normalized === "description") {
      targetField = "notes";
      confidence = normalized === "notes" ? "exact" : "suggested";
    }

    // Sample preview values for the user
    const sampleValues = sampleRows
      .slice(0, 3)
      .map((r) => r[header] || "")
      .filter(Boolean);

    return {
      sourceHeader: header,
      targetField,
      confidence,
      sampleValues,
    };
  });
}

/**
 * Generates official NXTQR CSV template string with clean documentation and examples.
 */
export function generateCanonicalBulkTemplate(): string {
  const headers = ["name", "type", "destination", "campaign", "folder", "notes"];
  const rows = [
    ["Summer Campaign 2026", "url", "https://example.com/summer-sale", "Retail Marketing", "Store QRs", "In-store signage"],
    ["VIP Event Wi-Fi", "wifi", "WIFI:S:Guest-Lounge;T:WPA;P:SecretPass2026;;", "Events", "Event Collateral", "Front desk check-in"],
    ["Alex Rivera Contact", "vcard", "https://portfolio.com/alex", "Corporate", "Business Cards", "Executive networking"],
    ["iOS & Android App", "app", "https://mybrand.com/app-download", "Product Launch", "App Collateral", "App packaging sticker"],
    ["Product Manual PDF", "url", "https://example.com/docs/manual-v4.pdf", "Customer Success", "Packaging", "Back of box QR"],
  ];

  const csvLines = [headers.join(",")];
  for (const row of rows) {
    const escaped = row.map((cell) => `"${cell.replace(/"/g, '""')}"`);
    csvLines.push(escaped.join(","));
  }

  return csvLines.join("\r\n");
}

/**
 * High-level auto-detection returning a Record<string, string> of targetField -> sourceHeader
 */
export function autoDetectColumnMapping(headers: string[]): Record<string, string> {
  const suggestions = suggestColumnMappings(headers);
  const mapping: Record<string, string> = {};
  for (const s of suggestions) {
    if (s.targetField !== "ignore") {
      const key = s.targetField === "destination" ? "destination_url" : s.targetField === "type" ? "qr_type" : s.targetField;
      mapping[key] = s.sourceHeader;
    }
  }
  return mapping;
}

/**
 * Normalizes raw PapaParse rows using column mapping into BulkRowPayload objects.
 */
export function normalizeParsedRows(
  rawRows: Record<string, string>[],
  mapping: Record<string, string>,
  context?: { campaigns?: Array<{ id: string; name: string }>; folders?: Array<{ id: string; name: string }> }
): Array<{
  name: string;
  qr_type: string;
  destination_url: string;
  content?: Record<string, any>;
  campaign_id?: string;
  folder_id?: string;
  custom_slug?: string;
}> {
  const nameCol = mapping["name"];
  const destCol = mapping["destination_url"] || mapping["destination"];
  const typeCol = mapping["qr_type"] || mapping["type"];
  const campCol = mapping["campaign"];
  const foldCol = mapping["folder"];
  const slugCol = mapping["custom_slug"] || mapping["slug"];

  return rawRows.map((r, i) => {
    const rawName = nameCol ? r[nameCol] || "" : "";
    const rawDest = destCol ? r[destCol] || "" : "";
    const rawType = typeCol ? r[typeCol] || "" : "url";
    const rawCamp = campCol ? r[campCol] || "" : "";
    const rawFold = foldCol ? r[foldCol] || "" : "";
    const rawSlug = slugCol ? r[slugCol] || "" : "";

    // Clean destination URL (add https:// if missing domain protocol)
    let destination = rawDest.trim();
    if (destination && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(destination)) {
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(destination)) {
        destination = `https://${destination}`;
      }
    }

    // Clean type
    let qr_type = rawType.trim().toLowerCase();
    if (["link", "website", "web", "http"].includes(qr_type) || !qr_type) {
      qr_type = "url";
    }

    // Resolve Campaign ID if name was provided
    let campaign_id: string | undefined = undefined;
    if (rawCamp && context?.campaigns) {
      const match = context.campaigns.find(
        (c) => c.id === rawCamp || c.name.toLowerCase() === rawCamp.trim().toLowerCase()
      );
      if (match) campaign_id = match.id;
    } else if (rawCamp) {
      campaign_id = rawCamp;
    }

    // Resolve Folder ID if name was provided
    let folder_id: string | undefined = undefined;
    if (rawFold && context?.folders) {
      const match = context.folders.find(
        (f) => f.id === rawFold || f.name.toLowerCase() === rawFold.trim().toLowerCase()
      );
      if (match) folder_id = match.id;
    } else if (rawFold) {
      folder_id = rawFold;
    }

    return {
      name: rawName.trim() || `Asset #${i + 1}`,
      qr_type,
      destination_url: destination,
      campaign_id,
      folder_id,
      custom_slug: rawSlug ? rawSlug.trim().toLowerCase() : undefined,
    };
  });
}
