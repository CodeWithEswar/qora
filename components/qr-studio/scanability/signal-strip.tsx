import * as React from "react";
import {
  ScanabilityChannelId,
  ScanabilityCheckResult,
  ScanabilitySeverity,
  ScanabilityStatus,
} from "@nxtqr/qr-core";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SignalStripProps {
  status: ScanabilityStatus;
  score?: number;
  checks: ScanabilityCheckResult[];
  activeChannel?: ScanabilityChannelId | null;
  onSelectChannel: (channel: ScanabilityChannelId) => void;
  recommendationsCount: number;
  blockersCount: number;
  compact?: boolean;
}

const GLYPHS: Record<ScanabilitySeverity, string> = {
  pass: "●",
  notice: "◇",
  warning: "△",
  blocking: "■!",
};

export function SignalStrip({
  status,
  score,
  checks,
  activeChannel,
  onSelectChannel,
  recommendationsCount,
  blockersCount,
  compact = false,
}: SignalStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 select-none">
      {/* 5-Node Geometric Signal Rail */}
      <TooltipProvider delayDuration={150}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">
            Signal
          </span>

        {checks.map((chk, index) => {
          const isActive = activeChannel === chk.channel;
          const glyph = GLYPHS[chk.status] || "●";

          return (
            <React.Fragment key={chk.channel}>
              {index > 0 && (
                <div
                  className={`h-0.5 w-2 sm:w-3.5 transition-colors ${
                    chk.status === "blocking"
                      ? "bg-destructive/40"
                      : chk.status === "warning"
                      ? "bg-amber-500/40"
                      : "bg-border"
                  }`}
                />
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectChannel(chk.channel)}
                    className={`h-6 min-w-6 px-1.5 rounded-md flex items-center justify-center gap-1 font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20"
                        : chk.status === "blocking"
                        ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                        : chk.status === "warning"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                        : chk.status === "notice"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                        : "bg-surface text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                    aria-label={`Inspect ${chk.label} (Status: ${chk.status})`}
                  >
                    <span className="text-[9px] opacity-75">{chk.channelNumber}</span>
                    <span className="text-[10px]">{glyph}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{chk.label}</p>
                  <p className="text-[11px] text-muted-foreground">{chk.summary}</p>
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          );
        })}
        </div>
      </TooltipProvider>

      {/* Signal Status Pill & Score Indicator */}
      <div className="flex items-center gap-2.5">
        {status === "not_ready" ? (
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Waiting for Content
          </span>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  status === "blocking"
                    ? "text-destructive"
                    : status === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {status === "blocking"
                  ? "Blocked"
                  : status === "warning"
                  ? "Review"
                  : "Ready"}
              </span>

              {score !== undefined && (
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-surface border border-border text-foreground">
                  {score}
                </span>
              )}
            </div>

            {!compact && recommendationsCount > 0 && (
              <span className="text-[10px] text-muted-foreground hidden md:inline">
                {recommendationsCount} recommendation{recommendationsCount > 1 ? "s" : ""}
              </span>
            )}
            {!compact && blockersCount > 0 && (
              <span className="text-[10px] text-destructive font-semibold hidden md:inline">
                {blockersCount} blocker{blockersCount > 1 ? "s" : ""}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
