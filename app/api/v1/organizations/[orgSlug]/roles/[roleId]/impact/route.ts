import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { CalculateRoleImpactDtoSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string; roleId: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/roles/:roleId/impact
 * Calculates the real-time member and capability impact of proposed permission changes.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { roleId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const body = await request.json();
    const validated = CalculateRoleImpactDtoSchema.parse(body);

    const impact = await SupabaseRolesRepository.calculateRoleImpact(
      ctx.organizationId,
      roleId,
      validated.proposedPermissions
    );

    return apiSuccess({ impact }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
