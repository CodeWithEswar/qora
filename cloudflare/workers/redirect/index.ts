/**
 * NXTQR — High-Performance Edge Redirect Worker & Scan Intelligence
 * 
 * Edge Data Plane (Phase 7):
 *  - Sub-10ms deterministic resolution from Cloudflare KV
 *  - Host-aware custom domain namespace isolation
 *  - Strict slug grammar validation & negative caching
 *  - Pure, deterministic QR Brain rule evaluation
 *  - Guardian-aware health fallback (compact published state)
 *  - Non-blocking async scan telemetry (ScanEventV1)
 *  - D1 authoritative fallback & asynchronous cache repair
 */

import {
  QrResolverSnapshotV1,
  RedirectSnapshot,
  isValidResolverSnapshot,
  resolveDestinationUrl,
  resolveDestinationId,
  ScanEventV1,
  evaluateRoutingPolicy,
  buildResolverKvKey,
} from "@nxtqr/contracts";
import {
  buildResolverContext,
  parseNormalizedTelemetryDimensions,
} from "./evaluator";

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB: any; // Cloudflare D1Database
  REDIRECT_KV: any; // Cloudflare KVNamespace
  ASSETS_R2: any; // Cloudflare R2Bucket
  SCAN_QUEUE: any; // Cloudflare Queue<ScanEventV1>
  SCAN_EVENTS?: any; // Cloudflare Queue<ScanEventV1>
  SCAN_ANALYTICS?: any; // Cloudflare AnalyticsEngineDataset
  REPORT_QUEUE?: any; // Cloudflare Queue<ReportJobV1>
  IP_SALT?: string;
  INTERNAL_API_SECRET?: string;
  DEFAULT_REDIRECT_HOST?: string;
}

export const SLUG_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;

export const RESERVED_SLUGS = new Set([
  "api",
  "admin",
  "auth",
  "login",
  "signup",
  "status",
  "robots.txt",
  "favicon.ico",
  "health",
  "_health",
  "assets",
  "dashboard",
  "docs",
  "settings",
  "billing",
]);

/**
 * Normalizes request host to determine resolver namespace.
 * Isolates custom domain namespaces from default NXTQR short domain.
 */
export function resolveResolverNamespace(request: Request, defaultHost = "nxtqr.vercel.app"): string {
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const [hostname] = hostHeader.toLowerCase().trim().split(":");
  
  if (
    !hostname ||
    hostname === defaultHost.toLowerCase() ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".workers.dev") ||
    hostname.endsWith(".pages.dev")
  ) {
    return "global";
  }
  return hostname;
}

/**
 * Validates slug syntax before any database or storage lookup.
 */
export function validateSlug(rawSlug: string): { valid: boolean; error?: string } {
  if (!rawSlug) return { valid: false, error: "Empty slug" };

  // Guard against path traversal and separator injection
  if (
    rawSlug.includes("..") ||
    rawSlug.includes("/") ||
    rawSlug.includes("\\") ||
    rawSlug.includes("%2f") ||
    rawSlug.includes("%2F")
  ) {
    return { valid: false, error: "Path traversal or separator detected" };
  }

  if (!SLUG_REGEX.test(rawSlug)) {
    return { valid: false, error: "Slug must be 3-64 alphanumeric characters, hyphens, or underscores" };
  }

  if (RESERVED_SLUGS.has(rawSlug.toLowerCase())) {
    return { valid: false, error: "Reserved system route" };
  }

  return { valid: true };
}

/**
 * Authoritative, centralized KV key builder for resolver snapshots.
 * Format: qr:v1:<namespace>:<slug>
 */
export function buildQrResolverKey(slug: string, namespace = "global"): string {
  const normNamespace = namespace.toLowerCase().trim();
  const normSlug = slug.toLowerCase().trim();
  return `qr:v1:${normNamespace}:${normSlug}`;
}

export { buildResolverKvKey };

/**
 * Defensive check for safe destination URL schemes (Invariant 28 & 83).
 */
