"use client";

import * as React from "react";
import {
  ScanabilityGeometry,
  ScanabilityOutputContext,
} from "@nxtqr/qr-core";
import {
  Printer,
  Sliders,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Info,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OutputPreset, PRINT_PRESETS } from "../types";

interface PrintReadinessLabProps {
  geometry?: ScanabilityGeometry;
  onContextChange: (ctx: ScanabilityOutputContext) => void;
  onExportSvg: () => void;
  onExportPng: (widthPx: number) => void;
}

export function PrintReadinessLab({
  geometry,
  onContextChange,
  onExportSvg,
  onExportPng,
}: PrintReadinessLabProps) {
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>("business_card");
  const [customWidthMm, setCustomWidthMm] = React.useState<number>(50);
  const [customDpi, setCustomDpi] = React.useState<number>(300);

  const selectedPreset = PRINT_PRESETS.find((p) => p.id === selectedPresetId) || PRINT_PRESETS[1];

  const effectiveWidthMm =
    selectedPreset.category === "print"
      ? selectedPreset.widthMm || customWidthMm
      : customWidthMm;

  const effectiveDpi = selectedPreset.targetDpi || customDpi;

  const matrixSize = geometry?.matrixSize ?? 29;
  const quietZone = geometry?.quietZoneModules ?? 4;
  const totalModules = matrixSize + quietZone * 2;

  // Calculate physical module size in millimeters
  const moduleSizeMm = effectiveWidthMm / totalModules;
  // Calculate pixel size at target DPI
  const totalPixels = Math.round((effectiveWidthMm / 25.4) * effectiveDpi);
  const modulePixels = totalPixels / totalModules;
  // Scan distance rule of thumb: ~10x the QR code physical width
  const minScanDistanceM = (effectiveWidthMm * 10) / 1000;

  // Print readiness status
  let printStatus: "optimal" | "acceptable" | "warning" | "critical" = "optimal";
  let statusReason = "Physical module width ensures rapid optical focus on standard smartphone cameras.";

  if (moduleSizeMm < 0.5) {
    printStatus = "critical";
    statusReason =
      "Modules are smaller than 0.5 mm. Standard smartphone cameras will experience optical blur and decoding failures.";
  } else if (moduleSizeMm < 0.7) {
    printStatus = "warning";
    statusReason =
      "Modules are between 0.5 mm and 0.7 mm. Scanning will require user to hold phone very close with steady lighting.";
  } else if (moduleSizeMm < 1.0) {
    printStatus = "acceptable";
    statusReason =
      "Modules are within standard acceptable limits (0.7–1.0 mm) for close-range handheld scanning.";
  }

  const handleSelectPreset = (preset: OutputPreset) => {
    setSelectedPresetId(preset.id);
    if (preset.category === "print" && preset.widthMm) {
      onContextChange({
        type: "printExport",
        printPresetId: preset.id,
        printWidthMm: preset.widthMm,
      });
    } else {
      onContextChange({
        type: "digitalExport",
        exportSizePx: preset.exportSizePx || 600,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden font-sans">
      {/* Section Header */}
      <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
            <Printer className="h-4 w-4 text-primary" />
            <span>Print &amp; Export Readiness Lab</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simulate physical substrates, print dimensions, and optical scan distances before manufacturing.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Presets Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-muted-foreground uppercase">
            TARGET SUBSTRATE / APPLICATION PRESET
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRINT_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground shadow-xs"
                      : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="font-bold text-xs truncate w-full mb-1">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono opacity-80">
                    {preset.category === "print"
                      ? `${preset.widthMm} mm @ ${preset.targetDpi} DPI`
                      : `${preset.exportSizePx} px (Web)`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Calculated Optical Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground block uppercase">
              MODULE PHYSICAL SIZE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-foreground">
                {moduleSizeMm.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">mm</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Target: ≥ 0.70 mm
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block uppercase">
              PIXEL DENSITY / MODULE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-foreground">
                {modulePixels.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">px</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Total: {totalPixels} × {totalPixels} px
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block uppercase">
              OPTIMAL SCAN DISTANCE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-foreground">
                {minScanDistanceM >= 1
                  ? `${minScanDistanceM.toFixed(1)} m`
                  : `${Math.round(minScanDistanceM * 100)} cm`}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Rule: 10× Physical Width
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block uppercase">
              OPTICAL RESOLVABILITY
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {printStatus === "optimal" || printStatus === "acceptable" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500 uppercase">
                    RESOLVABLE
                  </span>
                </>
              ) : printStatus === "warning" ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-500 uppercase">
                    SUBOPTIMAL
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-500" />
                  <span className="text-xs font-bold text-rose-500 uppercase">
                    TOO DENSE
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
              {effectiveDpi} DPI Print Press
            </span>
          </div>
        </div>

        {/* Engineering Status Assessment Note */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border text-xs">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Engineering Note: </strong>
            {statusReason} For physical mass-printing, always request a physical proof from your press technician before running large quantities.
          </p>
        </div>

        {/* Direct Export Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Export vector-calibrated assets for production printers:
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportSvg}
              className="h-9 px-3 text-xs font-medium border-border hover:bg-muted gap-1.5 rounded-xl shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Vector SVG (Press Ready)</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onExportPng(totalPixels)}
              className="h-9 px-3.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 rounded-xl shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>High-Res PNG ({totalPixels}px)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
