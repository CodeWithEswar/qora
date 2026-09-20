/**
 * NXTQR — 05 Campaigns Bounded Context
 * Responsibilities: Campaign grouping, lifecycle management, emoji identity, and organizational initiatives.
 * Invariants:
 * - Campaigns organize QR assets; they do not own QR identity.
 * - Folder hierarchies must be cycle-free with depth constraints.
 * - Tags and campaigns are strictly organization-scoped.
 * - One campaign per QR code in the authoritative relational model.
 */

import { ValidationError } from "../shared/errors";
import { CampaignStatus } from "@nxtqr/contracts";

export type { CampaignStatus };

export const VALID_CAMPAIGN_STATUSES: readonly CampaignStatus[] = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export interface CampaignEntity {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  emoji?: string | null;
  startDate?: number;
  endDate?: number;
  budgetInr?: number;
  budgetMinor?: number;
  status: CampaignStatus;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
  qrCount?: number;
  totalScans?: number;
}

export interface FolderEntity {
  id: string;
  organizationId: string;
  parentId?: string | null;
  name: string;
  color?: string;
  createdAt: number;
}

export interface TagEntity {
  id: string;
  organizationId: string;
  name: string;
  color?: string;
  createdAt: number;
}

/**
 * Validates campaign status lifecycle transitions.
 * - 'archived' is a terminal state unless explicitly restored.
 * - 'draft' can transition to 'active' or 'archived'.
 * - 'active' can transition to 'paused', 'completed', or 'archived'.
 * - 'paused' can transition to 'active', 'completed', or 'archived'.
 * - 'completed' can transition to 'active' or 'archived'.
 */
export function isValidCampaignStatusTransition(
  from: CampaignStatus,
  to: CampaignStatus
): boolean {
  if (from === to) return true;
  if (from === "archived") {
    // Restoring from archived requires moving to draft or active
    return to === "draft" || to === "active";
  }
  const allowed: Record<CampaignStatus, CampaignStatus[]> = {
    draft: ["active", "archived"],
    active: ["paused", "completed", "archived"],
    paused: ["active", "completed", "archived"],
    completed: ["active", "archived"],
    archived: ["draft", "active"],
  };
  return allowed[from]?.includes(to) ?? false;
}

/**
 * Validates that an emoji string contains bounded Unicode content.
 * Prevents script injection, massive payloads, or HTML tags.
 */
export function validateCampaignEmoji(emoji?: string | null): string | null {
  if (!emoji) return null;
  const trimmed = emoji.trim();
  if (!trimmed) return null;

  // Maximum 16 UTF-8 bytes to safely accommodate complex multi-codepoint grapheme clusters (e.g. skin tones, flags, ZWJ sequences)
  if (trimmed.length > 16) {
    throw new ValidationError("Campaign emoji must be a valid single emoji symbol");
  }

  // Reject HTML/script tags
  if (/[<>&"']/.test(trimmed)) {
    throw new ValidationError("Invalid characters in campaign emoji");
  }

  return trimmed;
}

/**
 * Computes a deterministic single-letter monogram fallback mark when no emoji exists.
 * e.g. "Summer Launch 2026" -> "S", "10x Growth" -> "1", "" -> "C"
 */
export function getCampaignFallbackMark(name: string): string {
  if (!name || typeof name !== "string") return "C";
  const trimmed = name.trim();
  if (!trimmed) return "C";

  // Use Intl.Segmenter or Unicode regex to safely match the first user-perceived character
  const match = trimmed.match(/^[\p{L}\p{N}]/u);
  if (match && match[0]) {
    return match[0].toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase() || "C";
}

/**
 * Validates that setting a parentFolderId does not introduce cycles or exceed maximum nesting depth.
 */
export function assertValidFolderNesting(
  folderId: string,
  targetParentId: string | null | undefined,
  existingFolders: FolderEntity[],
  maxDepth = 5
): void {
  if (!targetParentId) return;

  if (folderId === targetParentId) {
    throw new ValidationError("A folder cannot be its own parent");
  }

  const folderMap = new Map<string, FolderEntity>();
  existingFolders.forEach((f) => folderMap.set(f.id, f));

  let currentId: string | null | undefined = targetParentId;
  let depth = 1;
  const visited = new Set<string>([folderId]);

  while (currentId) {
    if (visited.has(currentId)) {
      throw new ValidationError("Cycle detected in folder hierarchy");
    }
    visited.add(currentId);
    depth++;
    if (depth > maxDepth) {
      throw new ValidationError(`Folder nesting cannot exceed maximum depth of ${maxDepth}`);
    }
    const parentFolder = folderMap.get(currentId);
    currentId = parentFolder?.parentId;
  }
}

export function normalizeTagName(rawTag: string): string {
  const normalized = (rawTag || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");

  if (normalized.length < 1 || normalized.length > 32) {
    throw new ValidationError("Tag must be between 1 and 32 characters");
  }
  return normalized;
}
