import { NextRequest } from "next/server";
import {
  NotFoundError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { publishRoutingRules } from "@/lib/domains/routing";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * POST /api/v1/qrs/:id/rules/publish — Publish QR Brain Rules
 * Validates draft rules, commits immutable Supabase revision (and D1 if available), and writes compact snapshot.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "routing.publish",
      entitlement: "routing.rules",
    });

    const { qrId } = await params;
    const d1 = ctx.db;
    const kv = undefined;
    const actorId = ctx.principal.actorId;

    const result = await publishRoutingRules(
      qrId,
      ctx.organizationId,
      actorId,
      d1,
      kv
    );

    // Emit internal event: qr.rule.changed (with isDraft: false)
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.QR_RULE_CHANGED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: actorId },
      resource: { type: "qr", id: qrId },
      data: {
        qrId,
        publishedRevision: result.publishedRevision,
        isDraft: false,
      },
    });

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
