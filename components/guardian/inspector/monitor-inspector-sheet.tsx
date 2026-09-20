"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianMonitorSummaryV1 } from "@nxtqr/contracts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HealthRibbon } from "../health-ribbon";
import { toast } from "sonner";

interface MonitorInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitor: GuardianMonitorSummaryV1 | null;
  onRunCheck: (monitor: GuardianMonitorSummaryV1) => void;
  onConfigureFallback: (monitor: GuardianMonitorSummaryV1) => void;
  onTogglePause: (monitor: GuardianMonitorSummaryV1) => void;
  onDeleteMonitor: (monitor: GuardianMonitorSummaryV1) => void;
}

export function MonitorInspectorSheet({
  open,
  onOpenChange,
  monitor,
  onRunCheck,
  onConfigureFallback,
  onTogglePause,
  onDeleteMonitor,
}: MonitorInspectorSheetProps) {
  if (!monitor) return null;

  const isHealthy = monitor.currentHealth === "HEALTHY";
  const isDegraded = monitor.currentHealth === "DEGRADED";
  const isUnavailable = monitor.currentHealth === "UNAVAILABLE";
  const isPaused = monitor.status === "PAUSED";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-surface text-foreground border-border p-6 overflow-y-auto space-y-6">
        <SheetHeader className="space-y-1 text-left border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20">
              MONITOR INSPECTOR
            </span>
            <Badge
              variant={isHealthy ? "outline" : isUnavailable ? "danger" : "secondary"}
              className="text-[10px] font-mono gap-1"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isHealthy
                    ? "bg-emerald-500"
                    : isDegraded
                    ? "bg-amber-500"
                    : isUnavailable
                    ? "bg-rose-500"
                    : "bg-muted-foreground"
                }`}
              />
              {monitor.currentHealth}
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold font-serif break-all">
            {monitor.name}
          </SheetTitle>
          <SheetDescription className="text-xs font-mono break-all text-muted-foreground">
            {monitor.destinationUrl}
          </SheetDescription>
        </SheetHeader>

        {/* Quick Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => onRunCheck(monitor)}
            className="text-xs h-8 px-3 gap-1.5 bg-[#FA520F] hover:bg-[#E0480C] text-white cursor-pointer"
          >
            <Icon icon="solar:refresh-linear" className="w-3.5 h-3.5" />
            <span>Run Health Check</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigureFallback(monitor)}
            className="text-xs h-8 px-3 gap-1.5 border-border cursor-pointer"
          >
            <Icon icon="solar:restart-square-linear" className="w-3.5 h-3.5" />
            <span>Fallback</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTogglePause(monitor)}
            className="text-xs h-8 px-3 gap-1.5 border-border cursor-pointer"
          >
            <Icon
              icon={isPaused ? "solar:play-circle-linear" : "solar:pause-circle-linear"}
              className="w-3.5 h-3.5"
            />
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </Button>
        </div>

        {/* Mini Health Ribbon */}
        <div className="space-y-1">
          <HealthRibbon monitors={[monitor]} selectedMonitor={monitor} />
        </div>

        {/* Configuration Specs */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            Monitoring Policy
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check Frequency:</span>
              <span className="text-foreground">Every {Math.round(monitor.checkIntervalSec / 60)} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failure Threshold:</span>
              <span className="text-foreground">{monitor.failureThreshold} consecutive fails</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recovery Threshold:</span>
              <span className="text-foreground">{monitor.recoveryThreshold} consecutive successes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Probe Timeout:</span>
              <span className="text-foreground">{monitor.timeoutMs}ms</span>
            </div>
          </div>
        </div>

        {/* Fallback Configuration */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            Recovery State
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Readiness:</span>
              <span className="text-foreground font-semibold">
                {monitor.fallbackConfig?.readiness || "NOT_CONFIGURED"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target URL:</span>
              <span className="text-foreground truncate max-w-[200px]">
                {monitor.fallbackConfig?.backupUrl || "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-Switch:</span>
              <span className="text-foreground">
                {monitor.fallbackConfig?.autoSwitch ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Observation Log */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            Recent Observations Stream
          </h4>
          <div className="space-y-1.5">
            {monitor.recentObservations.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground font-mono">
                No observations recorded yet.
              </div>
            ) : (
              monitor.recentObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-2.5 rounded-lg border border-border bg-background flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        obs.result === "HEALTHY"
                          ? "bg-emerald-500"
                          : obs.result === "DEGRADED"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                    <span className="text-foreground font-semibold">{obs.result}</span>
                    {obs.httpStatus && (
                      <span className="text-muted-foreground">HTTP {obs.httpStatus}</span>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <div>{obs.durationMs}ms</div>
                    <div>{new Date(obs.observedAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDeleteMonitor(monitor);
              onOpenChange(false);
            }}
            className="w-full text-xs h-9 gap-1.5 cursor-pointer"
          >
            <Icon icon="solar:trash-bin-trash-linear" className="w-3.5 h-3.5" />
            <span>Delete This Monitor</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
