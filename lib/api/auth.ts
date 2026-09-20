/**
 * NXTQR — Developer API Authentication & Principal Resolution
 * Invariants:
 * - Prefix is only a lookup/display aid; SHA-256 hash verification establishes validity.
 * - Client-supplied organizationId is NEVER trusted; tenant resolved strictly from authenticated principal.
 * - Plaintext API keys are never stored, never logged.
 */

import { NextRequest } from "next/server";
import { UnauthorizedError, ForbiddenError } from "@nxtqr/contracts";
async function resolveSession() {
  try {
    const mod = await import("@/lib/auth/session");
    const session = await mod.getSession();
    if (session?.user?.id) return session;
  } catch {}

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.id) {
      return {
        user: {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          avatarUrl: user.user_metadata?.avatar_url || "",
          provider: "google" as const,
          onboardingCompleted: true,
          workspaces: [],
        },
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
    }
  } catch {}

  return null;
}

export interface ApiPrincipal {
  type: "api_key" | "session";
  actorId: string;
  organizationId: string;
  scopes: string[];
  role?: string;
  name?: string;
}

/**
 * SHA-256 hash helper compatible with Edge runtime and Node.js
 */
export async function computeKeyHash(rawKey: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(rawKey));
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require("crypto");
  return nodeCrypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Authenticates an incoming HTTP request via API Key or Session.
 */
