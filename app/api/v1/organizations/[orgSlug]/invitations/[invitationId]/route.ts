import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; invitationId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, invitationId } = await params;
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

    await SupabaseMembersRepository.revokeInvitation(org.id, invitationId, ctx.principal.actorId);

    return apiSuccess({ success: true, revokedId: invitationId }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; invitationId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, invitationId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.MEMBERS_INVITE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.MEMBERS_INVITE
    );

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const res = await SupabaseMembersRepository.resendInvitation(org.id, invitationId, ctx.principal.actorId);

    return apiSuccess({ success: true, inviteUrl: res.inviteUrl }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

