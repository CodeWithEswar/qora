import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { BulkQrStore } from "@/lib/domains/bulk-qr/store";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";

const CreateBatchRequestSchema = z.object({
  name: z.string().min(1, "Batch name is required").max(120),
  sourceType: z.preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      const lower = v.toLowerCase().trim();
      return lower === "manual" ? "manual_grid" : lower;
    },
    z.enum(["csv", "manual_grid"])
  ),
  creationMode: z.enum(["DRAFT", "PUBLISH"]).default("DRAFT"),
  campaignId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().uuid().optional()
  ),
  folderId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().uuid().optional()
  ),
  design: z.any().optional(),
  manifest: z.any().optional(),
  rows: z.array(z.any()).min(1, "Batch must contain at least 1 row"),
});

/**
 * GET /api/v1/bulk/batches
 * Lists all batches for the authenticated organization.
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const batches = await BulkQrStore.listBatches(ctx.organizationId, limit, offset);

    return apiSuccess({ batches, total: batches.length }, ctx.requestId, 200);
  } catch (err) {
    return handleApiError(err, "req_bulk_list");
  }
}

/**
 * POST /api/v1/bulk/batches
 * Ingests a new batch and saves its preflight rows and manifest.
 */
export async function POST(request: NextRequest) {
  let ctx: any;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.create",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateBatchRequestSchema.parse(rawBody);

    const manifest = payload.manifest || {
      sourceType: payload.sourceType,
      totalRows: payload.rows.length,
      readyRows: payload.rows.length,
      warningRows: 0,
      blockedRows: 0,
      typeBreakdown: {},
    };

    const created = await BulkQrStore.createBatch({
      organizationId: ctx.organizationId,
      actorId: ctx.principal.actorId,
      name: payload.name,
      sourceType: payload.sourceType as any,
      creationMode: payload.creationMode,
      manifest,
      design: payload.design || CANONICAL_QR_DESIGN_DEFAULTS,
      rows: payload.rows,
      campaignId: payload.campaignId,
      folderId: payload.folderId,
    });

    return apiSuccess({ batch: created }, ctx.requestId, 201);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_bulk_create");
  }
}
