import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { updateTeamInD1, deleteTeamInD1 } from "@nxtqr/db";
import {
  updateTeamInStore,
  deleteTeamInStore,
} from "@/lib/domains/organization-store";
import { z } from "zod";

const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; teamId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_UPDATE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.TEAMS_UPDATE
    );

    const body = await request.json();
    const data = UpdateTeamSchema.parse(body);

    const d1 = ctx.db;
    if (d1) {
      await updateTeamInD1(d1, ctx.organizationId, teamId, data.name, data.description);
    } else {
      updateTeamInStore(orgSlug, teamId, data.name, data.description);
    }

    return apiSuccess({ success: true, teamId, name: data.name }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; teamId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_DELETE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.TEAMS_DELETE
    );

    const d1 = ctx.db;
    if (d1) {
      await deleteTeamInD1(d1, ctx.organizationId, teamId);
    } else {
      deleteTeamInStore(orgSlug, teamId);
    }

    return apiSuccess({ success: true, deletedTeamId: teamId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
