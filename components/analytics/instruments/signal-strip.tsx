"use client";

import * as React from "react";
import { SignalInstrument } from "./signal-instrument";
import { OrganizationAnalyticsDTO } from "@/lib/supabase/repositories/analytics";

interface SignalStripProps {
  data: OrganizationAnalyticsDTO;
}

export function SignalStrip({ data }: SignalStripProps) {
  const { totals, comparison, sparklines } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <SignalInstrument
        title="Total Scans"
        value={totals.totalScans}
        icon="lucide:scan-line"
        change={comparison.totalScansChange}
        comparisonLabel={comparison.previousPeriodLabel}
        sparklineData={sparklines.totalScans}
        color="#FA520F"
        gradientId="grad-total-scans"
        contextHint="All edge events"
      />

      <SignalInstrument
        title="Estimated Unique Scans"
        value={totals.estimatedUniqueScans}
        icon="lucide:users"
        change={comparison.uniqueScansChange}
        comparisonLabel={comparison.previousPeriodLabel}
        sparklineData={sparklines.uniqueScans}
        color="#FFA110"
        gradientId="grad-unique-scans"
        contextHint="IP/device coarse estimate"
      />

      <SignalInstrument
        title="Active QR Codes"
        value={totals.activeQRs}
        icon="lucide:qr-code"
        change={null}
        comparisonLabel={totals.activeQRs > 0 ? "Published & routing" : "No active assets"}
        sparklineData={sparklines.activeQRs}
        color="#FFB83E"
        gradientId="grad-active-qrs"
        contextHint="Live resolving"
      />

      <SignalInstrument
        title="Conversion Rate"
        value={`${totals.conversionRate.toFixed(1)}%`}
        icon="lucide:target"
        change={comparison.conversionRateChange}
        comparisonLabel={totals.conversions > 0 ? `${totals.conversions} goal signals` : "No conversion events"}
        sparklineData={sparklines.conversionRate}
        color="#10B981"
        gradientId="grad-conv-rate"
        contextHint="Observed outcomes"
      />
    </div>
  );
}
