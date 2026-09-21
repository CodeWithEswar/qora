import { NextRequest } from "next/server";
import {
  ReplaceQrRulesRequestV1Schema,
  NotFoundError,
  createInternalEvent,
  INTERNAL_EVENT_TYPES,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { getQrBrainState, saveDraftRules } from "@/lib/domains/routing";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * GET /api/v1/qrs/:id/rules — Authoritative QR Brain State
 * Fetches draft rules, published snapshot, approved destinations, and live static analysis.
 */
export async function GET(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "routing.read",
      entitlement: "routing.rules",
    });

    const { qrId } = await params;
    const d1 = ctx.db;

    const state = await getQrBrainState(qrId, ctx.organizationId, d1);
    if (!state) {
      throw new NotFoundError(`QR code '${qrId}' was not found.`);
    }

    return apiSuccess(state, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * PUT /api/v1/qrs/:id/rules — Save Draft Routing Rules
 * Saves working draft rules to Supabase Postgres (and D1 if bound) with tenant isolation.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:write",
      permission: "routing.update",
      entitlement: "routing.rules",
    });

    const { qrId } = await params;
    const rawBody = await request.json().catch(() => ({}));
    
    // Robust normalization for client rule structures (supporting action.destinationUrl & matchType)
    const normalizedBody = {
      ...rawBody,
      rules: Array.isArray(rawBody?.rules)
        ? rawBody.rules.map((r: any) => ({
            id: r.id,
            name: r.name || "Routing Rule",
            priority: Number(r.priority) || 1,
            destinationUrl: r.destinationUrl || r.action?.destinationUrl || "",
            destinationId: r.destinationId || r.action?.destinationId || undefined,
            isActive: r.isActive !== undefined ? r.isActive : true,
            matchMode: r.matchMode || r.matchType || "ALL",
            conditions: Array.isArray(r.conditions) && r.conditions.length > 0
              ? r.conditions.map((c: any) => ({
                  id: c.id,
                  field: c.field || c.type || "device",
                  operator: c.operator || "eq",
                  value: c.value,
                  paramName: c.paramName || c.key,
                }))
              : [
                  {
                    field: "device",
                    operator: "eq",
                    value: "mobile",
                  },
                ],
          }))
        : [],
    };

    const payload = ReplaceQrRulesRequestV1Schema.parse(normalizedBody);

    const d1 = ctx.db;
    const actorId = ctx.principal.actorId;
    const mappedRules = payload.rules.map((r) => ({
      id: r.id || "",
      qrId,
      name: r.name,
      priority: r.priority,
      isActive: r.isActive !== undefined ? r.isActive : true,
      matchType: r.matchMode || "ALL",
      conditions: r.conditions.map((c) => ({
        id: c.id || "",
        type: c.field as any,
        field: c.field,
        operator: c.operator as any,
        value: c.value as any,
        paramName: c.paramName || c.key,
      })),
      action: {
        type: "redirect" as const,
        destinationUrl: r.destinationUrl,
        destinationId: r.destinationId,
      },
    }));

    const defaultDestinationUrl = typeof rawBody?.defaultDestinationUrl === "string" ? rawBody.defaultDestinationUrl : undefined;
    const fallbackDestinationUrl = typeof rawBody?.fallbackDestinationUrl === "string" ? rawBody.fallbackDestinationUrl : undefined;

    const result = await saveDraftRules(
      qrId,
      ctx.organizationId,
      mappedRules,
      payload.expectedRevision,
      actorId,
      d1,
      defaultDestinationUrl,
      fallbackDestinationUrl
    );

    // Emit internal event: qr.rule.changed (draft update)
    createInternalEvent({
      eventType: INTERNAL_EVENT_TYPES.QR_RULE_CHANGED,
      organizationId: ctx.organizationId,
      actor: { type: ctx.principal.type === "session" ? "user" : "api_key", id: actorId },
      resource: { type: "qr", id: qrId },
      data: {
        qrId,
        ruleCount: result.ruleCount,
        isDraft: true,
      },
    });

    return apiSuccess(result, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
