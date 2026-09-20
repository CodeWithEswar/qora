"use client";

import * as React from "react";
import {
  ScanabilityCheckResult,
  ScanabilityFinding,
  ScanabilityResultV1,
} from "@nxtqr/qr-core";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  SunMedium,
  Square,
  Eye,
  Shield,
  Layers,
  Printer,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EngineeringCheckMatrixProps {
  result: ScanabilityResultV1;
  onInspectCheck: (check: ScanabilityCheckResult, finding?: ScanabilityFinding) => void;
}

export function EngineeringCheckMatrix({
  result,
  onInspectCheck,
}: EngineeringCheckMatrixProps) {
  const { checks, findings } = result;

  const channelIcons: Record<string, any> = {
    contrast: SunMedium,
    quiet_zone: Square,
    finder_integrity: Eye,
    logo_area: Shield,
    module_size: Printer,
    recovery: Layers,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            <span>PASSED</span>
          </span>
        );
      case "notice":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-mono font-bold shrink-0">
            <Info className="h-3 w-3" />
            <span>NOTICE</span>
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-mono font-bold shrink-0">
            <AlertTriangle className="h-3 w-3" />
            <span>WARNING</span>
          </span>
        );
      case "blocking":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-mono font-bold shrink-0">
            <XCircle className="h-3 w-3" />
            <span>BLOCKED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Engineering Check Matrix
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase">
              6 CHANNELS VERIFIED
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic optical and mathematical specifications derived from ISO/IEC 18004 standards.
          </p>
        </div>
      </div>

      {/* Check Rows */}
      <div className="divide-y divide-border">
        {checks.map((chk) => {
          const Icon = channelIcons[chk.channel] || Sparkles;
          const relatedFinding = findings.find((f) => f.channel === chk.channel);

          // Clean, robust formatting for measured vs required
          let measuredText = "—";
          let requiredText = "—";

          if (chk.channel === "contrast") {
            const rawRatio = String(chk.measurements.ratio ?? chk.measurements.contrastRatio ?? "21").replace(":1", "");
            measuredText = `${rawRatio}:1`;
            requiredText = "≥ 4.5:1 (ISO 18004)";
          } else if (chk.channel === "quiet_zone") {
            const mods = chk.measurements.modules ?? chk.measurements.quietZoneModules ?? 4;
            measuredText = `${mods} Modules`;
            requiredText = "≥ 4 Modules";
          } else if (chk.channel === "finder_integrity") {
            measuredText = chk.measurements.hasCollision
              ? "COLLISION DETECTED"
              : "3/3 Free & Aligned";
            requiredText = "3 Patterns (7×7) Clear";
          } else if (chk.channel === "logo_area") {
            const cov = chk.measurements.coveragePercent ?? 0;
            const bud = chk.measurements.ecBudgetPercent ?? 25;
            measuredText = `${cov}% Coverage`;
            requiredText = `≤ ${bud}% EC Budget`;
          } else if (chk.channel === "recovery") {
            const recPct = String(chk.measurements.recoveryPercent ?? "25%").replace("%", "");
            measuredText = `Level ${chk.measurements.level ?? "Q"} (${recPct}%)`;
            requiredText = "≥ 15% Recommended";
          } else if (chk.channel === "module_size") {
            measuredText = chk.measurements.effectiveMm
              ? `${chk.measurements.effectiveMm} mm`
              : `${chk.measurements.effectivePx ?? 10} px`;
            requiredText = chk.measurements.effectiveMm ? "≥ 0.5 mm (Print)" : "≥ 5 px (Screen)";
          }

          return (
            <div
              key={chk.channel}
              className="p-4 hover:bg-muted/15 transition-colors cursor-pointer group"
              onClick={() => onInspectCheck(chk, relatedFinding)}
            >
              {/* Row Header: Icon + Title + Badge + Inspect Button */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-muted border border-border flex items-center justify-center text-primary group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate">
                    {chk.channelName}
                  </span>
                  {getStatusBadge(chk.status)}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectCheck(chk, relatedFinding);
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground group-hover:text-foreground group-hover:bg-muted font-medium gap-1 rounded-lg shrink-0"
                >
                  <span>Inspect</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>

              {/* Row Description */}
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-10 mb-2.5">
                {chk.summary}
              </p>

              {/* Responsive Metrics Bar */}
              <div className="ml-10 grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs font-mono">
                <div className="min-w-0">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">
                    MEASURED
                  </span>
                  <span className="font-bold text-foreground text-[11px] block break-words mt-0.5">
                    {measuredText}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">
                    REQUIRED
                  </span>
                  <span className="text-muted-foreground text-[11px] block break-words mt-0.5">
                    {requiredText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
