import { NextRequest, NextResponse } from "next/server";
import { authorizeApiRequest, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@nxtqr/permissions";
import { SupabaseActivityRepository } from "@/lib/supabase/repositories/activity";
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
      permission: PERMISSIONS.ACTIVITY_EXPORT,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const range = (url.searchParams.get("range") as any) || "30d";
    const category = url.searchParams.get("category") || undefined;
    const resourceType = url.searchParams.get("resourceType") || undefined;
    const actorId = url.searchParams.get("actorId") || undefined;

    const csvData = await SupabaseActivityRepository.exportActivityCsv(org.id, {
      view: "stream",
      range,
      category,
      resourceType,
      actorId,
    });

    const filename = `nxtqr-activity-${orgSlug}-${new Date().toISOString().substring(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
