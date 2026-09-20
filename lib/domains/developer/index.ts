/**
 * NXTQR — 11 Developer Platform Bounded Context
 * Responsibilities: Public API v1, versioned DTOs, API key management, webhook dispatching & delivery.
 * Invariants:
 * - Public API exposes versioned DTOs (e.g. QrResponseV1), never raw internal D1 database rows.
 * - Customer webhook delivery is strictly asynchronous (via Queues) and protected against SSRF.
 */

import { validateOutboundUrl } from "../shared/ssrf";
import { ForbiddenError, ValidationError } from "../shared/errors";
import { QRAsset } from "@nxtqr/contracts";

export interface ApiKeyEntity {
  id: string;
  organizationId: string;
  name: string;
  prefix: string;
  keyHash: string;
  scopes: string[];
  lastUsedAt?: number;
  expiresAt?: number;
  status: "active" | "revoked";
  createdAt: number;
}

export interface WebhookEndpointEntity {
  id: string;
  organizationId: string;
  url: string;
  secretHash: string;
  signingSecret: string; // Stored securely; used by queue consumer to sign outbound payloads (never returned in public GET DTOs)
  subscribedEvents: string[];
  status: "active" | "disabled";
  createdAt: number;
}

export interface WebhookSubscriptionEntity {
  endpointId: string;
  eventType: string;
  createdAt: number;
}

export interface WebhookEventEntity {
  id: string;
  organizationId: string;
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface WebhookDeliveryAttempt {
  id: string;
  deliveryId?: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
  httpStatus?: number;
  responseMs?: number;
  attemptNumber: number;
  nextRetryAt?: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "RETRYING";
  createdAt: number;
}

/**
 * Public API Version 1 Data Transfer Object
 */
export interface QrResponseV1 {
  id: string;
  slug: string;
  name: string;
  type: string;
  status: string;
  destinationUrl: string;
  scanUrl: string;
  design: Record<string, any>;
  createdAt: string; // ISO 8601 string for public consumption
  updatedAt: string;
}

/**
 * Maps internal QR asset to public API V1 representation.
 */
export function toPublicQrV1(asset: QRAsset, baseDomain = "https://nxtqr.vercel.app"): QrResponseV1 {
  return {
    id: asset.id,
    slug: asset.slug,
    name: asset.name,
    type: asset.qrType,
    status: asset.status,
    destinationUrl: asset.destination.defaultUrl,
    scanUrl: `${baseDomain}/s/${asset.slug}`,
    design: {
      pixelStyle: asset.design.pixelStyle,
      fgColor: asset.design.fgColor,
      bgColor: asset.design.bgColor,
    },
    createdAt: new Date(asset.createdAt * 1000).toISOString(),
    updatedAt: new Date(asset.updatedAt * 1000).toISOString(),
  };
}

/**
 * Asserts that an API Key holds the required scope.
 */
export function assertApiKeyScope(keyScopes: string[], requiredScope: string): void {
  if (!keyScopes.includes(requiredScope) && !keyScopes.includes("*")) {
    throw new ForbiddenError(`API key is missing required scope '${requiredScope}'`);
  }
}

/**
 * Validates a new webhook endpoint URL (including SSRF check).
 */
export function validateWebhookEndpointUrl(rawUrl: string): string {
  const parsed = validateOutboundUrl(rawUrl, { allowHttp: false });
  return parsed.toString();
}

/**
 * Calculates exponential backoff retry schedule for webhook deliveries.
 */
export function calculateNextWebhookRetry(attemptCount: number): number | null {
  // Max 5 attempts
  if (attemptCount >= 5) return null;
  // Staggered: 1m, 5m, 30m, 2h
  const delaysMinutes = [1, 5, 30, 120];
  const delayMs = (delaysMinutes[attemptCount - 1] || 120) * 60 * 1000;
  return Date.now() + delayMs;
}

/**
 * Computes standard HMAC-SHA256 signature for outbound customer webhook delivery.
 * Attached to outbound requests as `X-NXTQR-Signature: sha256=<hex>`
 */
export async function computeWebhookSignature(
  rawPayload: string,
  signingSecret: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(rawPayload));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${hex}`;
}

