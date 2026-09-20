import * as React from "react";
import { Metadata } from "next";
import { RoutingAssetItem, RoutingDestinationOption } from "@/components/routes/types";
import { RoutesCommandCenter } from "@/components/routes/routes-command-center";
import { getD1Database } from "@/lib/db/d1";
import { RoutingRule } from "@nxtqr/contracts";

export const metadata: Metadata = {
  title: "NXTQR Routes — Edge Dynamic QR Brain Control Center",
  description:
    "Deterministic edge routing control plane for Dynamic QR codes. Route every scan to the right destination.",
};

interface RoutesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NxtqrRoutesPage({ params }: RoutesPageProps) {
  const { orgSlug } = await params;
  const db = await getD1Database();

  let orgId = "";
  let routingAssets: RoutingAssetItem[] = [];

  // 1. Authoritative Supabase retrieval
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgSlug);

    const orgQuery = supabase.from("organizations").select("id, slug").limit(1);
    const { data: org } = isUuid
      ? await orgQuery.eq("id", orgSlug).maybeSingle()
      : await orgQuery.or(`slug.eq.${orgSlug},legacy_id.eq.${orgSlug}`).maybeSingle();

    if (org?.id) {
      orgId = org.id;

      // Query QR codes with drafts and destinations
      const { data: qrs } = await supabase
        .from("qr_codes")
        .select("id, name, slug, status, published_revision, is_dynamic, created_at, updated_at")
        .eq("organization_id", org.id)
        .neq("status", "ARCHIVED")
        .order("created_at", { ascending: false });

      if (qrs && qrs.length > 0) {
        const qrIds = qrs.map((q: any) => q.id);

        // Fetch drafts and active/all rules for these QRs in parallel
        const [{ data: draftsData }, { data: rulesData }] = await Promise.all([
          supabase.from("qr_drafts").select("*").in("qr_id", qrIds),
          supabase.from("qr_rules").select("*").in("qr_id", qrIds).order("priority", { ascending: true }),
        ]);

        const draftsByQr = new Map<string, any>();
        for (const d of draftsData || []) {
          draftsByQr.set(d.qr_id, d);
        }

        const rulesByQr = new Map<string, any[]>();
        for (const r of rulesData || []) {
          const list = rulesByQr.get(r.qr_id) || [];
          list.push(r);
          rulesByQr.set(r.qr_id, list);
        }

        routingAssets = qrs.map((q: any) => {
          const draft = draftsByQr.get(q.id);

          const defaultUrl =
            draft?.destination_json?.defaultUrl ||
            draft?.content_json?.url ||
            "https://nxtqr.vercel.app";

          const fallbackUrl = draft?.destination_json?.fallbackUrl;

          // Process rules
          const rawRules = rulesByQr.get(q.id) || [];
          const parsedRules: RoutingRule[] = rawRules.map((r: any) => {
            let conditions = [];
            if (Array.isArray(r.conditions_json)) {
              conditions = r.conditions_json;
            } else if (typeof r.conditions_json === "string") {
              try {
                conditions = JSON.parse(r.conditions_json);
              } catch {
                conditions = [];
              }
            }

            return {
              id: r.id,
              qrId: r.qr_id,
              name: r.name || "Rule",
              priority: Number(r.priority || 1),
              isActive: r.is_active !== false,
              matchType: (r.match_type as any) || "ALL",
              conditions,
              action: {
                type: (r.action_type as any) || "redirect",
                destinationUrl: r.destination_url || defaultUrl,
                destinationId: r.destination_id || r.id,
              },
            };
          });

          // Build destination options
          const destOptions: RoutingDestinationOption[] = [
            {
              id: `def_${q.id.slice(-6)}`,
              url: defaultUrl,
              label: "Default Destination",
              isDefault: true,
            },
          ];

          if (fallbackUrl && fallbackUrl !== defaultUrl) {
            destOptions.push({
              id: `fb_${q.id.slice(-6)}`,
              url: fallbackUrl,
              label: "Guardian Fallback",
              isFallback: true,
              isDefault: false,
            });
          }

          for (const rule of parsedRules) {
            if (
              rule.action?.destinationUrl &&
              !destOptions.some((d) => d.url === rule.action.destinationUrl)
            ) {
              destOptions.push({
                id: rule.action.destinationId || `dest_${rule.id.slice(-6)}`,
                url: rule.action.destinationUrl,
                label: rule.name ? `${rule.name} Target` : "Conditional Target",
                isDefault: false,
              });
            }
          }

          return {
            id: q.id,
            name: q.name || "Untitled Dynamic QR",
            slug: q.slug,
            status: q.status || "ACTIVE",
            publishedRevision: Number(q.published_revision || 1),
            defaultUrl,
            fallbackUrl: fallbackUrl || undefined,
            ruleCount: parsedRules.length,
            routingMode: parsedRules.length > 0 ? "CONDITIONAL" : "DEFAULT",
            rules: parsedRules,
            destinations: destOptions,
            updatedAt: q.updated_at || q.created_at,
            createdAt: q.created_at,
            isDynamic: q.is_dynamic !== false,
          };
        });
      }
    }
  } catch (sbErr) {
    console.warn("[NxtqrRoutesPage] Supabase retrieval warning:", sbErr);
  }

  // 2. Cloudflare D1 fallback
  if (routingAssets.length === 0 && db) {
    try {
      const org = await db
        .prepare("SELECT id, slug FROM organizations WHERE slug = ? OR id = ? LIMIT 1")
        .bind(orgSlug, orgSlug)
        .first<any>();

      if (org?.id) {
        orgId = org.id;
        const qrsResult = await db
          .prepare(
            `SELECT q.id, q.name, q.slug, q.status, q.published_version_id, q.updated_at, q.created_at,
                    d.default_url as defaultUrl, d.fallback_url as fallbackUrl,
                    qd.routing_json as draftRoutingJson
             FROM qr_codes q
             LEFT JOIN qr_destinations d ON d.qr_id = q.id
             LEFT JOIN qr_drafts qd ON qd.qr_id = q.id
             WHERE q.organization_id = ? AND q.status != 'ARCHIVED'
             ORDER BY q.created_at DESC`
          )
          .bind(org.id)
          .all();

        if (qrsResult?.results) {
          const rulesResult = await db
            .prepare(
              `SELECT r.* FROM qr_rules r
               JOIN qr_codes q ON q.id = r.qr_id
               WHERE q.organization_id = ?
               ORDER BY r.priority ASC`
            )
            .bind(org.id)
            .all();

          const rulesByQr = new Map<string, any[]>();
          for (const r of rulesResult?.results || []) {
            const list = rulesByQr.get((r as any).qr_id) || [];
            list.push(r);
            rulesByQr.set((r as any).qr_id, list);
          }

          routingAssets = qrsResult.results.map((r: any) => {
            const defaultUrl = r.defaultUrl || "https://nxtqr.vercel.app";
            const rawRules = rulesByQr.get(r.id) || [];

            const parsedRules: RoutingRule[] = rawRules.map((ru: any) => ({
              id: ru.id,
              qrId: ru.qr_id,
              name: ru.name,
              priority: Number(ru.priority || 1),
              isActive: Boolean(ru.is_active),
              matchType: ru.match_type || "ALL",
              conditions: ru.conditions_json ? JSON.parse(ru.conditions_json) : [],
              action: {
                type: ru.action_type || "redirect",
                destinationUrl: ru.destination_url || defaultUrl,
                destinationId: ru.destination_id,
              },
            }));

            return {
              id: r.id,
              name: r.name || "Untitled Dynamic QR",
              slug: r.slug,
              status: r.status || "ACTIVE",
              publishedRevision: 1,
              defaultUrl,
              fallbackUrl: r.fallbackUrl || undefined,
              ruleCount: parsedRules.length,
              routingMode: parsedRules.length > 0 ? "CONDITIONAL" : "DEFAULT",
              rules: parsedRules,
              destinations: [
                {
                  id: `def_${r.id.slice(-6)}`,
                  url: defaultUrl,
                  label: "Default Destination",
                  isDefault: true,
                },
              ],
              updatedAt: r.updated_at,
              createdAt: r.created_at,
              isDynamic: true,
            };
          });
        }
      }
    } catch (d1Err) {
      console.error("[NxtqrRoutesPage] Error loading rules from D1 fallback:", d1Err);
    }
  }

  return <RoutesCommandCenter initialAssets={routingAssets} orgSlug={orgSlug} />;
}
