import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseActivityRepository } from "@/lib/supabase/repositories/activity";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { NotFoundError } from "@nxtqr/contracts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; eventId: string }> }
) {
  let ctx;
  try {
    const { orgSlug, eventId } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: PERMISSIONS.ACTIVITY_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const detail = await SupabaseActivityRepository.getEventDetail(org.id, eventId);
    return apiSuccess(detail, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
