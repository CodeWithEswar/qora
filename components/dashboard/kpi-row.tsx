import * as React from "react";
import { QrCode, ScanLine, Users, Target } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { DASHBOARD_KPIS } from "@/lib/mock-data/dashboard";

export function KPIRow() {
  const { totalScans, uniqueScans, activeQRs, conversionRate } = DASHBOARD_KPIS;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Scans"
        value={totalScans.value}
        change={totalScans.change}
        comparison={totalScans.comparison}
        sparklineData={totalScans.sparkline}
        icon={<ScanLine className="h-4 w-4" />}
      />

      <MetricCard
        title="Unique Scans"
        value={uniqueScans.value}
        change={uniqueScans.change}
        comparison={uniqueScans.comparison}
        sparklineData={uniqueScans.sparkline}
        icon={<Users className="h-4 w-4" />}
      />

      <MetricCard
        title="Active QR Codes"
        value={activeQRs.value}
        change={activeQRs.change}
        comparison={activeQRs.comparison}
        sparklineData={activeQRs.sparkline}
        icon={<QrCode className="h-4 w-4" />}
      />

      <MetricCard
        title="Conversion Rate"
        value={conversionRate.value}
        change={conversionRate.change}
        comparison={conversionRate.comparison}
        sparklineData={conversionRate.sparkline}
        icon={<Target className="h-4 w-4" />}
      />
    </div>
  );
}
