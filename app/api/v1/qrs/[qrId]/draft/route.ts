import { NextRequest } from "next/server";
import {
  SaveQrDraftRequestV1Schema,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * GET /api/v1/qrs/:qrId/draft — Retrieve active working draft
 * Returns mutable working draft state, or initializes from latest version / defaults.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const { qrId } = await params;

    // 1. Verify QR asset ownership within authenticated organization
    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    // 2. Fetch or auto-initialize draft
    const draft = await QrStore.getDraft(qrId, ctx.organizationId, ctx.db);

    return apiSuccess(
      {
        qrId,
        draftVersion: draft.draftVersion,
        qrName: qr.name,
        slug: qr.slug,
        qrType: qr.qrType,
        status: qr.status,
        isDynamic: Boolean(qr.isDynamic),
        content: {
          ...draft.content,
          isDynamic: Boolean(qr.isDynamic),
        },
        design: draft.design,
        destination: draft.destination,
        updatedAt: new Date(draft.updatedAt * 1000).toISOString(),
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PUT /api/v1/qrs/:qrId/draft — Debounced Draft Autosave
 * Preserves ephemeral working state with optimistic concurrency protection.
 * NEVER creates an immutable version or triggers domain event on keystrokes.
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
    const payload = SaveQrDraftRequestV1Schema.parse(rawBody);

    const result = await QrStore.saveDraft(
      qrId,
      ctx.organizationId,
      {
        name: payload.name,
        isDynamic: payload.isDynamic,
        content: payload.content as any,
        design: payload.design as any,
        destination: payload.destination,
        expectedDraftVersion: payload.expectedDraftVersion ?? 0,
        updatedBy: ctx.principal.actorId,
      },
      ctx.db
    );

    return apiSuccess(
      {
        qrId,
        draftVersion: result.draftVersion,
        updatedAt: result.updatedAt,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
