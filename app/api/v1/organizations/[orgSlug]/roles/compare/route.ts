import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { ValidationError } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/roles/compare?roleA=...&roleB=...
 * Compares two roles, producing Role A Only, Shared, and Role B Only permission breakdowns.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const searchParams = request.nextUrl.searchParams;
    const roleA = searchParams.get("roleA");
    const roleB = searchParams.get("roleB");

    if (!roleA || !roleB) {
      throw new ValidationError("Query parameters 'roleA' and 'roleB' are required.");
    }

    const comparison = await SupabaseRolesRepository.compareRoles(
      ctx.organizationId,
      roleA,
      roleB
    );

    return apiSuccess({ comparison }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
