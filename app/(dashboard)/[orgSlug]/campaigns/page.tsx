import * as React from "react";
import { getD1Database } from "@/lib/db/d1";
import { CampaignsRepository } from "@nxtqr/db";
import { CampaignResponseV1 } from "@nxtqr/contracts";
import {
  CampaignsOperationsCenter,
  CampaignSummaryData,
} from "@/components/campaigns";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const db = await getD1Database();

  let initialCampaigns: CampaignResponseV1[] = [];
  let initialSummary: CampaignSummaryData = {
    activeCampaigns: 0,
    qrAssetsInCampaigns: 0,
    scanActivity: 0,
    destinations: 0,
  };

  // 1. Authoritative Supabase retrieval
  try {
    const { SupabaseOrgRepository } = await import("@/lib/supabase/repositories/organizations");
    const { SupabaseCampaignRepository } = await import("@/lib/supabase/repositories/campaigns");
    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (org) {
      const rows = await SupabaseCampaignRepository.listByOrg(org.id);
      if (rows && rows.length > 0) {
        initialCampaigns = rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || undefined,
          emoji: r.emoji || null,
          status: r.status as any,
          startsAt: r.startDate || null,
          endsAt: r.endDate || null,
          qrCount: r.qrAssetCount || 0,
          totalScans: 0,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          archivedAt: null,
          createdBy: undefined,
        }));
        initialSummary = {
          activeCampaigns: rows.filter((c) => c.status === "active").length,
          qrAssetsInCampaigns: rows.reduce((acc, c) => acc + (c.qrAssetCount || 0), 0),
          scanActivity: 0,
          destinations: 0,
        };
      }
    }
  } catch (err) {
    console.warn("[CampaignsPage] Supabase prefetch notice:", err);
  }

  // 2. D1 fallback
  if (initialCampaigns.length === 0 && db) {
    try {
      const org = await db
        .prepare("SELECT id FROM organizations WHERE slug = ? OR id = ? LIMIT 1")
        .bind(orgSlug, orgSlug)
        .first<{ id: string }>();

      if (org?.id) {
        const [{ items: rows }, summary] = await Promise.all([
          CampaignsRepository.listCampaigns(db, org.id, {
            limit: 50,
            sortBy: "updatedAt",
            order: "desc",
          }),
          CampaignsRepository.getCampaignSummarySignal(db, org.id),
        ]);

        initialSummary = summary;
        initialCampaigns = rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || undefined,
          emoji: r.emoji || null,
          status: r.status,
          startsAt: r.startDate ? new Date(r.startDate * 1000).toISOString() : null,
          endsAt: r.endDate ? new Date(r.endDate * 1000).toISOString() : null,
          qrCount: r.qrCount,
          totalScans: r.totalScans,
          createdAt: new Date(r.createdAt * 1000).toISOString(),
          updatedAt: new Date(r.updatedAt * 1000).toISOString(),
          archivedAt: r.archivedAt ? new Date(r.archivedAt * 1000).toISOString() : null,
          createdBy: r.createdBy || undefined,
        }));
      }
    } catch (err) {
      console.warn("[CampaignsPage] Server prefetch error:", err);
    }
  }

  return (
    <CampaignsOperationsCenter
      orgSlug={orgSlug}
      initialCampaigns={initialCampaigns}
      initialSummary={initialSummary}
    />
  );
}
