import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseGuardianRepository } from "@/lib/supabase/repositories/guardian";
import { GuardianPageClient } from "@/components/guardian/guardian-page-client";
import {
  GuardianMonitorSummaryV1,
  GuardianPulseMetricsV1,
  GuardianIncidentDetailV1,
} from "@nxtqr/contracts";

export const metadata = {
  title: "Guardian — Destination Reliability & Automatic Fallback | NXTQR",
  description:
    "Observe destination health, understand incidents, and prepare safe fallback behavior without slowing a single scan.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function GuardianPage({ params }: PageProps) {
  const { orgSlug } = await params;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  let monitors: GuardianMonitorSummaryV1[] = [];
  let pulse: GuardianPulseMetricsV1 = {
    monitoredCount: 0,
    healthyCount: 0,
    degradedCount: 0,
    unavailableCount: 0,
    pausedCount: 0,
    openIncidentsCount: 0,
    lastSignalPublishedAt: null,
  };
  let incidents: GuardianIncidentDetailV1[] = [];

  try {
    const [{ items }, pulseMetrics, orgIncidents] = await Promise.all([
      SupabaseGuardianRepository.listMonitorsByOrg(org.id),
      SupabaseGuardianRepository.getPulseMetrics(org.id),
      SupabaseGuardianRepository.listIncidentsByOrg(org.id),
    ]);

    monitors = items;
    pulse = pulseMetrics;
    incidents = orgIncidents;
  } catch (err) {
    console.error("[GuardianPage] Failed to fetch data from Supabase:", err);
  }

  return (
    <GuardianPageClient
      orgSlug={orgSlug}
      initialMonitors={monitors}
      initialPulse={pulse}
      initialIncidents={incidents}
    />
  );
}
