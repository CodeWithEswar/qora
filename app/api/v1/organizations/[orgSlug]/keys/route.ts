import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { queryOrganizationApiKeys, createApiKeyInD1 } from "@nxtqr/db";
import { hashApiKeySecret } from "@/lib/domains/security";
import {
  listApiKeysInStore,
  createApiKeyInStore,
} from "@/lib/domains/organization-store";

interface RouteParams {
  params: Promise<{ orgSlug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.API_KEYS_READ,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.API_KEYS_READ
    );

    const d1 = ctx.db;
    if (!d1) {
      const keys = listApiKeysInStore(orgSlug);
      return apiSuccess({ keys }, ctx.requestId);
    }

    const keys = await queryOrganizationApiKeys(d1, ctx.organizationId);
    return apiSuccess({ keys }, ctx.requestId);
  } catch (error) {
    return handleApiError(error, ctx?.requestId || "req_unknown");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.API_KEYS_MANAGE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.API_KEYS_MANAGE
    );

    const body = await request.json().catch(() => ({}));
    const name = body.name?.trim();
    const scopes = Array.isArray(body.scopes) ? body.scopes : ["qr.read", "analytics.read"];

    if (!name) {
      return handleApiError(new Error("Key name is required"), ctx.requestId);
    }

    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const prefixId = randomHex.slice(0, 8);
    const rawSecret = `nxtqr_live_${prefixId}_${randomHex.slice(8)}`;
    const displayPrefix = `nxtqr_live_••••${prefixId.slice(-4)}`;
    const keyHash = hashApiKeySecret(rawSecret);

    const d1 = ctx.db;
    let keyId = `key_${Date.now()}`;
    const createdAt = Date.now();

    if (d1) {
      keyId = await createApiKeyInD1(d1, {
        organizationId: ctx.organizationId,
        name,
        prefix: displayPrefix,
        keyHash,
        scopes,
      });
    } else {
      createApiKeyInStore(orgSlug, {
        id: keyId,
        name,
        prefix: displayPrefix,
        scopes,
        status: "active",
        createdAt,
      });
    }

    return apiCreated(
      {
        key: {
          id: keyId,
          name,
          prefix: displayPrefix,
          scopes,
          status: "active",
          createdAt,
        },
        secret: rawSecret,
      },
      ctx.requestId
    );
  } catch (error) {
    return handleApiError(error, ctx?.requestId || "req_unknown");
  }
}
