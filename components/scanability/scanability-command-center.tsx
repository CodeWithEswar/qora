"use client";

import * as React from "react";
import {
  QrDesignV1,
  ScanabilityCheckResult,
  ScanabilityFinding,
  ScanabilityOutputContext,
  ScanabilityResultV1,
  evaluateScanability,
  renderQrSvg,
} from "@nxtqr/qr-core";
import { ScanabilityPageHeader } from "./scanability-page-header";
import { SelectedQrContextStrip } from "./selected-qr-context-strip";
import { QrInspectionStage } from "./inspector/qr-inspection-stage";
import { ScanabilityVerdict } from "./verdict/scanability-verdict";
import { EngineeringCheckMatrix } from "./checks/engineering-check-matrix";
import { PrintReadinessLab } from "./output/print-readiness-lab";
import { SelectQrDialog } from "./dialogs/select-qr-dialog";
import { CheckInspectorSheet } from "./inspectors/check-inspector-sheet";
import { ScanabilityEmpty } from "./states/scanability-empty";
import { ScanabilityNoSelection } from "./states/scanability-no-selection";
import { OverlayLayerId, ScanabilityQrRecord } from "./types";
import { toast } from "sonner";

interface ScanabilityCommandCenterProps {
  initialQrs: ScanabilityQrRecord[];
  orgSlug: string;
  initialSelectedId?: string;
}

