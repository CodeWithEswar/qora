import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseApprovalsRepository } from "@/lib/supabase/repositories/approvals";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

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

    const body = await request.json();
    if (body.decision !== "APPROVED" && body.decision !== "REJECTED" && body.decision !== "CHANGES_REQUESTED") {
      throw new ValidationError("Property 'decision' must be 'APPROVED', 'REJECTED', or 'CHANGES_REQUESTED'.");
    }

    const result = await SupabaseApprovalsRepository.decideApproval(
      org.id,
      approvalId,
      {
        decision: body.decision,
        note: body.note,
        reasonCode: body.reasonCode,
      },
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
