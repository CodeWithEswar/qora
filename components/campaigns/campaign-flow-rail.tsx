"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn, formatNumber } from "@/lib/utils";

export interface CampaignFlowRailProps {
  campaignName: string;
  emoji?: string | null;
  qrCount: number;
  routesCount: number;
  destinationCount: number;
  totalScans: number;
  activeSection?: string | null;
  onSectionClick?: (section: string) => void;
  className?: string;
}

export function CampaignFlowRail({
  campaignName,
  emoji,
  qrCount,
  routesCount,
  destinationCount,
  totalScans,
  activeSection,
  onSectionClick,
  className,
}: CampaignFlowRailProps) {
  const steps = [
    {
      id: "campaign",
      label: "Campaign",
      icon: "hugeicons:flag-02",
      value: emoji || "🚀",
      subtext: campaignName,
      isEmoji: Boolean(emoji),
    },
    {
      id: "qrs",
      label: "QR Assets",
      icon: "hugeicons:qr-code",
      value: formatNumber(qrCount),
      subtext: `${qrCount} active assets`,
    },
    {
      id: "routing",
      label: "Routing",
      icon: "hugeicons:route-01",
      value: `${routesCount} routes`,
      subtext: "Policy engine",
    },
    {
      id: "destinations",
      label: "Destinations",
      icon: "hugeicons:link-square-02",
      value: `${destinationCount}`,
      subtext: "Target endpoints",
    },
    {
      id: "scans",
      label: "Scan Signal",
      icon: "hugeicons:analytics-01",
      value: formatNumber(totalScans),
      subtext: "Live telemetry",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface/70 backdrop-blur-xs p-1 sm:p-1.5 shadow-2xs overflow-x-auto no-scrollbar",
        className
      )}
    >
      <div className="flex items-center min-w-[520px] md:min-w-0 justify-between divide-x divide-border/60">
        {steps.map((step) => {
          const isActive = activeSection === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSectionClick?.(step.id)}
              className={cn(
                "flex-1 px-4 py-2.5 text-left transition-all duration-200 group/rail",
                "hover:bg-primary/[0.04] dark:hover:bg-white/[0.02]",
                isActive && "bg-primary/[0.06] dark:bg-primary/[0.08]"
              )}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground group-hover/rail:text-primary transition-colors">
                <Icon icon={step.icon} className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={cn(
                    "text-sm font-bold tracking-tight text-foreground truncate max-w-[140px]",
                    step.isEmoji ? "text-base" : "font-mono"
                  )}
                >
                  {step.value}
                </span>
                <span className="text-[10px] text-muted-foreground truncate hidden lg:inline">
                  {step.subtext}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
