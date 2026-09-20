import * as React from "react";
import { Metadata } from "next";
import { listExperiments } from "@/lib/domains/experiments";
import { ExperimentsCommandCenter } from "@/components/experiments/experiments-command-center";

export const metadata: Metadata = {
  title: "NXTQR Experiments — A/B Dynamic QR Routing Lab",
  description:
    "Edge deterministic A/B routing experimentation platform for Dynamic QR codes. Compare variant destinations, measure scan performance, and optimize conversion outcomes.",
};

interface ExperimentsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function ExperimentsPage({ params }: ExperimentsPageProps) {
  const { orgSlug } = await params;

  // Authoritative data retrieval from Supabase (with D1 sync/fallback)
  const { experiments, eligibleQrs } = await listExperiments(orgSlug);

  return (
    <ExperimentsCommandCenter
      initialExperiments={experiments}
      eligibleQrs={eligibleQrs}
      orgSlug={orgSlug}
    />
  );
}
