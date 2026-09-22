import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseApprovalsRepository } from "@/lib/supabase/repositories/approvals";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; approvalId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, approvalId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.APPROVALS_DECIDE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const result = await SupabaseApprovalsRepository.retryExecution(
      org.id,
      approvalId,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
