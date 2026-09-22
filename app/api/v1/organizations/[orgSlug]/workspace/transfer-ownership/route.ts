import { NextRequest } from "next/server";
import { NotFoundError, ValidationError, ForbiddenError } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/workspace/transfer-ownership
 * Transfers workspace ownership to an eligible active member with typed confirmation.
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
    const { newOwnerMemberId, confirmationWorkspaceName } = body;

    if (!newOwnerMemberId) {
      throw new ValidationError("Target member ID is required.");
    }

    const confirmation = (confirmationWorkspaceName || "").trim();
    if (confirmation !== org.name && confirmation !== org.slug) {
      throw new ValidationError(
        `Confirmation mismatch. Please type exactly '${org.name}' or '${org.slug}' to confirm ownership transfer.`
      );
    }

    await SupabaseWorkspaceRepository.transferOwnership(
      org.id,
      newOwnerMemberId,
      ctx.principal.actorId
    );

    return apiSuccess({ success: true, message: "Workspace ownership transferred successfully." }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
