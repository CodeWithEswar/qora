/**
 * NXTQR — Guardian Bounded Context Engine
 * Responsibilities: Destination health probes, SSRF defense, incident lifecycle,
 * state transitions, fallback validation, cycle detection, and resolver signal publication.
 * 
 * Invariants:
 * - Guardian performs background asynchronous health probes; it NEVER blocks scan-time redirects.
 * - Outbound probe URLs are strictly verified with SSRF defenses before execution.
 * - Routing consumes Guardian's published health state to make deterministic fallback routing decisions.
 */

import { validateOutboundUrl } from "../shared/ssrf";
import { GuardianHealthSignal } from "../routing";
import {
  GuardianHealthState,
  GuardianIncidentStatus,
  GuardianObservationResult,
  GuardianObservationSummary,
} from "@nxtqr/contracts";

export type HealthCheckStatus = "HEALTHY" | "DEGRADED" | "DOWN";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export interface LinkCheckRecord {
  id: string;
  qrId: string;
  checkedUrl: string;
  httpStatus?: number;
  responseTimeMs: number;
  tlsValid: boolean;
  status: HealthCheckStatus;
  failureReason?: string;
  checkedAt: number;
}

export interface GuardianIncidentRecord {
  id: string;
  qrId: string;
  status: IncidentStatus;
  failureReason: string;
  fallbackTriggered: boolean;
  startedAt: number;
  resolvedAt?: number;
}

export interface FallbackPolicyEntity {
  id: string;
  qrId: string;
  failureThreshold: number; // e.g. 3 consecutive fails
  backupUrl: string;
  autoSwitch: boolean;
  notifyEmails: string[];
}

/**
 * Validates a target destination URL before enrolling it into Guardian monitoring.
 * Rejects localhost, loopbacks, internal RFC-1918 subnets, and cloud metadata endpoints.
 */
export function validateGuardianTargetUrl(url: string): string {
  const parsed = validateOutboundUrl(url, { allowHttp: true });
  return parsed.toString();
}

/**
 * Detects circular fallback configurations:
 * 1. Identical URL (A -> A)
 * 2. Normalized domain-level infinite redirect loop
 */
export function isFallbackCircular(primaryUrl: string, fallbackUrl: string): boolean {
  if (!primaryUrl || !fallbackUrl) return false;

  const normPrimary = primaryUrl.trim().toLowerCase().replace(/\/+$/, "");
  const normFallback = fallbackUrl.trim().toLowerCase().replace(/\/+$/, "");

  if (normPrimary === normFallback) {
    return true;
  }

  try {
    const pUrl = new URL(primaryUrl);
    const fUrl = new URL(fallbackUrl);
    if (pUrl.origin === fUrl.origin && pUrl.pathname === fUrl.pathname) {
      return true;
    }
  } catch {
    // If not parseable, string comparison handled it
  }

  return false;
}

/**
 * Evaluates state transitions based on consecutive failure/success counts and thresholds.
 */
export function evaluateGuardianStateTransition(params: {
  currentHealth: GuardianHealthState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  failureThreshold: number;
  recoveryThreshold: number;
  lastObservationResult: GuardianObservationResult;
}): {
  nextHealth: GuardianHealthState;
  shouldOpenIncident: boolean;
  shouldResolveIncident: boolean;
} {
  const {
    currentHealth,
    consecutiveFailures,
    consecutiveSuccesses,
    failureThreshold,
    recoveryThreshold,
    lastObservationResult,
  } = params;

  // Paused monitors stay paused
  if (currentHealth === "PAUSED") {
    return {
      nextHealth: "PAUSED",
      shouldOpenIncident: false,
      shouldResolveIncident: false,
    };
  }

  const isSuccess = lastObservationResult === "HEALTHY";

  if (isSuccess) {
    // We received a successful observation
    if (currentHealth === "UNAVAILABLE" || currentHealth === "DEGRADED") {
      if (consecutiveSuccesses >= recoveryThreshold) {
        return {
          nextHealth: "HEALTHY",
          shouldOpenIncident: false,
          shouldResolveIncident: currentHealth === "UNAVAILABLE",
        };
      }
      // Still recovering but not yet reached recovery threshold
      return {
        nextHealth: currentHealth,
        shouldOpenIncident: false,
        shouldResolveIncident: false,
      };
    }
    return {
      nextHealth: "HEALTHY",
      shouldOpenIncident: false,
      shouldResolveIncident: false,
    };
  } else {
    // Failure observation
    if (consecutiveFailures >= failureThreshold) {
      const isAlreadyUnavailable = currentHealth === "UNAVAILABLE";
      return {
        nextHealth: "UNAVAILABLE",
        shouldOpenIncident: !isAlreadyUnavailable,
        shouldResolveIncident: false,
      };
    }
    // Partial degradation
    return {
      nextHealth: "DEGRADED",
      shouldOpenIncident: false,
      shouldResolveIncident: false,
    };
  }
}

