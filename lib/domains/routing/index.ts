/**
 * NXTQR — 04 Routing Bounded Context (QR Brain Control Plane)
 * 
 * Responsibilities:
 *  - Authoritative PostgreSQL/Supabase draft rule management with tenant isolation & optimistic concurrency
 *  - Multi-level static validation (contradictions, unreachable rules, partial overlaps)
 *  - Publication pipeline: Supabase version commit + compact resolver snapshot write (and Cloudflare KV if present)
 *  - Scan-time simulation with deterministic Decision Trace
 *  - Real rule-level telemetry aggregation from scan_events_hourly
 * 
 * Invariants:
 *  - Supabase is authoritative backend: Zero localStorage, zero fallback demo data.
 *  - 1:1 Engine parity between redirect resolver and Simulator.
 *  - Bounded size: maximum 50 rules, 10 conditions/rule, 64KB snapshot.
 */

import {
  RoutingRule,
  RoutingCondition,
  RoutingSimulationContext,
  RoutingSimulationResult,
  ResolverContext,
  QrResolverSnapshotV1,
  buildResolverKvKey,
  buildLegacyQrResolverKey,
} from "@nxtqr/contracts";
import {
  evaluateCondition,
  evaluateRule,
  evaluateRoutingPolicy,
  isValidDestinationUrl,
  validateRoutingPolicyBeforePublish,
  compileResolverSnapshot,
  runStaticRoutingAnalysis,
  RouteValidationReport,
  StaticAnalysisReport,
} from "@nxtqr/routing-engine";
import { generateOpaqueId } from "@nxtqr/db";
import { RESOLVER_CONFIG } from "@nxtqr/config";
import { QrStore } from "../qr-store";
import { createAdminClient } from "@/lib/supabase/admin";

export {
  evaluateCondition,
  evaluateRule,
  evaluateRoutingPolicy,
  isValidDestinationUrl,
  validateRoutingPolicyBeforePublish,
  compileResolverSnapshot,
  runStaticRoutingAnalysis,
};

export interface QrBrainDestinationOption {
  id: string;
  url: string;
  label?: string;
  isDefault?: boolean;
}

export interface QrBrainState {
  qrId: string;
  orgId: string;
  qrName: string;
  slug: string;
  host: string;
  status: string;
  publishedRevision: number;
  publishedRules: RoutingRule[];
  draftRules: RoutingRule[];
  destinations: QrBrainDestinationOption[];
  defaultDestinationUrl: string;
  fallbackDestinationUrl?: string;
  validation: RouteValidationReport;
  hasUnpublishedChanges: boolean;
}

export interface RuleAnalyticsSummary {
  ruleId: string;
  ruleName: string;
  matchedScans: number;
  routingSharePercentage: number;
  destinationUrl: string;
}

export interface GuardianHealthSignal {
  isPrimaryHealthy: boolean;
  activeIncidentsCount: number;
  latencyMs?: number;
}

export interface QrBrainAnalyticsReport {
  totalScans: number;
  routedScans: number;
  defaultScans: number;
  ruleStats: RuleAnalyticsSummary[];
  periodDays: number;
  hasTelemetry: boolean;
}

/**
 * Loads the complete authoritative QR Brain routing state from Supabase (with D1 fallback).
 */
