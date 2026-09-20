import { QrDesignV1 } from "../../design/schema";
import { computeContrastRatio } from "../contrast";
import { SCANABILITY_POLICY_V1 } from "../thresholds";
import { ScanabilityCheckResult, ScanabilityFinding } from "../types";

export function checkContrast(design: QrDesignV1): {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
} {
  const fgBgContrast = computeContrastRatio(design.fgColor, design.bgColor);
  let minContrast = fgBgContrast;
  let gradientEvaluated = false;

  if (design.gradient) {
    gradientEvaluated = true;
    const gradContrast = computeContrastRatio(design.gradient.endColor, design.bgColor);
    minContrast = Math.min(fgBgContrast, gradContrast);
  }

  const findings: ScanabilityFinding[] = [];
  let scorePenalty = 0;
  let status: "pass" | "notice" | "warning" | "blocking" = "pass";
  let summary = `Strong luminance contrast (${minContrast}:1) ensures rapid optical edge detection.`;

  const { optimalRatio, minimumRatio, suboptimalRatio, criticalRatio, penalties } =
    SCANABILITY_POLICY_V1.contrast;

  if (minContrast < criticalRatio) {
    status = "blocking";
    scorePenalty = penalties.critical;
    summary = `Critically low contrast (${minContrast}:1) prevents camera edge detection.`;
    findings.push({
      id: "finding_contrast_critical",
      code: "CRITICAL_LOW_CONTRAST",
      channel: "contrast",
      severity: "blocking",
      title: "Critically Low Contrast",
      description: `Contrast ratio is ${minContrast}:1. Standard mobile camera sensors require at least ${minimumRatio}:1 to separate modules from background pixels.`,
      evidence: {
        measuredRatio: `${minContrast}:1`,
        requiredRatio: `${minimumRatio}:1`,
        foregroundColor: design.fgColor,
        backgroundColor: design.bgColor,
        gradientActive: gradientEvaluated,
      },
      remediation: "Darken foreground modules or brighten background canvas to achieve at least 4.5:1 contrast.",
      blocking: true,
      targetControl: "design.colors",
      potentialImprovementScore: penalties.critical,
      suggestedFixValue: {
        fgColor: "#000000",
        bgColor: "#FFFFFF",
      },
    });
  } else if (minContrast < suboptimalRatio) {
    status = "warning";
    scorePenalty = penalties.suboptimal;
    summary = `Suboptimal contrast (${minContrast}:1). May fail in dim lighting or glare.`;
    findings.push({
      id: "finding_contrast_suboptimal",
      code: "SUBOPTIMAL_CONTRAST",
      channel: "contrast",
      severity: "warning",
      title: "Suboptimal Color Contrast",
      description: `Contrast ratio is ${minContrast}:1. Older mobile lenses or environments with glare may experience scan latency.`,
      evidence: {
        measuredRatio: `${minContrast}:1`,
        recommendedRatio: `${optimalRatio}:1`,
        foregroundColor: design.fgColor,
        backgroundColor: design.bgColor,
      },
      remediation: "Increase luminance separation to at least 4.5:1 for instantaneous scanning.",
      blocking: false,
      targetControl: "design.colors",
      potentialImprovementScore: penalties.suboptimal,
      suggestedFixValue: {
        fgColor: "#111111",
        bgColor: "#FFFFFF",
      },
    });
  } else if (minContrast < minimumRatio) {
    status = "notice";
    scorePenalty = 5;
    summary = `Acceptable contrast (${minContrast}:1). Slightly below recommended 7:1 ratio.`;
    findings.push({
      id: "finding_contrast_moderate",
      code: "MODERATE_CONTRAST_NOTICE",
      channel: "contrast",
      severity: "notice",
      title: "Moderate Color Separation",
      description: `Contrast ratio is ${minContrast}:1. While functional on modern phones, high ambient light may reduce decode reliability.`,
      evidence: {
        measuredRatio: `${minContrast}:1`,
        recommendedRatio: `${optimalRatio}:1`,
      },
      remediation: "Consider deepening module color for maximum optical clarity.",
      blocking: false,
      targetControl: "design.colors",
    });
  }

  const check: ScanabilityCheckResult = {
    channel: "contrast",
    channelNumber: "01",
    channelName: "Contrast",
    label: "01 CONTRAST",
    status,
    summary,
    scorePenalty,
    measurements: {
      ratio: `${minContrast}:1`,
      foregroundColor: design.fgColor,
      backgroundColor: design.bgColor,
      hasGradient: gradientEvaluated,
      isPassing: status === "pass",
    },
  };

  return { check, findings };
}