/**
 * Legacy threshold evaluator for backward compatibility with existing tests
 */
export function evaluateHealthStatusThreshold(
  consecutiveFailures: number,
  policyThreshold = 3
): { shouldOpenIncident: boolean; status: HealthCheckStatus } {
  if (consecutiveFailures >= policyThreshold) {
    return { shouldOpenIncident: true, status: "DOWN" };
  }
  if (consecutiveFailures > 0) {
    return { shouldOpenIncident: false, status: "DEGRADED" };
  }
  return { shouldOpenIncident: false, status: "HEALTHY" };
}

/**
 * Compiles a published health signal for edge resolver consumption.
 */
export function compilePublishedHealthSignal(
  activeIncident: GuardianIncidentRecord | null,
  recentLatencyMs?: number
): GuardianHealthSignal {
  return {
    isPrimaryHealthy: activeIncident === null || activeIncident.status === "RESOLVED",
    activeIncidentsCount: activeIncident && activeIncident.status !== "RESOLVED" ? 1 : 0,
    latencyMs: recentLatencyMs,
  };
}

/**
 * Executes a secure, bounded outbound HTTP check for a target destination URL.
 * Invariant: Never downloads arbitrary multi-megabyte payloads; measures status and latency.
 */
export async function executeOutboundHealthProbe(
  rawUrl: string,
  timeoutMs = 5000
): Promise<{
  result: GuardianObservationResult;
  httpStatus?: number;
  durationMs: number;
  tlsValid: boolean;
  failureReason?: string;
}> {
  // 1. Validate URL against SSRF
  let sanitizedUrl: string;
  try {
    sanitizedUrl = validateGuardianTargetUrl(rawUrl);
  } catch (err: any) {
    return {
      result: "HTTP_ERROR",
      durationMs: 0,
      tlsValid: false,
      failureReason: `SSRF Validation Failed: ${err.message || "Forbidden target"}`,
    };
  }

  const boundedTimeout = Math.min(Math.max(timeoutMs, 1000), 10000);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), boundedTimeout);
  const startTime = Date.now();

  try {
    // Probe using HEAD first to minimize payload; fall back to bounded GET if HEAD is rejected (405)
    let response: Response;
    try {
      response = await fetch(sanitizedUrl, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "NXTQR-Guardian-Probe/1.0 (+https://nxtqr.vercel.app)",
          Accept: "*/*",
        },
        redirect: "follow",
      });

      if (response.status === 405) {
        // Method Not Allowed for HEAD — try GET
        response = await fetch(sanitizedUrl, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "NXTQR-Guardian-Probe/1.0 (+https://nxtqr.vercel.app)",
            Accept: "*/*",
            Range: "bytes=0-1024", // Bounded request
          },
          redirect: "follow",
        });
      }
    } catch (headErr: any) {
      // If HEAD aborted due to timeout, rethrow
      if (controller.signal.aborted) {
        throw headErr;
      }
      // Otherwise try GET
      response = await fetch(sanitizedUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "NXTQR-Guardian-Probe/1.0 (+https://nxtqr.vercel.app)",
          Accept: "*/*",
          Range: "bytes=0-1024",
        },
        redirect: "follow",
      });
    }

    const durationMs = Date.now() - startTime;
    clearTimeout(timeoutId);

    const httpStatus = response.status;
    const isHealthy = httpStatus >= 200 && httpStatus < 400;

    return {
      result: isHealthy ? "HEALTHY" : httpStatus >= 500 ? "UNAVAILABLE" : "DEGRADED",
      httpStatus,
      durationMs,
      tlsValid: sanitizedUrl.startsWith("https:"),
      failureReason: isHealthy ? undefined : `HTTP status ${httpStatus}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (err.name === "AbortError" || controller.signal.aborted) {
      return {
        result: "TIMEOUT",
        durationMs,
        tlsValid: sanitizedUrl.startsWith("https:"),
        failureReason: `Request timed out after ${boundedTimeout}ms`,
      };
    }

    const message = err.message || "";
    if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
      return {
        result: "DNS_ERROR",
        durationMs,
        tlsValid: false,
        failureReason: "DNS hostname could not be resolved",
      };
    }

    if (message.includes("CERT_") || message.includes("tls") || message.includes("SSL")) {
      return {
        result: "TLS_ERROR",
        durationMs,
        tlsValid: false,
        failureReason: `TLS/Certificate error: ${message}`,
      };
    }

    return {
      result: "HTTP_ERROR",
      durationMs,
      tlsValid: sanitizedUrl.startsWith("https:"),
      failureReason: message || "Network connection failure",
    };
  }
}
