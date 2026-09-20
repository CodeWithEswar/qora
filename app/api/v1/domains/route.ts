import { NextRequest } from "next/server";
import { CreateCustomDomainRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  apiCreated,
  handleApiError,
} from "@/lib/api";
import { SupabaseDomainRepository } from "@/lib/supabase/repositories/domains";

/**
 * GET /api/v1/domains — Lists custom domains for the authenticated workspace
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "domains:read",
      permission: "domains.read",
    });

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";

    const [{ items, total }, pulse] = await Promise.all([
      SupabaseDomainRepository.listByOrg(ctx.organizationId, { status, search }),
      SupabaseDomainRepository.getPulseMetrics(ctx.organizationId),
    ]);

    return apiSuccess(items, ctx.requestId, 200, { total, pulse });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/domains — Connects a new custom domain
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "domains:manage",
      permission: "domains.manage",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateCustomDomainRequestV1Schema.parse(rawBody);

    const created = await SupabaseDomainRepository.create(
      ctx.organizationId,
      ctx.principal.actorId,
      payload
    );

    return apiCreated(created, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
