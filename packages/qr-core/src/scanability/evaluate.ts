import { QrDesignV1 } from "../design/schema";
import { encodeQrMatrix } from "../encoder/matrix";
import { checkContrast } from "./checks/contrast";
import { checkQuietZone } from "./checks/quiet-zone";
import { checkLogoArea } from "./checks/logo-area";
import { checkModuleSize } from "./checks/module-size";
import { checkErrorCorrection } from "./checks/error-correction";
import { checkFinderIntegrity } from "./checks/finder-integrity";
import { computeCenterBox } from "./geometry/matrix";
import { computeScanabilityScore } from "./score";
import { SCANABILITY_POLICY_VERSION } from "./thresholds";
import {
  EvaluateScanabilityInput,
  ScanabilityCheckResult,
  ScanabilityFinding,
  ScanabilityGeometry,
  ScanabilityOutputContext,
  ScanabilityResultV1,
  ScanabilityStatus,
} from "./types";


import { encodeQrContent } from "../content/encoders";
import { QrContentV1 } from "../content/schema";

/**
 * Universal runtime-neutral scanability evaluation engine.
 * Supports multiple function signature overloads:
 * 1. evaluateScanability(content, design, outputContext?)
 * 2. evaluateScanability({ content, design, outputContext })
 *
 * Content can be either a raw encoded string or a structured QrContentV1 object.
 *
 * Guaranteed 100% deterministic mathematical assessment:
 * - VALID INPUT -> COMPUTE -> REAL RESULT
 * - INCOMPLETE INPUT -> NOT READY (Waiting for content)
 * - INVALID INPUT -> BLOCKING FINDING
 * - COMPUTATION FAILURE -> ERROR (Never a fake 94 / GOOD)
 */
import { CANONICAL_QR_DESIGN_DEFAULTS } from "../design/defaults";

