import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseTeamsRepository } from "@/lib/supabase/repositories/teams";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.TEAMS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const domain = url.searchParams.get("domain") || undefined;
    const size = (url.searchParams.get("size") as any) || undefined;
    const state = (url.searchParams.get("state") as any) || undefined;
    const sort = (url.searchParams.get("sort") as any) || undefined;

    const teams = await SupabaseTeamsRepository.listTeams(
      org.id,
      { search, domain, size, state, sort },
      ctx.principal.actorId
    );

    return apiSuccess(teams, ctx.requestId);
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
      permission: PERMISSIONS.TEAMS_CREATE,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const body = await request.json();
    const result = await SupabaseTeamsRepository.createTeam(
      org.id,
      body,
      ctx.principal.actorId
    );

    return apiSuccess(result, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
