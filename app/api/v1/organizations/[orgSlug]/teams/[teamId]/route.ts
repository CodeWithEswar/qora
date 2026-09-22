import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseTeamsRepository } from "@/lib/supabase/repositories/teams";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; teamId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, teamId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const detail = await SupabaseTeamsRepository.getTeamDetail(
      org.id,
      teamId,
      ctx.principal.actorId
    );

    if (!detail) {
      throw new NotFoundError(`Team '${teamId}' not found in workspace.`);
    }

    return apiSuccess(detail, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function PUT(
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
    const result = await SupabaseTeamsRepository.updateTeam(
      org.id,
      teamId,
      body,
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
      permission: PERMISSIONS.TEAMS_DELETE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const result = await SupabaseTeamsRepository.deleteTeam(
      org.id,
      teamId,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
