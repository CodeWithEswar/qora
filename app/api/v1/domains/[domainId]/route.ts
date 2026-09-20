import { NextRequest } from "next/server";
import { UpdateCustomDomainRequestV1Schema } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseDomainRepository } from "@/lib/supabase/repositories/domains";

interface RouteParams {
  params: Promise<{ domainId: string }>;
}

/**
 * GET /api/v1/domains/[domainId] — Retrieves detailed custom domain record
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { domainId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "domains:read",
      permission: "domains.read",
    });

    const domain = await SupabaseDomainRepository.getById(ctx.organizationId, domainId);
    return apiSuccess(domain, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/domains/[domainId] — Updates domain attributes (primary status, routing)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { domainId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "domains:manage",
      permission: "domains.manage",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = UpdateCustomDomainRequestV1Schema.parse(rawBody);

    let result = await SupabaseDomainRepository.getById(ctx.organizationId, domainId);

    if (payload.isPrimary === true) {
      result = await SupabaseDomainRepository.setPrimary(
        ctx.organizationId,
        domainId,
        ctx.principal.actorId
      );
    }

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/domains/[domainId] — Archives or permanently removes a domain
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let ctx;
  try {
    const { domainId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "domains:manage",
      permission: "domains.manage",
    });

    const url = new URL(request.url);
    const hardDelete = url.searchParams.get("hard") === "true" || url.searchParams.get("action") === "delete";

    if (hardDelete) {
      await SupabaseDomainRepository.delete(
        ctx.organizationId,
        domainId,
        ctx.principal.actorId
      );
      return apiSuccess({ deleted: true, domainId }, ctx.requestId);
    } else {
      const archived = await SupabaseDomainRepository.archive(
        ctx.organizationId,
        domainId,
        ctx.principal.actorId
      );
      return apiSuccess(archived, ctx.requestId);
    }
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
