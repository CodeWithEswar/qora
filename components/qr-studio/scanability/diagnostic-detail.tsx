import * as React from "react";
import {
  ScanabilityCheckResult,
  ScanabilityFinding,
  ScanabilityTargetControl,
} from "@nxtqr/qr-core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Wrench } from "lucide-react";

interface DiagnosticDetailProps {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
  onJumpToControl?: (target: ScanabilityTargetControl) => void;
  onApplyFix?: (fixValue: unknown, targetControl?: ScanabilityTargetControl) => void;
}

export function DiagnosticDetail({
  check,
  findings,
  onJumpToControl,
  onApplyFix,
}: DiagnosticDetailProps) {
  // Channel-specific jump control targets
  const defaultTarget: Record<string, ScanabilityTargetControl> = {
    contrast: "design.colors",
    quiet_zone: "design.quietZone",
    logo_area: "design.logo.size",
    module_size: "export.dimensions",
    recovery: "design.errorCorrection",
  };

  const jumpTarget = defaultTarget[check.channel];

  // Check if any finding has an explicit suggested fix
  const findingWithFix = findings.find((f) => f.suggestedFixValue !== undefined);

  return (
    <div className="p-4 rounded-xl border border-border bg-surface space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary">
            {check.channelNumber}
          </span>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {check.channelName} Diagnostic
          </h4>
        </div>

        <Badge
          variant={
            check.status === "pass"
              ? "success"
              : check.status === "warning"
              ? "warning"
              : check.status === "notice"
              ? "outline"
              : "danger"
          }
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5"
        >
          {check.status}
        </Badge>
      </div>

      {/* Summary Narrative */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {check.summary}
      </p>

      {/* Measured Technical Parameters (Monospace Matrix) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(check.measurements).map(([key, val]) => (
          <div
            key={key}
            className="p-2 rounded-lg border border-border bg-surface-elevated/40"
          >
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block truncate">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="font-mono text-xs font-semibold text-foreground truncate block mt-0.5">
              {String(val)}
            </span>
          </div>
        ))}
      </div>

      {/* Action Controls */}
      <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
        {findingWithFix && onApplyFix && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onApplyFix(findingWithFix.suggestedFixValue, findingWithFix.targetControl)}
            className="h-8 text-xs gap-1.5 bg-primary hover:bg-[#cc3a05] text-white cursor-pointer"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Apply Recommended Fix</span>
          </Button>
        )}

        {jumpTarget && onJumpToControl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onJumpToControl(jumpTarget)}
            className="h-8 text-xs gap-1.5 ml-auto cursor-pointer"
          >
            <span>Open in Inspector</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
