import { NextRequest } from "next/server";
import {
  CreateExperimentRequestV1Schema,
  ExperimentResponseV1,
  NotFoundError,
} from "@nxtqr/contracts";
import {
  authorizeApiRequest,
  apiCreated,
  apiCollection,
  handleApiError,
} from "@/lib/api";
import { generateOpaqueId } from "@nxtqr/db";

/**
 * GET /api/v1/experiments — List Experiments
 * Authoritative Supabase retrieval with D1 fallback
 */
export async function GET(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "experiments:read",
    });

    let items: ExperimentResponseV1[] = [];

    // Authoritative Supabase retrieval
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      const isOrgUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ctx.organizationId);
      let orgQuery = supabase.from("organizations").select("id").limit(1);
      const { data: orgRow } = isOrgUuid
        ? await orgQuery.eq("id", ctx.organizationId).maybeSingle()
        : await orgQuery.or(`slug.eq.${ctx.organizationId},legacy_id.eq.${ctx.organizationId}`).maybeSingle();

      const effectiveOrgId = orgRow?.id || ctx.organizationId;

      const { data: qrs } = await supabase
        .from("qr_codes")
        .select("id")
        .eq("organization_id", effectiveOrgId);

      if (qrs && qrs.length > 0) {
        const qrIds = qrs.map((q) => q.id);
        const { data: expRows } = await supabase
          .from("experiments")
          .select("*")
          .in("qr_id", qrIds)
          .order("created_at", { ascending: false });

        if (expRows && expRows.length > 0) {
          const expIds = expRows.map((e) => e.id);
          const { data: varRows } = await supabase
            .from("experiment_variants")
            .select("*")
            .in("experiment_id", expIds);

          const varsByExp = new Map<string, any[]>();
          for (const v of varRows || []) {
            const list = varsByExp.get(v.experiment_id) || [];
            list.push(v);
            varsByExp.set(v.experiment_id, list);
          }

          items = expRows.map((r: any) => ({
            id: r.id,
            qrId: r.qr_id,
            name: r.name,
            status: (r.status?.toLowerCase() || "active") as any,
            variants: (varsByExp.get(r.id) || []).map((v: any) => ({
              id: v.id,
              name: v.name,
              destinationUrl: v.destination_url,
              trafficWeight: Number(v.traffic_weight || 50),
            })),
            createdAt: r.created_at,
            updatedAt: r.created_at,
          }));
        }
      }
    } catch (sbErr) {
      console.warn("[GET /api/v1/experiments] Supabase retrieval error:", sbErr);
    }

    return apiCollection(items, { nextCursor: null, hasMore: false }, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}

/**
 * POST /api/v1/experiments — Create Experiment
 * Authoritative Supabase persistence
 */
export async function POST(request: NextRequest) {
  let ctx;
  try {
    ctx = await authorizeApiRequest(request, {
      scope: "experiments:write",
      permission: "routing.update",
      entitlement: "routing.rules",
    });

    const rawBody = await request.json().catch(() => ({}));
    const payload = CreateExperimentRequestV1Schema.parse(rawBody);

    let targetQr: any = null;
    const orgSlugHeader = request.headers.get("x-organization-slug") || "";

    // 1. Authoritative Supabase verification
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const lookupOrg = orgSlugHeader || ctx.organizationId;
    const isOrgUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lookupOrg);
    let orgQuery = supabase.from("organizations").select("id, slug").limit(1);
    const { data: orgRow } = isOrgUuid
      ? await orgQuery.eq("id", lookupOrg).maybeSingle()
      : await orgQuery.or(`slug.eq.${lookupOrg},legacy_id.eq.${lookupOrg}`).maybeSingle();

    const effectiveOrgId = orgRow?.id || ctx.organizationId;

    const isQrUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.qrId);
    let qrQuery = supabase
      .from("qr_codes")
      .select("id, name, slug, organization_id, is_dynamic");

    if (isQrUuid) {
      qrQuery = qrQuery.eq("id", payload.qrId);
    } else {
      qrQuery = qrQuery.or(`slug.eq.${payload.qrId},legacy_id.eq.${payload.qrId}`);
    }

    const { data: sbQr, error: qrErr } = await qrQuery.maybeSingle();
    if (qrErr) {
      console.warn("[POST /api/v1/experiments] Supabase QR query error:", qrErr);
    }

    if (sbQr) {
      const belongsToOrg =
        sbQr.organization_id === effectiveOrgId ||
        sbQr.organization_id === ctx.organizationId ||
        sbQr.organization_id === orgRow?.id;

      if (belongsToOrg) {
        targetQr = sbQr;
      } else {
        const { data: qrOrg } = await supabase
          .from("organizations")
          .select("id, slug")
          .eq("id", sbQr.organization_id)
          .maybeSingle();

        if (
          qrOrg &&
          (qrOrg.slug === lookupOrg ||
            qrOrg.slug === ctx.organizationId ||
            qrOrg.id === ctx.organizationId ||
            qrOrg.slug === orgRow?.slug)
        ) {
          targetQr = sbQr;
        }
      }
    }

    if (!targetQr) {
      throw new NotFoundError(`Target QR code '${payload.qrId}' not found.`);
    }

    const targetQrId = targetQr.id;
    const nowIso = new Date().toISOString();

    // 2. Ensure target QR is marked dynamic for edge A/B split routing
    await supabase
      .from("qr_codes")
      .update({ is_dynamic: true, updated_at: nowIso })
      .eq("id", targetQrId);

    const variants = payload.variants.map((v) => ({
      name: v.name.trim(),
      destinationUrl: v.destinationUrl.trim(),
      trafficWeight: Number(v.trafficWeight),
    }));

    // 3. Authoritative Supabase insertion
    const { data: insertedExp, error: expErr } = await supabase
      .from("experiments")
      .insert({
        qr_id: targetQrId,
        name: payload.name.trim(),
        status: "ACTIVE",
        start_time: nowIso,
      })
      .select("id")
      .single();

    if (expErr) {
      console.error("[POST /api/v1/experiments] Supabase experiment insert failed:", expErr);
      throw expErr;
    }

    const realExpId = insertedExp.id;
    const variantRows = variants.map((v) => ({
      experiment_id: realExpId,
      name: v.name,
      destination_url: v.destinationUrl,
      traffic_weight: v.trafficWeight,
      total_scans: 0,
      conversions: 0,
    }));

    const { data: insertedVariants, error: varErr } = await supabase
      .from("experiment_variants")
      .insert(variantRows)
      .select("id, name, destination_url, traffic_weight");

    if (varErr) {
      console.error("[POST /api/v1/experiments] Supabase variants insert failed:", varErr);
      throw varErr;
    }

    const finalVariants = (insertedVariants || variantRows).map((v: any) => ({
      id: v.id || generateOpaqueId("var"),
      name: v.name || v.destination_url,
      destinationUrl: v.destination_url || v.destinationUrl,
      trafficWeight: Number(v.traffic_weight || v.trafficWeight),
    }));

    const response: ExperimentResponseV1 = {
      id: realExpId,
      qrId: targetQrId,
      name: payload.name,
      description: payload.description,
      status: "active",
      variants: finalVariants,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    return apiCreated(response, ctx.requestId);
  } catch (err) {
    return handleApiError(err, ctx?.requestId || "req_unknown");
  }
}
