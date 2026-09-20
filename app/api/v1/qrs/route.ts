import { NextRequest } from "next/server";
import {
  CreateQrRequestV1Schema,
  QrCollectionQuerySchema,
  CreateQrRequestV1,
  QrResponseV1,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  apiCollection,
  handleApiError,
  checkIdempotency,
  recordIdempotentResponse,
} from "@/lib/api";
import { generateOpaqueId } from "@nxtqr/db";
import { QrStore } from "@/lib/domains/qr-store";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

/**
 * GET /api/v1/qrs — Paginated collection retrieval
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = QrCollectionQuerySchema.parse(rawQuery);

    const [rows, summary] = await Promise.all([
      QrStore.listQrs(
        {
          organizationId: ctx.organizationId,
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
      QrStore.getSummaryMetrics(ctx.organizationId, ctx.db),
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

/**
 * POST /api/v1/qrs — Create QR Asset
 * Organization derived strictly from authenticated principal.
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.create",
      entitlement: "qr.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload: CreateQrRequestV1 = CreateQrRequestV1Schema.parse(rawBody);

    // Idempotency check
    const idempotencyKey = request.headers.get("idempotency-key");
    const reservation = await checkIdempotency(
      ctx.db,
      ctx.principal,
      "/api/v1/qrs",
      "POST",
      idempotencyKey,
      payload
    );
    if (reservation.cachedResponse) {
      return reservation.cachedResponse;
    }

    const qrId = generateOpaqueId("qr");

    const record = await QrStore.createQr(
      {
        id: qrId,
        organizationId: ctx.organizationId,
        ownerId: ctx.principal.actorId,
        name: payload.name,
        type: payload.type,
        mode: payload.mode,
        destinationUrl: payload.destinationUrl,
        fallbackUrl: payload.fallbackUrl,
        campaignId: payload.campaignId,
        folderId: payload.folderId,
        design: payload.design,
      },
      ctx.db
    );

    // Emit internal domain event: qr.created
    const event = createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.QR_CREATED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "qr", id: qrId },
      data: {
        qrId,
        slug: record.slug,
        name: payload.name,
        type: payload.type,
        mode: payload.mode,
        destinationUrl: payload.destinationUrl,
      },
    });

    const responseData: QrResponseV1 = {
      id: qrId,
      slug: record.slug,
      name: payload.name,
      type: payload.type,
      mode: payload.mode,
      status: "ACTIVE",
      destinationUrl: payload.destinationUrl,
      fallbackUrl: payload.fallbackUrl,
      scanUrl: `https://nxtqr.vercel.app/s/${record.slug}`,
      campaignId: payload.campaignId,
      folderId: payload.folderId,
      design: record.design || payload.design || CANONICAL_QR_DESIGN_DEFAULTS,
      createdAt: new Date(record.createdAt * 1000).toISOString(),
      updatedAt: new Date(record.updatedAt * 1000).toISOString(),
    };

    if (idempotencyKey) {
      await recordIdempotentResponse(
        ctx.db,
        ctx.principal,
        "/api/v1/qrs",
        idempotencyKey,
        201,
        responseData
      );
    }

    return apiCreated(
      responseData,
      ctx.requestId,
      { idempotencyKey: idempotencyKey || undefined }
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
