import { NextRequest } from "next/server";
import {
  CreateFolderRequestV1Schema,
  FolderCollectionQuerySchema,
  FolderResponseV1,
  FolderSummarySignal,
  ConflictError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { FoldersRepository, recordActivityEvent } from "@nxtqr/db";
import { SupabaseFolderRepository } from "@/lib/supabase/repositories/folders";

/**
 * GET /api/v1/folders — List Folders with real relational metrics and summary signal
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "folders:read",
      permission: "folders.read",
    });

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = FolderCollectionQuerySchema.parse(rawQuery);

    // 1. Authoritative Supabase retrieval
    try {
      const [sbRows, summarySignal] = await Promise.all([
        SupabaseFolderRepository.listByOrg(ctx.organizationId, {
          status: query.status,
          search: query.search,
          sortBy: query.sortBy,
          order: query.order,
          limit: query.limit,
          offset: query.offset,
        }),
        SupabaseFolderRepository.getSummary(ctx.organizationId),
      ]);

      const items: FolderResponseV1[] = sbRows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || null,
        emoji: r.emoji || null,
        accentKey: (r.accentKey as any) || "Graphite",
        status: r.status,
        qrCount: r.qrAssetCount || 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        archivedAt: r.archivedAt || null,
        createdBy: r.createdBy || null,
      }));

      const hasMore = items.length === query.limit;
      const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

      return apiCollection(items, { nextCursor, hasMore, totalCount: items.length }, ctx.requestId, 200, {
        signal: summarySignal as unknown as Record<string, unknown>,
      });
    } catch (err) {
      console.warn("[GET /api/v1/folders] Supabase query notice:", err);
    }

    // 2. D1 fallback if available
    const d1 = ctx.db;
    if (d1) {
      const { items: d1Rows, totalCount } = await FoldersRepository.listFolders(d1, ctx.organizationId, {
        search: query.search,
        status: query.status,
        sortBy: query.sortBy,
        order: query.order,
        limit: query.limit,
        offset: query.offset,
      });

      const items: FolderResponseV1[] = d1Rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || null,
        emoji: r.emoji || null,
        accentKey: r.accentKey || "Graphite",
        status: r.status,
        qrCount: r.qrCount || 0,
        createdAt: new Date(r.createdAt * 1000).toISOString(),
        updatedAt: new Date(r.updatedAt * 1000).toISOString(),
        archivedAt: r.archivedAt ? new Date(r.archivedAt * 1000).toISOString() : null,
        createdBy: r.createdBy || null,
      }));

      return apiCollection(items, { nextCursor: null, hasMore: false, totalCount }, ctx.requestId, 200);
    }

    return apiCollection([], { nextCursor: null, hasMore: false, totalCount: 0 }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/folders — Create Folder in Supabase Postgres & Cloudflare D1
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "folders:write",
      permission: "folders.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateFolderRequestV1Schema.parse(rawBody);

    // 1. Authoritative Supabase insert
    let createdFolder: any = null;
    try {
      createdFolder = await SupabaseFolderRepository.createFolder(ctx.organizationId, {
        name: payload.name,
        description: payload.description,
        emoji: payload.emoji,
        accentKey: payload.accentKey,
        createdBy: ctx.principal.actorId,
      });
    } catch (sbErr: any) {
      console.warn("[POST /api/v1/folders] Supabase creation notice:", sbErr.message);
      if (sbErr instanceof ConflictError || sbErr.message?.includes("already exists")) {
        throw sbErr instanceof ConflictError ? sbErr : new ConflictError(sbErr.message);
      }
      if (!ctx.db) {
        throw sbErr;
      }
    }

    // 2. D1 sync if available
    const d1 = ctx.db;
    if (d1 && !createdFolder) {
      const d1Folder = await FoldersRepository.createFolder(d1, ctx.organizationId, {
        name: payload.name,
        description: payload.description,
        emoji: payload.emoji,
        accentKey: payload.accentKey,
        createdBy: ctx.principal.actorId,
      });
      createdFolder = {
        id: d1Folder.id,
        organizationId: d1Folder.organizationId,
        name: d1Folder.name,
        description: d1Folder.description,
        emoji: d1Folder.emoji,
        accentKey: d1Folder.accentKey,
        status: d1Folder.status,
        createdAt: new Date(d1Folder.createdAt * 1000).toISOString(),
        updatedAt: new Date(d1Folder.updatedAt * 1000).toISOString(),
        archivedAt: null,
        createdBy: d1Folder.createdBy,
        qrAssetCount: 0,
      };
    }

    if (!createdFolder) {
      throw new Error("Unable to persist folder record to backend.");
    }

    // Record activity event
    if (d1) {
      await recordActivityEvent(d1, {
        organizationId: ctx.organizationId,
        actorId: ctx.principal.actorId,
        action: "folder.created",
        resourceType: "folder",
        resourceId: createdFolder.id,
        metadata: { name: createdFolder.name, emoji: createdFolder.emoji },
      }).catch((err) => console.warn("[FoldersAPI] Failed to record activity:", err));
    }

    // Publish internal event
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.FOLDER_CREATED,
      organizationId: ctx.organizationId,
      actor: {
        type: ctx.principal.type === "session" ? "user" : "api_key",
        id: ctx.principal.actorId,
      },
      resource: { type: "folder", id: createdFolder.id },
      data: {
        folderId: createdFolder.id,
        name: createdFolder.name,
        emoji: createdFolder.emoji,
        createdBy: ctx.principal.actorId,
      },
    });

    const responseItem: FolderResponseV1 = {
      id: createdFolder.id,
      name: createdFolder.name,
      description: createdFolder.description || null,
      emoji: createdFolder.emoji || null,
      accentKey: createdFolder.accentKey,
      status: createdFolder.status,
      qrCount: createdFolder.qrAssetCount || 0,
      createdAt: createdFolder.createdAt,
      updatedAt: createdFolder.updatedAt,
      archivedAt: null,
      createdBy: createdFolder.createdBy || null,
    };

    return apiCreated(responseItem, ctx.requestId, { location: `/api/v1/folders/${createdFolder.id}` });
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
