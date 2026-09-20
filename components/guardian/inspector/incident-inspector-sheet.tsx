"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianIncidentDetailV1 } from "@nxtqr/contracts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface IncidentInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: GuardianIncidentDetailV1 | null;
}

export function IncidentInspectorSheet({
  open,
  onOpenChange,
  incident,
}: IncidentInspectorSheetProps) {
  if (!incident) return null;

  const isOpen = incident.status === "OPEN";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-surface text-foreground border-border p-6 overflow-y-auto space-y-6">
        <SheetHeader className="space-y-1 text-left border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20">
              INCIDENT DETAIL
            </span>
            <Badge
              variant={isOpen ? "danger" : "outline"}
              className="text-[10px] font-mono"
            >
              {incident.status}
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold font-serif break-all">
            {incident.destinationUrl}
          </SheetTitle>
          <SheetDescription className="text-xs font-mono text-muted-foreground">
            Target QR: {incident.qrName || "Direct Resource"}
          </SheetDescription>
        </SheetHeader>

        {/* Incident Summary Card */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Failure Reason:</span>
            <span className="text-rose-500 font-semibold">{incident.failureReason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started:</span>
            <span className="text-foreground">{new Date(incident.startedAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resolved:</span>
            <span className="text-foreground">
              {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : "Active Incident"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fallback Redirection:</span>
            <span className="text-foreground">
              {incident.fallbackTriggered ? "Activated" : "Not Triggered"}
            </span>
          </div>
        </div>

        {/* Diagnostic Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            Operational Progress
          </h4>
          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {incident.timelineEvents.map((evt, idx) => (
              <div key={idx} className="relative text-xs">
                <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#FA520F]" />
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground text-xs">{evt.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {evt.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routing Impact */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            Edge Routing State
          </h4>
          <div className="p-3 rounded-lg border border-border bg-background text-xs text-muted-foreground leading-relaxed">
            While this incident is open, edge resolvers consult Guardian's published compact signal to steer scan traffic safely away from the degraded endpoint without scan-time latency.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
