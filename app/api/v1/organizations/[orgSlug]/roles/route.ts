import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { SupabaseRolesRepository } from "@/lib/supabase/repositories/roles-control-plane";
import { CreateCustomRoleDtoSchema } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/roles
 * Retrieves the complete Access Architecture & RBAC Control Plane overview.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.read",
    });

    const overview = await SupabaseRolesRepository.getRolesOverview(
      orgSlug,
      ctx.principal.actorId
    );

    return apiSuccess(overview, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/organizations/:orgSlug/roles
 * Creates a new custom role within the organization.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "member.update_role",
    });

    const body = await request.json();
    const validated = CreateCustomRoleDtoSchema.parse(body);

    const created = await SupabaseRolesRepository.createCustomRole(
      ctx.organizationId,
      validated,
      ctx.principal.actorId
    );

    return apiCreated({ role: created }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
