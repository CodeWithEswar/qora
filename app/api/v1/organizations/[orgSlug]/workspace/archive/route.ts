import { NextRequest } from "next/server";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/workspace/archive
 * Archives a workspace after verifying confirmation.
 */
export async function POST(request: NextRequest, { params }: Params) {
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
    const confirmation = (body.confirmationWorkspaceName || "").trim();

    if (confirmation !== org.name && confirmation !== org.slug) {
      throw new ValidationError(
        `Confirmation mismatch. Please type exactly '${org.name}' or '${org.slug}' to archive.`
      );
    }

    await SupabaseWorkspaceRepository.archiveWorkspace(org.id, ctx.principal.actorId);

    return apiSuccess({ archived: true, id: org.id }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
