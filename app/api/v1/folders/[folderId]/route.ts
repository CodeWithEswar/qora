import { NextRequest } from "next/server";
import {
  UpdateFolderRequestV1Schema,
  FolderResponseV1,
  FolderPulseMetrics,
  NotFoundError,
  ValidationError,
  ConflictError,
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

export interface FolderDetailResponsePayload {
  folder: FolderResponseV1;
  pulse: FolderPulseMetrics;
  isUnfiled: boolean;
}

/**
 * GET /api/v1/folders/[folderId] — Folder Detail & Operational Pulse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  let ctx;
  try {
    const { folderId } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "folders:read",
      permission: "folders.read",
    });

    const isUnfiled = folderId === "unfiled";

    // 1. Handle Unfiled virtual workspace
    if (isUnfiled) {
      const pulse = await SupabaseFolderRepository.getFolderPulse(ctx.organizationId, null);
      const unfiledFolder: FolderResponseV1 = {
        id: "unfiled",
        name: "Unfiled QR Codes",
        description: "QR assets that are not assigned to any specific workspace folder.",
        emoji: "📂",
        accentKey: "Graphite",
        status: "active",
        qrCount: pulse.qrCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null,
        createdBy: null,
      };

      return apiSuccess<FolderDetailResponsePayload>(
        {
          folder: unfiledFolder,
          pulse,
          isUnfiled: true,
        },
        ctx.requestId
      );
    }

    // 2. Authoritative Supabase retrieval
    try {
      const sbFolder = await SupabaseFolderRepository.getById(ctx.organizationId, folderId);
      if (sbFolder) {
        const pulse = await SupabaseFolderRepository.getFolderPulse(ctx.organizationId, sbFolder.id);

        const folderRes: FolderResponseV1 = {
          id: sbFolder.id,
          name: sbFolder.name,
          description: sbFolder.description || null,
          emoji: sbFolder.emoji || null,
          accentKey: (sbFolder.accentKey as any) || "Graphite",
          status: sbFolder.status,
          qrCount: sbFolder.qrAssetCount || pulse.qrCount,
          createdAt: sbFolder.createdAt,
          updatedAt: sbFolder.updatedAt,
          archivedAt: sbFolder.archivedAt || null,
          createdBy: sbFolder.createdBy || null,
        };

        return apiSuccess<FolderDetailResponsePayload>(
          {
            folder: folderRes,
            pulse,
            isUnfiled: false,
          },
          ctx.requestId
        );
      }
    } catch (err) {
      console.warn("[GET /api/v1/folders/[folderId]] Supabase retrieval notice:", err);
    }

    // 3. D1 fallback
    const d1 = ctx.db;
    if (d1) {
      const d1Folder = await FoldersRepository.getFolder(d1, ctx.organizationId, folderId);
      if (d1Folder) {
        const folderRes: FolderResponseV1 = {
          id: d1Folder.id,
          name: d1Folder.name,
          description: d1Folder.description || null,
          emoji: d1Folder.emoji || null,
          accentKey: d1Folder.accentKey || "Graphite",
          status: d1Folder.status,
          qrCount: d1Folder.qrCount,
          createdAt: new Date(d1Folder.createdAt * 1000).toISOString(),
          updatedAt: new Date(d1Folder.updatedAt * 1000).toISOString(),
          archivedAt: d1Folder.archivedAt ? new Date(d1Folder.archivedAt * 1000).toISOString() : null,
          createdBy: d1Folder.createdBy || null,
        };

        return apiSuccess<FolderDetailResponsePayload>(
          {
            folder: folderRes,
            pulse: {
              qrCount: d1Folder.qrCount,
              dynamicCount: d1Folder.qrCount,
              staticCount: 0,
              destinationCount: 1,
              scanCount: 0,
            },
            isUnfiled: false,
          },
          ctx.requestId
        );
      }
    }

    throw new NotFoundError(`Folder '${folderId}' not found.`);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PATCH /api/v1/folders/[folderId] — Update Folder
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  let ctx;
  try {
    const { folderId } = await params;
    if (folderId === "unfiled") {
      throw new ValidationError("The Unfiled space cannot be renamed or modified.");
    }

    ctx = await authorizeApiRequest(request, {
      scope: "folders:write",
      permission: "folders.update",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = UpdateFolderRequestV1Schema.parse(rawBody);

    // 1. Authoritative Supabase update
    let updatedFolder: any = null;
    try {
      updatedFolder = await SupabaseFolderRepository.updateFolder(ctx.organizationId, folderId, {
        name: payload.name,
        description: payload.description,
        emoji: payload.emoji,
        accentKey: payload.accentKey,
        status: payload.status,
      });
    } catch (sbErr: any) {
      console.warn("[PATCH /api/v1/folders/[folderId]] Supabase update notice:", sbErr.message);
      if (sbErr instanceof ConflictError || sbErr.message?.includes("already exists")) {
        throw sbErr instanceof ConflictError ? sbErr : new ConflictError(sbErr.message);
      }
      if (!ctx.db) {
        throw sbErr;
      }
    }

    // 2. D1 update if available
    const d1 = ctx.db;
    if (d1) {
      try {
        const d1Updated = await FoldersRepository.updateFolder(d1, ctx.organizationId, folderId, {
          name: payload.name,
          description: payload.description,
          emoji: payload.emoji,
          accentKey: payload.accentKey,
          status: payload.status,
        });
        if (!updatedFolder && d1Updated) {
          updatedFolder = {
            id: d1Updated.id,
            organizationId: d1Updated.organizationId,
            name: d1Updated.name,
            description: d1Updated.description,
            emoji: d1Updated.emoji,
            accentKey: d1Updated.accentKey,
            status: d1Updated.status,
            createdAt: new Date(d1Updated.createdAt * 1000).toISOString(),
            updatedAt: new Date(d1Updated.updatedAt * 1000).toISOString(),
            archivedAt: d1Updated.archivedAt ? new Date(d1Updated.archivedAt * 1000).toISOString() : null,
            createdBy: d1Updated.createdBy,
            qrAssetCount: d1Updated.qrCount,
          };
        }

        await recordActivityEvent(d1, {
          organizationId: ctx.organizationId,
          actorId: ctx.principal.actorId,
          action: "folder.updated",
          resourceType: "folder",
          resourceId: folderId,
          metadata: { name: payload.name },
        }).catch((err) => console.warn("[FoldersAPI] Failed to record activity:", err));
      } catch (d1Err) {
        console.warn("[PATCH /api/v1/folders/[folderId]] D1 sync notice:", d1Err);
      }
    }

    if (!updatedFolder) {
      throw new NotFoundError(`Folder '${folderId}' not found.`);
    }

    // Publish internal event
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.FOLDER_UPDATED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "folder", id: folderId },
      data: {
        folderId,
        name: updatedFolder.name,
        status: updatedFolder.status,
      },
    });

    const response: FolderResponseV1 = {
      id: updatedFolder.id,
      name: updatedFolder.name,
      description: updatedFolder.description || null,
      emoji: updatedFolder.emoji || null,
      accentKey: updatedFolder.accentKey,
      status: updatedFolder.status,
      qrCount: updatedFolder.qrAssetCount || 0,
      createdAt: updatedFolder.createdAt,
      updatedAt: updatedFolder.updatedAt,
      archivedAt: updatedFolder.archivedAt || null,
      createdBy: updatedFolder.createdBy || null,
    };

    return apiSuccess(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * DELETE /api/v1/folders/[folderId] — Safe Deletion (QRs unlinked to Unfiled)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  let ctx;
  try {
    const { folderId } = await params;
    if (folderId === "unfiled") {
      throw new ValidationError("The Unfiled space cannot be deleted.");
    }

    ctx = await authorizeApiRequest(request, {
      scope: "folders:write",
      permission: "folders.delete",
    });

    let deleted = false;

    // 1. Authoritative Supabase deletion (with safe unlinking)
    try {
      deleted = await SupabaseFolderRepository.deleteFolder(ctx.organizationId, folderId);
    } catch (sbErr: any) {
      console.warn("[DELETE /api/v1/folders/[folderId]] Supabase delete notice:", sbErr.message);
    }

    // 2. D1 deletion if available
    const d1 = ctx.db;
    if (d1) {
      try {
        const d1Deleted = await FoldersRepository.deleteFolder(d1, ctx.organizationId, folderId);
        if (d1Deleted) {
          deleted = true;
          await recordActivityEvent(d1, {
            organizationId: ctx.organizationId,
            actorId: ctx.principal.actorId,
            action: "folder.deleted",
            resourceType: "folder",
            resourceId: folderId,
          }).catch((err) => console.warn("[FoldersAPI] Failed to record activity:", err));
        }
      } catch (d1Err) {
        console.warn("[DELETE /api/v1/folders/[folderId]] D1 sync notice:", d1Err);
      }
    }

    if (!deleted) {
      throw new NotFoundError(`Folder '${folderId}' not found.`);
    }

    // Publish internal event
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.FOLDER_DELETED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "folder", id: folderId },
      data: {
        folderId,
        deletedBy: ctx.principal.actorId,
      },
    });

    return apiSuccess(
      {
        success: true,
        message: `Folder '${folderId}' deleted. QR assets safely unlinked to Unfiled.`,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
