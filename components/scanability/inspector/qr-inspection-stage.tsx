"use client";

import * as React from "react";
import {
  QrDesignV1,
  ScanabilityGeometry,
  ScanabilityResultV1,
} from "@nxtqr/qr-core";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Shield,
  Square,
  Grid,
  SunMedium,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverlayLayerId } from "../types";

interface QrInspectionStageProps {
  svgMarkup: string;
  design: QrDesignV1;
  geometry?: ScanabilityGeometry;
  scanability: ScanabilityResultV1;
  activeOverlays: Set<OverlayLayerId>;
  onToggleOverlay: (layer: OverlayLayerId) => void;
}

export function QrInspectionStage({
  svgMarkup,
  design,
  geometry,
  scanability,
  activeOverlays,
  onToggleOverlay,
}: QrInspectionStageProps) {
  const [zoom, setZoom] = React.useState<number>(1);

  // Extract dimensions from SVG or fallback
  const matrixSize = geometry?.matrixSize ?? 29;
  const quietZone = Math.max(1, design.quietZone ?? geometry?.quietZoneModules ?? 4);
  const totalModuleWidth = matrixSize + quietZone * 2;
  const moduleSize = 10;
  const totalPixelSize = totalModuleWidth * moduleSize;

  const matrixX = quietZone * moduleSize;
  const matrixY = quietZone * moduleSize;
  const matrixPixelSize = matrixSize * moduleSize;
  const finderSize = 7 * moduleSize;

  // Center box for logo safety
  const centerBox = geometry?.centerBox ?? {
    xStart: Math.floor((matrixSize - 7) / 2),
    yStart: Math.floor((matrixSize - 7) / 2),
    size: 7,
  };
  const logoBoxX = matrixX + centerBox.xStart * moduleSize;
  const logoBoxY = matrixY + centerBox.yStart * moduleSize;
  const logoBoxSize = centerBox.size * moduleSize;

  // Status indicators for overlays
  const contrastCheck = scanability.checks.find((c) => c.channel === "contrast");
  const quietCheck = scanability.checks.find((c) => c.channel === "quiet_zone");
  const finderCheck = scanability.checks.find((c) => c.channel === "finder_integrity");
  const logoCheck = scanability.checks.find((c) => c.channel === "logo_area");

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden font-sans">
      {/* Top Overlay Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/30 border-b border-border text-xs">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-mono text-muted-foreground uppercase mr-1">
            DIAGNOSTIC LAYERS:
          </span>

          {/* Quiet Zone Toggle */}
          <button
            onClick={() => onToggleOverlay("quiet_zone")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeOverlays.has("quiet_zone")
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Square className="h-3.5 w-3.5" />
            <span>QUIET ZONE ({quietZone}M)</span>
            {quietCheck?.status === "pass" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ) : quietCheck?.status === "warning" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            ) : null}
          </button>

          {/* Finder Eyes Toggle */}
          <button
            onClick={() => onToggleOverlay("finders")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeOverlays.has("finders")
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>FINDER EYES (3×3)</span>
            {finderCheck?.status === "pass" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ) : finderCheck?.status === "warning" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            )}
          </button>

          {/* Logo Safety Toggle */}
          <button
            onClick={() => onToggleOverlay("logo_safety")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeOverlays.has("logo_safety")
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>
              LOGO SAFETY (
              {geometry?.logoCoveragePercent !== undefined
                ? `${geometry.logoCoveragePercent}%`
                : "0%"}
              )
            </span>
          </button>

          {/* Module Grid Toggle */}
          <button
            onClick={() => onToggleOverlay("module_grid")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeOverlays.has("module_grid")
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>GRID ({matrixSize}×{matrixSize})</span>
          </button>

          {/* Contrast Field Toggle */}
          <button
            onClick={() => onToggleOverlay("contrast_field")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              activeOverlays.has("contrast_field")
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <SunMedium className="h-3.5 w-3.5" />
            <span>
              CONTRAST (
              {contrastCheck?.measurements.ratio
                ? `${contrastCheck.measurements.ratio}:1`
                : "PROBES"}
              )
            </span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[11px] font-mono text-muted-foreground min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(1)}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Reset Zoom"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Vector Inspection Stage */}
      <div className="relative flex items-center justify-center min-h-[340px] sm:min-h-[380px] p-4 sm:p-8 bg-muted/20 overflow-hidden select-none">
        {/* Optical Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* QR Stage with Smooth Zoom Scaling */}
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Authentic Rendered QR SVG Container */}
          <div className="relative shadow-xl rounded-xl overflow-hidden bg-white w-[260px] h-[260px] sm:w-[320px] sm:h-[320px]">
            {/* SVG Content */}
            <div
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />

            {/* Diagnostic Vector Overlay HUD */}
            <svg
              viewBox={`0 0 ${totalPixelSize} ${totalPixelSize}`}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern
                  id="diag-hash"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#FA520F"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                </pattern>
              </defs>

              {/* 1. QUIET ZONE OVERLAY */}
              {activeOverlays.has("quiet_zone") && (
                <g className="animate-in fade-in duration-200">
                  {/* Outer margin border */}
                  <rect
                    x={0.5}
                    y={0.5}
                    width={totalPixelSize - 1}
                    height={totalPixelSize - 1}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  {/* Inner matrix boundary */}
                  <rect
                    x={matrixX}
                    y={matrixY}
                    width={matrixPixelSize}
                    height={matrixPixelSize}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.8"
                  />
                  {/* Quiet Zone Callout Tag */}
                  <g transform={`translate(${matrixX / 2}, 6)`}>
                    <rect
                      x="-14"
                      y="-4"
                      width="28"
                      height="12"
                      rx="3"
                      fill="#0284C7"
                      opacity="0.9"
                    />
                    <text
                      x="0"
                      y="5"
                      fill="#FFFFFF"
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {quietZone}M
                    </text>
                  </g>
                </g>
              )}

              {/* 2. FINDER PATTERNS (FP-1, FP-2, FP-3) OVERLAY */}
              {activeOverlays.has("finders") && (
                <g className="animate-in fade-in duration-200">
                  {[
                    { id: "FP-1", x: matrixX, y: matrixY },
                    { id: "FP-2", x: matrixX + (matrixSize - 7) * moduleSize, y: matrixY },
                    { id: "FP-3", x: matrixX, y: matrixY + (matrixSize - 7) * moduleSize },
                  ].map((fp) => (
                    <g key={fp.id}>
                      {/* Outer boundary */}
                      <rect
                        x={fp.x}
                        y={fp.y}
                        width={finderSize}
                        height={finderSize}
                        fill="none"
                        stroke="#FA520F"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      {/* Precision Corner Brackets */}
                      <path
                        d={`M ${fp.x} ${fp.y + 6} L ${fp.x} ${fp.y} L ${fp.x + 6} ${fp.y}`}
                        fill="none"
                        stroke="#FA520F"
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${fp.x + finderSize - 6} ${fp.y} L ${fp.x + finderSize} ${fp.y} L ${fp.x + finderSize} ${fp.y + 6}`}
                        fill="none"
                        stroke="#FA520F"
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${fp.x} ${fp.y + finderSize - 6} L ${fp.x} ${fp.y + finderSize} L ${fp.x + 6} ${fp.y + finderSize}`}
                        fill="none"
                        stroke="#FA520F"
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${fp.x + finderSize - 6} ${fp.y + finderSize} L ${fp.x + finderSize} ${fp.y + finderSize} L ${fp.x + finderSize} ${fp.y + finderSize - 6}`}
                        fill="none"
                        stroke="#FA520F"
                        strokeWidth="2.5"
                      />
                      {/* FP Label */}
                      <rect
                        x={fp.x + 2}
                        y={fp.y + 2}
                        width="20"
                        height="9"
                        rx="2"
                        fill="#FA520F"
                      />
                      <text
                        x={fp.x + 12}
                        y={fp.y + 9}
                        fill="#FFFFFF"
                        fontSize="6"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {fp.id}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* 3. LOGO OCCLUSION & SAFETY ZONE OVERLAY */}
              {activeOverlays.has("logo_safety") && logoBoxSize > 0 && (
                <g className="animate-in fade-in duration-200">
                  {/* Bounding box with diagonal hash lines */}
                  <rect
                    x={logoBoxX}
                    y={logoBoxY}
                    width={logoBoxSize}
                    height={logoBoxSize}
                    fill="url(#diag-hash)"
                    stroke="#FA520F"
                    strokeWidth="1.5"
                  />
                  {/* Safety Perimeter Line */}
                  <rect
                    x={logoBoxX - 2}
                    y={logoBoxY - 2}
                    width={logoBoxSize + 4}
                    height={logoBoxSize + 4}
                    fill="none"
                    stroke="#FA520F"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                  {/* Coverage Badge */}
                  <g transform={`translate(${logoBoxX + logoBoxSize / 2}, ${logoBoxY + logoBoxSize / 2})`}>
                    <rect
                      x="-24"
                      y="-7"
                      width="48"
                      height="14"
                      rx="3"
                      fill="#111111"
                      stroke="#FA520F"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fill="#FFFFFF"
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {geometry?.logoCoveragePercent ?? 0}% OCC
                    </text>
                  </g>
                </g>
              )}

              {/* 4. MODULE GRID OVERLAY */}
              {activeOverlays.has("module_grid") && (
                <g className="animate-in fade-in duration-200" opacity="0.4">
                  {Array.from({ length: matrixSize + 1 }).map((_, i) => (
                    <React.Fragment key={`grid-line-${i}`}>
                      {/* Vertical line */}
                      <line
                        x1={matrixX + i * moduleSize}
                        y1={matrixY}
                        x2={matrixX + i * moduleSize}
                        y2={matrixY + matrixPixelSize}
                        stroke="#0284C7"
                        strokeWidth="0.5"
                      />
                      {/* Horizontal line */}
                      <line
                        x1={matrixX}
                        y1={matrixY + i * moduleSize}
                        x2={matrixX + matrixPixelSize}
                        y2={matrixY + i * moduleSize}
                        stroke="#0284C7"
                        strokeWidth="0.5"
                      />
                    </React.Fragment>
                  ))}
                </g>
              )}

              {/* 5. CONTRAST FIELD OVERLAY */}
              {activeOverlays.has("contrast_field") && (
                <g className="animate-in fade-in duration-200">
                  {/* Optical Sampling Reticles */}
                  {[
                    { x: matrixX + 10, y: matrixY + 10, label: "P-1" },
                    { x: matrixX + matrixPixelSize - 10, y: matrixY + 10, label: "P-2" },
                    { x: matrixX + matrixPixelSize / 2, y: matrixY + matrixPixelSize / 2, label: "C-1" },
                  ].map((probe, idx) => (
                    <g key={`probe-${idx}`}>
                      <circle
                        cx={probe.x}
                        cy={probe.y}
                        r="6"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="1.2"
                      />
                      <circle cx={probe.x} cy={probe.y} r="1.5" fill="#10B981" />
                      <line
                        x1={probe.x - 8}
                        y1={probe.y}
                        x2={probe.x + 8}
                        y2={probe.y}
                        stroke="#10B981"
                        strokeWidth="0.8"
                      />
                      <line
                        x1={probe.x}
                        y1={probe.y - 8}
                        x2={probe.x}
                        y2={probe.y + 8}
                        stroke="#10B981"
                        strokeWidth="0.8"
                      />
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Calibration & Telemetry Matrix Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-card border-t border-border text-xs font-mono">
        <div className="flex items-center flex-wrap gap-4">
          <div>
            <span className="text-muted-foreground text-[10px] block">MATRIX DIMENSION</span>
            <span className="font-bold text-foreground">
              Version {Math.floor((matrixSize - 17) / 4)} ({matrixSize}×{matrixSize})
            </span>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div>
            <span className="text-muted-foreground text-[10px] block">TOTAL MODULES</span>
            <span className="font-bold text-foreground">
              {geometry?.totalModules ?? matrixSize * matrixSize} Modules
            </span>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div>
            <span className="text-muted-foreground text-[10px] block">QUIET ZONE</span>
            <span className="font-bold text-foreground">{quietZone} Modules (Compliant)</span>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div>
            <span className="text-muted-foreground text-[10px] block">OCCLUSION / BUDGET</span>
            <span className="font-bold text-foreground">
              {geometry?.logoCoveragePercent ?? 0}% / {geometry?.ecRecoveryBudget ?? 25}%
            </span>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground">
          CALIBRATION: <span className="text-emerald-500 font-semibold">1:1 MATHEMATICAL</span>
        </div>
      </div>
    </div>
  );
}