export function isValidDestinationUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // 01. Handle health check endpoint
    if (pathname === "/health" || pathname === "/_health") {
      return new Response(JSON.stringify({ status: "ok", edge: "active", time: Date.now() }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    // 02. Handle internal user synchronization routes for Next.js control plane
    if (pathname.startsWith("/api/internal/")) {
      return handleInternalApi(request, env, pathname);
    }

    // 03. Method Guard (Requirement 80) — Only GET and HEAD permitted on redirect path
    if (method !== "GET" && method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    // 04. Normalize host and extract slug (/s/:slug or /:slug)
    const defaultHost = env.DEFAULT_REDIRECT_HOST || "nxtqr.vercel.app";
    const namespace = resolveResolverNamespace(request, defaultHost);
    const parts = pathname.split("/").filter(Boolean);
    const rawSlug = parts[0] === "s" ? parts[1] : parts[0];

    if (!rawSlug) {
      return new Response("NXTQR Edge Gateway — Ready", { status: 200 });
    }

    // 05. Slug Grammar Validation (Requirement 13 & 14)
    const slugCheck = validateSlug(rawSlug);
    if (!slugCheck.valid) {
      return renderStatusPage(404, "Invalid QR Link", "This QR code link format is not recognized.", "#FA520F");
    }
    const slug = rawSlug.toLowerCase();

    try {
      const primaryKvKey = buildQrResolverKey(slug, namespace);
      const legacyKvKey = `slug:${slug}`;
      const negKey = `qr:v1:neg:${namespace}:${slug}`;
      let snapshot: QrResolverSnapshotV1 | null = null;

      // 06. Fast Negative Cache Check (mitigates repeated D1 queries on random probes)
      if (env.REDIRECT_KV) {
        const isNeg = await env.REDIRECT_KV.get(negKey);
        if (isNeg) {
          return renderStatusPage(404, "QR Code Not Found", "This QR code does not exist or has been removed.", "#FA520F");
        }
      }

      // 07. Read Snapshot from KV (Hot Path, sub-10ms)
      if (env.REDIRECT_KV) {
        const cached = (await env.REDIRECT_KV.get(primaryKvKey, "json")) ||
                       (namespace === "global" ? await env.REDIRECT_KV.get(legacyKvKey, "json") : null);

        if (cached && isValidResolverSnapshot(cached)) {
          snapshot = cached as QrResolverSnapshotV1;
        }
      }

      // 08. Fallback to D1 on KV Cache Miss
      if (!snapshot && env.DB) {
        snapshot = await fetchSnapshotFromD1(env.DB, slug, namespace);

        if (snapshot && env.REDIRECT_KV) {
          // Asynchronous Cache Repair: re-populate KV without blocking redirect
          ctx.waitUntil(
            env.REDIRECT_KV.put(primaryKvKey, JSON.stringify(snapshot), { expirationTtl: 3600 })
          );
        } else if (!snapshot && env.REDIRECT_KV) {
          // Negative Cache for 60 seconds
          ctx.waitUntil(
            env.REDIRECT_KV.put(negKey, "1", { expirationTtl: 60 })
          );
        }
      }

      // 09. If Asset Not Found
      if (!snapshot) {
        return renderStatusPage(404, "QR Code Not Found", "This QR code does not exist or has been removed.", "#FA520F");
      }

      // 10. Lifecycle Gate Validation (Requirements 22-27)
      const now = Date.now();

      if (snapshot.status === "DRAFT") {
        return renderStatusPage(403, "QR Code in Draft", "This QR code is currently in draft mode and has not been published yet.", "#FFA110");
      }

      if (snapshot.status === "PAUSED") {
        return renderStatusPage(503, "QR Code Paused", "This QR code has been temporarily paused by its owner.", "#6A6A6A");
      }

      if (snapshot.status === "ARCHIVED") {
        return renderStatusPage(410, "QR Code Removed", "This QR code has been archived or removed.", "#6A6A6A");
      }

      const startsAt = snapshot.schedule?.startsAt || snapshot.startsAt;
      if (startsAt && now < startsAt) {
        return renderStatusPage(403, "QR Campaign Scheduled", "This QR campaign is scheduled to start soon. Please check back later.", "#FFA110");
      }

      const expiresAt = snapshot.schedule?.expiresAt || snapshot.expiresAt;
      if (expiresAt && now > expiresAt) {
        return renderStatusPage(410, "QR Code Expired", "This campaign or offer has ended.", "#6A6A6A");
      }

      // 11. Normalize Scanner Context (Computed once)
      const timezone = snapshot.routing?.timezone || snapshot.schedule?.timezone || "UTC";
      const resolverContext = buildResolverContext(request, namespace, slug, timezone);

      // 12. Evaluate Deterministic Routing Policy (QR Brain)
      const evaluation = evaluateRoutingPolicy(snapshot, resolverContext);
      let targetDestination = evaluation.destinationUrl;
      const targetDestinationId = evaluation.destinationId;
      const matchedRuleId = evaluation.matchedRuleId;
      const isFallback = evaluation.isFallback;

      // 13. Defensive Destination Validation (Invariant 28 & 83)
      if (!isValidDestinationUrl(targetDestination)) {
        console.error("Invalid destination URL scheme encountered:", targetDestination);
        return renderStatusPage(500, "Destination Unavailable", "The target destination has an invalid format.", "#FA520F");
      }

      // 14. Asynchronous Scan Telemetry Ingestion (ScanEventV1)
      // HEAD requests do NOT emit scan analytics (Requirement 124)
      if (method === "GET") {
        const queueBinding = env.SCAN_EVENTS || env.SCAN_QUEUE;
        if (queueBinding) {
          const ipSalt = env.IP_SALT || "nxtqr_salt_2026";
          const clientIp = request.headers.get("cf-connecting-ip") || "0.0.0.0";
          const normalized = parseNormalizedTelemetryDimensions(request);

          ctx.waitUntil((async () => {
            try {
              const ipHash = await hashString(`${clientIp}-${ipSalt}-${new Date().toISOString().slice(0, 10)}`);
              const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

              const event: ScanEventV1 = {
                schemaVersion: 1,
                eventId,
                occurredAt: new Date(now).toISOString(),
                organizationId: snapshot.organizationId || (snapshot as any).orgId,
                qrId: snapshot.qrId,
                routingRuleId: matchedRuleId,
                destinationId: targetDestinationId || targetDestination,
                experimentId: snapshot.experiment?.id,
                experimentVariantId: evaluation.trace?.selectedVariantId,
                country: normalized.country,
                region: normalized.region,
                deviceClass: normalized.deviceClass,
                osFamily: normalized.osFamily,
                browserFamily: normalized.browserFamily,
                referrerClass: normalized.referrerClass,
                trafficQuality: normalized.trafficQuality,
                responseClass: "REDIRECTED",
                resolverVersion: 1,
                isFallback,
                ipHash,
              };

              await queueBinding.send(event);
            } catch (err) {
              // Invariant 17: Telemetry failures must never break valid redirect
              console.error("Non-blocking scan telemetry enqueue error:", err);
            }
          })());
        }
      }

      // 15. Deliver Safe HTTP 302 Found Redirect (Requirements 79, 81, 82, 127)
      return new Response(null, {
        status: 302,
        headers: {
          Location: targetDestination,
          "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
          "Referrer-Policy": "no-referrer-when-downgrade",
          "X-Content-Type-Options": "nosniff",
          "X-NXTQR-Resolved": "1",
        },
      });
    } catch (err: any) {
      console.error("Redirect resolution error:", err);
      return renderStatusPage(500, "Service Unavailable", "A temporary issue occurred while resolving this destination.", "#FA520F");
    }
  },

  /**
   * Cloudflare Queue Consumer: Batch processes scan telemetry events.
   * Emits to Cloudflare Analytics Engine (high-volume) and updates D1 hourly rollups.
   */
  async queue(batch: { messages: Array<{ body: any }> }, env: Env): Promise<void> {
    if (batch.messages.length === 0) return;

    for (const msg of batch.messages) {
      const event = msg.body;
      if (!event || (!event.qrId && !event.eventId)) continue;

      // 1. Emit to Cloudflare Analytics Engine if bound
      if (env.SCAN_ANALYTICS && typeof env.SCAN_ANALYTICS.writeDataPoint === "function") {
        try {
          env.SCAN_ANALYTICS.writeDataPoint({
            blobs: [
              event.organizationId || "unknown_org",
              event.qrId || "unknown_qr",
              event.country || "XX",
              event.deviceClass || "DESKTOP",
              event.osFamily || "UNKNOWN",
              event.browserFamily || "UNKNOWN",
              event.trafficQuality || "NORMAL",
              event.routingRuleId || "none",
              event.experimentVariantId || "none",
            ],
            doubles: [
              1, // Total scan count
              event.trafficQuality === "SUSPECTED_AUTOMATION" ? 1 : 0,
              event.isFallback ? 1 : 0,
            ],
            indexes: [
              event.organizationId || "unknown_org",
            ],
          });
        } catch (analyticsErr) {
          console.error("Analytics Engine write error:", analyticsErr);
        }
      }

      // 2. Aggregate Rollup into D1 scan_events_hourly
      if (env.DB) {
        const timestamp = event.occurredAt ? new Date(event.occurredAt).getTime() : (event.timestamp || Date.now());
        const hourBucket = Math.floor(timestamp / 3600000) * 3600000;
        const country = (event.country || event.countryCode || "XX").toUpperCase();
        const deviceType = (event.deviceClass || event.deviceType || "desktop").toLowerCase();
        const osName = event.osFamily || event.osName || "Unknown";
        const browserName = event.browserFamily || event.browserName || "Unknown";

        const upsertSql = `
          INSERT INTO scan_events_hourly (
            id, qr_id, organization_id, hour_bucket, total_scans, estimated_unique_scans,
            country_code, device_type, os_name, browser_name
          ) VALUES (
            ?, ?, ?, ?, 1, 1, ?, ?, ?, ?
          )
          ON CONFLICT(qr_id, hour_bucket, country_code, device_type, os_name) DO UPDATE SET
            total_scans = total_scans + 1
        `;

        const id = `scan_${event.qrId}_${hourBucket}_${country}_${deviceType}_${osName.replace(/[^a-zA-Z0-9]/g, '')}`;

        try {
          await env.DB.prepare(upsertSql).bind(
            id,
            event.qrId,
            event.organizationId,
            hourBucket,
            country,
            deviceType,
            osName,
            browserName
          ).run();
        } catch (err) {
          console.error("Queue batch insert error for event:", event.eventId, err);
        }
      }
    }
  },
};

/**
 * Authoritative D1 fallback query with minimal projection.
 */
async function fetchSnapshotFromD1(db: any, slug: string, namespace = "global"): Promise<QrResolverSnapshotV1 | null> {
  const query = `
    SELECT 
      q.id as qrId,
      q.organization_id as orgId,
      q.status as status,
      q.published_revision as publishedRevision,
      d.id as destinationId,
      d.default_url as defaultDestination,
      d.fallback_url as fallbackDestination,
      d.password_hash as passwordHash,
      d.starts_at as startsAt,
      d.expires_at as expiresAt,
      q.updated_at as updatedAt
    FROM qr_codes q
    LEFT JOIN qr_destinations d ON d.qr_id = q.id
    WHERE q.slug = ? AND q.status != 'ARCHIVED'
    LIMIT 1
  `;

  const row = await db.prepare(query).bind(slug).first();
  if (!row || !row.defaultDestination) return null;

  return {
    schemaVersion: 1,
    qrId: row.qrId,
    organizationId: row.orgId,
    status: row.status,
    publishedRevision: row.publishedRevision || 1,
    defaultDestination: {
      id: row.destinationId || row.qrId,
      url: row.defaultDestination,
    },
    fallbackDestination: row.fallbackDestination
      ? {
          id: `fallback_${row.qrId}`,
          url: row.fallbackDestination,
        }
      : undefined,
    passwordHash: row.passwordHash || undefined,
    startsAt: row.startsAt || undefined,
    expiresAt: row.expiresAt || undefined,
    rules: [],
    guardianHealthy: true,
    publishedAt: new Date(row.updatedAt || Date.now()).toISOString(),
    updatedAt: row.updatedAt,
  };
}

/**
 * SHA-256 coarse hashing helper for privacy-safe analytics
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
}

/**
 * Branded public status page renderer for non-active states
 */
function renderStatusPage(status: number, title: string, message: string, accentColor: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — NXTQR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #111111;
      color: #F7F4EC;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #191919;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${accentColor};
      margin-bottom: 20px;
      box-shadow: 0 0 12px ${accentColor};
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #B8B5AD;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 16px;
      font-size: 12px;
      color: #85827B;
      letter-spacing: 0.04em;
    }
    .brand {
      color: #FA520F;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"></div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">
      Powered by <span class="brand">NXTQR</span> Intelligence
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Internal API handler for Next.js SaaS backend -> Cloudflare D1 synchronization.
 */
async function handleInternalApi(request: Request, env: Env, pathname: string): Promise<Response> {
  // 1. Authenticate using Bearer token
  const authHeader = request.headers.get("authorization");
  const expectedSecret = env.INTERNAL_API_SECRET || "nxtqr_secret_prod_edge_2026";

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized access to edge internal API" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // 2. Sync Google User & Provision in D1
  if (pathname === "/api/internal/users/sync" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        googleSub: string;
        email: string;
        name: string;
        avatarUrl?: string;
      };

      if (!body.googleSub || !body.email) {
        return new Response(JSON.stringify({ error: "Missing required profile fields" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      const email = body.email.toLowerCase().trim();
      const now = Math.floor(Date.now() / 1000);

      // Check if user exists via auth_accounts (Google Sub)
      const existingAccount = (await env.DB.prepare(
        "SELECT user_id FROM auth_accounts WHERE provider = 'google' AND provider_account_id = ? LIMIT 1"
      )
        .bind(body.googleSub)
        .first()) as { user_id: string } | null;

      let userId = existingAccount?.user_id;

      // If not linked via Google Sub yet, check by verified email
      if (!userId) {
        const existingUser = (await env.DB.prepare(
          "SELECT id FROM users WHERE email = ? LIMIT 1"
        )
          .bind(email)
          .first()) as { id: string } | null;
        userId = existingUser?.id;
      }

      let isNewUser = false;

      if (userId) {
        // Update user profile in Cloudflare D1
        await env.DB.prepare(
          "UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?"
        )
          .bind(body.name || "User", body.avatarUrl || null, now, userId)
          .run();

        // Ensure google account is linked in auth_accounts
        await env.DB.prepare(
          "INSERT OR IGNORE INTO auth_accounts (id, user_id, provider, provider_account_id, created_at) VALUES (?, ?, 'google', ?, ?)"
        )
          .bind(`acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, userId, body.googleSub, now)
          .run();
      } else {
        // Brand new user registration in Cloudflare D1
        isNewUser = true;
        userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const accountId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO users (id, email, name, avatar_url, timezone, created_at, updated_at) VALUES (?, ?, ?, ?, 'UTC', ?, ?)"
          ).bind(userId, email, body.name || "User", body.avatarUrl || null, now, now),
          env.DB.prepare(
            "INSERT INTO auth_accounts (id, user_id, provider, provider_account_id, created_at) VALUES (?, ?, 'google', ?, ?)"
          ).bind(accountId, userId, body.googleSub, now),
        ]);
      }

      // Query active workspaces for this user from D1
      const orgs = (await env.DB.prepare(`
        SELECT o.id, o.name, o.slug, o.billing_plan as plan, mr.role_id
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        LEFT JOIN member_roles mr ON mr.member_id = om.id
        WHERE om.user_id = ? AND om.status = 'active'
      `)
        .bind(userId)
        .all()) as { results?: Array<{ id: string; name: string; slug: string; plan: string; role_id: string | null }> };

      const workspaces = (orgs?.results || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        role: (o.role_id ? o.role_id.replace("role_", "") : "owner") as any,
        plan: o.plan || "FREE",
      }));

      return new Response(
        JSON.stringify({
          success: true,
          isNewUser: isNewUser || workspaces.length === 0,
          user: {
            id: userId,
            email,
            name: body.name,
            avatarUrl: body.avatarUrl,
            provider: "google",
            onboardingCompleted: workspaces.length > 0,
            workspaces,
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    } catch (err: any) {
      console.error("Internal sync error:", err);
      return new Response(JSON.stringify({ error: err?.message || "Sync failed" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  }

  // 3. User Onboarding (Create workspace in D1)
  if (pathname === "/api/internal/users/onboarding" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        userId: string;
        workspaceName: string;
        workspaceSlug: string;
      };

      if (!body.userId || !body.workspaceName || !body.workspaceSlug) {
        return new Response(JSON.stringify({ error: "Missing required onboarding parameters" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      const now = Math.floor(Date.now() / 1000);
      const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const slug = body.workspaceSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");

      // Verify user exists in D1
      const user = await env.DB.prepare("SELECT id, name, email FROM users WHERE id = ?")
        .bind(body.userId)
        .first();
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found in D1" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      }

      // Create organization and link member
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO organizations (id, name, slug, billing_plan, created_at, updated_at) VALUES (?, ?, ?, 'FREE', ?, ?)"
        ).bind(orgId, body.workspaceName.trim(), slug, now, now),
        env.DB.prepare(
          "INSERT INTO organization_members (id, organization_id, user_id, status, joined_at) VALUES (?, ?, ?, 'active', ?)"
        ).bind(memberId, orgId, body.userId, now),
        env.DB.prepare(
          "INSERT INTO member_roles (member_id, role_id) VALUES (?, 'role_owner')"
        ).bind(memberId),
      ]);

      const workspace = {
        id: orgId,
        name: body.workspaceName.trim(),
        slug,
        role: "owner" as const,
        plan: "FREE",
      };

      return new Response(
        JSON.stringify({
          success: true,
          workspace,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    } catch (err: any) {
      console.error("Internal onboarding error:", err);
      return new Response(JSON.stringify({ error: err?.message || "Onboarding failed" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}
