import { NextRequest } from "next/server";
import { z } from "zod";
import {
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { FoldersRepository, recordActivityEvent } from "@nxtqr/db";
import { SupabaseFolderRepository } from "@/lib/supabase/repositories/folders";

const RemoveQrsRequestSchema = z.object({
  qrIds: z.array(z.string().uuid()).min(1, "At least one QR code must be provided"),
});

/**
 * POST /api/v1/folders/[folderId]/remove — Removes QR codes from this folder (unlinks to Unfiled)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  let ctx;
  try {
    const { folderId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "folders:write",
      permission: "qr.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = RemoveQrsRequestSchema.parse(rawBody);

    // Unlinking to Unfiled: targetFolderId = null
    const movedCount = await SupabaseFolderRepository.moveQrsToFolder(
      ctx.organizationId,
      payload.qrIds,
      null
    );

    const d1 = ctx.db;
    if (d1) {
      try {
        await FoldersRepository.moveQrsToFolder(
          d1,
          ctx.organizationId,
          payload.qrIds,
          null
        );

        await recordActivityEvent(d1, {
          organizationId: ctx.organizationId,
          actorId: ctx.principal.actorId,
          action: "folder.qr_removed",
          resourceType: "folder",
          resourceId: folderId,
          metadata: { removedCount: movedCount, qrIds: payload.qrIds },
        }).catch((err) => console.warn("[FoldersAPI] Failed to record activity:", err));
      } catch (d1Err) {
        console.warn("[POST /api/v1/folders/[folderId]/remove] D1 sync notice:", d1Err);
      }
    }

    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.FOLDER_QR_REMOVED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "folder", id: folderId },
      data: {
        folderId,
        removedCount: movedCount,
        qrIds: payload.qrIds,
      },
    });

    return apiSuccess(
      {
        success: true,
        removedCount: movedCount,
        message: `${movedCount} QR ${movedCount === 1 ? "code" : "codes"} moved to Unfiled.`,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
