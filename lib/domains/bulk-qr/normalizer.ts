/**
 * NXTQR — Bulk Data Normalization Stage
 * Transforms raw mapped rows into normalized, typed domain records.
 */

import { BulkColumnMapping, CanonicalBulkField } from "./types";

export interface NormalizationOrgContext {
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
}

export interface RawRowWithIndex {
  sourceRowNumber: number;
  data: Record<string, string>;
}

export interface NormalizedRow {
  sourceRowNumber: number;
  name: string;
  type: string;
  destinationUrl: string;
  fallbackUrl?: string;
  campaignId?: string;
  campaignName?: string;
  folderId?: string;
  folderName?: string;
  customSlug?: string;
  notes?: string;
  rawPayload: Record<string, any>;
}

/**
 * Normalizes user-entered QR type identifiers into canonical types recognized by @nxtqr/qr-core.
 */
export function normalizeQrType(rawType?: string): string {
  if (!rawType) return "url";
  const clean = rawType.trim().toLowerCase();

  switch (clean) {
    case "url":
    case "link":
    case "website":
    case "web":
    case "http":
    case "https":
      return "url";
    case "text":
    case "plain":
    case "message":
    case "note":
      return "text";
    case "wifi":
    case "wi-fi":
    case "wlan":
      return "wifi";
    case "vcard":
    case "contact":
    case "business_card":
    case "card":
      return "vcard";
    case "app":
    case "appstore":
    case "playstore":
    case "mobile_app":
      return "app";
    case "file":
    case "pdf":
    case "document":
    case "asset":
      return "file";
    case "email":
    case "mail":
    case "mailto":
      return "email";
    case "phone":
    case "tel":
    case "call":
      return "phone";
    case "sms":
    case "text_message":
      return "sms";
    default:
      return clean;
  }
}

/**
 * Normalizes URL destinations: prepends https:// if protocol is omitted.
 */
export function normalizeDestinationUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let trimmed = rawUrl.trim();
  // Strip spreadsheet escaping quote if present
  if (trimmed.startsWith("'")) {
    trimmed = trimmed.slice(1);
  }

  if (trimmed.length > 0 && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    // If it's a domain/path without protocol, default to https
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
  }

  return trimmed;
}

/**
 * Normalizes a batch of raw source rows using the user's field mapping definitions.
 */
export function normalizeBulkRows(
  rows: RawRowWithIndex[],
  mappings: BulkColumnMapping[],
  context: NormalizationOrgContext = {}
): NormalizedRow[] {
  // Build lookup index: targetField -> sourceHeader
  const fieldToHeader = new Map<CanonicalBulkField, string>();
  for (const m of mappings) {
    if (m.targetField !== "ignore") {
      fieldToHeader.set(m.targetField, m.sourceHeader);
    }
  }

  const nameHeader = fieldToHeader.get("name");
  const destHeader = fieldToHeader.get("destination");
  const typeHeader = fieldToHeader.get("type");
  const campaignHeader = fieldToHeader.get("campaign");
  const folderHeader = fieldToHeader.get("folder");
  const fallbackHeader = fieldToHeader.get("fallbackUrl");
  const slugHeader = fieldToHeader.get("slug");
  const notesHeader = fieldToHeader.get("notes");

  return rows.map((item) => {
    const raw = item.data;
    const rawName = nameHeader ? raw[nameHeader] || "" : "";
    const rawDest = destHeader ? raw[destHeader] || "" : "";
    const rawType = typeHeader ? raw[typeHeader] || "" : "url";
    const rawCamp = campaignHeader ? raw[campaignHeader] || "" : "";
    const rawFold = folderHeader ? raw[folderHeader] || "" : "";
    const rawFallback = fallbackHeader ? raw[fallbackHeader] || "" : "";
    const rawSlug = slugHeader ? raw[slugHeader] || "" : "";
    const rawNotes = notesHeader ? raw[notesHeader] || "" : "";

    const type = normalizeQrType(rawType);
    const destinationUrl = normalizeDestinationUrl(rawDest);
    const fallbackUrl = rawFallback ? normalizeDestinationUrl(rawFallback) : undefined;
    const name = rawName.trim() || `Bulk QR #${item.sourceRowNumber}`;

    // Resolve Campaign ID or Name from context
    let campaignId: string | undefined;
    let campaignName: string | undefined;
    if (rawCamp && context.campaigns) {
      const match = context.campaigns.find(
        (c) => c.id === rawCamp || c.name.toLowerCase() === rawCamp.trim().toLowerCase()
      );
      if (match) {
        campaignId = match.id;
        campaignName = match.name;
      } else {
        campaignName = rawCamp.trim();
      }
    }

    // Resolve Folder ID or Name from context
    let folderId: string | undefined;
    let folderName: string | undefined;
    if (rawFold && context.folders) {
      const match = context.folders.find(
        (f) => f.id === rawFold || f.name.toLowerCase() === rawFold.trim().toLowerCase()
      );
      if (match) {
        folderId = match.id;
        folderName = match.name;
      } else {
        folderName = rawFold.trim();
      }
    }

    return {
      sourceRowNumber: item.sourceRowNumber,
      name,
      type,
      destinationUrl,
      fallbackUrl,
      campaignId,
      campaignName,
      folderId,
      folderName,
      customSlug: rawSlug ? rawSlug.trim().toLowerCase() : undefined,
      notes: rawNotes ? rawNotes.trim() : undefined,
      rawPayload: raw,
    };
  });
}
