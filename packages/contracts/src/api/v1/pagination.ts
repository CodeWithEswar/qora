/**
 * NXTQR — HTTP API V1 Pagination Contracts & Helpers
 * Enforces opaque cursor-based keyset pagination with strict bounds.
 * Pure Web API compatible (Edge Workers & Node.js).
 */

import { z } from "zod";

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .coerce
    .number()
    .int()
    .min(1, "limit must be at least 1")
    .max(MAX_PAGE_LIMIT, `limit cannot exceed ${MAX_PAGE_LIMIT}`)
    .default(DEFAULT_PAGE_LIMIT),
});
export type PaginationQueryParams = z.infer<typeof PaginationQuerySchema>;

/**
 * Decoded cursor payload
 */
export interface DecodedCursor {
  id: string;
  createdAt: number;
  [key: string]: unknown;
}

/**
 * Encodes an opaque base64url cursor
 */
export function encodeCursor(payload: DecodedCursor): string {
  const json = JSON.stringify(payload);
  const globalBuffer = (globalThis as unknown as { Buffer?: { from: (s: string) => { toString: (enc: string) => string } } }).Buffer;
  if (typeof globalBuffer !== "undefined") {
    return globalBuffer.from(json).toString("base64url");
  }
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decodes an opaque base64url cursor
 */
export function decodeCursor(cursor: string): DecodedCursor | null {
  try {
    let base64 = cursor.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const globalBuffer = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => { toString: (enc: string) => string } } }).Buffer;
    const json = typeof globalBuffer !== "undefined"
      ? globalBuffer.from(base64, "base64").toString("utf-8")
      : atob(base64);
    return JSON.parse(json) as DecodedCursor;
  } catch {
    return null;
  }
}
