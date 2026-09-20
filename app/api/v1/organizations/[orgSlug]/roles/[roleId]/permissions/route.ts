import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { updateCustomRolePermissionsInD1 } from "@nxtqr/db";
import { updateRolePermissionsInStore } from "@/lib/domains/organization-store";
import { PermissionCode } from "@nxtqr/contracts";
import { z } from "zod";

const UpdateRolePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; roleId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.ROLES_UPDATE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.ROLES_UPDATE
    );

    const body = await request.json();
    const data = UpdateRolePermissionsSchema.parse(body);

    const d1 = ctx.db;
    if (d1) {
      await updateCustomRolePermissionsInD1(
        d1,
        ctx.organizationId,
        roleId,
        data.permissions as PermissionCode[]
      );
    } else {
      updateRolePermissionsInStore(
        orgSlug,
        roleId,
        data.permissions as PermissionCode[]
      );
    }

    return apiSuccess(
      {
        success: true,
        roleId,
        updatedPermissionCount: data.permissions.length,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
