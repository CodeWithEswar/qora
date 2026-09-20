import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { revokeApiKeyInD1 } from "@nxtqr/db";
import { revokeApiKeyInStore } from "@/lib/domains/organization-store";

interface RouteParams {
  params: Promise<{ orgSlug: string; keyId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { orgSlug, keyId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.API_KEYS_MANAGE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.API_KEYS_MANAGE
    );

    const d1 = ctx.db;
    if (d1) {
      await revokeApiKeyInD1(d1, ctx.organizationId, keyId);
    } else {
      revokeApiKeyInStore(orgSlug, keyId);
    }

    return apiSuccess({ success: true, revokedKeyId: keyId }, ctx.requestId);
  } catch (error) {
    return handleApiError(error, ctx?.requestId || "req_unknown");
  }
}
