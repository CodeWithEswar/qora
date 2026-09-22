import { NextRequest } from "next/server";
import { NotFoundError, ValidationError, ForbiddenError } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/workspace
 * Retrieves the full Workspace Control Plane overview.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const overview = await SupabaseWorkspaceRepository.getWorkspaceOverview(
      orgSlug,
      ctx.principal.actorId
    );

    return apiSuccess(overview, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/organizations/:orgSlug/workspace
 * Destructively deletes a workspace with typed confirmation.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const body = await request.json().catch(() => ({}));
    const confirmation = (body.confirmationWorkspaceName || "").trim();

    if (confirmation !== org.name && confirmation !== org.slug) {
      throw new ValidationError(
        `Confirmation mismatch. Please type exactly '${org.name}' or '${org.slug}' to proceed.`
      );
    }

    await SupabaseWorkspaceRepository.deleteWorkspace(org.id, ctx.principal.actorId);

    return apiSuccess({ deleted: true, id: org.id }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
