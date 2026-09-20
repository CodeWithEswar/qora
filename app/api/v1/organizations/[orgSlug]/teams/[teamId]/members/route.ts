import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { addTeamMembersInD1 } from "@nxtqr/db";
import { addTeamMembersInStore } from "@/lib/domains/organization-store";
import { z } from "zod";

const AddTeamMembersSchema = z.object({
  memberIds: z.array(z.string().min(1)),
});

export async function POST(
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
    const data = AddTeamMembersSchema.parse(body);

    const d1 = ctx.db;
    let addedCount = 0;
    if (d1) {
      const res = await addTeamMembersInD1(d1, ctx.organizationId, teamId, data.memberIds);
      addedCount = res.addedCount;
    } else {
      addedCount = addTeamMembersInStore(orgSlug, teamId, data.memberIds);
    }

    return apiCreated({ success: true, teamId, addedCount }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
