/**
 * NXTQR — Legacy Telemetry Payload Contracts
 * Maintained for backward compatibility with earlier phase scripts.
 */

export interface ScanTelemetryPayload {
  eventId: string;
  qrId: string;
  organizationId: string;
  timestamp: number;
  ipHash: string;
  countryCode?: string;
  region?: string;
  city?: string;
  deviceType?: "mobile" | "tablet" | "desktop" | "bot";
  osName?: string;
  osVersion?: string;
  browserName?: string;
  referrer?: string;
  resolvedDestination: string;
  matchedRuleId?: string;
  experimentVariantId?: string;
  isFallback: boolean;
}

export interface ConversionEventPayload {
  eventId: string;
  qrId: string;
  organizationId: string;
  eventName: string;
  eventValue?: number;
  currency?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface GuardianIncidentPayload {
  incidentId: string;
  qrId: string;
  organizationId: string;
  destinationUrl: string;
  httpStatus?: number;
  failureReason: string;
  latencyMs: number;
  fallbackTriggered: boolean;
  timestamp: number;
}
