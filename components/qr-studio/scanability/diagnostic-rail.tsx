import * as React from "react";
import {
  ScanabilityChannelId,
  ScanabilityCheckResult,
  ScanabilitySeverity,
} from "@nxtqr/qr-core";

interface DiagnosticRailProps {
  checks: ScanabilityCheckResult[];
  activeChannel: ScanabilityChannelId;
  onSelectChannel: (channel: ScanabilityChannelId) => void;
}

const STATUS_ICONS: Record<ScanabilitySeverity, string> = {
  pass: "●",
  notice: "◇",
  warning: "△",
  blocking: "■!",
};

export function DiagnosticRail({
  checks,
  activeChannel,
  onSelectChannel,
}: DiagnosticRailProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5 p-1 bg-surface-elevated rounded-xl border border-border">
      {checks.map((check) => {
        const isSelected = activeChannel === check.channel;
        const icon = STATUS_ICONS[check.status] || "●";

        return (
          <button
            key={check.channel}
            type="button"
            onClick={() => onSelectChannel(check.channel)}
            className={`p-2 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between select-none relative ${
              isSelected
                ? "bg-surface text-foreground shadow-xs border border-primary/40 ring-1 ring-primary/20"
                : "hover:bg-surface/50 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">
                {check.channelNumber}
              </span>
              <span
                className={`font-mono text-[10px] font-bold ${
                  check.status === "blocking"
                    ? "text-destructive"
                    : check.status === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : check.status === "notice"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {icon}
              </span>
            </div>

            <div className="mt-1">
              <p className="text-[11px] font-bold truncate leading-tight">
                {check.channelName}
              </p>
              <p className="text-[9px] text-muted-foreground truncate uppercase font-mono">
                {check.status}
              </p>
            </div>

            {check.scorePenalty > 0 && (
              <span className="absolute top-1.5 right-1.5 font-mono text-[9px] text-destructive/80 font-semibold">
                -{check.scorePenalty}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
