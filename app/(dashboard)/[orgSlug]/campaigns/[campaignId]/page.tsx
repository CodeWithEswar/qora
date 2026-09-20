import * as React from "react";
import { notFound } from "next/navigation";
import { getD1Database } from "@/lib/db/d1";
import { CampaignsRepository } from "@nxtqr/db";
import {
  CampaignResponseV1,
  CampaignQrAssetV1,
  CampaignConstellationNodeV1,
  CampaignAnalyticsV1,
} from "@nxtqr/contracts";
import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view";
import { DestinationTopologyNode } from "@/components/campaigns/campaign-destination-map";
import { CampaignActivityItem } from "@/components/campaigns/campaign-activity";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; campaignId: string }>;
}) {
  const { orgSlug, campaignId } = await params;
  const db = await getD1Database();

  // 1. Resolve organization via Supabase first, then D1
  let orgId: string | null = null;
  try {
    const sbOrg = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (sbOrg?.id) {
      orgId = sbOrg.id;
    }
  } catch (err) {
    console.warn("[CampaignDetailPage] Supabase org lookup:", err);
  }

  if (!orgId && db) {
    const d1Org = await db
      .prepare("SELECT id FROM organizations WHERE slug = ? OR id = ? LIMIT 1")
      .bind(orgSlug, orgSlug)
      .first<{ id: string }>();
    if (d1Org?.id) {
      orgId = d1Org.id;
    }
  }

  if (!orgId) {
    notFound();
  }

  // 2. Authoritative Supabase Campaign Lookup
  try {
    const sbCampaign = await SupabaseCampaignRepository.getById(orgId, campaignId);
    if (sbCampaign) {
      const [qrAssetsRaw, destinationsRaw, analyticsRaw, activityRaw] = await Promise.all([
        SupabaseCampaignRepository.listCampaignQrAssets(orgId, sbCampaign.id, { limit: 50 }),
        SupabaseCampaignRepository.getCampaignDestinations(orgId, sbCampaign.id),
        SupabaseCampaignRepository.getCampaignAnalytics(orgId, sbCampaign.id, "30d"),
        SupabaseCampaignRepository.getActivity(orgId, sbCampaign.id, 50),
      ]);

      const initialCampaign: CampaignResponseV1 = {
        id: sbCampaign.id,
        name: sbCampaign.name,
        description: sbCampaign.description || undefined,
        emoji: sbCampaign.emoji || null,
        status: sbCampaign.status as any,
        startsAt: sbCampaign.startDate || null,
        endsAt: sbCampaign.endDate || null,
        qrCount: qrAssetsRaw.length,
        totalScans: analyticsRaw.totalScans,
        createdAt: sbCampaign.createdAt,
        updatedAt: sbCampaign.updatedAt,
        archivedAt: sbCampaign.archivedAt || null,
        creatorName: sbCampaign.createdBy || undefined,
      };

      const initialQrAssets: CampaignQrAssetV1[] = qrAssetsRaw.map((q) => ({
        id: q.id,
        name: q.name,
        slug: q.slug,
        qrType: q.qrType,
        status: q.status,
        destinationUrl: q.destinationUrl,
        totalScans: q.totalScans,
        uniqueScans: q.uniqueScans,
        scans: q.totalScans,
        thumbnailUrl: undefined,
        createdAt: q.updatedAt,
        updatedAt: q.updatedAt,
        design: (q as any).design,
      }));

      const initialConstellationNodes: CampaignConstellationNodeV1[] = initialQrAssets
        .slice(0, 8)
        .map((q) => ({
          id: q.id,
          name: q.name,
          slug: q.slug,
          type: q.qrType,
          destinationUrl: q.destinationUrl,
          totalScans: q.totalScans,
          qrId: q.id,
          scans: q.totalScans,
          status: q.status,
        }));

      const initialDestinations: DestinationTopologyNode[] = destinationsRaw.map((d) => ({
        domain: d.domain,
        count: d.count,
        qrCount: d.qrCount,
      }));

      const defaultRoutesCount = initialQrAssets.length;
      const conditionalRulesCount = 0;
      const monitoredCount = initialQrAssets.filter(
        (q) => q.status === "active" || q.status === "ACTIVE"
      ).length;

      const initialActivity: CampaignActivityItem[] = activityRaw.map((r) => ({
        id: r.id,
        action: r.action,
        resourceType: r.resourceType,
        resourceId: r.resourceId,
        metadata: r.metadata,
        createdAt: r.createdAt,
        actorName: r.actorName || "Workspace Member",
        actorEmail: r.actorEmail,
        actorAvatarUrl: r.actorAvatarUrl,
      }));

      return (
        <CampaignDetailView
          orgSlug={orgSlug}
          campaignId={campaignId}
          initialCampaign={initialCampaign}
          initialQrAssets={initialQrAssets}
          initialConstellationNodes={initialConstellationNodes}
          initialAnalytics={analyticsRaw}
          initialDestinations={initialDestinations}
          initialRoutingSummary={{
            defaultRoutesCount,
            conditionalRulesCount,
            monitoredCount,
          }}
          initialActivity={initialActivity}
        />
      );
    }
  } catch (err) {
    console.warn("[CampaignDetailPage] Supabase load error:", err);
  }

  // 3. Fallback to Cloudflare D1 if available
  if (!db) {
    notFound();
  }

  const campaign = await CampaignsRepository.getCampaign(db, orgId, campaignId);
  if (!campaign) {
    notFound();
  }

  // Fetch campaign resources in parallel from D1
  const [qrAssetsRaw, destinationsRaw, analyticsRaw, activityRes] = await Promise.all([
    CampaignsRepository.listCampaignQrAssets(db, orgId, campaignId, { limit: 50 }),
    CampaignsRepository.getCampaignDestinations(db, orgId, campaignId),
    CampaignsRepository.getCampaignAnalytics(db, orgId, campaignId, "30d"),
    db
      .prepare(
        `SELECT 
          a.id, a.action, a.resource_type as resourceType, a.resource_id as resourceId,
          a.metadata_json as metadataJson, a.created_at as createdAt,
          u.name as actorName, u.email as actorEmail, u.avatar_url as actorAvatarUrl
        FROM activity_events a
        LEFT JOIN users u ON u.id = a.actor_id
        WHERE a.organization_id = ? 
          AND ((a.resource_type = 'campaign' AND a.resource_id = ?) OR a.metadata_json LIKE ?)
        ORDER BY a.created_at DESC
        LIMIT 50`
      )
      .bind(orgId, campaignId, `%"campaignId":"${campaignId}"%`)
      .all() as any,
  ]);

  const initialCampaign: CampaignResponseV1 = {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description || undefined,
    emoji: campaign.emoji || null,
    status: campaign.status,
    startsAt: campaign.startDate ? new Date(campaign.startDate * 1000).toISOString() : null,
    endsAt: campaign.endDate ? new Date(campaign.endDate * 1000).toISOString() : null,
    qrCount: campaign.qrCount,
    totalScans: campaign.totalScans,
    createdAt: new Date(campaign.createdAt * 1000).toISOString(),
    updatedAt: new Date(campaign.updatedAt * 1000).toISOString(),
    archivedAt: campaign.archivedAt ? new Date(campaign.archivedAt * 1000).toISOString() : null,
    creatorName: campaign.creatorName || undefined,
  };

  const initialQrAssets: CampaignQrAssetV1[] = qrAssetsRaw.map((q) => ({
    id: q.id,
    name: q.name,
    slug: q.slug,
    qrType: q.qrType,
    status: q.status,
    destinationUrl: q.destinationUrl,
    totalScans: q.totalScans,
    uniqueScans: q.uniqueScans,
    scans: q.totalScans,
    thumbnailUrl: q.thumbnailUrl || undefined,
    createdAt: new Date(q.createdAt * 1000).toISOString(),
    updatedAt: new Date(q.updatedAt * 1000).toISOString(),
  }));

  const initialConstellationNodes: CampaignConstellationNodeV1[] = initialQrAssets
    .slice(0, 8)
    .map((q) => ({
      id: q.id,
      name: q.name,
      slug: q.slug,
      type: q.qrType,
      destinationUrl: q.destinationUrl,
      totalScans: q.totalScans,
      qrId: q.id,
      scans: q.totalScans,
      status: q.status,
    }));

  const initialDestinations: DestinationTopologyNode[] = destinationsRaw.map((d) => ({
    domain: d.domain,
    count: (d as any).count ?? d.qrCount,
    qrCount: d.qrCount,
  }));

  const initialAnalytics: CampaignAnalyticsV1 = analyticsRaw;

  const defaultRoutesCount = initialQrAssets.length;
  const conditionalRulesCount = 0;
  const monitoredCount = initialQrAssets.filter((q) => q.status === "active").length;

  const initialActivity: CampaignActivityItem[] = ((activityRes?.results || []) as any[]).map(
    (r) => {
      let metadata: any = {};
      if (r.metadataJson) {
        try {
          metadata = JSON.parse(r.metadataJson);
        } catch {}
      }

      return {
        id: r.id,
        action: r.action,
        resourceType: r.resourceType,
        resourceId: r.resourceId,
        metadata,
        createdAt: new Date(r.createdAt * 1000).toISOString(),
        actorName: r.actorName || "Workspace Member",
        actorEmail: r.actorEmail,
        actorAvatarUrl: r.actorAvatarUrl,
      };
    }
  );

  return (
    <CampaignDetailView
      orgSlug={orgSlug}
      campaignId={campaignId}
      initialCampaign={initialCampaign}
      initialQrAssets={initialQrAssets}
      initialConstellationNodes={initialConstellationNodes}
      initialAnalytics={initialAnalytics}
      initialDestinations={initialDestinations}
      initialRoutingSummary={{
        defaultRoutesCount,
        conditionalRulesCount,
        monitoredCount,
      }}
      initialActivity={initialActivity}
    />
  );
}
