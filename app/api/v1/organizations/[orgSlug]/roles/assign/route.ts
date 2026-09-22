import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { ChangeMemberRoleDtoSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/roles/assign
 * Changes or assigns a role to an organization member with owner invariants check.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      permission: "member.update_role",
    });

    const body = await request.json();
    const validated = ChangeMemberRoleDtoSchema.parse(body);

    const result = await SupabaseRolesRepository.assignMemberRole(
      ctx.organizationId,
      validated.membershipId,
      validated.newRoleId,
      ctx.principal.actorId
    );

    return apiSuccess({ assignment: result }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
