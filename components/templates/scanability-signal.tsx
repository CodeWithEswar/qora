"use client";

import React, { useMemo } from "react";
import {
  evaluateScanability,
  ScanabilityResultV1,
  QrDesignV1,
} from "@nxtqr/qr-core";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";

interface ScanabilitySignalProps {
  design: QrDesignV1;
  content?: string;
  className?: string;
  compact?: boolean;
}

export function ScanabilitySignal({
  design,
  content = "https://nxtqr.vercel.app/preview",
  className = "",
  compact = false,
}: ScanabilitySignalProps) {
  // Pure mathematical scanability evaluation
  const result: ScanabilityResultV1 = useMemo(() => {
    return evaluateScanability(content, design);
  }, [content, design]);

  const score = result.score ?? 100;
  const isBlocking = result.status === "blocking";
  const hasWarnings = result.status === "warning";

  // Build the 5 core diagnostic channels
  const channels = useMemo(() => {
    const checkMap = new Map(result.checks.map((c) => [c.channel, c]));

    const contrastCheck = checkMap.get("contrast");
    const quietZoneCheck = checkMap.get("quiet_zone");
    const logoCheck = checkMap.get("logo_area");
    const moduleCheck = checkMap.get("module_size");
    const recoveryCheck = checkMap.get("recovery");

    return [
      {
        id: "contrast",
        label: "CONTRAST",
        status: contrastCheck?.status || "pass",
        summary: contrastCheck?.summary || "Adequate luminance delta",
      },
      {
        id: "quiet_zone",
        label: "QUIET ZONE",
        status: quietZoneCheck?.status || "pass",
        summary: quietZoneCheck?.summary || "Unobstructed margin perimeter",
      },
      {
        id: "logo_area",
        label: "LOGO AREA",
        status: logoCheck?.status || "pass",
        summary: logoCheck?.summary || "Safe center footprint within budget",
      },
      {
        id: "module_size",
        label: "MODULE SIZE",
        status: moduleCheck?.status || "pass",
        summary: moduleCheck?.summary || "Matrix density within scan bounds",
      },
      {
        id: "recovery",
        label: "ERROR LEVEL",
        status: recoveryCheck?.status || "pass",
        summary: recoveryCheck?.summary || `Level ${design.errorCorrection} Reed-Solomon capacity`,
      },
    ];
  }, [result, design.errorCorrection]);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {isBlocking ? (
          <Badge variant="danger" className="gap-1 font-mono text-[11px] px-1.5 py-0.5">
            <Icon icon="tabler:alert-triangle" className="h-3 w-3" />
            Scan Risk ({score}%)
          </Badge>
        ) : hasWarnings ? (
          <Badge
            variant="outline"
            className="gap-1 font-mono text-[11px] px-1.5 py-0.5 border-amber-500/40 text-amber-500 bg-amber-500/10"
          >
            <Icon icon="tabler:alert-circle" className="h-3 w-3" />
            {result.recommendationsCount} Warning{result.recommendationsCount > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 font-mono text-[11px] px-1.5 py-0.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          >
            <Icon icon="tabler:check" className="h-3 w-3" />
            Pass ({score}%)
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 rounded-lg border border-border/80 bg-card/60 p-3.5 ${className}`}>
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <Icon
            icon={isBlocking ? "tabler:shield-x" : hasWarnings ? "tabler:shield-alert" : "tabler:shield-check"}
            className={`h-4 w-4 ${
              isBlocking
                ? "text-red-500"
                : hasWarnings
                ? "text-amber-500"
                : "text-emerald-500"
            }`}
          />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
            Scanability Signal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            {score}%
          </span>
          <span className="text-[11px] text-muted-foreground uppercase font-mono">
            {result.status}
          </span>
        </div>
      </div>

      {/* Signal Bars */}
      <div className="space-y-2">
        {channels.map((channel) => {
          const isWarn = channel.status === "warning";
          const isBlock = channel.status === "blocking";

          return (
            <div key={channel.id} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">{channel.label}</span>
                <span
                  className={`font-semibold ${
                    isBlock
                      ? "text-red-500"
                      : isWarn
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {isBlock ? "BLOCKING" : isWarn ? "WARNING" : "PASS"}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className={`h-full transition-all duration-300 ${
                    isBlock
                      ? "w-1/3 bg-red-500"
                      : isWarn
                      ? "w-2/3 bg-amber-500"
                      : "w-full bg-emerald-500"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Findings */}
      {result.findings.length > 0 && (
        <div className="mt-3 border-t border-border/50 pt-2.5 space-y-1.5">
          {result.findings.slice(0, 2).map((finding) => (
            <div
              key={finding.id}
              className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-tight"
            >
              <Icon
                icon={finding.blocking ? "tabler:alert-triangle" : "tabler:info-circle"}
                className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                  finding.blocking ? "text-red-500" : "text-amber-500"
                }`}
              />
              <span>{finding.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
