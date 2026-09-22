import { NextRequest } from "next/server";
import { NotFoundError } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * PATCH /api/v1/organizations/:orgSlug/workspace/general
 * Updates workspace name, slug, description, timezone, and locale.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.update",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    const updated = await SupabaseWorkspaceRepository.updateGeneralSettings(
      org.id,
      body,
      ctx.principal.actorId
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
