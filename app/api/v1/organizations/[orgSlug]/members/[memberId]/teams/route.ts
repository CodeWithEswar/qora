import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";
import { z } from "zod";

const ManageMemberTeamsSchema = z.object({
  teamIds: z.array(z.string()),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_UPDATE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.TEAMS_UPDATE
    );

    const body = await request.json();
    const data = ManageMemberTeamsSchema.parse(body);

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    await SupabaseMembersRepository.updateMemberTeams(
      org.id,
      memberId,
      data.teamIds,
      ctx.principal.actorId
    );

    return apiSuccess(
      {
        success: true,
        memberId,
        assignedTeamCount: data.teamIds.length,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
