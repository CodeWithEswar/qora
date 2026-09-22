import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseCommentsRepository } from "@/lib/supabase/repositories/comments";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; threadId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, threadId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const thread = await SupabaseCommentsRepository.getThreadDetail(
      org.id,
      threadId,
      ctx.principal.actorId
    );

    return apiSuccess({ thread }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
