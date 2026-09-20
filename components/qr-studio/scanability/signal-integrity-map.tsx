import * as React from "react";
import {
  QrDesignV1,
  ScanabilityChannelId,
  ScanabilityCheckResult,
  ScanabilityResultV1,
} from "@nxtqr/qr-core";
import { DiagnosticOverlay } from "./diagnostic-overlay";
import { ScanPass } from "./scan-pass";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SignalIntegrityMapProps {
  svgMarkup: string;
  design?: QrDesignV1;
  scanability: ScanabilityResultV1;
  activeChannel: ScanabilityChannelId;
  onSelectChannel: (channel: ScanabilityChannelId) => void;
  hoveredFindingChannel: ScanabilityChannelId | null;
  surfaceBg?: string;
  zoom: number;
}

interface ChannelDef {
  id: ScanabilityChannelId;
  num: string;
  shortLabel: string;
  getValue: (chk?: ScanabilityCheckResult) => string;
}

const CHANNELS: ChannelDef[] = [
  {
    id: "contrast",
    num: "01",
    shortLabel: "CONTRAST",
    getValue: (chk) => (chk?.measurements.ratio ? String(chk.measurements.ratio) : "—"),
  },
  {
    id: "quiet_zone",
    num: "02",
    shortLabel: "QUIET",
    getValue: (chk) => (chk?.measurements.modules !== undefined ? `${chk.measurements.modules}M` : "—"),
  },
  {
    id: "logo_area",
    num: "03",
    shortLabel: "LOGO",
    getValue: (chk) =>
      chk?.measurements.coveragePercent !== undefined ? `${chk.measurements.coveragePercent}%` : "—",
  },
  {
    id: "module_size",
    num: "04",
    shortLabel: "MODULE",
    getValue: (chk) =>
      chk?.measurements.matrixSize !== undefined ? `${chk.measurements.matrixSize}M` : "—",
  },
  {
    id: "recovery",
    num: "05",
    shortLabel: "RECOVERY",
    getValue: (chk) => (chk?.measurements.level ? String(chk.measurements.level) : "—"),
  },
];

export function SignalIntegrityMap({
  svgMarkup,
  design,
  scanability,
  activeChannel,
  onSelectChannel,
  hoveredFindingChannel,
  surfaceBg,
  zoom,
}: SignalIntegrityMapProps) {
  const [isOverlayEnabled, setIsOverlayEnabled] = React.useState(false);
  const geometry = scanability.geometry;

  // Extract exact viewBox dimensions from authoritative rendered SVG
  const viewBoxMatch = React.useMemo(() => {
    return svgMarkup.match(/viewBox=["']0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/);
  }, [svgMarkup]);

  const svgWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 330;
  const svgHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 330;
  const aspectRatio = `${svgWidth} / ${svgHeight}`;

  // Retrieve channel check by id
  const getCheck = (channel: ScanabilityChannelId) =>
    scanability.checks.find((c) => c.channel === channel);

  return (
    <div className="flex flex-col items-center space-y-3 select-none w-full max-w-full overflow-hidden">
      {/* Overlay Toggle & Map Header */}
      <div className="w-full flex items-center justify-between px-1 text-xs gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Signal Integrity Map
          </span>
          {geometry && (
            <span className="font-mono text-[10px] text-muted-foreground/80 whitespace-nowrap hidden xs:inline">
              {geometry.matrixSize}×{geometry.matrixSize} Matrix
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Label
            htmlFor="overlay-switch"
            className="text-[11px] text-muted-foreground cursor-pointer font-medium whitespace-nowrap"
          >
            Diagnostic Overlay
          </Label>
          <Switch
            id="overlay-switch"
            checked={isOverlayEnabled}
            onCheckedChange={setIsOverlayEnabled}
            className="scale-85"
          />
        </div>
      </div>

      {/* Center QR Vector Diagnostic Surface with Scalable Orthogonal Frame */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-surface-elevated/20 overflow-hidden shadow-2xs"
        style={surfaceBg ? { backgroundColor: surfaceBg } : undefined}
      >
        {/* Restrained single scan pass on active channel switch */}
        <ScanPass triggerKey={activeChannel} />

        {/* Scalable Orthogonal Technical Frame Lines */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none stroke-border/70"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Corner tick marks */}
          <path d="M 4 8 L 4 4 L 8 4" fill="none" strokeWidth="0.8" />
          <path d="M 96 8 L 96 4 L 92 4" fill="none" strokeWidth="0.8" />
          <path d="M 4 92 L 4 96 L 8 96" fill="none" strokeWidth="0.8" />
          <path d="M 96 92 L 96 96 L 92 96" fill="none" strokeWidth="0.8" />

          {/* Orthogonal measurement axes */}
          <line x1="50" y1="2" x2="50" y2="6" strokeWidth="0.6" strokeDasharray="1 1" />
          <line x1="50" y1="94" x2="50" y2="98" strokeWidth="0.6" strokeDasharray="1 1" />
          <line x1="2" y1="50" x2="6" y2="50" strokeWidth="0.6" strokeDasharray="1 1" />
          <line x1="94" y1="50" x2="98" y2="50" strokeWidth="0.6" strokeDasharray="1 1" />
        </svg>

        {/* The Live QR Code Canvas + SVG Diagnostic Layer */}
        <div
          className="relative transition-transform duration-150 flex items-center justify-center drop-shadow-sm rounded-xl overflow-hidden"
          style={{
            aspectRatio,
            width: svgWidth >= svgHeight ? "100%" : "auto",
            height: svgHeight >= svgWidth ? "100%" : "auto",
            maxWidth: "280px",
            maxHeight: "300px",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        >
          {/* Authoritative Vector SVG Render */}
          <div
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
          />

          {/* Technical SVG Diagnostic Overlay (Overlaid precisely on top of the QR) */}
          {isOverlayEnabled && (
            <DiagnosticOverlay
              geometry={geometry}
              design={design}
              svgMarkup={svgMarkup}
              scanability={scanability}
              activeChannel={activeChannel}
              hoveredFindingChannel={hoveredFindingChannel}
              showFinderAnchors={true}
            />
          )}
        </div>
      </div>

      {/* Responsive 5-Channel Diagnostic Selector Rail */}
      <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
        {CHANNELS.map((ch) => {
          const check = getCheck(ch.id);
          const isActive = activeChannel === ch.id;
          const isHovered = hoveredFindingChannel === ch.id;
          const status = check?.status || "pass";
          const glyph =
            status === "blocking" ? "■!" : status === "warning" ? "△" : status === "notice" ? "◇" : "●";

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChannel(ch.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-center font-mono transition-all cursor-pointer border select-none ${
                isActive
                  ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                  : isHovered
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : status === "blocking"
                  ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15"
                  : status === "warning"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/15"
                  : "bg-surface text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              }`}
              aria-label={`Inspect ${ch.shortLabel} channel`}
            >
              <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase">
                <span className="opacity-80">{ch.num}</span>
                <span>{ch.shortLabel}</span>
                <span className="text-[8px] ml-0.5">{glyph}</span>
              </div>
              <div className="text-[11px] font-semibold tabular-nums mt-0.5">
                {ch.getValue(check)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
