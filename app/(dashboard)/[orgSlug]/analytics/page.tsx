import * as React from "react";
import { Download, Calendar, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ScanActivityChart } from "@/components/dashboard/scan-activity-chart";
import { DeviceBreakdownChart } from "@/components/dashboard/device-breakdown-chart";
import { TopLocations } from "@/components/dashboard/top-locations";
import { KPIRow } from "@/components/dashboard/kpi-row";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Acme Corp", href: `/${orgSlug}` },
          { label: "Analytics" },
        ]}
        title="Analytics & Telemetry"
        description="Comprehensive scan volume, geographic distribution, device breakdowns, and conversion performance."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last 30 Days</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </>
        }
      />

      <KPIRow />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <ScanActivityChart />
        <DeviceBreakdownChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <TopLocations />
      </div>
    </div>
  );
}
