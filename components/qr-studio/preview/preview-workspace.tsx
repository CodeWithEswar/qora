import * as React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import {
  QrDesignV1,
  renderQrSvg,
  evaluateScanability,
  ScanabilityResultV1,
  ScanabilityChannelId,
  ScanabilityTargetControl,
} from "@nxtqr/qr-core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignalIntegrityMap } from "../scanability/signal-integrity-map";
import { ScanabilityPanel } from "../scanability/scanability-panel";

interface PreviewWorkspaceProps {
  rawContent: string;
  design: QrDesignV1;
  isFullscreenOpen: boolean;
  onCloseFullscreen: () => void;
  onOpenFullscreen: () => void;
  onJumpToControl?: (target: ScanabilityTargetControl) => void;
  onApplyFix?: (fixValue: unknown, targetControl?: ScanabilityTargetControl) => void;
}

export function PreviewWorkspace({
  rawContent,
  design,
  isFullscreenOpen,
  onCloseFullscreen,
  onOpenFullscreen,
  onJumpToControl,
  onApplyFix,
}: PreviewWorkspaceProps) {
  const [surface, setSurface] = React.useState<"light" | "cream" | "dark">("light");
  const [zoom, setZoom] = React.useState(100);
  const [activeChannel, setActiveChannel] = React.useState<ScanabilityChannelId>("contrast");
  const [hoveredFindingChannel, setHoveredFindingChannel] = React.useState<ScanabilityChannelId | null>(null);

  // 1. Generate live SVG markup deterministically
  const svgMarkup = React.useMemo(() => {
    try {
      return renderQrSvg({
        content: rawContent || " ",
        design,
        moduleSize: 10,
      });
    } catch {
      return `<svg viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#f4f4f5" /><text x="100" y="100" text-anchor="middle" font-size="12" fill="#71717a">Rendering...</text></svg>`;
    }
  }, [rawContent, design]);

  // 2. Authoritative deterministic scanability (Pure mathematical analysis — ZERO fake scores)
  const scanability: ScanabilityResultV1 = React.useMemo(() => {
    return evaluateScanability(rawContent, design);
  }, [rawContent, design]);

  const zoomIn = () => setZoom((z) => Math.min(150, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(60, z - 10));
  const resetZoom = () => setZoom(100);

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-2xs overflow-hidden">
        {/* Workspace Canvas Header: Surface Toggles & Zoom Controls */}
        <CardHeader className="p-3 sm:p-3.5 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between w-full xl:w-auto min-w-0">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold tracking-tight">2. Live Vector Canvas</CardTitle>
              <CardDescription className="text-xs text-muted-foreground truncate">
                Vector preview & signal map
              </CardDescription>
            </div>

            {/* Maximize Button on narrow column view */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenFullscreen}
              className="h-7 w-7 text-muted-foreground hover:text-foreground xl:hidden shrink-0 cursor-pointer"
              title="Fullscreen Preview"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center justify-between xl:justify-end gap-2 w-full xl:w-auto shrink-0">
            {/* Surface Texture Toggles */}
            <div className="flex items-center gap-0.5 bg-surface-elevated p-0.5 rounded-lg border border-border text-[11px]">
              <button
                type="button"
                onClick={() => setSurface("light")}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  surface === "light"
                    ? "bg-surface text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setSurface("cream")}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  surface === "cream"
                    ? "bg-surface text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cream
              </button>
              <button
                type="button"
                onClick={() => setSurface("dark")}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  surface === "dark"
                    ? "bg-surface text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dark
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded-lg border border-border text-xs">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="p-1 hover:text-foreground cursor-pointer rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3 w-3" />
                </button>
                <span className="font-mono text-[11px] w-9 text-center tabular-nums">{zoom}%</span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="p-1 hover:text-foreground cursor-pointer rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="p-1 hover:text-foreground cursor-pointer rounded ml-0.5"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>

              {/* Maximize Button on desktop wide view */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenFullscreen}
                className="hidden xl:inline-flex h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                title="Fullscreen Preview"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Canvas Display Surface with Signal Integrity Map */}
        <CardContent
          className={`p-3 sm:p-6 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] transition-colors relative select-none ${
            surface === "light"
              ? "bg-[#fafafa] dark:bg-[#121214]"
              : surface === "cream"
              ? "bg-[#fff8e0] dark:bg-[#28241d]"
              : "bg-[#09090b] text-white"
          }`}
        >
          <SignalIntegrityMap
            svgMarkup={svgMarkup}
            design={design}
            scanability={scanability}
            activeChannel={activeChannel}
            onSelectChannel={setActiveChannel}
            hoveredFindingChannel={hoveredFindingChannel}
            surfaceBg={surface}
            zoom={zoom}
          />
        </CardContent>

        {/* Scanability Diagnostics Workbench */}
        <div className="border-t border-border p-3 sm:p-4 bg-surface-elevated/40">
          <ScanabilityPanel
            scanability={scanability}
            activeChannel={activeChannel}
            onSelectChannel={setActiveChannel}
            onHoverFinding={setHoveredFindingChannel}
            onJumpToControl={onJumpToControl}
            onApplyFix={onApplyFix}
          />
        </div>
      </Card>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={onCloseFullscreen}>
        <DialogContent className="max-w-xl w-[calc(100vw-2rem)] sm:w-full max-h-[calc(100vh-3rem)] p-4 sm:p-6 flex flex-col border-border bg-surface rounded-2xl shadow-2xl overflow-hidden">
          <DialogHeader className="shrink-0 pb-1 sm:pb-2">
            <DialogTitle className="text-sm font-semibold">High-Fidelity QR Preview</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Real-time vector render scaled with quiet zone and frame geometry.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-6 bg-surface-elevated/70 rounded-xl border border-border mt-2 sm:mt-3 overflow-hidden">
            <div
              className="drop-shadow-md flex items-center justify-center max-w-full max-h-full [&_svg]:max-w-full [&_svg]:max-h-[55vh] sm:[&_svg]:max-h-[62vh] [&_svg]:w-auto [&_svg]:h-auto [&_svg]:object-contain"
              dangerouslySetInnerHTML={{
                __html: renderQrSvg({
                  content: rawContent || " ",
                  design,
                  moduleSize: 10,
                }),
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
