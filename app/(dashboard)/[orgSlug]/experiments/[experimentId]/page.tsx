import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperiment } from "@/lib/domains/experiments";
import { ExperimentDetailView } from "@/components/experiments/detail/experiment-detail-view";

interface ExperimentDetailPageProps {
  params: Promise<{ orgSlug: string; experimentId: string }>;
}

export async function generateMetadata({
  params,
}: ExperimentDetailPageProps): Promise<Metadata> {
  const { orgSlug, experimentId } = await params;
  const exp = await getExperiment(orgSlug, experimentId);
  return {
    title: exp ? `${exp.name} — NXTQR A/B Routing Experiment Lab` : "Experiment Not Found",
    description: "Inspect live deterministic traffic allocation, variant performance, and telemetry signals.",
  };
}

export default async function ExperimentDetailPage({
  params,
}: ExperimentDetailPageProps) {
  const { orgSlug, experimentId } = await params;
  const experiment = await getExperiment(orgSlug, experimentId);

  if (!experiment) {
    notFound();
  }

  return <ExperimentDetailView experiment={experiment} orgSlug={orgSlug} />;
}
