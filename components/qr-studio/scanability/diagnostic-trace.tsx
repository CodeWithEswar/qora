import * as React from "react";
import {
  ScanabilityChannelId,
  ScanabilityFinding,
  ScanabilityTargetControl,
} from "@nxtqr/qr-core";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Wrench } from "lucide-react";

interface DiagnosticTraceProps {
  findings: ScanabilityFinding[];
  onHoverFinding?: (channel: ScanabilityChannelId | null) => void;
  onJumpToControl?: (target: ScanabilityTargetControl) => void;
  onApplyFix?: (fixValue: unknown, targetControl?: ScanabilityTargetControl) => void;
}

export function DiagnosticTrace({
  findings,
  onHoverFinding,
  onJumpToControl,
  onApplyFix,
}: DiagnosticTraceProps) {
  if (findings.length === 0) return null;

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Engineering Diagnostic Trace ({findings.length})
        </span>
      </div>

      <div className="space-y-3">
        {findings.map((finding) => {
          const isBlocking = finding.blocking || finding.severity === "blocking";
          const glyph = isBlocking ? "■!" : finding.severity === "warning" ? "△" : "◇";

          return (
            <div
              key={finding.id}
              onMouseEnter={() => onHoverFinding?.(finding.channel)}
              onMouseLeave={() => onHoverFinding?.(null)}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                isBlocking
                  ? "border-destructive/40 bg-destructive/5"
                  : finding.severity === "warning"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-blue-500/30 bg-blue-500/5"
              }`}
            >
              {/* Finding Title Header */}
              <div className="flex items-center justify-between font-mono pb-2 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold text-xs ${
                      isBlocking
                        ? "text-destructive"
                        : finding.severity === "warning"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {glyph}
                  </span>
                  <span className="font-bold uppercase tracking-wider text-foreground">
                    {finding.channel.replace("_", " ")} — {finding.title}
                  </span>
                </div>
                <span className="text-[10px] uppercase opacity-75 text-muted-foreground">
                  {finding.code}
                </span>
              </div>

              {/* Vertical Technical Tree Structure */}
              <div className="mt-2.5 font-mono text-[11px] space-y-2 pl-1">
                {/* 1. Observed Evidence */}
                <div>
                  <span className="text-muted-foreground">├─ Observed: </span>
                  <span className="text-foreground font-semibold">
                    {Object.entries(finding.evidence)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(", ")}
                  </span>
                </div>

                {/* 2. Why it matters */}
                <div>
                  <span className="text-muted-foreground">├─ Why it matters: </span>
                  <span className="text-foreground font-sans text-xs">
                    {finding.description}
                  </span>
                </div>

                {/* 3. Suggested Adjustment & Action Buttons */}
                <div className="pt-1">
                  <span className="text-muted-foreground">└─ Suggested adjustment: </span>
                  <span className="text-foreground font-sans text-xs font-medium">
                    {finding.remediation}
                  </span>

                  <div className="mt-2 flex items-center gap-2 pl-4">
                    {finding.suggestedFixValue !== undefined && onApplyFix && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyFix(finding.suggestedFixValue, finding.targetControl)}
                        className="h-7 text-[11px] gap-1 cursor-pointer font-sans"
                      >
                        <Wrench className="h-3 w-3 text-primary" />
                        <span>Apply Recommended Value</span>
                      </Button>
                    )}

                    {finding.targetControl && onJumpToControl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onJumpToControl(finding.targetControl!)}
                        className="h-7 text-[11px] gap-1 cursor-pointer font-sans text-muted-foreground hover:text-foreground"
                      >
                        <span>Jump to control</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
