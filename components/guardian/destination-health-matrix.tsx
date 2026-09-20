"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianMonitorSummaryV1, GuardianObservationSummary } from "@nxtqr/contracts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DestinationHealthMatrixProps {
  monitors: GuardianMonitorSummaryV1[];
  onSelectMonitor: (monitor: GuardianMonitorSummaryV1) => void;
}

const COLUMN_LABELS = ["-6", "-5", "-4", "-3", "-2", "-1", "NOW"];

export function DestinationHealthMatrix({
  monitors,
  onSelectMonitor,
}: DestinationHealthMatrixProps) {
  if (monitors.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-surface/90 overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
            <Icon icon="solar:chart-square-linear" className="w-4 h-4 text-[#FA520F]" />
            <span>Destination Health Matrix</span>
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Recent chronological observation windows per monitored destination endpoint
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {monitors.length} {monitors.length === 1 ? "endpoint" : "endpoints"} observed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/10 text-[11px] font-mono text-muted-foreground">
              <th className="py-2.5 pl-4 pr-3 font-medium">Destination Endpoint</th>
              <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Resource</th>
              <th className="px-3 py-2.5 font-medium text-right">Health</th>
              <th className="py-2.5 pl-4 pr-4 text-center font-medium">
                <div className="grid grid-cols-7 gap-1.5 min-w-[140px] max-w-[180px] mx-auto">
                  {COLUMN_LABELS.map((col) => (
                    <span key={col} className="text-[10px] text-muted-foreground/80">
                      {col}
                    </span>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {monitors.map((m) => {
              let hostname = m.destinationUrl;
              try {
                hostname = new URL(m.destinationUrl).hostname;
              } catch {}

              // Reverse so oldest of the 7 is at -6, newest at NOW
              const observations = [...m.recentObservations].reverse();
              // Pad to 7 items if fewer than 7 exist
              const paddedObs: Array<GuardianObservationSummary | null> = [];
              for (let i = 0; i < 7; i++) {
                const obsIndex = i - (7 - observations.length);
                paddedObs.push(obsIndex >= 0 ? observations[obsIndex] : null);
              }

              return (
                <tr
                  key={m.id}
                  onClick={() => onSelectMonitor(m)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  {/* Destination */}
                  <td className="py-3 pl-4 pr-3 max-w-[200px] sm:max-w-xs">
                    <div className="font-medium text-foreground truncate group-hover:text-[#FA520F] transition-colors">
                      {hostname}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground truncate">
                      {m.destinationUrl}
                    </div>
                  </td>

                  {/* Resource */}
                  <td className="px-3 py-3 hidden sm:table-cell font-mono text-[11px] text-muted-foreground max-w-[120px] truncate">
                    {m.qrName || "Direct Destination"}
                  </td>

                  {/* Health State */}
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        m.currentHealth === "HEALTHY"
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                          : m.currentHealth === "DEGRADED"
                          ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                          : m.currentHealth === "UNAVAILABLE"
                          ? "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                          : "text-muted-foreground bg-muted/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          m.currentHealth === "HEALTHY"
                            ? "bg-emerald-500"
                            : m.currentHealth === "DEGRADED"
                            ? "bg-amber-500"
                            : m.currentHealth === "UNAVAILABLE"
                            ? "bg-rose-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      {m.currentHealth}
                    </span>
                  </td>

                  {/* 7 Observation slots */}
                  <td className="py-3 pl-4 pr-4">
                    <TooltipProvider>
                      <div className="grid grid-cols-7 gap-1.5 min-w-[140px] max-w-[180px] mx-auto items-center">
                        {paddedObs.map((obs, idx) => {
                          if (!obs) {
                            return (
                              <div
                                key={idx}
                                className="h-5 w-5 rounded-sm bg-muted/20 border border-border/40 flex items-center justify-center text-[10px] text-muted-foreground/40 font-mono"
                              >
                                ·
                              </div>
                            );
                          }

                          const isHealthy = obs.result === "HEALTHY";
                          const isDegraded = obs.result === "DEGRADED";
                          const cellColor = isHealthy
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                            : isDegraded
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40"
                            : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40";

                          const symbol = isHealthy ? "●" : isDegraded ? "◐" : "×";

                          return (
                            <Tooltip key={obs.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-5 w-5 rounded-sm border flex items-center justify-center text-[10px] font-mono font-bold cursor-help transition-transform hover:scale-110 ${cellColor}`}
                                >
                                  {symbol}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs font-mono space-y-1 p-2">
                                <div className="font-semibold text-foreground">
                                  {obs.result} {obs.httpStatus ? `(HTTP ${obs.httpStatus})` : ""}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  Checked: {new Date(obs.observedAt).toLocaleString()}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  Duration: {obs.durationMs}ms
                                </div>
                                {obs.failureReason && (
                                  <div className="text-[11px] text-rose-500">
                                    Reason: {obs.failureReason}
                                  </div>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
