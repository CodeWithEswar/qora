import { NextRequest } from "next/server";
import {
  MoveQrsRequestV1Schema,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
  ValidationError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { FoldersRepository, recordActivityEvent } from "@nxtqr/db";
import { SupabaseFolderRepository } from "@/lib/supabase/repositories/folders";

/**
 * POST /api/v1/folders/[folderId]/move — Moves QR codes into this folder (or unfiled)
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
    const payload = MoveQrsRequestV1Schema.parse(rawBody);

    const targetFolderId =
      folderId === "unfiled" ? null : payload.targetFolderId !== undefined ? payload.targetFolderId : folderId;

    // 1. Authoritative Supabase update
    const movedCount = await SupabaseFolderRepository.moveQrsToFolder(
      ctx.organizationId,
      payload.qrIds,
      targetFolderId
    );

    // 2. D1 sync if available
    const d1 = ctx.db;
    if (d1) {
      try {
        await FoldersRepository.moveQrsToFolder(
          d1,
          ctx.organizationId,
          payload.qrIds,
          targetFolderId
        );

        await recordActivityEvent(d1, {
          organizationId: ctx.organizationId,
          actorId: ctx.principal.actorId,
          action: "folder.qr_moved",
          resourceType: "folder",
          resourceId: targetFolderId || "unfiled",
          metadata: { movedCount, qrIds: payload.qrIds },
        }).catch((err) => console.warn("[FoldersAPI] Failed to record activity:", err));
      } catch (d1Err) {
        console.warn("[POST /api/v1/folders/[folderId]/move] D1 sync notice:", d1Err);
      }
    }

    // Publish internal event
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.FOLDER_QR_MOVED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "folder", id: targetFolderId || "unfiled" },
      data: {
        targetFolderId,
        movedCount,
        qrIds: payload.qrIds,
      },
    });

    return apiSuccess(
      {
        success: true,
        movedCount,
        targetFolderId,
        message:
          targetFolderId === null
            ? `${movedCount} QR ${movedCount === 1 ? "asset" : "assets"} moved to Unfiled.`
            : `${movedCount} QR ${movedCount === 1 ? "asset" : "assets"} moved to folder.`,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
