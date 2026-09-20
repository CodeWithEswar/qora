import { NextRequest } from "next/server";
import { ValidationError, NotFoundError } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { SupabaseFilesRepository } from "@/lib/supabase/repositories/files";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string; fileId: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/files/:fileId/usages — Asset Constellation dependency graph
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug, fileId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "files:read",
      permission: "files.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new ValidationError(`Organization '${orgSlug}' not found.`);
    }

    const file = await SupabaseFilesRepository.getFileById(org.id, fileId, orgSlug);
    if (!file) {
      throw new NotFoundError(`File '${fileId}' not found.`);
    }

    return apiSuccess(
      {
        fileId: file.id,
        fileName: file.name,
        usageCount: file.usageCount,
        usages: Array.isArray(file.usages) ? file.usages : [],
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
