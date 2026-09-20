/**
 * NXTQR — Scan Event Queue Telemetry Contract (Phase 6 / Phase 7 Edge Pipeline)
 * High-volume compact telemetry contract for Cloudflare Queue ingestion.
 * Contains coarse geography, salted day-hash (no raw IP), sanitized user-agent classifications.
 */

import { z } from "zod";
import {
  DeviceClass,
  OSFamily,
  BrowserFamily,
  ReferrerClass,
  TrafficQualityClass,
  ResponseClass,
} from "../analytics";

export const ScanEventV1Schema = z.object({
  schemaVersion: z.literal(1),
  eventId: z.string(),
  occurredAt: z.string(),
  organizationId: z.string(),
  qrId: z.string(),
  campaignId: z.string().optional(),
  routingRuleId: z.string().optional(),
  destinationId: z.string(),
  experimentId: z.string().optional(),
  experimentVariantId: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  deviceClass: z.custom<DeviceClass>((val) => typeof val === "string"),
  osFamily: z.custom<OSFamily>((val) => typeof val === "string"),
  browserFamily: z.custom<BrowserFamily>((val) => typeof val === "string"),
  referrerClass: z.custom<ReferrerClass>((val) => typeof val === "string"),
  trafficQuality: z.custom<TrafficQualityClass>((val) => typeof val === "string"),
  responseClass: z.custom<ResponseClass>((val) => typeof val === "string"),
  resolverVersion: z.literal(1),
  isFallback: z.boolean().optional(),
  ipHash: z.string().optional(),
});

export type ScanEventV1 = {
  schemaVersion: 1;
  eventId: string;
  occurredAt: string;
  organizationId: string;
  qrId: string;
  campaignId?: string;
  routingRuleId?: string;
  destinationId: string;
  experimentId?: string;
  experimentVariantId?: string;
  country?: string;
  region?: string;
  deviceClass: DeviceClass;
  osFamily: OSFamily;
  browserFamily: BrowserFamily;
  referrerClass: ReferrerClass;
  trafficQuality: TrafficQualityClass;
  responseClass: ResponseClass;
  resolverVersion: 1;
  isFallback?: boolean;
  ipHash?: string;
};
