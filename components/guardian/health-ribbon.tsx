"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianMonitorSummaryV1, GuardianHealthState } from "@nxtqr/contracts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthRibbonProps {
  monitors: GuardianMonitorSummaryV1[];
  selectedMonitor?: GuardianMonitorSummaryV1 | null;
}

interface RibbonSegment {
  state: GuardianHealthState;
  weight: number; // percentage width (sum = 100)
  label: string;
  durationLabel: string;
  timestamp: string;
  failureReason?: string;
}

export function HealthRibbon({ monitors, selectedMonitor }: HealthRibbonProps) {
  // Use selected monitor or the first monitor with observations
  const activeMonitor =
    selectedMonitor ||
    monitors.find((m) => m.recentObservations.length > 0) ||
    monitors[0];

  if (!activeMonitor) return null;

  const observations = activeMonitor.recentObservations;

  // Build segments from observations or default state
  const segments: RibbonSegment[] = React.useMemo(() => {
    if (observations.length === 0) {
      return [
        {
          state: activeMonitor.currentHealth,
          weight: 100,
          label: activeMonitor.currentHealth,
          durationLabel: "Current State",
          timestamp: activeMonitor.lastCheckedAt || activeMonitor.createdAt,
        },
      ];
    }

    // Chronological from oldest to newest
    const chronological = [...observations].reverse();
    const total = chronological.length;
    const itemWeight = 100 / total;

    return chronological.map((obs, idx) => {
      let state: GuardianHealthState = "HEALTHY";
      if (obs.result === "DEGRADED") state = "DEGRADED";
      else if (obs.result !== "HEALTHY") state = "UNAVAILABLE";

      return {
        state,
        weight: itemWeight,
        label: state,
        durationLabel: `${obs.durationMs}ms duration`,
        timestamp: new Date(obs.observedAt).toLocaleTimeString(),
        failureReason: obs.failureReason || undefined,
      };
    });
  }, [observations, activeMonitor]);

  return (
    <div className="rounded-xl border border-border/80 bg-surface/90 p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
            <Icon icon="solar:history-linear" className="w-4 h-4 text-[#FA520F]" />
            <span>Health Ribbon Timeline</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Continuous health state transition ribbon for{" "}
            <span className="font-mono text-foreground font-medium">
              {activeMonitor.name}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-muted-foreground">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Horizontal Multi-State Ribbon Bar */}
      <TooltipProvider>
        <div className="relative h-8 rounded-lg overflow-hidden border border-border/80 bg-muted/20 flex gap-0.5 p-1">
          {segments.map((seg, idx) => {
            const bgClass =
              seg.state === "HEALTHY"
                ? "bg-emerald-500 hover:bg-emerald-400"
                : seg.state === "DEGRADED"
                ? "bg-amber-500 hover:bg-amber-400"
                : seg.state === "UNAVAILABLE"
                ? "bg-rose-500 hover:bg-rose-400"
                : "bg-muted-foreground/40";

            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div
                    style={{ width: `${seg.weight}%` }}
                    className={`h-full rounded-xs transition-all duration-150 cursor-pointer ${bgClass}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-mono space-y-1 p-2">
                  <div className="font-semibold text-foreground">
                    State: {seg.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Timestamp: {seg.timestamp}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Probe: {seg.durationLabel}
                  </div>
                  {seg.failureReason && (
                    <div className="text-[11px] text-rose-400">
                      Error: {seg.failureReason}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
        <span>Earliest Observation</span>
        <span>Latest Real-time State</span>
      </div>
    </div>
  );
}
