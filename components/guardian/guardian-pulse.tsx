"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianMonitorSummaryV1, GuardianHealthState } from "@nxtqr/contracts";
import { GuardianEmpty } from "./states/guardian-empty";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GuardianPulseProps {
  monitors: GuardianMonitorSummaryV1[];
  onSelectMonitor: (monitor: GuardianMonitorSummaryV1) => void;
  onAddMonitor: () => void;
}

function getHealthVisual(health: GuardianHealthState) {
  switch (health) {
    case "HEALTHY":
      return {
        label: "HEALTHY",
        icon: "solar:check-circle-bold",
        textColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        dotColor: "bg-emerald-500",
        pulseGlow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]",
      };
    case "DEGRADED":
      return {
        label: "DEGRADED",
        icon: "solar:danger-triangle-bold",
        textColor: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        dotColor: "bg-amber-500",
        pulseGlow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]",
      };
    case "UNAVAILABLE":
      return {
        label: "UNAVAILABLE",
        icon: "solar:close-circle-bold",
        textColor: "text-rose-600 dark:text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/30",
        dotColor: "bg-rose-500",
        pulseGlow: "shadow-[0_0_12px_rgba(244,63,94,0.3)]",
      };
    case "PAUSED":
      return {
        label: "PAUSED",
        icon: "solar:pause-circle-bold",
        textColor: "text-muted-foreground",
        bgColor: "bg-muted/30",
        borderColor: "border-border",
        dotColor: "bg-muted-foreground",
        pulseGlow: "",
      };
    default:
      return {
        label: "UNKNOWN",
        icon: "solar:question-circle-bold",
        textColor: "text-muted-foreground",
        bgColor: "bg-muted/20",
        borderColor: "border-border",
        dotColor: "bg-muted-foreground",
        pulseGlow: "",
      };
  }
}

export function GuardianPulse({
  monitors,
  onSelectMonitor,
  onAddMonitor,
}: GuardianPulseProps) {
  if (monitors.length === 0) {
    return <GuardianEmpty onAddMonitor={onAddMonitor} />;
  }

  // Bounded nodes for the signature visualization (up to 4 representative monitored nodes)
  const displayNodes = monitors.slice(0, 4);

  return (
    <div className="relative rounded-2xl border border-border/80 bg-surface/90 text-foreground p-6 sm:p-7 overflow-hidden shadow-xs">
      {/* Ambient background subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Decorative subtle signal glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#FA520F]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* TOP: Central Guardian Node */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-xs text-xs font-mono font-medium text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FA520F] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FA520F]" />
            </span>
            <span className="tracking-wide">GUARDIAN CONTROL PLANE</span>
          </div>

          {/* Vertical Stem */}
          <div className="w-px h-6 bg-linear-to-b from-border to-[#FA520F]/40" />

          {/* Compact Health Signal Badge */}
          <div className="px-2.5 py-0.5 rounded-full bg-[#FA520F]/10 border border-[#FA520F]/30 text-[#FA520F] text-[10px] font-mono font-bold tracking-wider uppercase">
            EDGE HEALTH SIGNAL
          </div>

          <div className="w-px h-6 bg-linear-to-b from-[#FA520F]/40 to-border" />
        </div>

        {/* BOTTOM: Connected Monitored Nodes */}
        <div className="w-full max-w-4xl">
          {/* Connecting Horizontal Line (desktop) */}
          {displayNodes.length > 1 && (
            <div className="hidden sm:block relative w-full mb-4">
              <div className="h-px w-full bg-border" />
              {/* Connector dots */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-[#FA520F]" />
            </div>
          )}

          {/* Monitored Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayNodes.map((m) => {
              const visual = getHealthVisual(m.currentHealth);
              let hostname = m.destinationUrl;
              try {
                hostname = new URL(m.destinationUrl).hostname;
              } catch {}

              const recentLatency =
                m.recentObservations.length > 0
                  ? `${m.recentObservations[0].durationMs}ms`
                  : null;

              return (
                <TooltipProvider key={m.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelectMonitor(m)}
                        className={`group text-left p-3.5 rounded-xl border bg-background/90 hover:bg-surface transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs hover:border-[#FA520F]/40 ${visual.borderColor} ${visual.pulseGlow}`}
                      >
                        {/* Card Header: Health state & dot */}
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${visual.bgColor} ${visual.textColor}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${visual.dotColor}`} />
                            {visual.label}
                          </span>

                          {recentLatency && (
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {recentLatency}
                            </span>
                          )}
                        </div>

                        {/* Destination Identity */}
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-foreground truncate group-hover:text-[#FA520F] transition-colors">
                            {hostname}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate font-mono">
                            {m.qrName || m.name}
                          </div>
                        </div>

                        {/* Footer: Mini observation indicators */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                          <span className="font-mono">
                            {m.fallbackConfig?.readiness === "READY"
                              ? "Fallback ready"
                              : "No fallback"}
                          </span>
                          <div className="flex items-center gap-1">
                            {m.recentObservations.slice(0, 5).map((obs) => (
                              <span
                                key={obs.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  obs.result === "HEALTHY"
                                    ? "bg-emerald-500"
                                    : obs.result === "DEGRADED"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs font-mono">
                      <div>Target: {m.destinationUrl}</div>
                      <div>Policy: {m.failureThreshold} fails threshold</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* If there are more monitors not shown in pulse */}
          {monitors.length > 4 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-muted-foreground font-mono">
                + {monitors.length - 4} more monitored destinations active below
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
