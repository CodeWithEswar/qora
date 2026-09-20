import { QrDesignV1 } from "../../design/schema";
import { computeLogoCoverage } from "../geometry/logo-coverage";
import { SCANABILITY_POLICY_V1 } from "../thresholds";
import { ScanabilityCheckResult, ScanabilityFinding } from "../types";

export function checkLogoArea(
  matrixSize: number,
  design: QrDesignV1
): {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
  coveragePercent: number;
  logoModulesCount: number;
} {
  const ecLimit = SCANABILITY_POLICY_V1.logoArea.ecLimits[design.errorCorrection];
  const { safeBudgetFactor, penalties } = SCANABILITY_POLICY_V1.logoArea;
  const safeThreshold = Math.round(ecLimit * safeBudgetFactor * 10) / 10;

  const findings: ScanabilityFinding[] = [];
  let scorePenalty = 0;
  let status: "pass" | "notice" | "warning" | "blocking" = "pass";

  if (!design.logo || (!design.logo.assetId && !design.logo.url)) {
    const check: ScanabilityCheckResult = {
      channel: "logo_area",
      channelNumber: "03",
      channelName: "Logo Area",
      label: "03 LOGO AREA",
      status: "pass",
      summary: "Zero module occlusion. Complete 100% matrix visibility.",
      scorePenalty: 0,
      measurements: {
        coveragePercent: 0,
        occludedModules: 0,
        ecBudgetPercent: ecLimit,
        hasLogo: false,
      },
    };
    return { check, findings, coveragePercent: 0, logoModulesCount: 0 };
  }

  const logoScale = design.logo.scale ?? 0.24;
  const logoPadding = design.logo.padding ?? 1;
  const geo = computeLogoCoverage(matrixSize, logoScale, logoPadding);
  const coveragePercent = geo.coveragePercent;

  let summary = `Center logo covers ${coveragePercent}% of matrix, safely within ${ecLimit}% recovery budget.`;

  if (coveragePercent > ecLimit) {
    status = "blocking";
    scorePenalty = penalties.exceedsCapacity;
    summary = `Center logo coverage (${coveragePercent}%) exceeds Level ${design.errorCorrection} recovery capacity (${ecLimit}%).`;
    findings.push({
      id: "finding_logo_exceeds_ec",
      code: "LOGO_EXCEEDS_EC_CAPACITY",
      channel: "logo_area",
      severity: "blocking",
      title: "Logo Exceeds Error Correction Capacity",
      description: `Center logo plate occludes approximately ${coveragePercent}% of data modules, which exceeds the mathematical recovery budget (${ecLimit}%) provided by Level ${design.errorCorrection} Reed-Solomon coding. The QR code cannot be decoded.`,
      evidence: {
        logoCoveragePercent: `${coveragePercent}%`,
        ecRecoveryLimit: `${ecLimit}%`,
        occludedModules: geo.logoModulesCount,
        totalModules: geo.totalModules,
        errorCorrectionLevel: design.errorCorrection,
      },
      remediation: "Reduce logo size or upgrade Error Correction to Level H (30% capacity).",
      blocking: true,
      targetControl: "design.logo.size",
      potentialImprovementScore: penalties.exceedsCapacity,
      suggestedFixValue: {
        scale: 0.2,
      },
    });
  } else if (coveragePercent > safeThreshold) {
    status = "warning";
    scorePenalty = penalties.highCoverage;
    summary = `Logo coverage (${coveragePercent}%) consumes most of the ${ecLimit}% recovery budget.`;
    findings.push({
      id: "finding_logo_coverage_high",
      code: "LOGO_COVERAGE_HIGH",
      channel: "logo_area",
      severity: "warning",
      title: "Elevated Logo Coverage",
      description: `Center logo occludes ${coveragePercent}% of modules. While mathematically within the ${ecLimit}% limit, physical surface scratches or print distortion may cause decode failures.`,
      evidence: {
        logoCoveragePercent: `${coveragePercent}%`,
        safeOperatingHeadroom: `${safeThreshold}%`,
        ecRecoveryLimit: `${ecLimit}%`,
      },
      remediation: "Reduce logo scale to below 0.24 or increase Error Correction level.",
      blocking: false,
      targetControl: "design.logo.size",
      potentialImprovementScore: penalties.highCoverage,
      suggestedFixValue: {
        scale: 0.22,
      },
    });
  } else if (coveragePercent > 10 && design.errorCorrection === "L") {
    status = "notice";
    scorePenalty = 5;
    summary = `Logo coverage is ${coveragePercent}%. Recommend upgrading from Level L to Level M or Q.`;
    findings.push({
      id: "finding_logo_low_ec_notice",
      code: "LOGO_ON_LOW_EC_NOTICE",
      channel: "logo_area",
      severity: "notice",
      title: "Logo with Minimal Error Correction",
      description: `Logo is placed on Level L (7% recovery). Any minor physical smudge could prevent reading.`,
      evidence: {
        logoCoveragePercent: `${coveragePercent}%`,
        errorCorrectionLevel: "L",
      },
      remediation: "Switch error correction to Level M (15%) or Level Q (25%).",
      blocking: false,
      targetControl: "design.errorCorrection",
    });
  }

  const check: ScanabilityCheckResult = {
    channel: "logo_area",
    channelNumber: "03",
    channelName: "Logo Area",
    label: "03 LOGO AREA",
    status,
    summary,
    scorePenalty,
    measurements: {
      coveragePercent,
      occludedModules: geo.logoModulesCount,
      ecBudgetPercent: ecLimit,
      safeThresholdPercent: safeThreshold,
      hasLogo: true,
      scale: logoScale,
    },
  };

  return { check, findings, coveragePercent, logoModulesCount: geo.logoModulesCount };
}
