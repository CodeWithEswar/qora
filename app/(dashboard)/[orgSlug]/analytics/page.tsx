import * as React from "react";
import { notFound } from "next/navigation";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseAnalyticsRepository, ReportJobRecord } from "@/lib/supabase/repositories/analytics";
import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics & Telemetry — Scan Intelligence | NXTQR",
  description: "Understand how scans move through your QR infrastructure.",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AnalyticsPage({ params, searchParams }: PageProps) {
  const { orgSlug } = await params;
  const sParams = await searchParams;

  const org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  if (!org) {
    notFound();
  }

  const range = (typeof sParams.range === "string" ? sParams.range : "30d") as "24h" | "7d" | "30d" | "90d" | "custom";
  const dateFrom = typeof sParams.from === "string" ? sParams.from : undefined;
  const dateTo = typeof sParams.to === "string" ? sParams.to : undefined;
  const qrId = typeof sParams.qrId === "string" ? sParams.qrId : undefined;
  const country = typeof sParams.country === "string" ? sParams.country : undefined;
  const device = typeof sParams.device === "string" ? sParams.device : undefined;
  const os = typeof sParams.os === "string" ? sParams.os : undefined;
  const browser = typeof sParams.browser === "string" ? sParams.browser : undefined;
  const ruleId = typeof sParams.ruleId === "string" ? sParams.ruleId : undefined;
  const trafficQuality = typeof sParams.trafficQuality === "string" ? sParams.trafficQuality : undefined;
  const timezone = typeof sParams.timezone === "string" ? sParams.timezone : "UTC";

  let analytics;
  let reports: ReportJobRecord[] = [];

  try {
    const [analyticsResult, reportsResult] = await Promise.all([
      SupabaseAnalyticsRepository.getOrganizationAnalytics(org.id, {
        range,
        dateFrom,
        dateTo,
        qrId,
        country,
        device,
        os,
        browser,
        ruleId,
        trafficQuality,
        timezone,
      }),
      SupabaseAnalyticsRepository.listReportJobs(org.id),
    ]);

    analytics = analyticsResult;
    reports = reportsResult;
  } catch (err) {
    console.error("[AnalyticsPage] Error pre-fetching Supabase telemetry:", err);
    // In case of query error, return default bounded zero model so UI can show honest error / recovery
    analytics = {
      range: {
        from: new Date(Date.now() - 30 * 86400000).toISOString(),
        to: new Date().toISOString(),
        key: range,
        timezone: "UTC",
      },
      totals: {
        totalScans: 0,
        estimatedUniqueScans: 0,
        activeQRs: 0,
        conversions: 0,
        conversionRate: 0,
        normalScans: 0,
        suspectedAutomation: 0,
        blockedEvents: 0,
      },
      comparison: {
        hasPreviousData: false,
        previousPeriodLabel: "No previous-period data",
        totalScansChange: null,
        uniqueScansChange: null,
        conversionRateChange: null,
      },
      sparklines: {
        totalScans: [],
        uniqueScans: [],
        activeQRs: [],
        conversionRate: [],
      },
      series: [],
      velocity: [],
      geography: [],
      devices: {
        deviceClasses: [],
        operatingSystems: [],
        browsers: [],
      },
      destinationFlow: {
        nodes: [],
        links: [],
        topDestinations: [],
      },
      routing: {
        rules: [],
        defaultScans: 0,
        fallbackScans: 0,
      },
      temporalMatrix: [],
      trafficQuality: {
        normalScans: 0,
        normalPercentage: 0,
        suspectedAutomation: 0,
        suspectedPercentage: 0,
        blockedRequests: 0,
        blockedPercentage: 0,
      },
      conversionJourney: {
        scans: 0,
        destinationsReached: 0,
        conversions: 0,
        conversionRate: 0,
      },
      experiments: [],
      topQrAssets: [],
      recentSignals: [],
      filtersAvailable: {
        qrs: [],
        campaigns: [],
        countries: [],
        devices: [],
      },
    };
  }

  return (
    <AnalyticsPageClient
      orgSlug={orgSlug}
      initialData={analytics}
      initialReports={reports}
    />
  );
}