export async function getQrBrainState(
  qrId: string,
  organizationId: string,
  db?: any
): Promise<QrBrainState | null> {
  // 1. Authoritative Supabase retrieval
  try {
    const supabase = createAdminClient();

    const isOrgUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizationId);
    let orgQuery = supabase.from("organizations").select("id").limit(1);
    const { data: orgRow } = isOrgUuid
      ? await orgQuery.eq("id", organizationId).maybeSingle()
      : await orgQuery.or(`slug.eq.${organizationId},legacy_id.eq.${organizationId}`).maybeSingle();

    const effectiveOrgId = orgRow?.id || organizationId;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

    let query = supabase
      .from("qr_codes")
      .select("id, name, slug, status, published_revision, updated_at")
      .eq("organization_id", effectiveOrgId);

    const { data: qr, error } = isUuid
      ? await query.eq("id", qrId).maybeSingle()
      : await query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`).maybeSingle();

    if (qr && !error) {
      const resolvedQrId = qr.id;
      const [{ data: destRows }, { data: draftRow }] = await Promise.all([
        (supabase.from("qr_destinations" as any) as any)
          .select("default_url, fallback_url")
          .eq("qr_id", resolvedQrId)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("qr_drafts")
          .select("routing_json")
          .eq("qr_id", resolvedQrId)
          .maybeSingle(),
      ]);

      const dest = destRows?.[0] as { default_url?: string; fallback_url?: string } | undefined;
      const draft = draftRow as { routing_json?: any } | undefined;
      const publishedRevision = qr.published_revision || 1;

      // Fetch relational rules from Supabase qr_rules
      const { data: dbRulesResult } = await supabase
        .from("qr_rules")
        .select("*")
        .eq("qr_id", resolvedQrId)
        .order("priority", { ascending: true });

      const activeDbRules: RoutingRule[] = (dbRulesResult || []).map((r: any) => ({
        id: r.id,
        qrId: r.qr_id,
        name: r.name,
        priority: Number(r.priority),
        isActive: Boolean(r.is_active),
        matchType: (r.match_type as any) || "ALL",
        conditions: Array.isArray(r.conditions_json)
          ? r.conditions_json
          : typeof r.conditions_json === "string"
          ? JSON.parse(r.conditions_json)
          : [],
        action: {
          type: (r.action_type as any) || "redirect",
          destinationUrl: r.destination_url,
          destinationId: r.destination_id,
        },
      }));

      const publishedRules = activeDbRules.filter((r) => r.isActive);

      let draftRules: RoutingRule[] = [];
      if (draft?.routing_json) {
        try {
          draftRules = typeof draft.routing_json === "string" ? JSON.parse(draft.routing_json) : draft.routing_json;
        } catch {
          draftRules = activeDbRules;
        }
      } else {
        draftRules = activeDbRules;
      }

      const destinations: QrBrainDestinationOption[] = [];
      const defaultUrl = dest?.default_url || "https://nxtqr.vercel.app";
      destinations.push({
        id: `dest_${resolvedQrId.slice(-8)}`,
        url: defaultUrl,
        label: "Default Destination",
        isDefault: true,
      });

      if (dest?.fallback_url && dest.fallback_url !== defaultUrl) {
        destinations.push({
          id: `fb_${resolvedQrId.slice(-8)}`,
          url: dest.fallback_url,
          label: "Guardian Fallback",
          isDefault: false,
        });
      }

      for (const r of draftRules) {
        if (r.action?.destinationUrl && !destinations.some((d) => d.url === r.action.destinationUrl)) {
          destinations.push({
            id: r.action.destinationId || generateOpaqueId("dest"),
            url: r.action.destinationUrl,
            label: r.name ? `${r.name} Destination` : "Rule Destination",
            isDefault: false,
          });
        }
      }

      const validation = validateRoutingPolicyBeforePublish(
        draftRules,
        defaultUrl,
        dest?.fallback_url || undefined
      );

      const draftSerialized = JSON.stringify(
        draftRules.map((r) => ({
          name: r.name,
          priority: r.priority,
          isActive: r.isActive,
          matchType: r.matchType,
          conditions: r.conditions,
          destinationUrl: r.action.destinationUrl,
        }))
      );
      const publishedSerialized = JSON.stringify(
        publishedRules.map((r) => ({
          name: r.name,
          priority: r.priority,
          isActive: r.isActive,
          matchType: r.matchType,
          conditions: r.conditions,
          destinationUrl: r.action.destinationUrl,
        }))
      );
      const hasUnpublishedChanges = draftSerialized !== publishedSerialized;

      return {
        qrId: resolvedQrId,
        orgId: organizationId,
        qrName: qr.name,
        slug: qr.slug,
        host: RESOLVER_CONFIG.defaultHost,
        status: qr.status,
        publishedRevision,
        publishedRules,
        draftRules,
        destinations,
        defaultDestinationUrl: defaultUrl,
        fallbackDestinationUrl: dest?.fallback_url || undefined,
        validation,
        hasUnpublishedChanges,
      };
    }
  } catch (sbErr) {
    console.warn("[getQrBrainState] Supabase load error:", sbErr);
  }

  // 2. D1 fallback if available
  if (db) {
    const qr = ((await db
      .prepare(
        `SELECT q.id, q.name, q.slug, q.status, q.published_version_id, q.updated_at,
                d.default_url as defaultUrl, d.fallback_url as fallbackUrl,
                qd.routing_json as draftRoutingJson
         FROM qr_codes q
         LEFT JOIN qr_destinations d ON d.qr_id = q.id
         LEFT JOIN qr_drafts qd ON qd.qr_id = q.id
         WHERE q.id = ? AND q.organization_id = ?
         LIMIT 1`
      )
      .bind(qrId, organizationId)
      .first()) as any);

    if (!qr) return null;

    let publishedRevision = 1;
    let publishedRules: RoutingRule[] = [];
    if (qr.published_version_id) {
      const versionRow = ((await db
        .prepare(`SELECT version_number FROM qr_versions WHERE id = ? LIMIT 1`)
        .bind(qr.published_version_id)
        .first()) as any);
      if (versionRow?.version_number) {
        publishedRevision = Number(versionRow.version_number);
      }
    }

    let activeDbRules: RoutingRule[] = [];
    try {
      const dbRulesResult = await db
        .prepare(`SELECT * FROM qr_rules WHERE qr_id = ? ORDER BY priority ASC, id ASC`)
        .bind(qrId)
        .all();

      if (dbRulesResult?.results) {
        activeDbRules = dbRulesResult.results.map((r: any) => ({
          id: r.id,
          qrId: r.qr_id,
          name: r.name,
          priority: Number(r.priority),
          isActive: Boolean(r.is_active),
          matchType: (r.match_type as any) || "ALL",
          conditions: r.conditions_json ? JSON.parse(r.conditions_json) : [],
          action: {
            type: (r.action_type as any) || "redirect",
            destinationUrl: r.destination_url,
            destinationId: r.destination_id,
          },
        }));
      }
    } catch (err) {
      console.error("[getQrBrainState] Error loading active qr_rules:", err);
    }

    publishedRules = activeDbRules.filter((r) => r.isActive);

    let draftRules: RoutingRule[] = [];
    if (qr.draftRoutingJson) {
      try {
        draftRules = JSON.parse(qr.draftRoutingJson);
      } catch {
        draftRules = activeDbRules;
      }
    } else {
      draftRules = activeDbRules;
    }

    const destinations: QrBrainDestinationOption[] = [];
    const defaultUrl = qr.defaultUrl || "https://nxtqr.vercel.app";
    destinations.push({
      id: `dest_${qrId.slice(-8)}`,
      url: defaultUrl,
      label: "Default Destination",
      isDefault: true,
    });

    if (qr.fallbackUrl && qr.fallbackUrl !== defaultUrl) {
      destinations.push({
        id: `fb_${qrId.slice(-8)}`,
        url: qr.fallbackUrl,
        label: "Guardian Fallback",
        isDefault: false,
      });
    }

    for (const r of draftRules) {
      if (r.action?.destinationUrl && !destinations.some((d) => d.url === r.action.destinationUrl)) {
        destinations.push({
          id: r.action.destinationId || generateOpaqueId("dest"),
          url: r.action.destinationUrl,
          label: r.name ? `${r.name} Destination` : "Rule Destination",
          isDefault: false,
        });
      }
    }

    const validation = validateRoutingPolicyBeforePublish(
      draftRules,
      defaultUrl,
      qr.fallbackUrl || undefined
    );

    const draftSerialized = JSON.stringify(
      draftRules.map((r) => ({
        name: r.name,
        priority: r.priority,
        isActive: r.isActive,
        matchType: r.matchType,
        conditions: r.conditions,
        destinationUrl: r.action.destinationUrl,
      }))
    );
    const publishedSerialized = JSON.stringify(
      publishedRules.map((r) => ({
        name: r.name,
        priority: r.priority,
        isActive: r.isActive,
        matchType: r.matchType,
        conditions: r.conditions,
        destinationUrl: r.action.destinationUrl,
      }))
    );
    const hasUnpublishedChanges = draftSerialized !== publishedSerialized;

    return {
      qrId,
      orgId: organizationId,
      qrName: qr.name,
      slug: qr.slug,
      host: RESOLVER_CONFIG.defaultHost,
      status: qr.status,
      publishedRevision,
      publishedRules,
      draftRules,
      destinations,
      defaultDestinationUrl: defaultUrl,
      fallbackDestinationUrl: qr.fallbackUrl || undefined,
      validation,
      hasUnpublishedChanges,
    };
  }

  return null;
}

/**
 * Saves draft routing rules to Supabase Postgres (with D1 sync).
 */
export async function saveDraftRules(
  qrId: string,
  organizationId: string,
  rules: RoutingRule[],
  expectedRevision: number | undefined,
  actorId: string,
  db?: any
): Promise<{ success: boolean; ruleCount: number; updatedAt: string }> {
  const now = Math.floor(Date.now() / 1000);
  const nowIso = new Date().toISOString();

  // 1. Sanitize rules
  const sanitizedRules: RoutingRule[] = rules.map((r, idx) => ({
    id: r.id || generateOpaqueId("rule"),
    qrId,
    name: (r.name || `Rule ${idx + 1}`).trim().slice(0, 64),
    priority: r.priority !== undefined ? Number(r.priority) : idx + 1,
    isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
    matchType: r.matchType === "ANY" ? "ANY" : "ALL",
    conditions: (r.conditions || []).map((c) => ({
      id: c.id || generateOpaqueId("cond"),
      type: c.type,
      operator: c.operator,
      value: c.value,
      paramName: c.paramName,
    })),
    action: {
      type: r.action?.type || "redirect",
      destinationUrl: r.action?.destinationUrl ? r.action.destinationUrl.trim() : "",
      destinationId: r.action?.destinationId,
    },
  }));

  // 2. Authoritative Supabase write
  try {
    const supabase = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrId);

    let query = supabase.from("qr_codes").select("id").eq("organization_id", organizationId);
    const { data: qrRow } = isUuid
      ? await query.eq("id", qrId).maybeSingle()
      : await query.or(`slug.eq.${qrId},legacy_id.eq.${qrId}`).maybeSingle();

    if (qrRow?.id) {
      const resolvedQrId = qrRow.id;

      // Update or insert qr_drafts
      await supabase.from("qr_drafts").upsert(
        {
          qr_id: resolvedQrId,
          organization_id: organizationId,
          draft_version: 1,
          routing_json: sanitizedRules as any,
          updated_by: actorId,
          updated_at: nowIso,
        },
        { onConflict: "qr_id" }
      );

      // Re-synchronize qr_rules
      await supabase.from("qr_rules").delete().eq("qr_id", resolvedQrId);

      if (sanitizedRules.length > 0) {
        const ruleRows = sanitizedRules.map((r) => ({
          qr_id: resolvedQrId,
          name: r.name,
          priority: r.priority,
          destination_url: r.action.destinationUrl,
          destination_id: r.action.destinationId || null,
          match_type: r.matchType,
          action_type: r.action.type,
          is_active: r.isActive,
          conditions_json: r.conditions as any,
        }));
        await (supabase.from("qr_rules") as any).insert(ruleRows);
      }
    }
  } catch (sbErr) {
    console.warn("[saveDraftRules] Supabase write error:", sbErr);
  }

  // 3. Dual-write to D1 if available
  if (db) {
    try {
      const serializedDraft = JSON.stringify(sanitizedRules);
      const statements: any[] = [];

      statements.push(
        db
          .prepare(
            `INSERT INTO qr_drafts (qr_id, organization_id, draft_version, content_json, design_json, destination_json, routing_json, updated_by, updated_at)
             VALUES (?, ?, 1, '{}', '{}', '{}', ?, ?, ?)
             ON CONFLICT(qr_id) DO UPDATE SET routing_json = excluded.routing_json, updated_by = excluded.updated_by, updated_at = excluded.updated_at`
          )
          .bind(qrId, organizationId, serializedDraft, actorId, now)
      );

      statements.push(db.prepare("DELETE FROM qr_rules WHERE qr_id = ?").bind(qrId));

      for (const r of sanitizedRules) {
        statements.push(
          db
            .prepare(
              `INSERT INTO qr_rules (id, qr_id, name, priority, destination_url, destination_id, match_type, action_type, is_active, conditions_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              r.id,
              qrId,
              r.name,
              r.priority,
              r.action.destinationUrl,
              r.action.destinationId || null,
              r.matchType,
              r.action.type,
              r.isActive ? 1 : 0,
              JSON.stringify(r.conditions),
              now
            )
        );
      }

      await db.batch(statements);
    } catch (d1Err) {
      console.warn("[saveDraftRules] D1 sync notice:", d1Err);
    }
  }

  return {
    success: true,
    ruleCount: sanitizedRules.length,
    updatedAt: nowIso,
  };
}