export function evaluateScanability(
  contentOrInput: string | QrContentV1 | EvaluateScanabilityInput,
  maybeDesign?: QrDesignV1,
  maybeContext?: ScanabilityOutputContext
): ScanabilityResultV1 {
  let rawContent: any;
  let design: QrDesignV1;
  let outputContext: ScanabilityOutputContext | undefined;

  if (
    typeof contentOrInput === "object" &&
    contentOrInput !== null &&
    "design" in contentOrInput &&
    "content" in contentOrInput
  ) {
    rawContent = (contentOrInput as EvaluateScanabilityInput).content;
    design = (contentOrInput as EvaluateScanabilityInput).design;
    outputContext = (contentOrInput as EvaluateScanabilityInput).outputContext;
  } else {
    rawContent = contentOrInput;
    design = maybeDesign!;
    outputContext = maybeContext;
  }

  // Ensure design is well-formed with canonical defaults
  design = design ? { ...CANONICAL_QR_DESIGN_DEFAULTS, ...design } : CANONICAL_QR_DESIGN_DEFAULTS;

  // Normalize content to string
  let content = "";
  if (typeof rawContent === "string") {
    content = rawContent;
  } else if (rawContent && typeof rawContent === "object") {
    if ("type" in rawContent) {
      try {
        content = encodeQrContent(rawContent as QrContentV1);
      } catch {
        content = "";
      }
    } else {
      content = JSON.stringify(rawContent);
    }
  }

  // 1. Incomplete input guard: NOT READY state
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      schemaVersion: 1,
      policyVersion: SCANABILITY_POLICY_VERSION,
      status: "not_ready",
      summary: "Complete the QR content to begin signal integrity analysis.",
      recommendationsCount: 0,
      blockersCount: 0,
      checks: [],
      findings: [],
    };
  }

  try {
    // 2. Encode Matrix (Pure QR encoding check)
    let qr;
    try {
      qr = encodeQrMatrix(trimmed, design.errorCorrection);
    } catch (encErr: any) {
      // Encoding failed (e.g. payload exceeds maximum QR version 40 capacity)
      const blockingFinding: ScanabilityFinding = {
        id: "finding_payload_unencodable",
        code: "PAYLOAD_TOO_LARGE",
        channel: "recovery",
        severity: "blocking",
        title: "Payload Exceeds QR Capacity",
        description: `The supplied payload (${trimmed.length} characters) cannot be encoded with Error Correction Level ${design.errorCorrection}. Standard QR capacity is exceeded.`,
        evidence: {
          payloadLength: trimmed.length,
          errorCorrection: design.errorCorrection,
          errorMessage: encErr?.message || "Encoder capacity exceeded",
        },
        remediation: "Shorten the destination URL or content payload, or use a dynamic short link.",
        blocking: true,
        targetControl: "design.errorCorrection",
      };

      return {
        schemaVersion: 1,
        policyVersion: SCANABILITY_POLICY_VERSION,
        status: "blocking",
        score: 15,
        summary: "The current payload cannot be encoded using the selected QR configuration.",
        recommendationsCount: 0,
        blockersCount: 1,
        checks: [],
        findings: [blockingFinding],
      };
    }

    const matrixSize = qr.size;
    const totalModules = matrixSize * matrixSize;
    const centerBox = computeCenterBox(matrixSize, design.logo?.scale ?? 0.24);

    // 3. Execute the 6 Diagnostic Channels
    const contrastRes = checkContrast(design);
    const quietZoneRes = checkQuietZone(design);
    const finderRes = checkFinderIntegrity(matrixSize, design, centerBox);
    const logoAreaRes = checkLogoArea(matrixSize, design);
    const moduleSizeRes = checkModuleSize(matrixSize, design.quietZone, outputContext);
    const recoveryRes = checkErrorCorrection(
      design.errorCorrection,
      matrixSize,
      trimmed.length,
      logoAreaRes.coveragePercent
    );

    const checks: ScanabilityCheckResult[] = [
      contrastRes.check,
      quietZoneRes.check,
      finderRes.check,
      logoAreaRes.check,
      moduleSizeRes.check,
      recoveryRes.check,
    ];

    const findings: ScanabilityFinding[] = [
      ...contrastRes.findings,
      ...quietZoneRes.findings,
      ...finderRes.findings,
      ...logoAreaRes.findings,
      ...moduleSizeRes.findings,
      ...recoveryRes.findings,
    ];

    // 4. Calculate Aggregate Status & Severity
    const blockers = findings.filter((f) => f.blocking || f.severity === "blocking");
    const warnings = findings.filter((f) => f.severity === "warning");
    const notices = findings.filter((f) => f.severity === "notice");

    const blockersCount = blockers.length;
    const recommendationsCount = warnings.length + notices.length;

    let status: ScanabilityStatus = "pass";
    if (blockersCount > 0) {
      status = "blocking";
    } else if (warnings.length > 0) {
      status = "warning";
    } else if (notices.length > 0) {
      status = "notice";
    }

    // 5. Calculate Deterministic Score
    const { score, breakdown } = computeScanabilityScore(checks, blockersCount > 0);

    // 6. Geometry Model for Visual Overlays
    const geometry: ScanabilityGeometry = {
      matrixSize,
      totalModules,
      quietZoneModules: design.quietZone,
      logoCoveragePercent: logoAreaRes.coveragePercent,
      logoModulesCount: logoAreaRes.logoModulesCount,
      effectiveModulePixelSize: moduleSizeRes.effectivePixelSize,
      effectiveModulePhysicalMm: moduleSizeRes.effectivePhysicalMm,
      ecRecoveryBudget: checks[5].measurements.recoveryPercent as any,
      centerBox,
      finders: {
        tl: { x: 0, y: 0, size: 7 },
        tr: { x: matrixSize - 7, y: 0, size: 7 },
        bl: { x: 0, y: matrixSize - 7, size: 7 },
        hasCollision: finderRes.hasCollision,
      },
    };


    // 7. Summary text
    let summary = "All configured scanability checks passed. Strong signal integrity.";
    if (status === "blocking") {
      summary = `${blockersCount} blocking issue must be resolved before publishing.`;
    } else if (status === "warning") {
      summary = `${warnings.length} recommendation${warnings.length > 1 ? "s" : ""} to optimize physical scanning speed.`;
    } else if (status === "notice") {
      summary = "Scanability is good. Optional design notices identified.";
    }

    return {
      schemaVersion: 1,
      policyVersion: SCANABILITY_POLICY_VERSION,
      status,
      score,
      scoreBreakdown: breakdown,
      summary,
      recommendationsCount,
      blockersCount,
      checks,
      findings,
      geometry,
    };
  } catch (err: any) {
    // Unexpected internal computation fault: Return typed error (NEVER fake 94 / GOOD)
    return {
      schemaVersion: 1,
      policyVersion: SCANABILITY_POLICY_VERSION,
      status: "error",
      summary: "Scanability analysis unavailable. We couldn't analyze the current configuration.",
      recommendationsCount: 0,
      blockersCount: 0,
      checks: [],
      findings: [],
      errorMessage: err?.message || "Internal scanability computation failure",
    };
  }
}
