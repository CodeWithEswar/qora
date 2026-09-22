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
    if (!body.note || typeof body.note !== "string" || !body.note.trim()) {
      throw new ValidationError("A detailed change request note is required.");
    }

    const result = await SupabaseApprovalsRepository.requestChanges(
      org.id,
      approvalId,
      body.note.trim(),
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
