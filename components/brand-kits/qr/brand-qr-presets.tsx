"use client";

import * as React from "react";
import { BrandQrPreset } from "@nxtqr/contracts";
import { renderQrSvg, evaluateScanability, QrDesignV1 } from "@nxtqr/qr-core";
import { Plus, CheckCircle, AlertTriangle, ShieldAlert, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandQrPresetsProps {
  presets: BrandQrPreset[];
  primaryColor?: string;
  onCreatePreset: () => void;
  onSetDefaultPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
}

export function BrandQrPresets({
  presets,
  primaryColor = "#FA520F",
  onCreatePreset,
  onSetDefaultPreset,
  onDeletePreset,
}: BrandQrPresetsProps) {
  const samplePayload = "https://nxtqr.vercel.app/preview/brand";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
            BRANDED QR STYLE PRESETS
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reusable scannable matrix geometries, finder eye styles, and frame templates anchored by this Brand Kit.
          </p>
        </div>

        <Button
          onClick={onCreatePreset}
          size="sm"
          className="h-8 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New QR Preset</span>
        </Button>
      </div>

      {presets.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-border bg-surface/40 space-y-3">
          <p className="text-xs text-muted-foreground">
            No QR style presets defined in this Brand Kit yet.
          </p>
          <Button
            onClick={onCreatePreset}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Create First QR Style
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => {
            const design = preset.design as unknown as QrDesignV1;

            // 1. Render actual vector QR SVG
            let svgMarkup = "";
            try {
              svgMarkup = renderQrSvg({
                content: samplePayload,
                design,
                moduleSize: 6,
              });
            } catch {
              svgMarkup = "";
            }

            // 2. Evaluate actual mathematical scanability
            let scanDiagnostics;
            try {
              scanDiagnostics = evaluateScanability(samplePayload, design);
            } catch {
              scanDiagnostics = null;
            }

            const isPassed = scanDiagnostics?.status === "pass";
            const hasWarnings = Boolean(scanDiagnostics && scanDiagnostics.findings.some((f) => f.severity === "warning"));
            const hasBlocking = Boolean(
              scanDiagnostics &&
                (scanDiagnostics.status === "blocking" ||
                  scanDiagnostics.findings.some((f) => f.severity === "blocking"))
            );

            return (
              <div
                key={preset.id}
                className="p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm space-y-3 flex flex-col justify-between group hover:border-border transition-colors shadow-xs"
              >
                <div>
                  {/* Real QR Vector Renderer Box */}
                  <div className="relative w-full h-44 rounded-lg border border-border/80 bg-white dark:bg-black/40 flex items-center justify-center p-3 shadow-inner overflow-hidden">
                    {svgMarkup ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                        className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:drop-shadow-xs"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground font-mono">
                        Vector preview unavailable
                      </div>
                    )}

                    {preset.isDefault && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-[9px] font-semibold bg-[#FA520F] text-white border-0 py-0"
                      >
                        Default Preset
                      </Badge>
                    )}
                  </div>

                  {/* Preset Title & Description */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground truncate">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {design?.moduleStyle || "squares"}
                      </span>
                    </div>

                    {preset.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {preset.description}
                      </p>
                    )}
                  </div>

                  {/* Real Scanability Integrity Pill */}
                  <div className="mt-2.5 flex items-center justify-between p-2 rounded-lg border border-border/60 bg-surface text-[10px] font-mono">
                    <span className="text-muted-foreground uppercase">SCAN INTEGRITY</span>
                    {hasBlocking ? (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                        <ShieldAlert className="w-3 h-3" />
                        CRITICAL ERROR
                      </span>
                    ) : hasWarnings ? (
                      <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        WARNINGS DETECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle className="w-3 h-3" />
                        SCANABILITY OPTIMAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Preset Actions Toolbar */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  {!preset.isDefault ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefaultPreset(preset.id)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-[#FA520F]"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      <span>Set as Default</span>
                    </Button>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      WORKSPACE DEFAULT
                    </span>
                  )}

                  {presets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeletePreset(preset.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
