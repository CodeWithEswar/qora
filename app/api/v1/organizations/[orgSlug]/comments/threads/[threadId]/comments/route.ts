import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseCommentsRepository } from "@/lib/supabase/repositories/comments";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; threadId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, threadId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_CREATE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    if (!body.body || !body.body.trim()) {
      throw new ValidationError("Comment body cannot be empty.");
    }

    const comment = await SupabaseCommentsRepository.createComment(
      org.id,
      threadId,
      {
        body: body.body.trim(),
        replyToCommentId: body.replyToCommentId,
        mentions: body.mentions,
        references: body.references,
        attachments: body.attachments,
      },
      ctx.principal.actorId
    );

    return apiSuccess({ comment }, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
