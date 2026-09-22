import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseTeamsRepository } from "@/lib/supabase/repositories/teams";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; teamId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_UPDATE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    const resources = body.resources;

    if (!Array.isArray(resources) || resources.length === 0) {
      throw new ValidationError("At least one resource must be specified.");
    }

    const result = await SupabaseTeamsRepository.connectResources(
      org.id,
      teamId,
      resources,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; teamId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_UPDATE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      throw new ValidationError("assignmentId parameter is required.");
    }

    const result = await SupabaseTeamsRepository.disconnectResource(
      org.id,
      teamId,
      assignmentId,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
