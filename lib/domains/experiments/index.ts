import { createAdminClient } from "@/lib/supabase/admin";
import { getD1Database } from "@/lib/db/d1";
import { generateOpaqueId } from "@nxtqr/db";
import {
  ExperimentItem,
  ExperimentVariantItem,
  EligibleDynamicQrOption,
  CreateExperimentStepInput,
  ExperimentStatus,
} from "@/components/experiments/types";

/**
 * Lists all experiments belonging to dynamic QRs in the organization.
 */
export async function listExperiments(orgSlug: string): Promise<{
  experiments: ExperimentItem[];
  eligibleQrs: EligibleDynamicQrOption[];
}> {
  const db = await getD1Database();
  let experiments: ExperimentItem[] = [];
  let eligibleQrs: EligibleDynamicQrOption[] = [];

  // 1. Authoritative Supabase retrieval
  try {
    const supabase = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgSlug);

    const orgQuery = supabase.from("organizations").select("id, slug").limit(1);
    const { data: org } = isUuid
      ? await orgQuery.eq("id", orgSlug).maybeSingle()
      : await orgQuery.or(`slug.eq.${orgSlug},legacy_id.eq.${orgSlug}`).maybeSingle();

    if (org?.id) {
      // Query organization's QRs
      const { data: qrs } = await supabase
        .from("qr_codes")
        .select("id, name, slug, status, published_revision, is_dynamic, qr_drafts(destination_json, content_json)")
        .eq("organization_id", org.id)
        .neq("status", "ARCHIVED")
        .order("created_at", { ascending: false });

      if (qrs && qrs.length > 0) {
        eligibleQrs = qrs.map((q: any) => {
          const draft = Array.isArray(q.qr_drafts) ? q.qr_drafts[0] : q.qr_drafts;
          const defaultUrl =
            draft?.destination_json?.defaultUrl ||
            draft?.content_json?.url ||
            "https://nxtqr.vercel.app";
          return {
            id: q.id,
            name: q.name || "Untitled QR",
            slug: q.slug,
            status: q.status || "ACTIVE",
            defaultUrl,
            publishedRevision: Number(q.published_revision || 1),
          };
        });

        const qrIds = qrs.map((q: any) => q.id);
        const qrMap = new Map(qrs.map((q: any) => [q.id, q]));

        // Fetch experiments for these QRs
        const { data: expRows } = await supabase
          .from("experiments")
          .select("*")
          .in("qr_id", qrIds)
          .order("created_at", { ascending: false });

        if (expRows && expRows.length > 0) {
          const expIds = expRows.map((e: any) => e.id);

          // Fetch variants
          const { data: variantRows } = await supabase
            .from("experiment_variants")
            .select("*")
            .in("experiment_id", expIds);

          const variantsByExp = new Map<string, any[]>();
          for (const v of variantRows || []) {
            const list = variantsByExp.get(v.experiment_id) || [];
            list.push(v);
            variantsByExp.set(v.experiment_id, list);
          }

          experiments = expRows.map((e: any) => {
            const parentQr = qrMap.get(e.qr_id);
            const rawVars = variantsByExp.get(e.id) || [];

            const parsedVariants: ExperimentVariantItem[] = rawVars.map((v: any) => ({
              id: v.id,
              experimentId: v.experiment_id,
              name: v.name,
              destinationUrl: v.destination_url,
              trafficWeight: Number(v.traffic_weight || 50),
              totalScans: Number(v.total_scans || 0),
              conversions: Number(v.conversions || 0),
            }));

            const totalObservations = parsedVariants.reduce((sum, v) => sum + v.totalScans, 0);

            return {
              id: e.id,
              qrId: e.qr_id,
              qrName: parentQr?.name || "Target QR",
              qrSlug: parentQr?.slug || "qr",
              name: e.name,
              description: e.description || undefined,
              status: (e.status?.toUpperCase() as ExperimentStatus) || "DRAFT",
              goalMetric: "scans",
              startTime: e.start_time || undefined,
              endTime: e.end_time || undefined,
              variants: parsedVariants,
              totalObservations,
              createdAt: e.created_at,
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn("[listExperiments] Supabase query notice:", err);
  }

  return { experiments, eligibleQrs };
}

/**
 * Creates an experiment in Supabase.
 */
export async function createExperiment(
  orgSlug: string,
  input: CreateExperimentStepInput,
  actorId?: string
): Promise<{ success: boolean; experimentId: string }> {
  const supabase = createAdminClient();

  const totalWeight = input.variants.reduce((sum, v) => sum + Number(v.trafficWeight), 0);
  if (Math.round(totalWeight) !== 100) {
    throw new Error("Variant traffic allocation weights must sum to exactly 100%.");
  }

  const expId = generateOpaqueId("exp");
  const nowIso = new Date().toISOString();

  const { data: qr } = await supabase
    .from("qr_codes")
    .select("id, organization_id, slug")
    .eq("id", input.qrId)
    .single();

  if (!qr) {
    throw new Error(`QR asset '${input.qrId}' not found.`);
  }

  // Automatically ensure parent QR code is dynamic for edge split routing
  await supabase
    .from("qr_codes")
    .update({ is_dynamic: true, updated_at: nowIso })
    .eq("id", input.qrId);

  const { data: insertedExp, error: expErr } = await supabase
    .from("experiments")
    .insert({
      qr_id: input.qrId,
      name: input.name.trim(),
      status: "ACTIVE",
      start_time: input.startTime ? new Date(input.startTime).toISOString() : nowIso,
      end_time: input.endTime ? new Date(input.endTime).toISOString() : null,
    })
    .select("id")
    .single();

  if (expErr) throw expErr;

  const realExpId = insertedExp?.id || expId;

  const variantRows = input.variants.map((v) => ({
    experiment_id: realExpId,
    name: v.name.trim(),
    destination_url: v.destinationUrl.trim(),
    traffic_weight: Number(v.trafficWeight),
    total_scans: 0,
    conversions: 0,
  }));

  const { error: varErr } = await supabase.from("experiment_variants").insert(variantRows);
  if (varErr) throw varErr;

  return { success: true, experimentId: realExpId };
}

/**
 * Updates experiment lifecycle status (ACTIVE, PAUSED, COMPLETED, ARCHIVED).
 */
export async function updateExperimentStatus(
  experimentId: string,
  status: ExperimentStatus
): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  try {
    await supabase.from("experiments").update({ status }).eq("id", experimentId);
  } catch (err) {
    console.warn("[updateExperimentStatus] Supabase error:", err);
    throw err;
  }

  return { success: true };
}

/**
 * Retrieves a single experiment by ID within the authorized organization.
 */
export async function getExperiment(
  orgSlug: string,
  experimentId: string
): Promise<ExperimentItem | null> {
  const { experiments } = await listExperiments(orgSlug);
  return experiments.find((e) => e.id === experimentId) || null;
}

