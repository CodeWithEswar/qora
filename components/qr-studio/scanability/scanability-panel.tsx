import * as React from "react";
import {
  ScanabilityChannelId,
  ScanabilityResultV1,
  ScanabilityTargetControl,
} from "@nxtqr/qr-core";
import { SignalStrip } from "./signal-strip";
import { DiagnosticRail } from "./diagnostic-rail";
import { DiagnosticDetail } from "./diagnostic-detail";
import { DiagnosticTrace } from "./diagnostic-trace";
import { ScanabilityNotReady } from "./states/scanability-not-ready";
import { ScanabilityError } from "./states/scanability-error";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sliders } from "lucide-react";

interface ScanabilityPanelProps {
  scanability: ScanabilityResultV1;
  activeChannel: ScanabilityChannelId;
  onSelectChannel: (channel: ScanabilityChannelId) => void;
  onHoverFinding?: (channel: ScanabilityChannelId | null) => void;
  onJumpToControl?: (target: ScanabilityTargetControl) => void;
  onApplyFix?: (fixValue: unknown, targetControl?: ScanabilityTargetControl) => void;
  onRetry?: () => void;
  defaultExpanded?: boolean;
}

export function ScanabilityPanel({
  scanability,
  activeChannel,
  onSelectChannel,
  onHoverFinding,
  onJumpToControl,
  onApplyFix,
  onRetry,
  defaultExpanded = false,
}: ScanabilityPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  if (scanability.status === "not_ready") {
    return <ScanabilityNotReady />;
  }

  if (scanability.status === "error") {
    return <ScanabilityError message={scanability.errorMessage} onRetry={onRetry} />;
  }

  // Active check
  const activeCheck =
    scanability.checks.find((c) => c.channel === activeChannel) ||
    scanability.checks[0];

  // Channel-specific findings
  const channelFindings = scanability.findings.filter(
    (f) => f.channel === activeChannel
  );

  return (
    <div className="border border-border bg-surface-elevated/40 rounded-xl overflow-hidden shadow-2xs select-none">
      {/* 1. Collapsed Signature Bar */}
      <div className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface">
        <SignalStrip
          status={scanability.status}
          score={scanability.score}
          checks={scanability.checks}
          activeChannel={isExpanded ? activeChannel : null}
          onSelectChannel={(ch) => {
            onSelectChannel(ch);
            setIsExpanded(true);
          }}
          recommendationsCount={scanability.recommendationsCount}
          blockersCount={scanability.blockersCount}
          compact={false}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 text-xs gap-1.5 cursor-pointer font-medium"
        >
          <Sliders className="h-3 w-3 text-primary" />
          <span>{isExpanded ? "Collapse" : "Inspect"}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* 2. Expanded Diagnostic Workbench */}
      {isExpanded && (
        <div className="p-4 border-t border-border space-y-4 bg-surface-elevated/20 animate-in fade-in duration-200">
          {/* Five Channel Rail */}
          <DiagnosticRail
            checks={scanability.checks}
            activeChannel={activeChannel}
            onSelectChannel={onSelectChannel}
          />

          {/* Active Channel Diagnostic Detail */}
          {activeCheck && (
            <DiagnosticDetail
              check={activeCheck}
              findings={channelFindings}
              onJumpToControl={onJumpToControl}
              onApplyFix={onApplyFix}
            />
          )}

          {/* Transparent Score Breakdown (Rules 46, 47) */}
          {scanability.scoreBreakdown && scanability.scoreBreakdown.deductions.length > 0 && (
            <div className="p-3 rounded-lg border border-border bg-surface text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-muted-foreground text-[10px] uppercase tracking-wider">
                <span>Score Methodology Breakdown</span>
                <span>Base: 100</span>
              </div>
              <div className="space-y-1 pt-1 border-t border-border/60">
                {scanability.scoreBreakdown.deductions.map((d) => (
                  <div key={d.channel} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      - {d.channel.toUpperCase()}: {d.reason}
                    </span>
                    <span className="text-destructive font-bold">-{d.penalty}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t border-border/80 font-bold text-foreground">
                  <span>FINAL DETERMINISTIC SCORE</span>
                  <span className="text-primary">{scanability.scoreBreakdown.final} / 100</span>
                </div>
              </div>
            </div>
          )}

          {/* All Findings Diagnostic Trace */}
          {scanability.findings.length > 0 && (
            <DiagnosticTrace
              findings={scanability.findings}
              onHoverFinding={onHoverFinding}
              onJumpToControl={onJumpToControl}
              onApplyFix={onApplyFix}
            />
          )}
        </div>
      )}
    </div>
  );
}
