import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { addTeamMembersInD1 } from "@nxtqr/db";
import { updateMemberTeamsInStore } from "@/lib/domains/organization-store";
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

    const d1 = ctx.db;
    if (d1) {
      // Clear member's current teams
      await d1
        .prepare(`
          DELETE FROM team_members 
          WHERE member_id = ? AND team_id IN (
            SELECT id FROM teams WHERE organization_id = ?
          )
        `)
        .bind(memberId, ctx.organizationId)
        .run();

      // Assign to each selected team
      for (const teamId of data.teamIds) {
        await addTeamMembersInD1(d1, ctx.organizationId, teamId, [memberId]);
      }
    } else {
      updateMemberTeamsInStore(orgSlug, memberId, data.teamIds);
    }

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
