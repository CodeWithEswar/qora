import * as React from "react";
import { QROperationsCenter } from "@/components/qr-operations";
import { QrStore, QrSummaryMetrics } from "@/lib/domains/qr-store";
import { getD1Database } from "@/lib/db/d1";
import { QrResponseV1 } from "@nxtqr/contracts";
import { CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";

export default async function QRCodesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const db = await getD1Database();

  let initialItems: QrResponseV1[] = [];
  let initialSummary: QrSummaryMetrics = {
    total: 0,
    active: 0,
    draft: 0,
    paused: 0,
    archived: 0,
  };

  // 1. Resolve Organization ID via Supabase first, then D1
  let orgId: string | null = null;
  try {
    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (org?.id) {
      orgId = org.id;
    }
  } catch (err) {
    console.warn("[QRCodesPage] Supabase org lookup notice:", err);
  }

  if (!orgId && db) {
    try {
      const org = await db
        .prepare("SELECT id FROM organizations WHERE slug = ? OR id = ? LIMIT 1")
        .bind(orgSlug, orgSlug)
        .first<any>();
      if (org?.id) {
        orgId = org.id;
      }
    } catch {}
  }

  // 2. Fetch authoritative QR records and summary metrics
  if (orgId) {
    try {
      const [rows, summary] = await Promise.all([
        QrStore.listQrs(
          {
            organizationId: orgId,
            limit: 100,
            sortBy: "updatedAt",
            order: "desc",
          },
          db || undefined
        ),
        QrStore.getSummaryMetrics(orgId, db || undefined),
      ]);

      initialSummary = summary;
      initialItems = rows.map((q) => ({
        id: q.id,
        slug: q.slug,
        name: q.name || "Untitled QR",
        type: q.qrType || "url",
        mode: q.isDynamic ? "dynamic" : "static",
        status: q.status,
        destinationUrl: q.destinationUrl || "",
        fallbackUrl: q.fallbackUrl || undefined,
        scanUrl: `https://nxtqr.vercel.app/s/${q.slug}`,
        campaignId: q.campaignId || undefined,
        campaignName: q.campaignName || undefined,
        folderId: q.folderId || undefined,
        ownerId: q.ownerId || undefined,
        ownerName: q.ownerName || undefined,
        ownerEmail: q.ownerEmail || undefined,
        ownerAvatarUrl: q.ownerAvatarUrl || undefined,
        scans: q.totalScans ?? 0,
        uniqueScans: q.uniqueScans ?? 0,
        design: q.design || CANONICAL_QR_DESIGN_DEFAULTS,
        createdAt: new Date(q.createdAt * 1000).toISOString(),
        updatedAt: new Date(q.updatedAt * 1000).toISOString(),
      }));
    } catch (e) {
      console.warn("[QRCodesPage] Server prefetch error:", e);
    }
  }

  return (
    <QROperationsCenter
      orgSlug={orgSlug}
      initialItems={initialItems}
      initialSummary={initialSummary}
    />
  );
}
