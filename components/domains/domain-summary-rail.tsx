"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { DomainPulseMetricsV1, DomainStatus } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface DomainSummaryRailProps {
  metrics: DomainPulseMetricsV1;
  activeStatusFilter: DomainStatus | "all" | "issues";
  onSelectFilter: (filter: DomainStatus | "all" | "issues") => void;
}

export function DomainSummaryRail({
  metrics,
  activeStatusFilter,
  onSelectFilter,
}: DomainSummaryRailProps) {
  const items = [
    {
      id: "all" as const,
      label: "TOTAL DOMAINS",
      count: metrics.totalDomains,
      subtitle: `${metrics.activeDomains} verified`,
      icon: "solar:global-bold",
      accent: "text-foreground",
      borderActive: "border-foreground/40 bg-surface",
    },
    {
      id: "ACTIVE" as const,
      label: "ACTIVE AT EDGE",
      count: metrics.activeDomains,
      subtitle: "Routing ready",
      icon: "solar:check-circle-bold",
      accent: "text-emerald-500",
      borderActive: "border-emerald-500/50 bg-emerald-500/5",
    },
    {
      id: "PENDING" as const,
      label: "PENDING DNS",
      count: metrics.pendingDomains,
      subtitle: "Verification needed",
      icon: "solar:clock-circle-bold",
      accent: "text-amber-500",
      borderActive: "border-amber-500/50 bg-amber-500/5",
    },
    {
      id: "issues" as const,
      label: "ISSUES DETECTED",
      count: metrics.issuesDomains,
      subtitle: metrics.issuesDomains === 0 ? "All healthy" : "Configuration required",
      icon: "solar:danger-triangle-bold",
      accent: metrics.issuesDomains > 0 ? "text-destructive" : "text-muted-foreground",
      borderActive: "border-destructive/50 bg-destructive/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const isSelected = activeStatusFilter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectFilter(item.id)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer",
              isSelected
                ? item.borderActive
                : "border-border/70 bg-surface/30 hover:bg-surface/70 hover:border-border"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono font-medium tracking-wider text-muted-foreground uppercase">
                {item.label}
              </span>
              <Icon
                icon={item.icon}
                className={cn("w-4 h-4 transition-transform group-hover:scale-110", item.accent)}
              />
            </div>

            <div className="mt-2.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {item.count}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
