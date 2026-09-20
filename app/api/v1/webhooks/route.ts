import { NextRequest } from "next/server";
import {
  CreateWebhookEndpointRequestV1Schema,
  WebhookEndpointCreatedResponseV1,
  WebhookEndpointResponseV1,
  ALLOWED_WEBHOOK_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { generateOpaqueId } from "@nxtqr/db";
import { validateOutboundUrl } from "@/lib/domains/shared/ssrf";
import { computeKeyHash } from "@/lib/api/auth";

/**
 * GET /api/v1/webhooks — List Configured Webhook Endpoints
 * Invariant: Signing secret is NEVER exposed in list/read responses.
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "webhooks:read",
      permission: "api_keys.manage",
    });

    const d1 = ctx.db;
    let items: WebhookEndpointResponseV1[] = [];

    if (d1) {
      const sql = `
        SELECT id, url, description, status, created_at as createdAt, updated_at as updatedAt
        FROM webhook_endpoints
        WHERE organization_id = ?
        ORDER BY created_at DESC
      `;
      const res = ((await d1.prepare(sql).bind(ctx.organizationId).all()) as any) || {};
      items = (res.results || []).map((r: any) => ({
        id: r.id,
        url: r.url,
        description: r.description || undefined,
        subscribedEvents: [...ALLOWED_WEBHOOK_EVENT_TYPES],
        status: (r.status || "active") as any,
        createdAt: new Date(Number(r.createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(r.updatedAt || r.createdAt) * 1000).toISOString(),
      }));
    }

    return apiCollection(items, { nextCursor: null, hasMore: false }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/webhooks — Register Outbound Webhook Endpoint
 * Invariants:
 * - SSRF Protection: Blocks private IPs, loopback, and cloud metadata.
 * - Requires HTTPS.
 * - Reveals signingSecret ONCE in 201 response.
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "webhooks:manage",
      permission: "api_keys.manage",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateWebhookEndpointRequestV1Schema.parse(rawBody);

    // 1. SSRF Validation (Blocks loopback 127.0.0.1, private IPs, cloud metadata 169.254.169.254)
    validateOutboundUrl(payload.url, { allowHttp: false });

    const endpointId = generateOpaqueId("ep");
    const rawSigningSecret = `nxtqr_whsec_${Math.random().toString(36).substring(2, 14)}_${Date.now().toString(36)}`;
    const secretHash = await computeKeyHash(rawSigningSecret);
    const now = Math.floor(Date.now() / 1000);

    const d1 = ctx.db;
    if (d1) {
      const insertEp = `
        INSERT INTO webhook_endpoints (
          id, organization_id, url, secret_hash, signing_secret, description, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
      `;
      await d1.prepare(insertEp).bind(
        endpointId,
        ctx.organizationId,
        payload.url,
        secretHash,
        rawSigningSecret,
        payload.description || null,
        now,
        now
      ).run();

      const subStatements = payload.subscribedEvents.map((evt) =>
        d1
          .prepare(`INSERT OR IGNORE INTO webhook_subscriptions (endpoint_id, event_type, created_at) VALUES (?, ?, ?)`)
          .bind(endpointId, evt, now)
      );
      await d1.batch(subStatements);
    }

    const response: WebhookEndpointCreatedResponseV1 = {
      id: endpointId,
      url: payload.url,
      description: payload.description,
      subscribedEvents: payload.subscribedEvents,
      status: "active",
      signingSecret: rawSigningSecret, // Shown ONLY ONCE!
      createdAt: new Date(now * 1000).toISOString(),
    };

    return apiCreated(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
