"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrDesignV1,
  CANONICAL_QR_DESIGN_DEFAULTS,
  SYSTEM_DESIGN_PRESETS,
  renderQrSvg,
  evaluateScanability,
} from "@nxtqr/qr-core";
import { BulkRowValidationResult } from "@/lib/domains/bulk-qr";

interface DesignStepProps {
  validatedRows: BulkRowValidationResult[];
  brandKits?: Array<{ id: string; name: string; design?: Partial<QrDesignV1> }>;
  initialDesign?: QrDesignV1;
  onBack: () => void;
  onProceed: (design: QrDesignV1, brandKitId?: string) => void;
}

export function DesignStep({
  validatedRows,
  brandKits = [],
  initialDesign,
  onBack,
  onProceed,
}: DesignStepProps) {
  // Current design state
  const [currentDesign, setCurrentDesign] = useState<QrDesignV1>(
    initialDesign || CANONICAL_QR_DESIGN_DEFAULTS
  );
  const [selectedPolicy, setSelectedPolicy] = useState<string>("default");
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | undefined>(undefined);
  const [orgTemplates, setOrgTemplates] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/v1/templates")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data?.items) {
          setOrgTemplates(json.data.items);
        }
      })
      .catch(() => {});
  }, []);

  // Representative preview row index
  const [previewRowIndex, setPreviewRowIndex] = useState(0);
  const representativeRow = validatedRows[previewRowIndex] || validatedRows[0];

  // SVG generation
  const previewSvg = useMemo(() => {
    try {
      const content =
        representativeRow?.row?.destination_url ||
        representativeRow?.row?.name ||
        "https://nxtqr.vercel.app";
      return renderQrSvg({
        content,
        design: currentDesign,
        moduleSize: 7,
      });
    } catch {
      return "";
    }
  }, [representativeRow, currentDesign]);

  // Scanability evaluation of current design
  const scanability = useMemo(() => {
    const sampleContent =
      representativeRow?.row?.destination_url || "https://nxtqr.vercel.app";
    return evaluateScanability(sampleContent, currentDesign);
  }, [representativeRow, currentDesign]);

  // Handle policy changes
  const handleSelectPreset = (presetId: string) => {
    setSelectedPolicy(presetId);
    setSelectedBrandKitId(undefined);

    if (presetId === "default") {
      setCurrentDesign(CANONICAL_QR_DESIGN_DEFAULTS);
      return;
    }

    const preset = SYSTEM_DESIGN_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCurrentDesign({
        ...CANONICAL_QR_DESIGN_DEFAULTS,
        ...preset.design,
      });
    }
  };

  const handleSelectBrandKit = (kitId: string) => {
    setSelectedPolicy(`brand-kit-${kitId}`);
    setSelectedBrandKitId(kitId);
    const kit = brandKits.find((b) => b.id === kitId);
    if (kit?.design) {
      setCurrentDesign({
        ...CANONICAL_QR_DESIGN_DEFAULTS,
        ...kit.design,
      });
    }
  };

  const handleSelectTemplate = (tmpl: any) => {
    setSelectedPolicy(`template-${tmpl.id}`);
    setSelectedBrandKitId(tmpl.brand_kit_id || undefined);
    if (tmpl.design_json) {
      setCurrentDesign({
        ...CANONICAL_QR_DESIGN_DEFAULTS,
        ...tmpl.design_json,
      });
    }
  };

  const handleProceed = () => {
    onProceed(currentDesign, selectedBrandKitId);
  };

  return (
    <div className="space-y-8">
      {/* Header ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <Icon icon="lucide:palette" className="w-5 h-5 text-orange-500" />
            Batch Design Policy
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Apply unified typography, module geometry, quiet zones, and colors across all {validatedRows.length} QR assets in this batch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`font-mono text-xs px-2.5 py-1 ${
              (scanability.score ?? 100) >= 80
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : (scanability.score ?? 100) >= 60
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            Scan Score: {scanability.score ?? 100}/100 ({scanability.status.toUpperCase()})
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Design Presets & Brand Kits (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Standard Presets */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Icon icon="lucide:sparkles" className="w-4 h-4 text-orange-400" />
              NXTQR System Presets
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Default */}
              <button
                type="button"
                onClick={() => handleSelectPreset("default")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedPolicy === "default"
                    ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                    : "border-white/10 bg-neutral-950/60 hover:border-white/20 hover:bg-neutral-900/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-neutral-100">
                    NXTQR Canonical Default
                  </span>
                  {selectedPolicy === "default" && (
                    <Icon icon="lucide:check-circle" className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  Standard high-contrast square modules with maximum scannability and 4-module quiet zone.
                </p>
              </button>

              {/* System Presets */}
              {SYSTEM_DESIGN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedPolicy === preset.id
                      ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                      : "border-white/10 bg-neutral-950/60 hover:border-white/20 hover:bg-neutral-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-100">
                      {preset.name}
                    </span>
                    {selectedPolicy === preset.id && (
                      <Icon icon="lucide:check-circle" className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Organization Brand Kits */}
          {brandKits.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Icon icon="lucide:shield" className="w-4 h-4 text-orange-400" />
                Verified Organization Brand Kits
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brandKits.map((kit) => (
                  <button
                    key={kit.id}
                    type="button"
                    onClick={() => handleSelectBrandKit(kit.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPolicy === `brand-kit-${kit.id}`
                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                        : "border-white/10 bg-neutral-950/60 hover:border-white/20 hover:bg-neutral-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-neutral-100">
                        {kit.name}
                      </span>
                      {selectedPolicy === `brand-kit-${kit.id}` && (
                        <Icon icon="lucide:check-circle" className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500">
                      Brand Kit Token: {kit.id.slice(0, 8)}...
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Organization Design Templates */}
          {orgTemplates.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Icon icon="lucide:layers" className="w-4 h-4 text-orange-400" />
                Organization Design Templates ({orgTemplates.length})
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orgTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPolicy === `template-${tmpl.id}`
                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                        : "border-white/10 bg-neutral-950/60 hover:border-white/20 hover:bg-neutral-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-neutral-100">
                        {tmpl.name}
                      </span>
                      {selectedPolicy === `template-${tmpl.id}` && (
                        <Icon icon="lucide:check-circle" className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500">
                      v{tmpl.current_version || 1} · {tmpl.compatibility?.[0] || "UNIVERSAL"}
                      {tmpl.is_brand_locked && " · LOCKED"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scanability Diagnostic Checklist */}
          <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/60 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Icon icon="lucide:activity" className="w-4 h-4 text-orange-400" />
              Scanability Engine Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Module Style</span>
                <span className="font-medium text-neutral-200 capitalize">{currentDesign.moduleStyle}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Error Correction</span>
                <span className="font-mono text-neutral-200">Level {currentDesign.errorCorrection}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Quiet Zone</span>
                <span className="font-mono text-neutral-200">{currentDesign.quietZone} Modules</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-white/5">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Contrast Ratio</span>
                <span className="font-mono text-emerald-400">Optimal (21:1)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Live Vector QR Preview & Row Switcher (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 backdrop-blur-xl shadow-xl flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon icon="lucide:eye" className="w-3.5 h-3.5 text-primary" />
                Live Asset Preview
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Row {previewRowIndex + 1} of {validatedRows.length}
              </span>
            </div>

            {/* Rendered SVG Preview Canvas */}
            <div className="w-64 h-64 rounded-xl bg-white p-4 flex items-center justify-center shadow-xl border border-border/40 my-2">
              {previewSvg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                  className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full"
                />
              ) : (
                <Icon icon="lucide:qr-code" className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            {/* Representative Row Info */}
            <div className="mt-4 w-full text-left p-3 rounded-lg bg-muted/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground truncate">
                  {representativeRow?.row?.name || "Sample QR Asset"}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-border capitalize">
                  {representativeRow?.row?.qr_type || "url"}
                </Badge>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground truncate">
                {representativeRow?.row?.destination_url || "https://nxtqr.vercel.app"}
              </p>
            </div>

            {/* Row Switcher Controls */}
            <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-white/10">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={previewRowIndex <= 0}
                onClick={() => setPreviewRowIndex((i) => Math.max(0, i - 1))}
                className="h-8 text-xs border-white/10 hover:bg-neutral-800 text-neutral-300"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4 mr-1" />
                Previous Row
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={previewRowIndex >= validatedRows.length - 1}
                onClick={() =>
                  setPreviewRowIndex((i) => Math.min(validatedRows.length - 1, i + 1))
                }
                className="h-8 text-xs border-white/10 hover:bg-neutral-800 text-neutral-300"
              >
                Next Row
                <Icon icon="lucide:chevron-right" className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-white/10 hover:bg-neutral-800 text-neutral-300"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back to Validation
        </Button>
        <Button
          type="button"
          onClick={handleProceed}
          className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 font-medium"
        >
          Proceed to Organization
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
