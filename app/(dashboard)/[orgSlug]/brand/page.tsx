import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseBrandKitRepository } from "@/lib/supabase/repositories/brand-kits";
import { BrandKitsPageClient } from "@/components/brand-kits/brand-kits-page-client";
import { BrandKitSummaryV1, BrandKitPulseMetrics } from "@nxtqr/contracts";

export const metadata = {
  title: "Brand Kits — Visual Identity System | NXTQR",
  description:
    "Create, govern, and apply consistent visual identities across QR codes, destination landing pages, and print assets.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function BrandKitsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  let initialKits: BrandKitSummaryV1[] = [];
  let pulse: BrandKitPulseMetrics = {
    totalKits: 0,
    activeKits: 0,
    totalAssignedQrs: 0,
    totalBrandAssets: 0,
    totalQrPresets: 0,
  };

  try {
    const [{ items }, pulseMetrics] = await Promise.all([
      SupabaseBrandKitRepository.listByOrg(org.id, { status: "all" }),
      SupabaseBrandKitRepository.getPulseMetrics(org.id),
    ]);

    initialKits = items;
    pulse = pulseMetrics;
  } catch (err) {
    console.error("[BrandKitsPage] Failed to fetch brand kits from database:", err);
  }

  return (
    <BrandKitsPageClient
      orgSlug={orgSlug}
      initialKits={initialKits}
      initialPulse={pulse}
    />
  );
}
