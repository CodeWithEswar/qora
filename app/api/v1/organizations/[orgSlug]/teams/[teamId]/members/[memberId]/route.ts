import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { removeTeamMemberInD1 } from "@nxtqr/db";
import { removeTeamMemberInStore } from "@/lib/domains/organization-store";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ orgSlug: string; teamId: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_UPDATE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.TEAMS_UPDATE
    );

    const d1 = ctx.db;
    if (d1) {
      await removeTeamMemberInD1(d1, ctx.organizationId, teamId, memberId);
    } else {
      removeTeamMemberInStore(orgSlug, teamId, memberId);
    }

    return apiSuccess({ success: true, teamId, removedMemberId: memberId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
