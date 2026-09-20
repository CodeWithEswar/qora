/**
 * NXTQR — Standardized API Response Builders
 * Enforces unified envelope conventions and mandatory security/observability headers.
 */

import { NextResponse } from "next/server";
import {
  createApiSuccessResponse,
  createApiCollectionResponse,
  ApiSuccessResponse,
  ApiCollectionResponse,
} from "@nxtqr/contracts";

export function getRequestId(request?: Request): string {
  const existing = request?.headers.get("x-request-id");
  if (existing) return existing;
  return `req_${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "").substring(0, 16) : Math.random().toString(36).substring(2, 12)}`;
}

export function apiSuccess<T>(
  data: T,
  requestId: string,
  statusCode = 200,
  extraMeta?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T> & { success: boolean }> {
  const envelope = createApiSuccessResponse(data, { requestId, ...extraMeta });
  return NextResponse.json(
    { ...envelope, success: true },
    {
      status: statusCode,
      headers: {
        "X-Request-Id": requestId,
        "Cache-Control": "no-store, private",
        "Content-Type": "application/json",
      },
    }
  );
}

export function apiCreated<T>(
  data: T,
  requestId: string,
  extraMeta?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T> & { success: boolean }> {
  return apiSuccess(data, requestId, 201, extraMeta);
}

export function apiAccepted<T>(
  data: T,
  requestId: string,
  extraMeta?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T> & { success: boolean }> {
  return apiSuccess(data, requestId, 202, extraMeta);
}

export function apiCollection<T>(
  data: T[],
  page: { nextCursor: string | null; hasMore: boolean; totalCount?: number },
  requestId: string,
  statusCode = 200,
  extraMeta?: Record<string, unknown>
): NextResponse<ApiCollectionResponse<T> & { success: boolean }> {
  const envelope = createApiCollectionResponse(data, page, { requestId, ...extraMeta });
  return NextResponse.json(
    { ...envelope, success: true },
    {
      status: statusCode,
      headers: {
        "X-Request-Id": requestId,
        "Cache-Control": "no-store, private",
        "Content-Type": "application/json",
      },
    }
  );
}

export function apiNoContent(requestId: string): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "X-Request-Id": requestId,
      "Cache-Control": "no-store, private",
    },
  });
}
