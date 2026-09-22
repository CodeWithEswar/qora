import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import {
  UpdateCustomRoleDtoSchema,
  DeleteRoleDtoSchema,
} from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string; roleId: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/roles/:roleId
 * Retrieves granular role detail with permissions and assigned members.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const role = await SupabaseRolesRepository.getRoleDetail(
      ctx.organizationId,
      roleId
    );

    return apiSuccess({ role }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/organizations/:orgSlug/roles/:roleId
 * Updates custom role name, description, and permissions.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "member.update_role",
    });

    const body = await request.json();
    const validated = UpdateCustomRoleDtoSchema.parse(body);

    const updated = await SupabaseRolesRepository.updateCustomRole(
      ctx.organizationId,
      roleId,
      validated,
      ctx.principal.actorId
    );

    return apiSuccess({ role: updated }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/organizations/:orgSlug/roles/:roleId
 * Safely deletes a custom role with mandatory reassignment of assigned members.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "member.update_role",
    });

    const body = await request.json().catch(() => ({}));
    const validated = DeleteRoleDtoSchema.parse(body);

    const targetReassignId = validated.reassignToRoleId || validated.reassignRoleId || "";
    await SupabaseRolesRepository.deleteCustomRole(
      ctx.organizationId,
      roleId,
      targetReassignId,
      ctx.principal.actorId
    );

    return apiSuccess(
      { deleted: true, roleId, reassignedTo: targetReassignId },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
