import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";
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

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const result = await SupabaseMembersRepository.changeMemberRole(
      org.id,
      memberId,
      data.roleId,
      ctx.principal.actorId
    );

    return apiSuccess(
      {
        memberId,
        ...result,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
