"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn, formatNumber } from "@/lib/utils";

export interface CampaignSummaryData {
  activeCampaigns: number;
  qrAssetsInCampaigns: number;
  scanActivity: number;
  destinations: number;
}

export interface CampaignSignalRailProps {
  data: CampaignSummaryData;
  isLoading?: boolean;
  className?: string;
  onHoverStage?: (stage: "campaigns" | "qrs" | "destinations" | "scans" | null) => void;
}

export function CampaignSignalRail({
  data,
  isLoading = false,
  className,
  onHoverStage,
}: CampaignSignalRailProps) {
  const items = [
    {
      id: "campaigns" as const,
      label: "Active Campaigns",
      value: data.activeCampaigns,
      icon: "hugeicons:flag-02",
      format: (v: number) => formatNumber(v),
    },
    {
      id: "qrs" as const,
      label: "QR Assets",
      value: data.qrAssetsInCampaigns,
      icon: "hugeicons:qr-code",
      format: (v: number) => formatNumber(v),
    },
    {
      id: "destinations" as const,
      label: "Destinations",
      value: data.destinations,
      icon: "hugeicons:link-square-02",
      format: (v: number) => formatNumber(v),
    },
    {
      id: "scans" as const,
      label: "Scan Activity",
      value: data.scanActivity,
      icon: "hugeicons:analytics-01",
      format: (v: number) => formatNumber(v),
    },
  ];

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/80 bg-surface/60 backdrop-blur-xs p-1 shadow-2xs overflow-hidden",
        className
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {items.map((item, index) => (
          <div
            key={item.id}
            onMouseEnter={() => onHoverStage?.(item.id)}
            onMouseLeave={() => onHoverStage?.(null)}
            className={cn(
              "px-4 py-3 group/stage transition-colors duration-150 flex items-center justify-between",
              "hover:bg-primary/[0.03] dark:hover:bg-white/[0.02]"
            )}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <Icon icon={item.icon} className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/stage:text-primary transition-colors" />
                <span>{item.label}</span>
              </div>
              <div className="font-mono text-xl font-bold tracking-tight text-foreground">
                {isLoading ? (
                  <div className="h-6 w-14 bg-muted animate-pulse rounded-sm mt-0.5" />
                ) : (
                  item.format(item.value)
                )}
              </div>
            </div>

            {/* Subtle flow connector arrow between stages (hidden on last item) */}
            {index < items.length - 1 && (
              <div className="hidden md:flex items-center text-muted-foreground/30 group-hover/stage:text-primary/50 transition-colors">
                <Icon icon="hugeicons:arrow-right-01" className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