export async function authenticatePrincipal(
  request: NextRequest,
  db?: any
): Promise<ApiPrincipal> {
  // 1. Check Authorization Bearer or X-Api-Key
  const authHeader = request.headers.get("authorization") || "";
  let apiKeySecret = "";

  if (authHeader.startsWith("Bearer ") || authHeader.startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token.startsWith("nxtqr_")) {
      apiKeySecret = token;
    }
  }

  if (!apiKeySecret) {
    const customHeader = request.headers.get("x-api-key") || "";
    if (customHeader.startsWith("nxtqr_")) {
      apiKeySecret = customHeader.trim();
    }
  }

  // 2. If API Key provided, perform hash verification against Supabase (authoritative) and D1 fallback
  if (apiKeySecret) {
    const keyHash = await computeKeyHash(apiKeySecret);

    // 2a. Supabase Authoritative API Key lookup
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      const { data: keyRow, error } = await supabase
        .from("api_keys")
        .select(`
          id,
          organization_id,
          name,
          scopes,
          status,
          expires_at,
          organization:organizations(status)
        `)
        .eq("key_hash", keyHash)
        .maybeSingle();

      if (keyRow) {
        if (keyRow.status !== "active") {
          throw new UnauthorizedError("API key has been revoked.");
        }

        if (keyRow.expires_at && new Date(keyRow.expires_at).getTime() < Date.now()) {
          throw new UnauthorizedError("API key has expired.");
        }

        const orgStatus = (keyRow.organization as any)?.status;
        if (orgStatus === "SUSPENDED") {
          throw new ForbiddenError("Organization account is currently suspended.");
        }

        let scopes: string[] = [];
        if (Array.isArray(keyRow.scopes)) {
          scopes = keyRow.scopes as string[];
        } else if (typeof keyRow.scopes === "string") {
          try {
            scopes = JSON.parse(keyRow.scopes);
          } catch {
            scopes = [];
          }
        }

        // Asynchronously update last_used_at
        supabase
          .from("api_keys")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", keyRow.id)
          .then(() => {}, () => {});

        return {
          type: "api_key",
          actorId: keyRow.id,
          organizationId: keyRow.organization_id,
          scopes,
          name: keyRow.name,
        };
      }
    } catch (err) {
      if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
        throw err;
      }
      console.warn("[authenticatePrincipal] Supabase API key check notice:", err);
    }

    // 2b. D1 fallback lookup
    const d1 = db || (request as any).env?.DB;
    if (d1) {
      const query = `
        SELECT 
          k.id, k.organization_id as orgId, k.name, k.scopes_json as scopesJson,
          k.status, k.expires_at as expiresAt, o.status as orgStatus
        FROM api_keys k
        JOIN organizations o ON o.id = k.organization_id
        WHERE k.key_hash = ?
        LIMIT 1
      `;
      const keyRow = (await d1.prepare(query).bind(keyHash).first()) as {
        id: string;
        orgId: string;
        name: string;
        scopesJson: string;
        status: string;
        expiresAt: number | null;
        orgStatus: string;
      } | null;

      if (!keyRow) {
        throw new UnauthorizedError("Invalid or unknown API key.");
      }

      if (keyRow.status !== "active") {
        throw new UnauthorizedError("API key has been revoked.");
      }

      if (keyRow.expiresAt && keyRow.expiresAt < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedError("API key has expired.");
      }

      if (keyRow.orgStatus === "SUSPENDED") {
        throw new ForbiddenError("Organization account is currently suspended.");
      }

      let scopes: string[] = [];
      try {
        scopes = JSON.parse(keyRow.scopesJson || "[]");
      } catch {
        scopes = [];
      }

      try {
        d1.prepare("UPDATE api_keys SET last_used_at = unixepoch() WHERE id = ?").bind(keyRow.id).run().catch(() => {});
      } catch {}

      return {
        type: "api_key",
        actorId: keyRow.id,
        organizationId: keyRow.orgId,
        scopes,
        name: keyRow.name,
      };
    }

    throw new UnauthorizedError("Invalid API key.");
  }

  // 3. Fallback: Authenticated User Session (Cookie)
  const session = await resolveSession();
  if (session && session.user && session.user.id) {
    const d1 = db || (request as any).env?.DB;
    let requestedOrg =
      request.headers.get("x-organization-slug") ||
      request.nextUrl?.searchParams?.get("orgSlug") ||
      request.nextUrl?.searchParams?.get("organizationId");

    if (!requestedOrg) {
      const referer = request.headers.get("referer");
      if (referer) {
        try {
          const refUrl = new URL(referer);
          const firstSegment = refUrl.pathname.split("/").filter(Boolean)[0];
          if (
            firstSegment &&
            !["api", "login", "signup", "signin", "register", "features", "pricing", "security", "privacy", "terms", "docs", "s"].includes(firstSegment)
          ) {
            requestedOrg = firstSegment;
          }
        } catch {}
      }
    }

    let activeWorkspace: any = null;

    // 3a. Authoritative Check via Supabase PostgreSQL
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      if (requestedOrg) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedOrg);
        let orgQuery = supabase.from("organizations").select("id, name, slug, billing_plan");
        const { data: org } = isUuid
          ? await orgQuery.eq("id", requestedOrg).maybeSingle()
          : await orgQuery.or(`slug.eq.${requestedOrg},legacy_id.eq.${requestedOrg}`).maybeSingle();

        if (org) {
          // Verify user's membership
          const { data: mem } = await supabase
            .from("organization_memberships")
            .select(`
              id,
              status,
              member_roles(role:roles(code, name))
            `)
            .eq("organization_id", org.id)
            .eq("user_id", session.user.id)
            .eq("status", "active")
            .maybeSingle();

          const sessionWs = session.user.workspaces?.find(
            (w: any) => w.slug === requestedOrg || w.id === org.id || w.slug === org.slug
          );

          if (mem || sessionWs) {
            const roleName = (mem as any)?.member_roles?.[0]?.role?.code || sessionWs?.role || "OWNER";
            activeWorkspace = {
              id: org.id,
              name: org.name,
              slug: org.slug,
              plan: org.billing_plan || "FREE",
              role: roleName,
            };
          }
        }
      } else {
        const { data: mems } = await supabase
          .from("organization_memberships")
          .select(`
            id,
            organization:organizations(id, name, slug, billing_plan)
          `)
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .limit(1);

        const firstOrg: any = mems?.[0]?.organization;
        if (firstOrg) {
          activeWorkspace = {
            id: firstOrg.id,
            name: firstOrg.name,
            slug: firstOrg.slug,
            plan: firstOrg.billing_plan || "FREE",
            role: "OWNER",
          };
        }
      }
    } catch (err) {
      console.warn("[authenticatePrincipal] Supabase tenancy check notice:", err);
    }

    // 3b. Verify against user's authenticated session workspaces
    if (!activeWorkspace && requestedOrg) {
      const sessionWs = session.user.workspaces?.find(
        (w: any) => w.slug === requestedOrg || w.id === requestedOrg
      );
      if (sessionWs) {
        activeWorkspace = sessionWs;
      }
    }

    // 3c. Fallback to Cloudflare D1 if available
    if (!activeWorkspace && d1) {
      try {
        if (requestedOrg) {
          let userOrg = (await d1
            .prepare(
              `SELECT o.id, o.name, o.slug, o.billing_plan as plan, COALESCE(r.name, 'MEMBER') as role
               FROM organization_members om
               JOIN organizations o ON o.id = om.organization_id
               LEFT JOIN member_roles mr ON mr.member_id = om.id
               LEFT JOIN roles r ON r.id = mr.role_id
               WHERE om.user_id = ? AND (o.slug = ? OR o.id = ?) AND om.status = 'active'
               LIMIT 1`
            )
            .bind(session.user.id, requestedOrg, requestedOrg)
            .first()) as any;

          if (userOrg) {
            activeWorkspace = {
              id: userOrg.id,
              name: userOrg.name,
              slug: userOrg.slug,
              plan: userOrg.plan || "FREE",
              role: userOrg.role || "OWNER",
            };
          }
        } else {
          const userOrg = (await d1
            .prepare(
              `SELECT o.id, o.name, o.slug, o.billing_plan as plan, COALESCE(r.name, 'OWNER') as role
               FROM organization_members om
               JOIN organizations o ON o.id = om.organization_id
               LEFT JOIN member_roles mr ON mr.member_id = om.id
               LEFT JOIN roles r ON r.id = mr.role_id
               WHERE om.user_id = ? AND om.status = 'active'
               ORDER BY om.joined_at ASC LIMIT 1`
            )
            .bind(session.user.id)
            .first()) as any;

          if (userOrg) {
            activeWorkspace = {
              id: userOrg.id,
              name: userOrg.name,
              slug: userOrg.slug,
              plan: userOrg.plan || "FREE",
              role: userOrg.role || "OWNER",
            };
          }
        }
      } catch (err: any) {
        console.warn("[authenticatePrincipal] D1 tenancy check notice:", err);
      }
    }

    if (!activeWorkspace && !requestedOrg) {
      activeWorkspace = session.user.workspaces?.[0];
    }

    if (!activeWorkspace) {
      throw new ForbiddenError(
        requestedOrg
          ? `You do not have access to organization '${requestedOrg}'.`
          : "No active workspace found for user."
      );
    }

    return {
      type: "session",
      actorId: session.user.id,
      organizationId: activeWorkspace.id,
      scopes: ["*"], // User sessions map to RBAC matrix
      role: activeWorkspace.role || "OWNER",
      name: session.user.name,
    };
  }

  throw new UnauthorizedError("Authentication required. Please provide a valid API key via Authorization header.");
}
