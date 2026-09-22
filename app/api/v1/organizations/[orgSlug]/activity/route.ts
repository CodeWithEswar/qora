import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
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
      permission: PERMISSIONS.ACTIVITY_READ,
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const view = (url.searchParams.get("view") as any) || "stream";
    const range = (url.searchParams.get("range") as any) || "30d";
    const category = url.searchParams.get("category") || undefined;
    const resourceType = url.searchParams.get("resourceType") || undefined;
    const actorId = url.searchParams.get("actorId") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;

    const filters = {
      view,
      range,
      category,
      resourceType,
      actorId,
      search,
      startDate,
      endDate,
    };

    // Parallel fetch of stream & observatory aggregates
    const [
      events,
      signalMetrics,
      timeSeries,
      densityMatrix,
      resourcePulse,
      actorResourceMatrix,
      eventComposition,
      changeFlow,
    ] = await Promise.all([
      SupabaseActivityRepository.listActivityEvents(org.id, filters, 150),
      SupabaseActivityRepository.getOperationalSignalMetrics(org.id, range),
      SupabaseActivityRepository.getTimeSeries(org.id, range),
      SupabaseActivityRepository.getDensityMatrix(org.id, range),
      SupabaseActivityRepository.getResourcePulse(org.id, range),
      SupabaseActivityRepository.getActorResourceMatrix(org.id, range),
      SupabaseActivityRepository.getEventComposition(org.id, range),
      SupabaseActivityRepository.getChangeFlow(org.id, range),
    ]);

    return apiSuccess(
      {
        events,
        signalMetrics,
        metrics: signalMetrics,
        timeSeries,
        densityMatrix,
        resourcePulse,
        actorResourceMatrix,
        eventComposition,
        changeFlow,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
