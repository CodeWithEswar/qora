import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";
import { LandingPageAnalyticsView } from "@/components/landing-pages/analytics/landing-page-analytics-view";

export const metadata = {
  title: "Destination Performance Analytics — Landing Pages | NXTQR",
  description: "Measure real QR scan ingress, destination page views, and conversion actions.",
};

export default async function LandingPageAnalyticsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pageId: string }>;
}) {
  const { orgSlug, pageId } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  try {
    const [{ page }, analytics] = await Promise.all([
      SupabaseLandingPageRepository.getById(org.id, pageId),
      SupabaseLandingPageRepository.getAnalytics(org.id, pageId),
    ]);

    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <LandingPageAnalyticsView
          page={page}
          analytics={analytics}
          orgSlug={orgSlug}
        />
      </div>
    );
  } catch (err) {
    console.error("[LandingPageAnalyticsPage] Failed to fetch analytics:", err);
    notFound();
  }
}
