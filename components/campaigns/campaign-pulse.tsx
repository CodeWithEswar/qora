"use client";

import * as React from "react";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export interface CampaignPulseProps {
  qrCount: number;
  routesCount: number;
  destinationCount: number;
  totalScans: number;
  lastActivityAt?: string | null;
  activeSection?: string | null;
  onSectionClick?: (section: string) => void;
  className?: string;
}

/**
 * CampaignPulse — Signature NXTQR operational pulse strip.
 * Replaces disconnected metadata with a dense, honest 5-metric pulse
 * using real Supabase metrics only (no fake telemetry).
 */
export function CampaignPulse({
  qrCount,
  routesCount,
  destinationCount,
  totalScans,
  lastActivityAt,
  activeSection,
  onSectionClick,
  className,
}: CampaignPulseProps) {
  // Compute honest last activity string
  const formattedActivity = React.useMemo(() => {
    if (!lastActivityAt) return "Just created";
    try {
      const date = new Date(lastActivityAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDate(date);
    } catch {
      return "Recent";
    }
  }, [lastActivityAt]);

  const metrics = [
    {
      id: "qrs",
      label: "QR Assets",
      icon: "solar:qr-code-bold",
      value: formatNumber(qrCount),
      subtext: qrCount === 1 ? "1 active asset" : `${qrCount} active assets`,
    },
    {
      id: "routing",
      label: "Routes",
      icon: "solar:route-bold",
      value: `${routesCount}`,
      subtext: routesCount === 1 ? "1 active route" : `${routesCount} active routes`,
    },
    {
      id: "destinations",
      label: "Destinations",
      icon: "solar:link-square-bold",
      value: `${destinationCount}`,
      subtext: destinationCount === 1 ? "1 endpoint" : `${destinationCount} endpoints`,
    },
    {
      id: "analytics",
      label: "Scan Signal",
      icon: "solar:chart-2-bold",
      value: formatNumber(totalScans),
      subtext: totalScans === 0 ? "No scan signal yet" : `${totalScans} verified scans`,
    },
    {
      id: "activity",
      label: "Last Activity",
      icon: "solar:clock-circle-bold",
      value: formattedActivity,
      subtext: "Campaign event",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface/80 backdrop-blur-xs shadow-2xs overflow-hidden",
        className
      )}
    >
      {/* Microcopy header bar */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-1.5 border-b border-border/60 bg-muted/20 text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Campaign Pulse</span>
        </div>
        <span className="hidden sm:inline text-muted-foreground/80">
          Everything connected to this campaign, at a glance
        </span>
      </div>

      {/* Metric cells: Desktop 5-cols, Mobile 2-cols */}
      <div className="grid grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric, idx) => {
          const isActive = activeSection === metric.id;
          const isSpanMobile = idx === 4; // 5th item spans full width on 2-col mobile

          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => onSectionClick?.(metric.id)}
              className={cn(
                "p-3 sm:p-3.5 text-left transition-all duration-200 group/pulse cursor-pointer border-border/60",
                "hover:bg-primary/[0.04] dark:hover:bg-white/[0.02]",
                isActive && "bg-primary/[0.07] dark:bg-primary/[0.09]",
                // Right border for left column on mobile
                (idx === 0 || idx === 2) && "border-r",
                // Bottom border for rows 1 & 2 on mobile
                idx < 4 && "border-b lg:border-b-0",
                // Right border on desktop for all items except the last
                idx < 4 && "lg:border-r",
                // 5th item spans full width on mobile
                isSpanMobile && "col-span-2 lg:col-span-1"
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground group-hover/pulse:text-primary transition-colors">
                <NxtqrIcon
                  icon={metric.icon}
                  size={12}
                  className="text-primary group-hover/pulse:scale-110 transition-transform shrink-0"
                />
                <span className="truncate">{metric.label}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 mt-1">
                <span className="font-mono text-sm sm:text-base font-bold text-foreground tracking-tight">
                  {metric.value}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {metric.subtext}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
