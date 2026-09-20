import { QrDesignV1 } from "../../design/schema";
import { SCANABILITY_POLICY_V1 } from "../thresholds";
import { ScanabilityCheckResult, ScanabilityFinding } from "../types";

export function checkQuietZone(design: QrDesignV1): {
  check: ScanabilityCheckResult;
  findings: ScanabilityFinding[];
} {
  const quietZone = design.quietZone;
  const { standardModules, minimumSafetyModules, criticalModules, penalties } =
    SCANABILITY_POLICY_V1.quietZone;

  const findings: ScanabilityFinding[] = [];
  let scorePenalty = 0;
  let status: "pass" | "notice" | "warning" | "blocking" = "pass";
  let summary = `Standard ${quietZone}-module clear perimeter complies with ISO/IEC 18004.`;

  if (quietZone < criticalModules) {
    status = "blocking";
    scorePenalty = penalties.deficient;
    summary = `Quiet zone is deficient (${quietZone} modules). External graphics will break scan bounds.`;
    findings.push({
      id: "finding_quiet_zone_deficient",
      code: "QUIET_ZONE_DEFICIENT",
      channel: "quiet_zone",
      severity: "blocking",
      title: "Quiet Zone Deficient",
      description: `Quiet zone is set to ${quietZone} modules. Without a clear margin, adjacent text or graphics will merge with the QR matrix, preventing finder pattern recognition.`,
      evidence: {
        configuredModules: quietZone,
        standardRequiredModules: standardModules,
        minimumSafetyModules,
      },
      remediation: `Increase quiet zone to at least ${standardModules} modules.`,
      blocking: true,
      targetControl: "design.quietZone",
      potentialImprovementScore: penalties.deficient,
      suggestedFixValue: standardModules,
    });
  } else if (quietZone < minimumSafetyModules) {
    status = "warning";
    scorePenalty = penalties.reduced;
    summary = `Quiet zone is narrow (${quietZone} modules). Print trim borders or backgrounds may interfere.`;
    findings.push({
      id: "finding_quiet_zone_reduced",
      code: "QUIET_ZONE_REDUCED",
      channel: "quiet_zone",
      severity: "warning",
      title: "Reduced Quiet Zone",
      description: `Quiet zone is ${quietZone} modules. Standard QR specification recommends 4 modules of uninterrupted clear space.`,
      evidence: {
        configuredModules: quietZone,
        standardRequiredModules: standardModules,
      },
      remediation: `Expand quiet zone padding to ${standardModules} modules for reliable scanning.`,
      blocking: false,
      targetControl: "design.quietZone",
      potentialImprovementScore: penalties.reduced,
      suggestedFixValue: standardModules,
    });
  } else if (quietZone < standardModules) {
    status = "notice";
    scorePenalty = 5;
    summary = `Quiet zone (${quietZone} modules) is slightly below 4-module ISO standard.`;
    findings.push({
      id: "finding_quiet_zone_notice",
      code: "QUIET_ZONE_SUB_STANDARD_NOTICE",
      channel: "quiet_zone",
      severity: "notice",
      title: "Slightly Reduced Quiet Zone",
      description: `Current quiet zone is ${quietZone} modules. Standard specification calls for 4 modules.`,
      evidence: {
        configuredModules: quietZone,
        standardModules,
      },
      remediation: `Increase quiet zone to ${standardModules} modules.`,
      blocking: false,
      targetControl: "design.quietZone",
      suggestedFixValue: standardModules,
    });
  }

  const check: ScanabilityCheckResult = {
    channel: "quiet_zone",
    channelNumber: "02",
    channelName: "Quiet Zone",
    label: "02 QUIET ZONE",
    status,
    summary,
    scorePenalty,
    measurements: {
      modules: quietZone,
      standardModules,
      isCompliant: quietZone >= standardModules,
    },
  };

  return { check, findings };
}
