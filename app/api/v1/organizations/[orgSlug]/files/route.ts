import { NextRequest } from "next/server";
import {
  FileCollectionQuerySchema,
  ValidationError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  apiCreated,
  handleApiError,
} from "@/lib/api";
import { SupabaseFilesRepository } from "@/lib/supabase/repositories/files";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/files — Lists workspace files with Asset Pulse metrics
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "files:read",
      permission: "files.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new ValidationError(`Organization '${orgSlug}' not found.`);
    }

    const searchParams = request.nextUrl.searchParams;
    const query = FileCollectionQuerySchema.parse({
      search: searchParams.get("search") || searchParams.get("q") || undefined,
      category: searchParams.get("category") || searchParams.get("type") || "ALL",
      usage: searchParams.get("usage") || "all",
      status: searchParams.get("status") || "all",
      sortBy: searchParams.get("sortBy") || "updatedAt",
      order: searchParams.get("order") || "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
    });

    const [{ items, total }, pulse] = await Promise.all([
      SupabaseFilesRepository.listFiles(org.id, query),
      SupabaseFilesRepository.getStoragePulse(org.id),
    ]);

    return apiSuccess(
      items,
      ctx.requestId,
      200,
      {
        total,
        page: query.page,
        limit: query.limit,
        pulse,
      }
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/organizations/:orgSlug/files — Authorized Asset Vault Upload
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "files:write",
      permission: "files.upload",
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
      throw new ValidationError("No file provided in form-data.");
    }

    // 25MB maximum file limit
    if (file.size > 25 * 1024 * 1024) {
      throw new ValidationError(
        `File size exceeds maximum allowed 25MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
      );
    }

    // Active Content Security check for SVG uploads
    const mimeType = file.type || "application/octet-stream";
    if (mimeType === "image/svg+xml") {
      const text = await file.text();
      const dangerousPatterns = /<script|onload=|onerror=|onclick=|javascript:/i;
      if (dangerousPatterns.test(text)) {
        throw new ValidationError(
          "SVG file contains active script elements or event handlers and was rejected for security."
        );
      }
    }

    const bucketChoice = (formData.get("bucket") as any) || "qr-assets";
    const uploadedFile = await SupabaseFilesRepository.uploadFile({
      orgId: org.id,
      file,
      bucket: bucketChoice,
      uploadedBy: ctx.principal.actorId,
    });

    return apiCreated(
      uploadedFile,
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
