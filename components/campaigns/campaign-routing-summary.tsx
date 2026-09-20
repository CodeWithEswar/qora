"use client";

import * as React from "react";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface CampaignRoutingSummaryProps {
  defaultRoutesCount: number;
  conditionalRulesCount: number;
  monitoredCount: number;
  layout?: "stack" | "grid";
  className?: string;
}

export function CampaignRoutingSummary({
  defaultRoutesCount,
  conditionalRulesCount,
  monitoredCount,
  layout = "stack",
  className,
}: CampaignRoutingSummaryProps) {
  const routes = [
    {
      label: "Default Routes",
      count: defaultRoutesCount,
      description: "Direct URL resolutions without conditional rules",
      icon: "solar:link-square-bold",
    },
    {
      label: "Conditional Rules",
      count: conditionalRulesCount,
      description: "Dynamic routing rules (device, geo, schedule)",
      icon: "solar:tuning-bold",
    },
    {
      label: "Guardian Monitored",
      count: monitoredCount,
      description: "Link health verification and automated failover",
      icon: "solar:shield-check-bold",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface p-4 sm:p-5 shadow-2xs space-y-3.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
            <NxtqrIcon icon="solar:route-bold" size={12} />
            <span>Routing Architecture</span>
          </div>
          <h2 className="text-sm font-bold text-foreground mt-0.5">
            Routing Engine Snapshot
          </h2>
        </div>
      </div>

      {layout === "stack" ? (
        /* 1. Stacked vertical layout — optimal for sidebars and responsive narrow columns */
        <div className="space-y-2.5">
          {routes.map((r) => (
            <div
              key={r.label}
              className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated/40 border border-border/60 hover:bg-surface-elevated/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <NxtqrIcon icon={r.icon} size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      {r.label}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-foreground px-2 py-0.5 rounded-md bg-muted/60 border border-border/60 shrink-0">
                  {r.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 2. Grid layout — for wide viewports like standalone Routing tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {routes.map((r) => (
            <div
              key={r.label}
              className="p-3.5 rounded-xl bg-surface-elevated/40 border border-border/60 space-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground min-w-0 truncate">
                    <NxtqrIcon icon={r.icon} size={14} className="text-primary shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground px-2 py-0.5 rounded-md bg-muted/60 border border-border/60 shrink-0">
                    {r.count}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
                  {r.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
