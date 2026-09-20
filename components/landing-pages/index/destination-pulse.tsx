"use client";

import React from "react";
import type { LandingPagePulseMetrics } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface DestinationPulseProps {
  pulse: LandingPagePulseMetrics;
}

export function DestinationPulse({ pulse }: DestinationPulseProps) {
  const metrics = [
    {
      label: "TOTAL PAGES",
      value: pulse.totalPages,
      icon: "solar:documents-bold",
    },
    {
      label: "PUBLISHED",
      value: pulse.publishedPages,
      icon: "solar:check-circle-bold",
      indicator: pulse.publishedPages > 0 ? "bg-emerald-500" : null,
    },
    {
      label: "DRAFTS",
      value: pulse.draftPages,
      icon: "solar:pen-bold",
    },
    {
      label: "CONNECTED QRS",
      value: pulse.connectedQrs,
      icon: "solar:qr-code-bold",
    },
    {
      label: "PAGE VIEWS",
      value: pulse.totalViews,
      icon: "solar:eye-bold",
    },
    {
      label: "ACTIONS & CTAS",
      value: pulse.totalActions,
      icon: "solar:cursor-bold",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 py-1 sm:py-2">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:border-border hover:bg-card/90 shadow-2xs"
        >
          {/* Header Row: Label & Icon */}
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground truncate min-w-0 flex-1">
              {m.label}
            </span>
            <div className="w-6 h-6 rounded-md bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-foreground transition-colors relative">
              <NxtqrIcon icon={m.icon} size={13} />
              {m.indicator && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-2 ring-card",
                    m.indicator
                  )}
                />
              )}
            </div>
          </div>

          {/* Metric Value */}
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {m.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
