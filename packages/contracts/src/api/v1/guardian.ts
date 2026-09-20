/**
 * NXTQR — Guardian Reliability, Destination Health & Automatic Fallback Contracts (V1)
 * Enforces strict typing for destination monitoring, observation histories,
 * health transitions, incidents, and fallback readiness.
 */

import { z } from "zod";

// 1. Health & Operational Enums
export const GuardianHealthStateSchema = z.enum([
  "HEALTHY",
  "DEGRADED",
  "UNAVAILABLE",
  "UNKNOWN",
  "PAUSED",
]);
export type GuardianHealthState = z.infer<typeof GuardianHealthStateSchema>;

export const GuardianIncidentStatusSchema = z.enum([
  "OPEN",
  "INVESTIGATING",
  "RESOLVED",
]);
export type GuardianIncidentStatus = z.infer<typeof GuardianIncidentStatusSchema>;

export const GuardianFallbackReadinessSchema = z.enum([
  "READY",
  "NOT_CONFIGURED",
  "INELIGIBLE",
  "INVALID",
]);
export type GuardianFallbackReadiness = z.infer<typeof GuardianFallbackReadinessSchema>;

export const GuardianObservationResultSchema = z.enum([
  "HEALTHY",
  "DEGRADED",
  "UNAVAILABLE",
  "TIMEOUT",
  "DNS_ERROR",
  "TLS_ERROR",
  "HTTP_ERROR",
]);
export type GuardianObservationResult = z.infer<typeof GuardianObservationResultSchema>;

// 2. Bounded Observation Schema
export const GuardianObservationSummarySchema = z.object({
  id: z.string().uuid(),
  monitorId: z.string().uuid(),
  observedAt: z.string(),
  result: GuardianObservationResultSchema,
  httpStatus: z.number().int().optional().nullable(),
  durationMs: z.number().int().nonnegative(),
  tlsValid: z.boolean().default(true),
  failureReason: z.string().optional().nullable(),
  checkedUrl: z.string(),
});
export type GuardianObservationSummary = z.infer<typeof GuardianObservationSummarySchema>;

// 3. Fallback Configuration Schema
export const GuardianFallbackConfigSchema = z.object({
  backupUrl: z.string(),
  autoSwitch: z.boolean().default(true),
  failureThreshold: z.number().int().positive().default(3),
  notifyEmails: z.array(z.string().email()).default([]),
  readiness: GuardianFallbackReadinessSchema.default("NOT_CONFIGURED"),
});
export type GuardianFallbackConfig = z.infer<typeof GuardianFallbackConfigSchema>;

// 4. Monitor Summary Schema (For page registry & pulse)
export const GuardianMonitorSummaryV1Schema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  qrId: z.string().uuid().optional().nullable(),
  qrName: z.string().optional().nullable(),
  qrSlug: z.string().optional().nullable(),
  destinationUrl: z.string(),
  name: z.string(),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]),
  currentHealth: GuardianHealthStateSchema,
  lastCheckedAt: z.string().optional().nullable(),
  lastStateChangedAt: z.string().optional().nullable(),
  checkIntervalSec: z.number().int().positive().default(300),
  timeoutMs: z.number().int().positive().default(5000),
  failureThreshold: z.number().int().positive().default(3),
  recoveryThreshold: z.number().int().positive().default(2),
  consecutiveFailures: z.number().int().nonnegative().default(0),
  consecutiveSuccesses: z.number().int().nonnegative().default(0),
  fallbackConfig: GuardianFallbackConfigSchema.optional().nullable(),
  activeIncidentId: z.string().uuid().optional().nullable(),
  recentObservations: z.array(GuardianObservationSummarySchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GuardianMonitorSummaryV1 = z.infer<typeof GuardianMonitorSummaryV1Schema>;

// 5. Incident Details Schema
export const GuardianIncidentTimelineEventSchema = z.object({
  timestamp: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
});
export type GuardianIncidentTimelineEvent = z.infer<typeof GuardianIncidentTimelineEventSchema>;

export const GuardianIncidentDetailV1Schema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  monitorId: z.string().uuid().optional().nullable(),
  qrId: z.string().uuid(),
  qrName: z.string().optional().nullable(),
  destinationUrl: z.string(),
  status: GuardianIncidentStatusSchema,
  startedAt: z.string(),
  resolvedAt: z.string().optional().nullable(),
  failureReason: z.string(),
  fallbackTriggered: z.boolean().default(false),
  currentHealth: GuardianHealthStateSchema.default("UNAVAILABLE"),
  timelineEvents: z.array(GuardianIncidentTimelineEventSchema).default([]),
});
export type GuardianIncidentDetailV1 = z.infer<typeof GuardianIncidentDetailV1Schema>;

// 6. Pulse Metrics Schema
export const GuardianPulseMetricsV1Schema = z.object({
  monitoredCount: z.number().int().nonnegative(),
  healthyCount: z.number().int().nonnegative(),
  degradedCount: z.number().int().nonnegative(),
  unavailableCount: z.number().int().nonnegative(),
  pausedCount: z.number().int().nonnegative(),
  openIncidentsCount: z.number().int().nonnegative(),
  lastSignalPublishedAt: z.string().optional().nullable(),
});
export type GuardianPulseMetricsV1 = z.infer<typeof GuardianPulseMetricsV1Schema>;

// 7. Request Payloads
export const CreateGuardianMonitorRequestV1Schema = z.object({
  qrId: z.string().uuid().optional(),
  destinationUrl: z.string().min(1),
  name: z.string().min(1).max(120),
  checkIntervalSec: z.number().int().min(60).max(86400).default(300),
  timeoutMs: z.number().int().min(1000).max(10000).default(5000),
  failureThreshold: z.number().int().min(1).max(10).default(3),
  recoveryThreshold: z.number().int().min(1).max(10).default(2),
  fallbackUrl: z.string().optional(),
  autoSwitch: z.boolean().default(true),
});
export type CreateGuardianMonitorRequestV1 = z.infer<typeof CreateGuardianMonitorRequestV1Schema>;

export const UpdateGuardianMonitorRequestV1Schema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
  checkIntervalSec: z.number().int().min(60).max(86400).optional(),
  timeoutMs: z.number().int().min(1000).max(10000).optional(),
  failureThreshold: z.number().int().min(1).max(10).optional(),
  recoveryThreshold: z.number().int().min(1).max(10).optional(),
  fallbackUrl: z.string().optional(),
  autoSwitch: z.boolean().optional(),
});
export type UpdateGuardianMonitorRequestV1 = z.infer<typeof UpdateGuardianMonitorRequestV1Schema>;

export const ConfigureFallbackRequestV1Schema = z.object({
  backupUrl: z.string().min(1),
  failureThreshold: z.number().int().min(1).max(10).default(3),
  autoSwitch: z.boolean().default(true),
  notifyEmails: z.array(z.string().email()).default([]),
});
export type ConfigureFallbackRequestV1 = z.infer<typeof ConfigureFallbackRequestV1Schema>;
