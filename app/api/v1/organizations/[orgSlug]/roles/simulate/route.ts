import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { SimulateAccessDtoSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/roles/simulate
 * Simulates access evaluation across the 8-stage decision corridor:
 * Identity -> Membership -> Role -> Permission -> Entitlement -> Policy -> Resource -> Result
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const body = await request.json();
    const validated = SimulateAccessDtoSchema.parse(body);

    const result = await SupabaseRolesRepository.simulateAccess(
      ctx.organizationId,
      validated
    );

    return apiSuccess({ simulation: result }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
