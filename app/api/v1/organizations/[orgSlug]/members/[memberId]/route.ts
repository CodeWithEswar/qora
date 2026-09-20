import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { removeMemberFromD1 } from "@nxtqr/db";
import { removeMemberInStore } from "@/lib/domains/organization-store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.MEMBERS_REMOVE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.MEMBERS_REMOVE
    );

    const d1 = ctx.db;
    let removedMemberEmail = "";
    if (d1) {
      const res = await removeMemberFromD1(
        d1,
        ctx.organizationId,
        memberId,
        ctx.principal.actorId
      );
      removedMemberEmail = res.removedMemberEmail;
    } else {
      const res = removeMemberInStore(orgSlug, memberId);
      removedMemberEmail = res.removedMemberEmail;
    }

    return apiSuccess(
      {
        success: true,
        removedMemberId: memberId,
        removedMemberEmail,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
