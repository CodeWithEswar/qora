import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseCommentsRepository } from "@/lib/supabase/repositories/comments";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; threadId: string; commentId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, commentId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_EDIT,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    if (!body.body || !body.body.trim()) {
      throw new ValidationError("Comment body cannot be empty.");
    }

    const updated = await SupabaseCommentsRepository.editComment(
      org.id,
      commentId,
      body.body.trim(),
      ctx.principal.actorId
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; threadId: string; commentId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, commentId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_DELETE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const result = await SupabaseCommentsRepository.deleteComment(
      org.id,
      commentId,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
