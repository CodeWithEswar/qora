import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { revokeInvitationInD1 } from "@nxtqr/db";
import { revokeInvitationInStore } from "@/lib/domains/organization-store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; invitationId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, invitationId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.MEMBERS_REMOVE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.MEMBERS_REMOVE
    );

    const d1 = ctx.db;
    if (d1) {
      await revokeInvitationInD1(d1, ctx.organizationId, invitationId, ctx.principal.actorId);
    } else {
      revokeInvitationInStore(orgSlug, invitationId);
    }

    return apiSuccess({ success: true, revokedId: invitationId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
