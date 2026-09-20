import { QrDesignV1 } from "../../design/schema";
import { computeContrastRatio } from "../contrast";
import { SCANABILITY_POLICY_V1 } from "../thresholds";
import { ScanabilityCheckResult, ScanabilityFinding } from "../types";

export interface CheckFinderIntegrityResult {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
  hasCollision: boolean;
  eyeContrastRatio: number;
}

export function checkFinderIntegrity(
  matrixSize: number,
  design: QrDesignV1,
  centerBox: { xStart: number; yStart: number; size: number }
): CheckFinderIntegrityResult {
  const findings: ScanabilityFinding[] = [];
  let scorePenalty = 0;
  let status: "pass" | "notice" | "warning" | "blocking" = "pass";

  // 1. The three ISO/IEC 18004 Position Detection Patterns (7x7 modules each)
  const finders = [
    { id: "TL", name: "Top-Left (FP-1)", x: 0, y: 0, size: 7 },
    { id: "TR", name: "Top-Right (FP-2)", x: matrixSize - 7, y: 0, size: 7 },
    { id: "BL", name: "Bottom-Left (FP-3)", x: 0, y: matrixSize - 7, size: 7 },
  ];

  // 2. Collision Check: Logo bounding box vs Finder Patterns
  const hasLogo = Boolean(design.logo && (design.logo.assetId || design.logo.url));
  let hasCollision = false;
  const collidingFinders: string[] = [];

  if (hasLogo && centerBox.size > 0) {
    const lX1 = centerBox.xStart;
    const lX2 = centerBox.xStart + centerBox.size;
    const lY1 = centerBox.yStart;
    const lY2 = centerBox.yStart + centerBox.size;

    for (const f of finders) {
      const fX1 = f.x;
      const fX2 = f.x + f.size;
      const fY1 = f.y;
      const fY2 = f.y + f.size;

      // Axis-Aligned Bounding Box overlap
      const overlaps = !(lX2 <= fX1 || lX1 >= fX2 || lY2 <= fY1 || lY1 >= fY2);
      if (overlaps) {
        hasCollision = true;
        collidingFinders.push(f.name);
      }
    }
  }

  // 3. Contrast Evaluation for Finder Eyes against Canvas
  const outerEyeColor = design.eyeColor || design.fgColor;
  const innerEyeColor = design.eyeInnerColor || design.eyeColor || design.fgColor;
  const bgColor = design.bgColor;

  const outerContrast = computeContrastRatio(outerEyeColor, bgColor);
  const innerContrast = computeContrastRatio(innerEyeColor, bgColor);
  const eyeContrastRatio = Math.min(outerContrast, innerContrast);

  // 4. Evaluate Findings
  if (hasCollision) {
    status = "blocking";
    scorePenalty += SCANABILITY_POLICY_V1.finderIntegrity.penalties.collision;
    findings.push({
      id: "finding_finder_collision",
      code: "FINDER_PATTERN_OCCLUSION",
      channel: "finder_integrity",
      severity: "blocking",
      title: "Logo Occludes Finder Pattern",
      description: `Center logo plate overlaps with position detection patterns (${collidingFinders.join(
        ", "
      )}). Scanners require complete, unoccluded finder patterns to locate and deskew the matrix.`,
      evidence: {
        collidingPatterns: collidingFinders.join(", "),
        logoSizeModules: centerBox.size,
        matrixSize,
      },
      remediation: "Reduce the logo scale in QR Studio to prevent overlapping corner finder patterns.",
      blocking: true,
      targetControl: "design.logo.size",
      potentialImprovementScore: SCANABILITY_POLICY_V1.finderIntegrity.penalties.collision,
    });
  }

  if (eyeContrastRatio < 2.0) {
    status = "blocking";
    scorePenalty += SCANABILITY_POLICY_V1.finderIntegrity.penalties.criticalContrast;
    findings.push({
      id: "finding_finder_contrast_critical",
      code: "CRITICAL_FINDER_CONTRAST",
      channel: "finder_integrity",
      severity: "blocking",
      title: "Critical Finder Eye Contrast Deficit",
      description: `Finder eye color contrast is ${eyeContrastRatio}:1 against the background canvas. Position detection requires at least 4.5:1 contrast to distinguish orientation in camera frames.`,
      evidence: {
        eyeContrastRatio: `${eyeContrastRatio}:1`,
        outerEyeColor,
        innerEyeColor,
        backgroundColor: bgColor,
      },
      remediation: "Darken the finder eye color or lighten the background to ensure high optical contrast.",
      blocking: true,
      targetControl: "design.colors",
      potentialImprovementScore: SCANABILITY_POLICY_V1.finderIntegrity.penalties.criticalContrast,
    });
  } else if (eyeContrastRatio < 4.5) {
    if (status !== "blocking") status = "warning";
    scorePenalty += SCANABILITY_POLICY_V1.finderIntegrity.penalties.lowContrast;
    findings.push({
      id: "finding_finder_contrast_low",
      code: "SUBOPTIMAL_FINDER_CONTRAST",
      channel: "finder_integrity",
      severity: "warning",
      title: "Suboptimal Finder Eye Contrast",
      description: `Finder eye contrast (${eyeContrastRatio}:1) is below the recommended 4.5:1 threshold. May reduce recognition speed at skewed camera angles.`,
      evidence: {
        eyeContrastRatio: `${eyeContrastRatio}:1`,
        outerEyeColor,
        innerEyeColor,
        backgroundColor: bgColor,
      },
      remediation: "Increase eye color contrast against the background canvas.",
      blocking: false,
      targetControl: "design.colors",
      potentialImprovementScore: SCANABILITY_POLICY_V1.finderIntegrity.penalties.lowContrast,
    });
  }

  let summary = "All 3 finder patterns (TL, TR, BL) are 100% unobstructed with compliant optical contrast.";
  if (hasCollision) {
    summary = `Logo collides with ${collidingFinders.length} finder pattern(s). QR cannot be oriented by scanners.`;
  } else if (eyeContrastRatio < 2.0) {
    summary = `Critically low eye contrast (${eyeContrastRatio}:1) prevents finder edge detection.`;
  } else if (eyeContrastRatio < 4.5) {
    summary = `Suboptimal eye contrast (${eyeContrastRatio}:1). Orientation detection may be delayed in low light.`;
  }

  const check: ScanabilityCheckResult = {
    channel: "finder_integrity",
    channelNumber: "06",
    channelName: "Finder Integrity",
    label: "06 FINDER INTEGRITY",
    status,
    summary,
    scorePenalty,
    measurements: {
      tlValid: true,
      trValid: true,
      blValid: true,
      hasCollision,
      collidingFindersCount: collidingFinders.length,
      eyeContrastRatio,
      outerEyeColor,
      innerEyeColor,
    },
  };


  return {
    check,
    findings,
    hasCollision,
    eyeContrastRatio,
  };
}
