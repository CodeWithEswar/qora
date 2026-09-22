import { NextRequest } from "next/server";
import { authorizeApiRequest, apiCreated, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { DuplicateRoleDtoSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string; roleId: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/roles/:roleId/duplicate
 * Clones a custom or system role's permissions into a new custom role.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "member.update_role",
    });

    const body = await request.json();
    const validated = DuplicateRoleDtoSchema.parse(body);

    const cloned = await SupabaseRolesRepository.duplicateCustomRole(
      ctx.organizationId,
      roleId,
      validated.name,
      ctx.principal.actorId
    );

    return apiCreated({ role: cloned }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
