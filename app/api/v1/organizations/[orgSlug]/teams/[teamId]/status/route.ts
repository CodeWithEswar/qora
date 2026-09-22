import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseTeamsRepository } from "@/lib/supabase/repositories/teams";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; teamId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_UPDATE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    const action = body.action;

    if (action === "archive") {
      const result = await SupabaseTeamsRepository.archiveTeam(
        org.id,
        teamId,
        ctx.principal.actorId
      );
      return apiSuccess(result, ctx.requestId);
    } else if (action === "restore") {
      const result = await SupabaseTeamsRepository.restoreTeam(
        org.id,
        teamId,
        ctx.principal.actorId
      );
      return apiSuccess(result, ctx.requestId);
    } else {
      throw new ValidationError("Action must be either 'archive' or 'restore'.");
    }
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
