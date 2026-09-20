/**
 * NXTQR — HTTP API V1 Common Contracts & Envelopes
 * Standardizes successful responses, collection metadata, and common query schemas.
 */

import { z } from "zod";

/**
 * Standard single-resource response envelope
 */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

/**
 * Standard cursor-paginated collection envelope
 */
export interface ApiCollectionResponse<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

/**
 * Sort order schema
 */
export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

/**
 * Common date range filter schema (ISO-8601 strings)
 */
export const DateRangeFilterSchema = z.object({
  from: z.string().datetime({ message: "from must be a valid ISO 8601 UTC timestamp" }).optional(),
  to: z.string().datetime({ message: "to must be a valid ISO 8601 UTC timestamp" }).optional(),
});
export type DateRangeFilter = z.infer<typeof DateRangeFilterSchema>;

/**
 * Helper to build an API success response
 */
export function createApiSuccessResponse<T>(
  data: T,
  meta?: { requestId?: string; [key: string]: unknown }
): ApiSuccessResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Helper to build an API collection response
 */
export function createApiCollectionResponse<T>(
  data: T[],
  page: { nextCursor: string | null; hasMore: boolean; totalCount?: number },
  meta?: { requestId?: string; [key: string]: unknown }
): ApiCollectionResponse<T> {
  return {
    data,
    page,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}
