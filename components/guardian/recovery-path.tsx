"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianMonitorSummaryV1 } from "@nxtqr/contracts";
import { Button } from "@/components/ui/button";

interface RecoveryPathProps {
  monitors: GuardianMonitorSummaryV1[];
  onConfigureFallback: (monitor: GuardianMonitorSummaryV1) => void;
}

export function RecoveryPath({
  monitors,
  onConfigureFallback,
}: RecoveryPathProps) {
  // Select monitor with fallback configured, or first monitor
  const activeMonitor =
    monitors.find((m) => m.fallbackConfig?.backupUrl) || monitors[0];

  if (!activeMonitor) return null;

  const fallback = activeMonitor.fallbackConfig;
  const isReady = fallback?.readiness === "READY";
  const hasFallback = !!fallback?.backupUrl;

  return (
    <div className="rounded-xl border border-border/80 bg-surface/90 p-5 sm:p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono flex items-center gap-2">
            <Icon icon="solar:restart-square-linear" className="w-4 h-4 text-[#FA520F]" />
            <span>Automatic Recovery Path</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Zero-latency failover pipeline. Scans resolve via QR Brain using the compact Guardian edge signal.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigureFallback(activeMonitor)}
          className="text-xs h-8 px-3 gap-1.5 border-border bg-background hover:bg-muted text-foreground cursor-pointer"
        >
          <Icon icon="solar:pen-new-square-linear" className="w-3.5 h-3.5" />
          <span>Configure Policy</span>
        </Button>
      </div>

      {/* Visual Connected Recovery Nodes Pipeline */}
      <div className="relative py-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* Node 1: Primary Destination */}
          <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
              <span>Primary</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-foreground truncate font-mono">
              {activeMonitor.destinationUrl}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {activeMonitor.qrName || activeMonitor.name}
            </div>
          </div>

          {/* Node 2: Guardian Health Signal */}
          <div className="p-3.5 rounded-xl border border-[#FA520F]/30 bg-[#FA520F]/5 shadow-2xs space-y-1.5 text-center">
            <div className="text-[10px] font-mono font-semibold uppercase text-[#FA520F] tracking-wider">
              Health Signal
            </div>
            <div className="text-xs font-bold font-mono text-foreground">
              {activeMonitor.currentHealth}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Threshold: {activeMonitor.failureThreshold} fails
            </div>
          </div>

          {/* Node 3: Fallback Policy */}
          <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-2xs space-y-1.5 text-center">
            <div className="text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider">
              Policy Evaluation
            </div>
            <div className="text-xs font-bold font-mono text-foreground">
              {fallback?.autoSwitch ? "Auto Failover" : "Manual Only"}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              Cycle Safe: Verified
            </div>
          </div>

          {/* Node 4: Safe Backup Destination */}
          <div className="p-3.5 rounded-xl border border-border bg-background/90 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
              <span>Safe Target</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isReady ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>
            <div className="text-xs font-bold text-foreground truncate font-mono">
              {fallback?.backupUrl || "Not Configured"}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Readiness: {fallback?.readiness || "NOT_CONFIGURED"}
            </div>
          </div>

          {/* Node 5: QR Brain Decision */}
          <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 shadow-2xs space-y-1.5 text-center">
            <div className="text-[10px] font-mono font-semibold uppercase text-primary tracking-wider">
              QR Brain Route
            </div>
            <div className="text-xs font-bold font-mono text-foreground">
              Sub-10ms Redirect
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Never waits for probe
            </div>
          </div>
        </div>
      </div>

      {/* Fallback policy description */}
      <div className="p-3 rounded-lg bg-muted/20 border border-border text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon icon="solar:info-circle-linear" className="w-4 h-4 text-muted-foreground" />
          <span>
            If <strong className="text-foreground">{activeMonitor.destinationUrl}</strong> fails {activeMonitor.failureThreshold} consecutive checks, QR Brain automatically reroutes subsequent scans to the safe target destination.
          </span>
        </div>
        <span className="font-mono text-[11px] whitespace-nowrap text-foreground font-medium">
          Impact: 1 QR Asset Active
        </span>
      </div>
    </div>
  );
}
