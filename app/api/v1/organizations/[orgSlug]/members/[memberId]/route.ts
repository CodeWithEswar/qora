import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.MEMBERS_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const member = await SupabaseMembersRepository.getMemberDetail(
      org.id,
      memberId,
      ctx.principal.actorId
    );

    if (!member) {
      throw new NotFoundError(`Member '${memberId}' not found.`);
    }

    return apiSuccess(member, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.MEMBERS_REMOVE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.MEMBERS_REMOVE
    );

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const res = await SupabaseMembersRepository.removeMember(
      org.id,
      memberId,
      ctx.principal.actorId
    );

    return apiSuccess(
      {
        success: true,
        removedMemberId: memberId,
        removedMemberEmail: res.email,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
