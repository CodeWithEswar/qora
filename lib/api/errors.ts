/**
 * NXTQR — API Error Formatter and Boundary Handler
 * Safely transforms errors into standardized ApiErrorEnvelope without leaking raw SQL or traces.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  API_ERROR_CODES,
  ApiErrorCode,
  createApiErrorEnvelope,
  DomainError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  ValidationError as DomainValidationError,
  EntitlementError,
} from "@nxtqr/contracts";

export function formatZodError(zodError: ZodError, requestId: string): NextResponse {
  const details = zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    code: issue.code,
    message: issue.message,
  }));

  const envelope = createApiErrorEnvelope(
    API_ERROR_CODES.VALIDATION_ERROR,
    "The request contains invalid or malformed fields.",
    requestId,
    details
  );

  return NextResponse.json(
    { ...envelope, success: false },
    {
      status: 400,
      headers: {
        "X-Request-Id": requestId,
        "Cache-Control": "no-store, private",
      },
    }
  );
}

export function apiError(
  code: ApiErrorCode | string,
  message: string,
  statusCode: number,
  requestId: string,
  details?: Array<{ field?: string; code: string; message?: string }>
): NextResponse {
  const envelope = createApiErrorEnvelope(code, message, requestId, details);
  return NextResponse.json(
    { ...envelope, success: false },
    {
      status: statusCode,
      headers: {
        "X-Request-Id": requestId,
        "Cache-Control": "no-store, private",
      },
    }
  );
}

export function handleApiError(err: unknown, requestId: string): NextResponse {
  if (err instanceof ZodError) {
    return formatZodError(err, requestId);
  }

  if (err instanceof NotFoundError) {
    return apiError(API_ERROR_CODES.RESOURCE_NOT_FOUND, err.message, 404, requestId);
  }

  if (err instanceof UnauthorizedError) {
    return apiError(API_ERROR_CODES.AUTHENTICATION_REQUIRED, err.message, 401, requestId);
  }

  if (err instanceof ForbiddenError) {
    return apiError(API_ERROR_CODES.FORBIDDEN, err.message, 403, requestId);
  }

  if (err instanceof ConflictError) {
    return apiError(API_ERROR_CODES.RESOURCE_CONFLICT, err.message, 409, requestId);
  }

  if (err instanceof DomainValidationError) {
    return apiError(API_ERROR_CODES.VALIDATION_ERROR, err.message, 422, requestId);
  }

  if (err instanceof EntitlementError) {
    return apiError(API_ERROR_CODES.ENTITLEMENT_LIMIT_EXCEEDED, err.message, 402, requestId);
  }

  if (err instanceof DomainError) {
    return apiError(err.code, err.message, err.statusCode, requestId);
  }

  // Unhandled internal exception — NEVER leak internal stack traces to public clients
  console.error(`[Unhandled API Error] (RequestId: ${requestId}):`, err);
  return apiError(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred while processing your request.",
    500,
    requestId
  );
}

export { DomainValidationError as ValidationError };

