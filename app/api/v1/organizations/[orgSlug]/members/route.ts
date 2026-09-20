import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { listOrganizationMembers } from "@nxtqr/db";
import { getOrCreateOrgData } from "@/lib/domains/organization-store";

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

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const role = url.searchParams.get("role") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const teamId = url.searchParams.get("teamId") || undefined;

    const d1 = ctx.db;
    if (!d1) {
      const stored = getOrCreateOrgData(orgSlug);
      let members = stored.members || [];
      if (search) {
        const q = search.toLowerCase();
        members = members.filter(
          (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
      }
      return apiSuccess(members, ctx.requestId);
    }

    const members = await listOrganizationMembers(d1, ctx.organizationId, {
      search,
      role,
      status,
      teamId,
    });

    return apiSuccess(members, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
