import { NextRequest } from "next/server";
import {
  CreateLandingPageRequestV1Schema,
  LandingPageCollectionQuerySchema,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";

/**
 * GET /api/v1/landing-pages — Lists landing pages with attached pulse metrics
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:read",
      permission: "landing_pages.read",
    });

    const searchParams = request.nextUrl.searchParams;
    const query = LandingPageCollectionQuerySchema.parse({
      search: searchParams.get("search") || searchParams.get("q") || undefined,
      status: searchParams.get("status") || "all",
      sortBy: searchParams.get("sortBy") || "updatedAt",
      order: searchParams.get("order") || "desc",
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
    });

    const [{ items, total }, pulse] = await Promise.all([
      SupabaseLandingPageRepository.listByOrg(ctx.organizationId, query),
      SupabaseLandingPageRepository.getPulseMetrics(ctx.organizationId),
    ]);

    return apiSuccess(
      items,
      ctx.requestId,
      200,
      {
        total,
        limit: query.limit,
        offset: query.offset,
        pulse,
      }
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/landing-pages — Creates a new destination landing page
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "landing_pages:write",
      permission: "landing_pages.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateLandingPageRequestV1Schema.parse(rawBody);

    const created = await SupabaseLandingPageRepository.createPage(
      ctx.organizationId,
      ctx.principal.actorId,
      payload
    );

    return apiSuccess(created, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
