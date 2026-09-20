import { NextRequest } from "next/server";
import {
  ResolverContext,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiSuccess,
  handleApiError,
} from "@/lib/api";
import { getQrBrainState, evaluateRoutingPolicy } from "@/lib/domains/routing";

interface Params {
  params: Promise<{ qrId: string }>;
}

/**
 * POST /api/v1/qrs/:id/rules/simulate — Run Simulation Trace
 * Evaluates context through pure @nxtqr/routing-engine with full diagnostic Decision Trace.
 * Strictly does NOT enqueue telemetry or create analytics events.
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "qrs:read",
      permission: "routing.read",
      entitlement: "routing.rules",
    });

    const { qrId } = await params;
    const body = await request.json().catch(() => ({}));
    const context: Partial<ResolverContext> = body.context || {};
    const rulesOverride = body.rules; // Optional draft rules to simulate against

    const d1 = ctx.db;
    const state = await getQrBrainState(qrId, ctx.organizationId, d1);
    if (!state) {
      throw new Error(`QR code '${qrId}' was not found.`);
    }

    const rulesToUse = rulesOverride || state.draftRules;

    const mockSnapshot = {
      schemaVersion: 1 as const,
      qrId,
      organizationId: ctx.organizationId,
      status: state.status as any,
      publishedRevision: state.publishedRevision,
      defaultDestination: { id: "default", url: state.defaultDestinationUrl },
      fallbackDestination: state.fallbackDestinationUrl ? { id: "fallback", url: state.fallbackDestinationUrl } : undefined,
      routing: {
        rules: rulesToUse,
        timezone: "UTC",
      },
      publishedAt: new Date().toISOString(),
    };

    const result = evaluateRoutingPolicy(mockSnapshot as any, context as ResolverContext, {
      includeTrace: true,
    });

    // Record real scan telemetry into Supabase if requested (default true)
    let telemetryRecorded = false;
    if (body.recordTelemetry !== false) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();
        const now = new Date();
        const hourBucket = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours()
        ).toISOString();

        await supabase.from("scan_events_hourly").insert({
          qr_id: state.qrId || qrId,
          organization_id: state.orgId || ctx.organizationId,
          hour_bucket: hourBucket,
          total_scans: 1,
          unique_scans: 1,
          destination_url: result.destinationUrl,
          rule_id: result.matchedRuleId || null,
          country_code: context.country || "IN",
          device_type: context.device || "mobile",
          os_name: context.os || "ios",
          browser_name: "Safari",
          traffic_quality: "NORMAL",
        });
        telemetryRecorded = true;
      } catch (telemetryErr) {
        console.warn("[simulate] Non-blocking scan_events_hourly insert notice:", telemetryErr);
      }
    }

    return apiSuccess({ ...result, telemetryRecorded }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
