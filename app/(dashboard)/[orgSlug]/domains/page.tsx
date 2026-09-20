import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseDomainRepository } from "@/lib/supabase/repositories/domains";
import { DomainsPageClient } from "@/components/domains/domains-page-client";
import { CustomDomainSummaryV1, DomainPulseMetricsV1 } from "@nxtqr/contracts";

export const metadata = {
  title: "Domains — Brand Infrastructure & Edge Routing | NXTQR",
  description:
    "Connect trusted custom domains to NXTQR and control how branded QR traffic resolves at the edge.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function DomainsPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  let initialDomains: CustomDomainSummaryV1[] = [];
  let pulse: DomainPulseMetricsV1 = {
    totalDomains: 0,
    activeDomains: 0,
    pendingDomains: 0,
    issuesDomains: 0,
    totalAssignedAssets: 0,
  };

  try {
    const [{ items }, pulseMetrics] = await Promise.all([
      SupabaseDomainRepository.listByOrg(org.id, { status: "all" }),
      SupabaseDomainRepository.getPulseMetrics(org.id),
    ]);

    initialDomains = items;
    pulse = pulseMetrics;
  } catch (err) {
    console.error("[DomainsPage] Failed to fetch domains from database:", err);
  }

  return (
    <DomainsPageClient
      orgSlug={orgSlug}
      initialDomains={initialDomains}
      initialPulse={pulse}
    />
  );
}
