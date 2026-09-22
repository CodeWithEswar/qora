import { NextRequest } from "next/server";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { SupabaseWorkspaceRepository } from "@/lib/supabase/repositories/workspace-control-plane";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseStorageRepository } from "@/lib/supabase/repositories/storage";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * POST /api/v1/organizations/:orgSlug/workspace/logo
 * Handles workspace logo image upload to Supabase Storage and database record update.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.update",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ValidationError("No file provided for logo upload.");
    }

    // Validate MIME type
    const validMimes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!validMimes.includes(file.type)) {
      throw new ValidationError("Unsupported file type. Logo must be PNG, JPEG, WebP, or SVG.");
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError("Logo file size exceeds the 5MB limit.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1] || "png";
    const objectPath = `workspace-logos/${org.id}/${Date.now()}-logo.${extension}`;

    const { publicUrl } = await SupabaseStorageRepository.uploadFile(
      "avatars",
      objectPath,
      buffer,
      file.type
    );

    const logoUrl = publicUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${objectPath}`;

    await SupabaseWorkspaceRepository.updateLogo(org.id, logoUrl, ctx.principal.actorId);

    return apiSuccess({ logoUrl }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/organizations/:orgSlug/workspace/logo
 * Removes the workspace logo.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      permission: "organization.update",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    await SupabaseWorkspaceRepository.updateLogo(org.id, null, ctx.principal.actorId);

    return apiSuccess({ logoUrl: null }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
