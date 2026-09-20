import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { changeMemberRoleInD1 } from "@nxtqr/db";
import { changeMemberRoleInStore } from "@/lib/domains/organization-store";
import { z } from "zod";

const ChangeRoleSchema = z.object({
  roleId: z.string().min(1),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.ROLES_ASSIGN,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.ROLES_ASSIGN
    );

    const body = await request.json();
    const data = ChangeRoleSchema.parse(body);

    const d1 = ctx.db;
    let result = { previousRole: "", newRole: "" };
    if (d1) {
      result = await changeMemberRoleInD1(
        d1,
        ctx.organizationId,
        memberId,
        data.roleId,
        ctx.principal.actorId
      );
    } else {
      result = changeMemberRoleInStore(orgSlug, memberId, data.roleId);
    }

    return apiSuccess(
      {
        success: true,
        memberId,
        ...result,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
