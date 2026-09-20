"use client";

import * as React from "react";
import {
  ScanabilityResultV1,
  ScanabilityStatus,
} from "@nxtqr/qr-core";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanabilityVerdictProps {
  result: ScanabilityResultV1;
  onOpenExplainSheet: () => void;
}

export function ScanabilityVerdict({
  result,
  onOpenExplainSheet,
}: ScanabilityVerdictProps) {
  const { status, score, scoreBreakdown, summary, blockersCount, recommendationsCount, checks } =
    result;

  const passedCount = checks.filter((c) => c.status === "pass").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;

  const statusConfig = {
    pass: {
      badge: "PRODUCTION READY",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: CheckCircle2,
      headline: "Optical and Geometric Specifications Compliant",
      subline:
        "Matrix contrast, quiet zone clearances, finder patterns, and error recovery exceed standard commercial scanning thresholds.",
    },
    notice: {
      badge: "PRODUCTION READY (MINOR NOTICES)",
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: Info,
      headline: "Specifications Compliant with Advisory Notices",
      subline:
        "Code is safe for distribution and print. Minor advisory notices available to optimize recognition speed.",
    },
    warning: {
      badge: "SUBOPTIMAL — REVIEW RECOMMENDED",
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: AlertTriangle,
      headline: "Physical Scan Performance May Degrade",
      subline:
        "One or more parameters (contrast, logo headroom, or physical print size) are suboptimal and may cause scan friction under glare or distance.",
    },
    blocking: {
      badge: "BLOCKED — DO NOT PRINT OR PUBLISH",
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/30",
      icon: XCircle,
      headline: "Critical Geometry / Contrast Violation",
      subline:
        "The QR code cannot be reliably decoded by standard smartphone camera sensors. Review and resolve blocking issues immediately.",
    },
    not_ready: {
      badge: "AWAITING CONFIGURATION",
      color: "text-muted-foreground",
      bg: "bg-muted border-border",
      icon: HelpCircle,
      headline: "Incomplete QR Configuration",
      subline: "Provide QR destination content to begin engineering analysis.",
    },
    error: {
      badge: "ANALYSIS ERROR",
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/30",
      icon: XCircle,
      headline: "Computation Failure",
      subline: result.errorMessage || "Scanability analysis could not be computed.",
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-border bg-card shadow-xs font-sans">
      <div className="space-y-4">
        {/* Header with Status Badge and Score */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold tracking-wide uppercase mb-2.5 ${statusConfig.bg} ${statusConfig.color}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{statusConfig.badge}</span>
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              {statusConfig.headline}
            </h2>
          </div>

          {score !== undefined && (
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                  {score}
                </span>
                <span className="text-xs font-mono text-muted-foreground">/100</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                SIGNAL INDEX
              </span>
            </div>
          )}
        </div>

        {/* Subline Explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {statusConfig.subline}
        </p>

        {/* Deductions Breakdown if any */}
        {scoreBreakdown && scoreBreakdown.deductions.length > 0 && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
              <span>SCORE CALCULATION</span>
              <span>BASE 100</span>
            </div>
            {scoreBreakdown.deductions.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] text-amber-500">
                <span className="truncate pr-2">&bull; {d.reason}</span>
                <span className="shrink-0 font-bold">-{d.penalty}</span>
              </div>
            ))}
          </div>
        )}

        {/* Verification Check Counters */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
          <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">PASSED</span>
            <span className="text-base font-bold text-emerald-500">{passedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">WARNINGS</span>
            <span className={`text-base font-bold ${warningCount > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
              {warningCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">BLOCKERS</span>
            <span className={`text-base font-bold ${blockersCount > 0 ? "text-rose-500" : "text-muted-foreground"}`}>
              {blockersCount}
            </span>
          </div>
        </div>
      </div>

      {/* Button to explain verdict */}
      <div className="pt-5 mt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onOpenExplainSheet}
          className="w-full h-9 text-xs font-medium border-border hover:bg-accent/10 justify-between rounded-xl shadow-xs"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Explain Technical Breakdown & Remediation</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
