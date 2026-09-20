/**
 * NXTQR — HTTP API V1 Error Contracts & Machine-Readable Codes
 * Prevents leaking raw SQL, D1 internals, stack traces, or Zod internal objects.
 */

import { z } from "zod";

export const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  INVALID_API_KEY: "INVALID_API_KEY",
  EXPIRED_API_KEY: "EXPIRED_API_KEY",
  REVOKED_API_KEY: "REVOKED_API_KEY",
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_SCOPE: "INSUFFICIENT_SCOPE",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  ENTITLEMENT_LIMIT_EXCEEDED: "ENTITLEMENT_LIMIT_EXCEEDED",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  QR_NOT_FOUND: "QR_NOT_FOUND",
  CAMPAIGN_NOT_FOUND: "CAMPAIGN_NOT_FOUND",
  REPORT_NOT_FOUND: "REPORT_NOT_FOUND",
  WEBHOOK_ENDPOINT_NOT_FOUND: "WEBHOOK_ENDPOINT_NOT_FOUND",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  STALE_REVISION: "STALE_REVISION",
  IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD: "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD",
  IDEMPOTENT_REQUEST_IN_PROGRESS: "IDEMPOTENT_REQUEST_IN_PROGRESS",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SECURITY_POLICY_VIOLATION: "SECURITY_POLICY_VIOLATION",
  SSRF_BLOCKED: "SSRF_BLOCKED",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const ApiErrorDetailSchema = z.object({
  field: z.string().optional(),
  code: z.string(),
  message: z.string().optional(),
});
export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;

export const ApiErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
  details: z.array(ApiErrorDetailSchema).optional(),
});
export type ApiErrorPayload = z.infer<typeof ApiErrorPayloadSchema>;

export const ApiErrorEnvelopeSchema = z.object({
  error: ApiErrorPayloadSchema,
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

/**
 * Creates a normalized API error response envelope
 */
export function createApiErrorEnvelope(
  code: ApiErrorCode | string,
  message: string,
  requestId: string,
  details?: ApiErrorDetail[]
): ApiErrorEnvelope {
  return {
    error: {
      code,
      message,
      requestId,
      ...(details && details.length > 0 ? { details } : {}),
    },
  };
}
