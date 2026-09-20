import { NextRequest } from "next/server";
import {
  FolderAssetCollectionQuerySchema,
  FolderQrAssetV1,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { SupabaseFolderRepository } from "@/lib/supabase/repositories/folders";

/**
 * GET /api/v1/folders/[folderId]/assets — Paginated list of QR assets in folder or unfiled
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

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = FolderAssetCollectionQuerySchema.parse(rawQuery);

    const { items, totalCount } = await SupabaseFolderRepository.listFolderQrAssets(
      ctx.organizationId,
      folderId === "unfiled" ? null : folderId,
      {
        search: query.search,
        status: query.status,
        qrType: query.qrType,
        isDynamic: query.isDynamic,
        sortBy: query.sortBy,
        order: query.order,
        limit: query.limit,
        offset: query.offset,
      }
    );

    const hasMore = (query.offset || 0) + items.length < totalCount;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return apiCollection<FolderQrAssetV1>(
      items,
      { nextCursor, hasMore, totalCount },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
