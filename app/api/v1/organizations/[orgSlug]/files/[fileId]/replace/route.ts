import { NextRequest } from "next/server";
import { ValidationError } from "@nxtqr/contracts";
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
 * POST /api/v1/organizations/:orgSlug/files/:fileId/replace — Replaces binary bytes in-place
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug, fileId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "files:write",
      permission: "files.update",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new ValidationError(`Organization '${orgSlug}' not found.`);
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      throw new ValidationError("Invalid multipart form-data payload.");
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      throw new ValidationError("No replacement file provided.");
    }

    if (file.size > 25 * 1024 * 1024) {
      throw new ValidationError(
        `File size exceeds 25MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
      );
    }

    const updated = await SupabaseFilesRepository.replaceFile(
      org.id,
      fileId,
      file
    );

    return apiSuccess(updated, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
