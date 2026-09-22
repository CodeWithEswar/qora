import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseCommentsRepository } from "@/lib/supabase/repositories/comments";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; threadId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, threadId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.COMMENTS_RESOLVE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    const action = body.action || "resolve"; // "resolve" | "reopen"

    let updated;
    if (action === "resolve") {
      updated = await SupabaseCommentsRepository.resolveThread(
        org.id,
        threadId,
        body.resolutionNote,
        ctx.principal.actorId
      );
    } else if (action === "reopen") {
      updated = await SupabaseCommentsRepository.reopenThread(
        org.id,
        threadId,
        ctx.principal.actorId
      );
    } else {
      throw new ValidationError(`Unsupported resolution action '${action}'.`);
    }

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
