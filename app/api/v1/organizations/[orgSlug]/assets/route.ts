import { NextRequest } from "next/server";
import { ValidationError } from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  handleApiError,
} from "@/lib/api";
import { generateOpaqueId } from "@nxtqr/db";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/v1/organizations/:orgSlug/assets — Authorized Asset Upload
 * Invariants 21-24: R2 stores bytes, D1 owns metadata authority.
 * Tenant-scoped: validates membership and entitlement.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "organizations:write",
      permission: "qr.create",
    });

    const { orgSlug } = await params;
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      throw new ValidationError("Invalid multipart form-data payload.");
    }

    const file = formData.get("file") as File | null;
    const resourceType = (formData.get("resourceType") as string) || "logo";

    if (!file) {
      throw new ValidationError("No file provided in form-data.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File size exceeds maximum allowed 5MB (${Math.round(file.size / 1024)} KB).`);
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new ValidationError(`Unsupported file MIME type '${mimeType}'. Allowed: PNG, JPEG, WEBP, SVG, PDF.`);
    }

    // Security Check: Rule 17 & 159 — Active Content Defense for SVG uploads
    if (mimeType === "image/svg+xml") {
      const text = await file.text();
      const dangerousPatterns = /<script|onload=|onerror=|onclick=|javascript:/i;
      if (dangerousPatterns.test(text)) {
        throw new ValidationError("SVG file contains active script elements or event handlers and was rejected for security.");
      }
    }

    const assetId = generateOpaqueId("asset");
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-_]/g, "_").slice(0, 100);
    const objectKey = `orgs/${ctx.organizationId}/assets/${assetId}-${sanitizedFileName}`;
    const now = Math.floor(Date.now() / 1000);

    const d1 = ctx.db;
    if (d1) {
      const insertSql = `
        INSERT INTO r2_assets (
          id, organization_id, bucket_name, object_key, file_name,
          content_type, size_bytes, resource_type, status, created_by, created_at
        )
        VALUES (?, ?, 'assets', ?, ?, ?, ?, ?, 'READY', ?, ?)
      `;
      await d1
        .prepare(insertSql)
        .bind(
          assetId,
          ctx.organizationId,
          objectKey,
          sanitizedFileName,
          mimeType,
          file.size,
          resourceType,
          ctx.principal.actorId,
          now
        )
        .run();
    }

    // Store in Cloudflare R2 bucket if available
    const r2 = (request as any).env?.ASSETS_BUCKET;
    if (r2) {
      const buffer = await file.arrayBuffer();
      await r2.put(objectKey, buffer, {
        httpMetadata: { contentType: mimeType },
      });
    }

    // Return reference URL for Studio preview
    const downloadUrl = `/api/v1/organizations/${orgSlug}/assets/${assetId}`;

    return apiCreated(
      {
        assetId,
        fileName: sanitizedFileName,
        contentType: mimeType,
        sizeBytes: file.size,
        objectKey,
        url: downloadUrl,
        createdAt: new Date(now * 1000).toISOString(),
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
