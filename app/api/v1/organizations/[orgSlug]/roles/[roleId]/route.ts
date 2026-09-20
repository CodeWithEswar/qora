import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { deleteCustomRoleInD1 } from "@nxtqr/db";
import { deleteRoleInStore } from "@/lib/domains/organization-store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; roleId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.ROLES_DELETE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.ROLES_DELETE
    );

    const d1 = ctx.db;
    if (d1) {
      await deleteCustomRoleInD1(d1, ctx.organizationId, roleId);
    } else {
      deleteRoleInStore(orgSlug, roleId);
    }

    return apiSuccess({ success: true, deletedRoleId: roleId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
