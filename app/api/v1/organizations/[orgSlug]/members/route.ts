import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
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
      permission: PERMISSIONS.MEMBERS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const role = url.searchParams.get("role") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const teamId = url.searchParams.get("teamId") || undefined;
    const sort = (url.searchParams.get("sort") as any) || undefined;

    const members = await SupabaseMembersRepository.listMembers(
      org.id,
      { search, role, status, teamId, sort },
      ctx.principal.actorId
    );

    return apiSuccess(members, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
