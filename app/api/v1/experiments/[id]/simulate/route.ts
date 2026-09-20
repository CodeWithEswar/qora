import { NextRequest } from "next/server";
import { authorizeApiRequest, apiSuccess, handleApiError } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError, ValidationError } from "@nxtqr/contracts";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/experiments/:id/simulate — Inject real scan telemetry into Supabase
 */
export async function POST(request: NextRequest, { params }: Params) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "experiments:write",
      permission: "routing.update",
    });

    const { id: experimentId } = await params;
    const body = await request.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body.batchSize || body.count || 1), 1), 500);

    const supabase = createAdminClient();

    // 1. Fetch experiment and verify existence
    const { data: experiment, error: expErr } = await supabase
      .from("experiments")
      .select("*, qr:qr_codes(id, organization_id, slug, name)")
      .eq("id", experimentId)
      .maybeSingle();

    if (expErr || !experiment) {
      throw new NotFoundError(`Experiment '${experimentId}' not found.`);
    }

    // 2. Fetch variants
    const { data: variants, error: varErr } = await supabase
      .from("experiment_variants")
      .select("*")
      .eq("experiment_id", experimentId)
      .order("name", { ascending: true });

    if (varErr || !variants || variants.length === 0) {
      throw new ValidationError("Experiment has no configured variants to route traffic.");
    }

    // 3. Compute cumulative thresholds
    let cumulative = 0;
    const cumulativeWeights = variants.map((v) => {
      cumulative += Number(v.traffic_weight || 50);
      return { variant: v, threshold: cumulative };
    });

    const decisions: {
      id: string;
      timestamp: string;
      variantId: string;
      variantName: string;
      destination: string;
      randomSeed: number;
      converted: boolean;
    }[] = [];

    const variantScanDeltas: Record<string, number> = {};
    const variantConvDeltas: Record<string, number> = {};

    for (const v of variants) {
      variantScanDeltas[v.id] = 0;
      variantConvDeltas[v.id] = 0;
    }

    // 4. Deterministic edge simulation
    const now = new Date();
    for (let i = 0; i < batchSize; i++) {
      const rand = Math.random() * (cumulative || 100);
      const chosen =
        cumulativeWeights.find((w) => rand <= w.threshold)?.variant || variants[0];

      // Simulated conversion chance: ~8-14%
      const converted = Math.random() < 0.11;

      variantScanDeltas[chosen.id] = (variantScanDeltas[chosen.id] || 0) + 1;
      if (converted) {
        variantConvDeltas[chosen.id] = (variantConvDeltas[chosen.id] || 0) + 1;
      }

      decisions.push({
        id: `sim_${Date.now()}_${i}`,
        timestamp: now.toLocaleTimeString(),
        variantId: chosen.id,
        variantName: chosen.name,
        destination: chosen.destination_url,
        randomSeed: Math.floor(rand),
        converted,
      });
    }

    // 5. Authoritatively update Supabase experiment_variants
    const updatedVariants: any[] = [];
    for (const v of variants) {
      const addedScans = variantScanDeltas[v.id] || 0;
      const addedConversions = variantConvDeltas[v.id] || 0;

      const nextScans = Number(v.total_scans || 0) + addedScans;
      const nextConversions = Number(v.conversions || 0) + addedConversions;

      await supabase
        .from("experiment_variants")
        .update({
          total_scans: nextScans,
          conversions: nextConversions,
        })
        .eq("id", v.id);

      updatedVariants.push({
        id: v.id,
        experimentId: v.experiment_id,
        name: v.name,
        destinationUrl: v.destination_url,
        trafficWeight: Number(v.traffic_weight || 50),
        totalScans: nextScans,
        conversions: nextConversions,
      });
    }

    // 6. Record hourly scan telemetry in scan_events_hourly
    try {
      const hourBucket = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours()
      ).toISOString();

      const targetQrId = experiment.qr_id;
      const targetOrgId = experiment.qr?.organization_id || ctx.organizationId;

      await supabase.from("scan_events_hourly").insert({
        qr_id: targetQrId,
        organization_id: targetOrgId,
        hour_bucket: hourBucket,
        total_scans: batchSize,
        unique_scans: Math.max(1, Math.floor(batchSize * 0.85)),
        traffic_quality: "NORMAL",
        destination_url: updatedVariants[0]?.destinationUrl || "https://nxtqr.vercel.app",
      });
    } catch (telemetryErr) {
      console.warn("[simulate] Non-blocking scan_events_hourly notice:", telemetryErr);
    }

    const totalObservations = updatedVariants.reduce((sum, v) => sum + v.totalScans, 0);

    const updatedExperiment = {
      id: experiment.id,
      qrId: experiment.qr_id,
      qrName: experiment.qr?.name || "Target QR",
      qrSlug: experiment.qr?.slug || "qr",
      name: experiment.name,
      status: experiment.status || "ACTIVE",
      goalMetric: "scans",
      startTime: experiment.start_time,
      endTime: experiment.end_time,
      variants: updatedVariants,
      totalObservations,
      createdAt: experiment.created_at,
    };

    return apiSuccess(
      {
        batchSize,
        decisions,
        updatedExperiment,
      },
      ctx.requestId
    );
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
