import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { requirePermission, PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseMembersRepository } from "@/lib/supabase/repositories/members";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";
import { z } from "zod";

const StatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; memberId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, memberId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.MEMBERS_REMOVE, // Requires administrative permission
    });

    requirePermission(
      { role: ctx.principal.role, permissions: [] },
      PERMISSIONS.MEMBERS_REMOVE
    );

    const body = await request.json();
    const data = StatusSchema.parse(body);

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    if (data.status === "suspended") {
      await SupabaseMembersRepository.suspendMember(org.id, memberId, ctx.principal.actorId);
    } else {
      await SupabaseMembersRepository.restoreMember(org.id, memberId, ctx.principal.actorId);
    }

    return apiSuccess(
      {
        success: true,
        memberId,
        status: data.status,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
