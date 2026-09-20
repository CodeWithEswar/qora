import { NextRequest } from "next/server";
import {
  CreateBrandKitRequestV1Schema,
  BrandKitCollectionQuerySchema,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";

/**
 * GET /api/v1/brand-kits — Lists organization brand kits with real pulse metrics
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "brand:read",
      permission: "brand.read",
    });

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
      SupabaseBrandKitRepository.listByOrg(ctx.organizationId, query),
      SupabaseBrandKitRepository.getPulseMetrics(ctx.organizationId),
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
 * POST /api/v1/brand-kits — Creates a new brand kit in the organization
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "brand:write",
      permission: "brand.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateBrandKitRequestV1Schema.parse(rawBody);

    const created = await SupabaseBrandKitRepository.create(
      ctx.organizationId,
      ctx.principal.actorId,
      payload
    );

    return apiSuccess(created, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
