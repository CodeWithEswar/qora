import { NextRequest } from "next/server";
import {
  QrCollectionQuerySchema,
  QrResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

interface Params {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET /api/v1/organizations/:orgSlug/qrs — Paginated collection retrieval for organization
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    const { orgSlug } = await params;
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (!org) {
      throw new NotFoundError(`Organization '${orgSlug}' not found.`);
    }

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = QrCollectionQuerySchema.parse(rawQuery);

    const [rows, summary] = await Promise.all([
      QrStore.listQrs(
        {
          organizationId: org.id,
          search: query.search,
          status: query.status,
          qrType: query.type,
          campaignId: query.campaignId,
          ownerId: query.ownerId,
          sortBy: query.sortBy as any,
          order: query.order as any,
          limit: query.limit + 1,
        },
        ctx.db
      ),
      QrStore.getSummaryMetrics(org.id, ctx.db),
    ]);

    const hasMore = rows.length > query.limit;
    const slice = hasMore ? rows.slice(0, query.limit) : rows;

    const items: QrResponseV1[] = slice.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: (row.qrType as any) || "url",
      mode: row.isDynamic ? "dynamic" : "static",
      status: row.status,
      destinationUrl: row.destinationUrl || "",
      fallbackUrl: row.fallbackUrl || undefined,
      scanUrl: `https://nxtqr.vercel.app/s/${row.slug}`,
      campaignId: row.campaignId || undefined,
      campaignName: row.campaignName || undefined,
      folderId: row.folderId || undefined,
      ownerId: row.ownerId || undefined,
      ownerName: row.ownerName || undefined,
      ownerEmail: row.ownerEmail || undefined,
      ownerAvatarUrl: row.ownerAvatarUrl || undefined,
      scans: row.totalScans || 0,
      uniqueScans: row.uniqueScans || 0,
      design: row.design || CANONICAL_QR_DESIGN_DEFAULTS,
      createdAt: new Date(row.createdAt * 1000).toISOString(),
      updatedAt: new Date(row.updatedAt * 1000).toISOString(),
    }));

    return apiCollection(
      items,
      {
        totalCount: items.length,
        hasMore,
        nextCursor: hasMore ? slice[slice.length - 1].id : null,
      },
      ctx.requestId,
      200,
      { summary }
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
