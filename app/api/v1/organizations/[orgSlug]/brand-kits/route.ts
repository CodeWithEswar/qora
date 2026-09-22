import { NextRequest } from "next/server";
import {
  BrandKitCollectionQuerySchema,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/brand-kits — Lists organization brand kits with real pulse metrics
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "brand:read",
      permission: "brand.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const searchParams = request.nextUrl.searchParams;
    const query = BrandKitCollectionQuerySchema.parse({
      search: searchParams.get("search") || searchParams.get("q") || undefined,
      status: searchParams.get("status") || "active",
      isDefault: searchParams.has("isDefault") ? searchParams.get("isDefault") === "true" : undefined,
      sortBy: searchParams.get("sortBy") || "updatedAt",
      order: searchParams.get("order") || "desc",
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
    });

    const [{ items, total }, pulse] = await Promise.all([
      SupabaseBrandKitRepository.listByOrg(org.id, query),
      SupabaseBrandKitRepository.getPulseMetrics(org.id),
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
