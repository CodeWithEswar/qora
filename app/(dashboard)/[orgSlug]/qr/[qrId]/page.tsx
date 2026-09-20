import * as React from "react";
import { notFound } from "next/navigation";
import { getD1Database } from "@/lib/db/d1";
import { QrStore, StoredQrRecord, StoredQrVersion } from "@/lib/domains/qr-store";
import { DynamicQrControlSurface } from "@/components/dynamic-qr";
import { RESOLVER_CONFIG } from "@nxtqr/config";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { createAdminClient } from "@/lib/supabase/admin";

interface DynamicQrPageProps {
  params: Promise<{ orgSlug: string; qrId: string }>;
}

export default async function DynamicQrPage({ params }: DynamicQrPageProps) {
  const { orgSlug, qrId } = await params;
  const db = await getD1Database();

  let orgId: string | null = null;
  let resolvedOrgSlug = orgSlug;

  // 1. Resolve Organization ID via Supabase first, then D1
  try {
    const sbOrg = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (sbOrg?.id) {
      orgId = sbOrg.id;
      resolvedOrgSlug = sbOrg.slug;
    }
  } catch (err) {
    console.warn("[DynamicQrPage] Supabase org lookup notice:", err);
  }

  if (!orgId && db) {
    try {
      const d1Org = await db
        .prepare("SELECT id, slug FROM organizations WHERE slug = ? OR id = ? LIMIT 1")
        .bind(orgSlug, orgSlug)
        .first<{ id: string; slug: string }>();
      if (d1Org?.id) {
        orgId = d1Org.id;
        resolvedOrgSlug = d1Org.slug;
      }
    } catch {}
  }

  if (!orgId) {
    notFound();
  }

  // 2. Fetch Authoritative QR Record
  const qr: StoredQrRecord | null = await QrStore.getQr(qrId, orgId, db || undefined);

  if (!qr) {
    notFound();
  }

  let versions: StoredQrVersion[] = [];
  let routingRuleCount = 0;
  let routingRules: Array<{
    id: string;
    name: string;
    priority: number;
    destinationUrl: string;
    conditionSummary?: string;
  }> = [];

  let totalScans = 0;
  let estimatedUniqueScans = 0;
  const timeseries: Array<{ timestamp: string; scans: number; estimatedUniqueScans: number }> = [];
  const devicesCount: Record<string, number> = {};
  const countriesCount: Record<string, number> = {};

  let activityEvents: Array<{
    id: string;
    action: string;
    createdAt: string;
    actorName: string;
    actorEmail?: string;
    actorAvatarUrl?: string;
    metadata?: Record<string, unknown>;
  }> = [];

  const host = RESOLVER_CONFIG.defaultHost;

  try {
    // 3. Parallel fetch of versions, rules, analytics, and activity
    const versionsPromise = QrStore.listVersions(qr.id, orgId, db || undefined).catch(() => []);

    // Fetch from Supabase
    const supabase = createAdminClient();

    const [versionsRes, rulesRes, rollupsRes, activityRes] = await Promise.all([
      versionsPromise,
      supabase
        .from("qr_rules")
        .select("id, name, priority, destination_url, action_type, conditions_json")
        .eq("qr_id", qr.id)
        .eq("is_active", true)
        .order("priority", { ascending: true })
        .limit(5),
      supabase
        .from("scan_events_hourly")
        .select("hour_bucket, total_scans, unique_scans, device_type, country_code")
        .eq("qr_id", qr.id)
        .eq("organization_id", orgId)
        .order("hour_bucket", { ascending: true })
        .limit(500),
      supabase
        .from("activity_events")
        .select("id, action, resource_type, resource_id, metadata_json, created_at, profiles(display_name, email, avatar_url)")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    versions = versionsRes || [];

    if (rulesRes.data) {
      routingRuleCount = rulesRes.data.length;
      routingRules = rulesRes.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        priority: r.priority,
        destinationUrl: r.destination_url,
        conditionSummary: r.conditions_json ? `Rules: ${Array.isArray(r.conditions_json) ? r.conditions_json.length : 1}` : undefined,
      }));
    }

    if (rollupsRes.data) {
      for (const row of rollupsRes.data) {
        const sc = Number(row.total_scans) || 0;
        const un = Number(row.unique_scans) || 0;
        totalScans += sc;
        estimatedUniqueScans += un;

        if (row.device_type) devicesCount[row.device_type] = (devicesCount[row.device_type] || 0) + sc;
        if (row.country_code) countriesCount[row.country_code] = (countriesCount[row.country_code] || 0) + sc;

        timeseries.push({
          timestamp: new Date(row.hour_bucket).toISOString(),
          scans: sc,
          estimatedUniqueScans: un,
        });
      }
    }

    if (activityRes.data) {
      activityEvents = activityRes.data.map((row: any) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: row.id,
          action: row.action,
          createdAt: row.created_at,
          actorName: profile?.display_name || "Workspace Member",
          actorEmail: profile?.email || undefined,
          actorAvatarUrl: profile?.avatar_url || undefined,
          metadata: row.metadata_json || undefined,
        };
      });
    }
  } catch (err) {
    console.error("[DynamicQrPage] Error loading supplementary QR state:", err);
  }

  // Derive top device & country only if real telemetry exists
  let topDevice: string | undefined = undefined;
  const devEntries = Object.entries(devicesCount);
  if (devEntries.length > 0) {
    devEntries.sort((a, b) => b[1] - a[1]);
    topDevice = devEntries[0][0];
  }

  let topCountry: string | undefined = undefined;
  const cEntries = Object.entries(countriesCount);
  if (cEntries.length > 0) {
    cEntries.sort((a, b) => b[1] - a[1]);
    topCountry = cEntries[0][0];
  }

  return (
    <DynamicQrControlSurface
      orgSlug={resolvedOrgSlug}
      qr={qr}
      versions={versions}
      host={host}
      routingRuleCount={routingRuleCount}
      routingRules={routingRules}
      totalScans={totalScans}
      estimatedUniqueScans={estimatedUniqueScans}
      timeseries={timeseries}
      topDevice={topDevice}
      topCountry={topCountry}
      activityEvents={activityEvents}
      fallbackUrl={undefined}
    />
  );
}
