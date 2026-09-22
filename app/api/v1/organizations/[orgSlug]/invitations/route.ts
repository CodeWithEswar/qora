import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";
import { z } from "zod";

const InviteRequestSchema = z.object({
  email: z.string().email().optional(),
  emails: z.array(z.string().email()).optional(),
  roleId: z.string().min(1),
  teamIds: z.array(z.string()).optional().default([]),
});

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

    const invitations = await SupabaseMembersRepository.listInvitations(org.id);
    return apiSuccess({ invitations }, ctx.requestId);
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
      permission: PERMISSIONS.MEMBERS_INVITE,
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.MEMBERS_INVITE
    );

    const body = await request.json();
    const data = InviteRequestSchema.parse(body);

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const emailList = data.emails || (data.email ? [data.email] : []);
    if (emailList.length === 0) {
      throw new Error("At least one email address is required.");
    }

    let lastInviteUrl = "";
    for (const targetEmail of emailList) {
      const res = await SupabaseMembersRepository.createInvitation(
        org.id,
        targetEmail,
        data.roleId,
        ctx.principal.actorId,
        data.teamIds
      );
      lastInviteUrl = res.inviteUrl;
    }

    return apiCreated(
      {
        success: true,
        invitedCount: emailList.length,
        inviteUrl: lastInviteUrl,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
