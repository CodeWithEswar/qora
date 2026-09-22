import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseApprovalsRepository } from "@/lib/supabase/repositories/approvals";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.APPROVALS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const view = (url.searchParams.get("view") as any) || undefined;
    const search = url.searchParams.get("search") || undefined;
    const type = (url.searchParams.get("type") as any) || undefined;
    const teamId = url.searchParams.get("teamId") || undefined;
    const status = (url.searchParams.get("status") as any) || undefined;
    const executionStatus = (url.searchParams.get("executionStatus") as any) || undefined;
    const sort = (url.searchParams.get("sort") as any) || undefined;

    const approvals = await SupabaseApprovalsRepository.listApprovals(
      org.id,
      { view, search, type, teamId, status, executionStatus, sort },
      ctx.principal.actorId
    );

    return apiSuccess(approvals, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.APPROVALS_REQUEST,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    if (!body.title || !body.type || !body.affectedEntityType || !body.affectedEntityId) {
      throw new ValidationError("Missing required approval request fields (title, type, affectedEntityType, affectedEntityId).");
    }

    const result = await SupabaseApprovalsRepository.createApprovalRequest(
      org.id,
      {
        type: body.type,
        title: body.title,
        description: body.description,
        reason: body.reason,
        affectedEntityType: body.affectedEntityType,
        affectedEntityId: body.affectedEntityId,
        affectedEntityRef: body.affectedEntityRef,
        assignedTeamId: body.assignedTeamId,
        evidenceItems: body.evidenceItems,
        requestSnapshot: body.requestSnapshot,
      },
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
