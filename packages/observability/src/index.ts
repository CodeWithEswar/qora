/**
 * NXTQR — Observability, Structured Logging & Security Redaction
 * Pure, runtime-neutral primitives for safe diagnostics.
 */

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  organizationId?: string;
  resourceId?: string;
  userId?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "keyhash",
  "key_hash",
  "signingsecret",
  "signing_secret",
  "cashfreesecret",
  "accesstoken",
  "refreshtoken",
  "privatekey",
]);

/**
 * Central redaction utility for security audit logs and error telemetry.
 * Recursively redacts sensitive credentials, tokens, cookies, and secrets.
 */
export function redactSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = k.toLowerCase().replace(/[^a-z]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      cleaned[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null) {
      cleaned[k] = redactSensitiveData(v);
    } else {
      cleaned[k] = v;
    }
  }

  return cleaned;
}

/**
 * Creates safe, structured log payload with redaction applied.
 */
export function createStructuredLog(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context?: LogContext
): {
  timestamp: string;
  level: string;
  message: string;
  context?: unknown;
} {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? redactSensitiveData(context) : undefined,
  };
}