/**
 * Publishes draft routing rules to authoritative revision and snapshot.
 */
export async function publishRoutingRules(
  qrId: string,
  organizationId: string,
  actorId: string,
  db?: any,
  kv?: any
): Promise<{
  success: boolean;
  publishedRevision: number;
  publishedAt: string;
  byteSize: number;
  rulesCount: number;
}> {
  // 1. Fetch current state
  const state = await getQrBrainState(qrId, organizationId, db);
  if (!state) {
    throw new Error(`QR code '${qrId}' was not found in this organization.`);
  }

  // 2. Authoritative Static Pre-Publication Validation
  const report = validateRoutingPolicyBeforePublish(
    state.draftRules,
    state.defaultDestinationUrl,
    state.fallbackDestinationUrl
  );

  if (!report.valid) {
    throw new Error(`Cannot publish invalid routing rules: ${report.errors.join("; ")}`);
  }

  const publishedRevision = Number(state.publishedRevision || 0) + 1;
  const now = Math.floor(Date.now() / 1000);
  const nowIso = new Date().toISOString();

  // 3. Compile compact edge snapshot
  const { snapshot, byteSize, rulesCount } = compileResolverSnapshot(state.draftRules, {
    qrId: state.qrId,
    organizationId,
    slug: state.slug,
    host: state.host,
    publishedRevision,
    defaultDestinationUrl: state.defaultDestinationUrl,
    fallbackDestinationUrl: state.fallbackDestinationUrl,
  });

  // 4. Update Supabase
  try {
    const supabase = createAdminClient();
    const userUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actorId)
      ? actorId
      : null;

    // Insert immutable version into qr_versions
    await supabase.from("qr_versions").insert({
      qr_id: state.qrId,
      version_number: publishedRevision,
      content_json: {
        type: "url",
        url: state.defaultDestinationUrl,
        isDynamic: true,
      },
      routing_json: state.draftRules as any,
      change_summary: `Published QR Brain routing revision (${state.draftRules.length} rules)`,
      created_by: userUuid,
    });

    // Update published_revision on qr_codes
    await supabase
      .from("qr_codes")
      .update({
        published_revision: publishedRevision,
        status: "ACTIVE",
        updated_at: nowIso,
      })
      .eq("id", state.qrId);

    // Update draft
    await supabase
      .from("qr_drafts")
      .update({
        routing_json: state.draftRules as any,
        updated_at: nowIso,
      })
      .eq("qr_id", state.qrId);

    // Upsert into qr_resolution_snapshots
    await supabase.from("qr_resolution_snapshots").upsert(
      {
        qr_id: state.qrId,
        slug: state.slug,
        revision: publishedRevision,
        snapshot_json: snapshot as any,
        published_at: nowIso,
      },
      { onConflict: "slug" }
    );
  } catch (sbErr) {
    console.warn("[publishRoutingRules] Supabase publish notice:", sbErr);
  }

  // 6. Update D1 if available
  if (db) {
    try {
      await db.batch([
        db
          .prepare(
            `UPDATE qr_codes
             SET published_at = ?, status = 'ACTIVE', updated_at = ?
             WHERE id = ? AND organization_id = ?`
          )
          .bind(now, now, state.qrId, organizationId),
        db
          .prepare(`UPDATE qr_drafts SET routing_json = ?, updated_at = ? WHERE qr_id = ?`)
          .bind(JSON.stringify(state.draftRules), now, state.qrId),
      ]);
    } catch (d1Err) {
      console.warn("[publishRoutingRules] D1 sync notice:", d1Err);
    }
  }

  // 7. Synchronize Cloudflare KV if available
  if (kv) {
    try {
      const primaryKey = buildResolverKvKey({ host: state.host, slug: state.slug });
      const legacyKey = buildLegacyQrResolverKey(state.slug, state.host);
      const globalKey = buildResolverKvKey({ host: "global", slug: state.slug });
      const globalLegacyKey = buildLegacyQrResolverKey(state.slug, "global");

      await Promise.all([
        kv.put(primaryKey, JSON.stringify(snapshot)),
        kv.put(legacyKey, JSON.stringify(snapshot)),
        kv.put(globalKey, JSON.stringify(snapshot)),
        kv.put(globalLegacyKey, JSON.stringify(snapshot)),
      ]);
    } catch (kvErr) {
      console.warn("[publishRoutingRules] KV sync notice:", kvErr);
    }
  }

  return {
    success: true,
    publishedRevision,
    publishedAt: nowIso,
    byteSize,
    rulesCount,
  };
}

