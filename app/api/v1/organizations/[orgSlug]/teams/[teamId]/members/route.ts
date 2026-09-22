import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseTeamsRepository } from "@/lib/supabase/repositories/teams";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function PUT(
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
    if (!Array.isArray(body.membershipIds)) {
      throw new ValidationError("Body property 'membershipIds' must be an array of membership IDs.");
    }

    const result = await SupabaseTeamsRepository.updateTeamMembers(
      org.id,
      teamId,
      body.membershipIds,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
