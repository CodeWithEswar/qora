import { QrErrorCorrectionLevel } from "../../design/schema";
import { SCANABILITY_POLICY_V1 } from "../thresholds";
import { ScanabilityCheckResult, ScanabilityFinding } from "../types";

export function checkErrorCorrection(
  errorCorrection: QrErrorCorrectionLevel,
  matrixSize: number,
  payloadLength: number,
  logoCoveragePercent: number
): {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
} {
  const ecLimit = SCANABILITY_POLICY_V1.logoArea.ecLimits[errorCorrection];
  const { denseMatrixThreshold, densityPenalty } = SCANABILITY_POLICY_V1.errorCorrection;

  const findings: ScanabilityFinding[] = [];
  let scorePenalty = 0;
  let status: "pass" | "notice" | "warning" | "blocking" = "pass";
  let summary = `Level ${errorCorrection} provides up to ${ecLimit}% Reed-Solomon codeword recovery headroom.`;

  // Dense matrix + low redundancy alert
  if (matrixSize >= denseMatrixThreshold && errorCorrection === "L") {
    status = "warning";
    scorePenalty = densityPenalty;
    summary = `Dense ${matrixSize}×${matrixSize} matrix with low redundancy (Level L). Small damages may corrupt data.`;
    findings.push({
      id: "finding_ec_density_risk",
      code: "EC_DENSITY_HIGH",
      channel: "recovery",
      severity: "warning",
      title: "High Density with Low Recovery",
      description: `Payload length (${payloadLength} chars) produced a dense ${matrixSize}×${matrixSize} matrix. Pairing this with minimal 7% error correction increases susceptibility to minor surface smudges.`,
      evidence: {
        errorCorrectionLevel: errorCorrection,
        recoveryCapacity: `${ecLimit}%`,
        matrixSize: `${matrixSize}×${matrixSize}`,
        payloadLength,
      },
      remediation: "Upgrade error correction to Level M (15%) or Level Q (25%) to ensure resilient recovery.",
      blocking: false,
      targetControl: "design.errorCorrection",
      potentialImprovementScore: densityPenalty,
      suggestedFixValue: "M",
    });
  } else if (errorCorrection === "H" && matrixSize > 55) {
    status = "notice";
    scorePenalty = 0;
    summary = `Level H offers maximum 30% recovery, but results in high matrix density (${matrixSize}×${matrixSize}).`;
    findings.push({
      id: "finding_ec_density_tradeoff",
      code: "EC_DENSITY_TRADEOFF_NOTICE",
      channel: "recovery",
      severity: "notice",
      title: "Density vs Recovery Trade-off",
      description: `High error correction level expands the matrix to ${matrixSize}×${matrixSize} modules. If printed at small dimensions, consider Level M or Q for larger module sizes.`,
      evidence: {
        errorCorrectionLevel: "H",
        matrixSize: `${matrixSize}×${matrixSize}`,
      },
      remediation: "Verify module physical size in the print export context.",
      blocking: false,
      targetControl: "design.errorCorrection",
    });
  }

  const check: ScanabilityCheckResult = {
    channel: "recovery",
    channelNumber: "05",
    channelName: "Recovery",
    label: "05 RECOVERY",
    status,
    summary,
    scorePenalty,
    measurements: {
      level: errorCorrection,
      recoveryPercent: `${ecLimit}%`,
      matrixModules: matrixSize,
      payloadLength,
      logoHeadroomPercent: Math.max(0, ecLimit - logoCoveragePercent),
    },
  };

  return { check, findings };
}