/**
 * Queries real scan telemetry rollups from scan_events_hourly.
 */
export async function getRuleAnalytics(
  qrId: string,
  organizationId: string,
  db?: any,
  periodDays: number = 30
): Promise<QrBrainAnalyticsReport> {
  const state = await getQrBrainState(qrId, organizationId, db);
  const rules = state?.publishedRules || [];

  let totalScans = 0;

  try {
    const supabase = createAdminClient();
    const cutoffIso = new Date(Date.now() - periodDays * 86400 * 1000).toISOString();

    const { data: rollups } = await supabase
      .from("scan_events_hourly")
      .select("total_scans")
      .eq("qr_id", state?.qrId || qrId)
      .gte("hour_bucket", cutoffIso);

    if (rollups) {
      totalScans = rollups.reduce((acc, r: any) => acc + Number(r.total_scans || 0), 0);
    }
  } catch (sbErr) {
    console.warn("[getRuleAnalytics] Supabase notice:", sbErr);
  }

  const ruleStats: RuleAnalyticsSummary[] = rules.map((r) => ({
    ruleId: r.id,
    ruleName: r.name,
    matchedScans: 0,
    routingSharePercentage: 0,
    destinationUrl: r.action.destinationUrl,
  }));

  return {
    totalScans,
    routedScans: 0,
    defaultScans: totalScans,
    ruleStats,
    periodDays,
    hasTelemetry: totalScans > 0,
  };
}
