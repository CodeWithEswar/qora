import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseCampaignRepository } from "@/lib/supabase/repositories/campaigns";
import { SupabaseFolderRepository } from "@/lib/supabase/repositories/folders";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";
import { getD1Database } from "@/lib/db/d1";
import { BulkQrStudio } from "@/components/bulk-qr/bulk-qr-studio";

export const metadata = {
  title: "Bulk QR Studio — Batch QR Operations | NXTQR",
  description:
    "Transform structured CSV or manual data into validated, production-grade QR assets with automated schema verification and edge publishing.",
};

export default async function BulkQrStudioPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const db = await getD1Database();

  // 1. Resolve Organization ID authoritatively
  let orgId: string | null = null;
  try {
    const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
    if (org?.id) {
      orgId = org.id;
    }
  } catch (err) {
    console.warn("[BulkQrStudioPage] Supabase org lookup notice:", err);
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

  if (!orgId) {
    notFound();
  }

  // 2. Fetch real organization campaigns, folders, and brand kits
  let campaigns: Array<{ id: string; name: string }> = [];
  let folders: Array<{ id: string; name: string }> = [];
  let brandKits: Array<{ id: string; name: string; design?: any }> = [];

  try {
    const [cRes, fRes, bRes] = await Promise.all([
      SupabaseCampaignRepository.listByOrg(orgId, { limit: 100 }),
      SupabaseFolderRepository.listByOrg(orgId, { limit: 100 }),
      SupabaseBrandKitRepository.listByOrg(orgId, { limit: 50 }),
    ]);

    campaigns = cRes.map((c) => ({ id: c.id, name: c.name }));
    folders = fRes.map((f) => ({ id: f.id, name: f.name }));
    brandKits = (bRes?.items || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      design: b.qrDesignPreset || undefined,
    }));
  } catch (err) {
    console.warn("[BulkQrStudioPage] Error fetching workspace scopes:", err);
  }

  return (
    <div className="w-full">
      <BulkQrStudio
        orgSlug={orgSlug}
        orgId={orgId}
        campaigns={campaigns}
        folders={folders}
        brandKits={brandKits}
        canPublish={true}
      />
    </div>
  );
}
