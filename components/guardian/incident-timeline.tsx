"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianIncidentDetailV1 } from "@nxtqr/contracts";
import { Badge } from "@/components/ui/badge";

interface IncidentTimelineProps {
  incidents: GuardianIncidentDetailV1[];
  onSelectIncident: (incident: GuardianIncidentDetailV1) => void;
}

export function IncidentTimeline({
  incidents,
  onSelectIncident,
}: IncidentTimelineProps) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-surface/60 p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <Icon icon="solar:shield-check-bold" className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-sm font-semibold text-foreground font-serif tracking-wide uppercase">
            NO INCIDENTS IN THIS PERIOD
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Guardian has not recorded a qualifying destination health incident for the selected period. All monitored endpoints satisfy configured reliability policies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
          <Icon icon="solar:bell-bing-bold" className="w-4 h-4 text-[#FA520F]" />
          <span>Operational Incident Center</span>
        </h3>
        <span className="text-[11px] font-mono text-muted-foreground">
          {incidents.length} {incidents.length === 1 ? "incident" : "incidents"} recorded
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {incidents.map((incident) => {
          const isOpen = incident.status === "OPEN";
          const isInvestigating = incident.status === "INVESTIGATING";

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className="rounded-xl border border-border/80 bg-surface/90 hover:bg-surface transition-all duration-150 p-4 sm:p-5 cursor-pointer shadow-2xs hover:shadow-xs group space-y-4"
            >
              {/* Header: Title, status, timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground group-hover:text-[#FA520F] transition-colors">
                      {incident.destinationUrl}
                    </span>
                    <Badge
                      variant={isOpen ? "danger" : "outline"}
                      className="text-[10px] font-mono py-0.2"
                    >
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    Resource: {incident.qrName || "Direct Destination"}
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-muted-foreground">
                  <div>Started: {new Date(incident.startedAt).toLocaleString()}</div>
                  {incident.resolvedAt && (
                    <div className="text-emerald-600 dark:text-emerald-400">
                      Resolved: {new Date(incident.resolvedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Failure summary */}
              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-mono">
                <span className="font-semibold">Reason:</span> {incident.failureReason}
                {incident.fallbackTriggered && (
                  <span className="ml-2 text-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
                    Automatic fallback engaged
                  </span>
                )}
              </div>

              {/* Step-by-step operational timeline events */}
              {incident.timelineEvents.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider">
                    Diagnostic Timeline
                  </div>
                  <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                    {incident.timelineEvents.map((evt, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-[#FA520F]" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-foreground text-[11px]">
                            {evt.title}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {evt.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
