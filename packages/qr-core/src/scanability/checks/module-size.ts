import { SCANABILITY_POLICY_V1 } from "../thresholds";
import { ScanabilityCheckResult, ScanabilityFinding, ScanabilityOutputContext } from "../types";

export function checkModuleSize(
  matrixSize: number,
  quietZone: number,
  outputContext?: ScanabilityOutputContext
): {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
  effectivePixelSize?: number;
  effectivePhysicalMm?: number;
} {
  const totalDimensionModules = matrixSize + quietZone * 2;
  const ctx = outputContext || { type: "editor" };

  const findings: ScanabilityFinding[] = [];
  let scorePenalty = 0;
  let status: "pass" | "notice" | "warning" | "blocking" = "pass";
  let summary = "";
  let effectivePixelSize: number | undefined;
  let effectivePhysicalMm: number | undefined;

  if (ctx.type === "printExport" && ctx.printWidthMm) {
    const mmPerModule = Math.round((ctx.printWidthMm / totalDimensionModules) * 100) / 100;
    effectivePhysicalMm = mmPerModule;
    const { optimalMm, minimumMm, criticalMm, penalties } = SCANABILITY_POLICY_V1.moduleSize.print;

    if (mmPerModule < criticalMm) {
      status = "blocking";
      scorePenalty = penalties.critical;
      summary = `Physical module size (${mmPerModule}mm) is below the 0.5mm camera sensor optical resolution threshold.`;
      findings.push({
        id: "finding_print_module_critical",
        code: "PRINT_MODULE_SUB_OPTICAL",
        channel: "module_size",
        severity: "blocking",
        title: "Print Module Size Sub-Optical",
        description: `At ${ctx.printWidthMm}mm total width, individual modules measure ${mmPerModule}mm. Typical smartphone camera autofocus optics cannot resolve data modules under 0.5mm.`,
        evidence: {
          printWidthMm: `${ctx.printWidthMm}mm`,
          effectiveModuleMm: `${mmPerModule}mm`,
          criticalThresholdMm: `${criticalMm}mm`,
          matrixModules: matrixSize,
        },
        remediation: "Select a larger physical print preset, or shorten the payload to reduce matrix module count.",
        blocking: true,
        targetControl: "export.dimensions",
        potentialImprovementScore: penalties.critical,
      });
    } else if (mmPerModule < minimumMm) {
      status = "warning";
      scorePenalty = penalties.small;
      summary = `Physical module size (${mmPerModule}mm) is small for print. May require close scanning distance.`;
      findings.push({
        id: "finding_print_module_small",
        code: "PRINT_MODULE_TOO_SMALL",
        channel: "module_size",
        severity: "warning",
        title: "Small Physical Module Size",
        description: `Physical modules measure ${mmPerModule}mm on print. Recommended minimum for comfortable arm-length scanning is ${optimalMm}mm.`,
        evidence: {
          printWidthMm: `${ctx.printWidthMm}mm`,
          effectiveModuleMm: `${mmPerModule}mm`,
          recommendedMinimumMm: `${minimumMm}mm`,
        },
        remediation: "Increase print dimensions or reduce payload complexity.",
        blocking: false,
        targetControl: "export.dimensions",
        potentialImprovementScore: penalties.small,
      });
    } else {
      summary = `Physical module size is ${mmPerModule}mm (${ctx.printWidthMm}mm output). Excellent print readability.`;
    }
  } else if (ctx.type === "digitalExport" && ctx.exportSizePx) {
    const pxPerModule = Math.round((ctx.exportSizePx / totalDimensionModules) * 10) / 10;
    effectivePixelSize = pxPerModule;
    const { optimalPx, minimumPx, criticalPx, penalties } = SCANABILITY_POLICY_V1.moduleSize.digital;

    if (pxPerModule < criticalPx) {
      status = "blocking";
      scorePenalty = penalties.critical;
      summary = `Digital export module size (${pxPerModule}px) is too small for raster pixel grid sampling.`;
      findings.push({
        id: "finding_export_module_critical",
        code: "MODULE_SIZE_CRITICAL",
        channel: "module_size",
        severity: "blocking",
        title: "Export Resolution Too Low",
        description: `At ${ctx.exportSizePx}×${ctx.exportSizePx}px, each QR module is only ${pxPerModule}px wide. Anti-aliasing will blur module edges into background.`,
        evidence: {
          exportWidthPx: `${ctx.exportSizePx}px`,
          pixelsPerModule: `${pxPerModule}px`,
          minimumRequiredPx: `${minimumPx}px`,
        },
        remediation: "Choose a higher export resolution (1024px or 2048px).",
        blocking: true,
        targetControl: "export.dimensions",
        potentialImprovementScore: penalties.critical,
      });
    } else if (pxPerModule < minimumPx) {
      status = "warning";
      scorePenalty = penalties.small;
      summary = `Export module size (${pxPerModule}px) is narrow. May display anti-aliasing artifacts.`;
      findings.push({
        id: "finding_export_module_small",
        code: "MODULE_SIZE_TOO_SMALL",
        channel: "module_size",
        severity: "warning",
        title: "Narrow Module Resolution",
        description: `Each module is ${pxPerModule}px wide in this export. For sharp digital display on retina screens, 8px+ is recommended.`,
        evidence: {
          exportWidthPx: `${ctx.exportSizePx}px`,
          pixelsPerModule: `${pxPerModule}px`,
          recommendedPx: `${optimalPx}px`,
        },
        remediation: "Select 1024px or 2048px export size for pristine sharpness.",
        blocking: false,
        targetControl: "export.dimensions",
        potentialImprovementScore: penalties.small,
      });
    } else {
      summary = `Digital export module size is ${pxPerModule}px (${ctx.exportSizePx}×${ctx.exportSizePx}px). Sharp raster grid.`;
    }
  } else {
    // Standard Editor Workspace Screen context (10px baseline)
    effectivePixelSize = 10;
    summary = `Matrix size ${matrixSize}×${matrixSize} modules (${totalDimensionModules} with quiet zone). Standard geometry.`;
  }

  const check: ScanabilityCheckResult = {
    channel: "module_size",
    channelNumber: "04",
    channelName: "Module Size",
    label: "04 MODULE SIZE",
    status,
    summary,
    scorePenalty,
    measurements: {
      matrixSize,
      totalDimensionModules,
      contextType: ctx.type,
      effectivePixelSize: effectivePixelSize ?? "N/A",
      effectivePhysicalMm: effectivePhysicalMm ? `${effectivePhysicalMm}mm` : "N/A",
    },
  };

  return { check, findings, effectivePixelSize, effectivePhysicalMm };
}
