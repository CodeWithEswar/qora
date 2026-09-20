import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseLandingPageRepository } from "@/lib/supabase/repositories/landing-pages";
import { LandingPageOverviewView } from "@/components/landing-pages/overview/landing-page-overview-view";

export const metadata = {
  title: "Destination Trace & Overview — Landing Pages | NXTQR",
  description: "Operational view of QR scan ingress, destination trace, and publication versions.",
};

export default async function LandingPageOverviewPage({
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
    const [{ page }, connectedQrs, versions] = await Promise.all([
      SupabaseLandingPageRepository.getById(org.id, pageId),
      SupabaseLandingPageRepository.listConnectedQrs(org.id, pageId),
      SupabaseLandingPageRepository.listVersions(org.id, pageId),
    ]);

    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <LandingPageOverviewView
          page={page}
          connectedQrs={connectedQrs}
          versions={versions}
          orgSlug={orgSlug}
        />
      </div>
    );
  } catch (err) {
    console.error("[LandingPageOverviewPage] Failed to fetch destination overview:", err);
    notFound();
  }
}
