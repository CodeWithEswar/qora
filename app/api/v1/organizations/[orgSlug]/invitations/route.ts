import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, apiCreated, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import {
  createInvitationInD1,
  listOrganizationInvitations,
} from "@nxtqr/db";
import {
  getOrCreateOrgData,
  createInvitationInStore,
} from "@/lib/domains/organization-store";
import { z } from "zod";

const InviteRequestSchema = z.object({
  emails: z.array(z.string().email()),
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

    const d1 = ctx.db;
    if (!d1) {
      const stored = getOrCreateOrgData(orgSlug);
      return apiSuccess({ invitations: stored.invitations }, ctx.requestId);
    }

    const invitations = await listOrganizationInvitations(d1, ctx.organizationId);
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

    const d1 = ctx.db;
    let lastInviteUrl = "";

    if (d1) {
      for (const email of data.emails) {
        const res = await createInvitationInD1(
          d1,
          ctx.organizationId,
          email,
          data.roleId,
          ctx.principal.actorId,
          data.teamIds
        );
        lastInviteUrl = res.inviteUrl;
      }
    } else {
      for (const email of data.emails) {
        const res = createInvitationInStore(
          orgSlug,
          email,
          data.roleId,
          ctx.principal.actorId,
          data.teamIds
        );
        lastInviteUrl = res.inviteUrl;
      }
    }

    return apiCreated(
      {
        success: true,
        invitedCount: data.emails.length,
        inviteUrl: lastInviteUrl,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
