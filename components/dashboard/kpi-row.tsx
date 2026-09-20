import * as React from "react";
import { QrCode, ScanLine, Users, Target } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { formatNumber } from "@/lib/utils";
export interface KPIRowProps {
  data?: {
    totalScans?: number;
    uniqueScans?: number;
    activeQRs?: number;
    conversionRate?: number;
    comparisonLabel?: string;
    sparklines?: {
      totalScans?: number[];
      uniqueScans?: number[];
      activeQRs?: number[];
      conversionRate?: number[];
    };
  };
}

export function KPIRow({ data }: KPIRowProps = {}) {
  const totalScansValue = data?.totalScans !== undefined ? formatNumber(data.totalScans) : "0";
  const uniqueScansValue = data?.uniqueScans !== undefined ? formatNumber(data.uniqueScans) : "0";
  const activeQRsValue = data?.activeQRs !== undefined ? formatNumber(data.activeQRs) : "0";
  const convRateValue = data?.conversionRate !== undefined ? `${data.conversionRate.toFixed(1)}%` : "0.0%";
  const compLabel = data?.comparisonLabel || "No scan data yet";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Scans"
        value={totalScansValue}
        change={0}
        comparison={compLabel}
        sparklineData={data?.sparklines?.totalScans || []}
        icon={<ScanLine className="h-4 w-4" />}
      />

      <MetricCard
        title="Unique Scans"
        value={uniqueScansValue}
        change={0}
        comparison={compLabel}
        sparklineData={data?.sparklines?.uniqueScans || []}
        icon={<Users className="h-4 w-4" />}
      />

      <MetricCard
        title="Active QR Codes"
        value={activeQRsValue}
        change={0}
        comparison={data?.activeQRs ? "Published assets" : "No active assets"}
        sparklineData={data?.sparklines?.activeQRs || []}
        icon={<QrCode className="h-4 w-4" />}
      />

      <MetricCard
        title="Conversion Rate"
        value={convRateValue}
        change={0}
        comparison={data?.conversionRate ? "Exposures converted" : "No conversions yet"}
        sparklineData={data?.sparklines?.conversionRate || []}
        icon={<Target className="h-4 w-4" />}
      />
    </div>
  );
}
