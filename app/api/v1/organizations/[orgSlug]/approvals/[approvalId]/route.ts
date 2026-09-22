import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseApprovalsRepository } from "@/lib/supabase/repositories/approvals";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; approvalId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, approvalId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.APPROVALS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const detail = await SupabaseApprovalsRepository.getApprovalDetail(
      org.id,
      approvalId,
      ctx.principal.actorId
    );

    if (!detail) {
      throw new NotFoundError(`Approval request '${approvalId}' not found in this workspace.`);
    }

    return apiSuccess(detail, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
