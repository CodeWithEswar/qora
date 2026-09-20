import { NextRequest } from "next/server";
import {
  CreateQrVersionRequestV1Schema,
  NotFoundError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  apiCreated,
  handleApiError,
} from "@/lib/api";
import { QrStore } from "@/lib/domains/qr-store";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * GET /api/v1/qrs/:qrId/versions — List immutable version history
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "qr.read",
    });

    const { qrId } = await params;

    // Verify QR ownership
    const qr = await QrStore.getQr(qrId, ctx.organizationId, ctx.db);
    if (!qr) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    const versionRows = await QrStore.listVersions(qrId, ctx.organizationId, ctx.db);

    const versions = versionRows.map((r) => ({
      id: r.id,
      qrId: r.qrId,
      versionNumber: r.versionNumber,
      changeSummary: r.changeSummary,
      content: r.content,
      design: r.design,
      author: {
        id: r.createdBy,
        name: "Workspace Member",
        email: "",
      },
      isCurrent: qr.currentVersion === r.versionNumber,
      isPublished: qr.publishedVersionId === r.id,
      createdAt: new Date(r.createdAt * 1000).toISOString(),
    }));

    return apiSuccess({ qrId, versions }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/qrs/:qrId/versions — Create an immutable checkpoint version
 * Never updates historical versions in-place.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "qr.update",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateQrVersionRequestV1Schema.parse(rawBody);

    const versionItem = await QrStore.createVersion(
      qrId,
      ctx.organizationId,
      {
        changeSummary: payload.changeSummary,
        createdBy: ctx.principal.actorId,
        content: payload.content as any,
        design: payload.design as any,
      },
      ctx.db
    );

    // Emit domain event: qr.version.created
    const event = createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.QR_CREATED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: ctx.principal.actorId },
      resource: { type: "qr", id: qrId },
      data: {
        qrId,
        versionId: versionItem.id,
        versionNumber: versionItem.versionNumber,
        changeSummary: payload.changeSummary,
      },
    });

    return apiCreated(
      {
        id: versionItem.id,
        qrId,
        versionNumber: versionItem.versionNumber,
        changeSummary: payload.changeSummary,
        content: versionItem.content,
        design: versionItem.design,
        createdAt: new Date(versionItem.createdAt * 1000).toISOString(),
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
