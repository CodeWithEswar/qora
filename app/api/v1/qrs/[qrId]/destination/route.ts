import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";
import { isValidDestinationUrl } from "@nxtqr/routing-engine";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";
import { buildShortResolverUrl, RESOLVER_CONFIG } from "@nxtqr/config";

interface Params {
  params: Promise<{ qrId: string }>;
}

const UpdateDestinationSchema = z.object({
  destinationUrl: z.string().min(1, "Destination URL is required").max(2048, "URL is too long"),
});

/**
 * PUT /api/v1/qrs/:id/destination
 * Updates working draft destination in Cloudflare D1 (qr_drafts).
 * Crucial Invariant: Editing the draft does NOT alter published edge KV state until explicit publication.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.update",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const { destinationUrl } = UpdateDestinationSchema.parse(rawBody);

    // 1. URL Scheme & Syntax Validation
    if (!isValidDestinationUrl(destinationUrl)) {
      throw new ValidationError(
        "Invalid destination URL scheme. Destinations must use http:// or https:// and cannot contain scripts or data URIs."
      );
    }

    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    // 2. Prevent Circular Redirect
    const resolverUrl = buildShortResolverUrl(qr.slug);
    if (destinationUrl.toLowerCase().trim() === resolverUrl.toLowerCase().trim()) {
      throw new ValidationError("Circular redirect detected: Destination cannot point to the QR's own short URL.");
    }

    // 3. Update Draft in D1 qr_drafts
    const db = ctx.db;
    if (db) {
      const now = Math.floor(Date.now() / 1000);
      const currentDraft = await QrStore.getDraft(qrId, ctx.organizationId, db);

      const updatedContent = {
        ...currentDraft.content,
        url: destinationUrl,
        type: "url",
        isDynamic: true,
      };

      const destinationData = {
        defaultUrl: destinationUrl,
        fallbackUrl: qr.fallbackUrl || null,
      };

      await db
        .prepare(
          `INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, updated_by, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(qr_id) DO UPDATE SET
             content_json = excluded.content_json,
             destination_json = excluded.destination_json,
             updated_by = excluded.updated_by,
             updated_at = excluded.updated_at`
        )
        .bind(
          qrId,
          ctx.organizationId,
          (currentDraft.draftVersion || 1) + 1,
          JSON.stringify(updatedContent),
          JSON.stringify(currentDraft.design),
          JSON.stringify(destinationData),
          ctx.principal.actorId,
          now
        )
        .run();
    }

    const hasUnpublishedChanges = qr.destinationUrl !== destinationUrl;

    return apiSuccess(
      {
        qrId,
        publishedDestination: qr.destinationUrl,
        draftDestination: destinationUrl,
        hasUnpublishedChanges,
        message: "Destination saved as draft. Publish revision to make live at edge.",
      },
      ctx.requestId,
      200
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