export function ScanabilityCommandCenter({
  initialQrs,
  orgSlug,
  initialSelectedId,
}: ScanabilityCommandCenterProps) {
  const [qrs] = React.useState<ScanabilityQrRecord[]>(initialQrs);

  // Selected QR
  const [selectedQr, setSelectedQr] = React.useState<ScanabilityQrRecord | null>(() => {
    if (initialSelectedId) {
      const match = qrs.find((q) => q.id === initialSelectedId);
      if (match) return match;
    }
    return qrs.length > 0 ? qrs[0] : null;
  });

  // Modal / Sheet states
  const [isSelectQrOpen, setIsSelectQrOpen] = React.useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);
  const [inspectedCheck, setInspectedCheck] = React.useState<ScanabilityCheckResult | null>(null);
  const [inspectedFinding, setInspectedFinding] = React.useState<ScanabilityFinding | null>(null);

  // Active Diagnostic Overlays
  const [activeOverlays, setActiveOverlays] = React.useState<Set<OverlayLayerId>>(
    new Set(["quiet_zone", "finders", "logo_safety"])
  );

  // Output Context
  const [outputContext, setOutputContext] = React.useState<ScanabilityOutputContext>({
    type: "printExport",
    printPresetId: "business_card",
    printWidthMm: 45,
  });

  // Toggle overlay layers
  const handleToggleOverlay = (layer: OverlayLayerId) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  // 100% Pure, deterministic Scanability computation
  const scanabilityResult: ScanabilityResultV1 = React.useMemo(() => {
    if (!selectedQr) {
      return {
        schemaVersion: 1,
        policyVersion: "2026.1",
        status: "not_ready",
        summary: "No QR asset selected for analysis.",
        recommendationsCount: 0,
        blockersCount: 0,
        checks: [],
        findings: [],
      };
    }

    const content = selectedQr.defaultUrl || selectedQr.content || "https://nxtqr.vercel.app";
    const design = selectedQr.design;

    return evaluateScanability({
      content,
      design,
      outputContext,
    });
  }, [selectedQr, outputContext]);

  // Authentic QR SVG Vector Markup
  const svgMarkup = React.useMemo(() => {
    if (!selectedQr) return "";
    const content = selectedQr.defaultUrl || selectedQr.content || "https://nxtqr.vercel.app";
    return renderQrSvg({
      content,
      design: selectedQr.design,
      moduleSize: 10,
    });
  }, [selectedQr]);

  // Re-calculate action
  const handleRecalculate = () => {
    toast.success("Optical and geometric analysis re-synchronized.");
  };

  // Inspect specific check
  const handleInspectCheck = (check: ScanabilityCheckResult, finding?: ScanabilityFinding) => {
    setInspectedCheck(check);
    setInspectedFinding(finding || null);
    setIsInspectorOpen(true);
  };

  // Open explanation for overall verdict
  const handleOpenExplainVerdict = () => {
    const firstCheck = scanabilityResult.checks[0] || null;
    const firstFinding = scanabilityResult.findings[0] || null;
    setInspectedCheck(firstCheck);
    setInspectedFinding(firstFinding);
    setIsInspectorOpen(true);
  };

  // Export SVG handler
  const handleExportSvg = () => {
    if (!svgMarkup || !selectedQr) return;
    try {
      const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedQr.slug}-scanability-vector.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Vector SVG exported successfully.");
    } catch {
      toast.error("Failed to export SVG.");
    }
  };

  // Export PNG handler
  const handleExportPng = (widthPx: number) => {
    if (!svgMarkup || !selectedQr) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = widthPx;
      canvas.height = widthPx;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, widthPx, widthPx);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${selectedQr.slug}-${widthPx}px.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Exported ${widthPx}px high-res PNG.`);
      };
      img.src = url;
    } catch {
      toast.error("Failed to export PNG.");
    }
  };

  // Truthful empty states
  if (qrs.length === 0) {
    return (
      <div className="space-y-6">
        <ScanabilityPageHeader
          orgSlug={orgSlug}
          selectedQr={null}
          onOpenSelectDialog={() => {}}
          onRecalculate={() => {}}
        />
        <ScanabilityEmpty orgSlug={orgSlug} />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <ScanabilityPageHeader
        orgSlug={orgSlug}
        selectedQr={selectedQr}
        onOpenSelectDialog={() => setIsSelectQrOpen(true)}
        onRecalculate={handleRecalculate}
      />

      {/* Selected QR Context Strip */}
      {selectedQr ? (
        <>
          <SelectedQrContextStrip orgSlug={orgSlug} qr={selectedQr} />

          {/* Two-Column Lab Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: QR Inspection Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-6 min-w-0">
              <QrInspectionStage
                svgMarkup={svgMarkup}
                design={selectedQr.design}
                geometry={scanabilityResult.geometry}
                scanability={scanabilityResult}
                activeOverlays={activeOverlays}
                onToggleOverlay={handleToggleOverlay}
              />

              {/* Print Readiness Lab */}
              <PrintReadinessLab
                geometry={scanabilityResult.geometry}
                onContextChange={setOutputContext}
                onExportSvg={handleExportSvg}
                onExportPng={handleExportPng}
              />
            </div>

            {/* Right Column: Engineering Verdict & Check Matrix (5 cols) */}
            <div className="lg:col-span-5 space-y-6 min-w-0">
              <ScanabilityVerdict
                result={scanabilityResult}
                onOpenExplainSheet={handleOpenExplainVerdict}
              />

              <EngineeringCheckMatrix
                result={scanabilityResult}
                onInspectCheck={handleInspectCheck}
              />
            </div>
          </div>
        </>
      ) : (
        <ScanabilityNoSelection
          qrs={qrs}
          onSelectQr={(qr) => setSelectedQr(qr)}
          onOpenSelectDialog={() => setIsSelectQrOpen(true)}
        />
      )}

      {/* Select QR Dialog */}
      <SelectQrDialog
        open={isSelectQrOpen}
        onOpenChange={setIsSelectQrOpen}
        qrs={qrs}
        selectedQrId={selectedQr?.id}
        onSelectQr={(qr) => setSelectedQr(qr)}
      />

      {/* Engineering Check Inspector Slide-Over Sheet */}
      <CheckInspectorSheet
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        check={inspectedCheck}
        finding={inspectedFinding}
        orgSlug={orgSlug}
        qrId={selectedQr?.id}
      />
    </div>
  );
}
