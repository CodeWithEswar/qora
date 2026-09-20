import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";
import { LandingPagesHeader } from "@/components/landing-pages/index/landing-pages-header";
import { DestinationPulse } from "@/components/landing-pages/index/destination-pulse";
import { DestinationField } from "@/components/landing-pages/index/destination-field";
import type { LandingPageResponseV1, LandingPagePulseMetrics } from "@nxtqr/contracts";

export const metadata = {
  title: "Landing Pages — Mobile-First Destination Studio | NXTQR",
  description: "Compose mobile-first destinations designed for QR traffic. Measure real scan→page→action conversions.",
};

export default async function LandingPagesIndexPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  let initialPages: LandingPageResponseV1[] = [];
  let pulse: LandingPagePulseMetrics = {
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    connectedQrs: 0,
    totalViews: 0,
    totalActions: 0,
  };

  try {
    const [pagesResult, pulseResult] = await Promise.all([
      SupabaseLandingPageRepository.listByOrg(org.id, {
        limit: 100,
        status: "all",
        sortBy: "updatedAt",
        order: "desc",
      }),
      SupabaseLandingPageRepository.getPulseMetrics(org.id),
    ]);

    initialPages = pagesResult.items;
    pulse = pulseResult;
  } catch (err) {
    console.error("[LandingPagesIndexPage] Failed to fetch data from Supabase:", err);
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Header */}
      <LandingPagesHeader orgSlug={orgSlug} />

      {/* 2. Destination Pulse Metrics */}
      <DestinationPulse pulse={pulse} />

      {/* 3. Destination Field Surface */}
      <DestinationField
        initialPages={initialPages}
        pulse={pulse}
        orgSlug={orgSlug}
      />
    </div>
  );
}
