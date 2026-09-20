import { NextRequest } from "next/server";
import {
  RenameFileRequestV1Schema,
  ValidationError,
  NotFoundError,
} from "@nxtqr/contracts";
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
 * GET /api/v1/organizations/:orgSlug/files/:fileId — Retrieve single file detail with usages
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

    return apiSuccess(file, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/organizations/:orgSlug/files/:fileId — Rename or change status
 */
export async function PATCH(request: NextRequest, { params }: Params) {
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

    const body = await request.json().catch(() => ({}));

    let updatedFile;
    if (body.action === "archive") {
      updatedFile = await SupabaseFilesRepository.archiveFile(org.id, fileId);
    } else if (body.action === "restore") {
      updatedFile = await SupabaseFilesRepository.restoreFile(org.id, fileId);
    } else {
      const parsed = RenameFileRequestV1Schema.parse(body);
      updatedFile = await SupabaseFilesRepository.renameFile(
        org.id,
        fileId,
        parsed.displayName
      );
    }

    return apiSuccess(updatedFile, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/organizations/:orgSlug/files/:fileId — Dependency-aware file deletion
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug, fileId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "files:write",
      permission: "files.delete",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new ValidationError(`Organization '${orgSlug}' not found.`);
    }

    const force = request.nextUrl.searchParams.get("force") === "true";
    const result = await SupabaseFilesRepository.deleteFile(org.id, fileId, force);

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
