import { QrDesignV1 } from "../design/schema";

export type ScanabilityChannelId =
  | "contrast"
  | "quiet_zone"
  | "finder_integrity"
  | "logo_area"
  | "module_size"
  | "recovery";

export type ScanabilityStatus =
  | "pass"
  | "notice"
  | "warning"
  | "blocking"
  | "not_ready"
  | "error";

export type ScanabilitySeverity =
  | "pass"
  | "notice"
  | "warning"
  | "blocking";

export interface ScanabilityOutputContext {
  type: "editor" | "digitalExport" | "printExport";
  exportSizePx?: number;
  printPresetId?: string;
  printWidthMm?: number;
}

export type ScanabilityTargetControl =
  | "design.colors"
  | "design.quietZone"
  | "design.logo.size"
  | "design.errorCorrection"
  | "export.dimensions";

export interface ScanabilityFinding {
  id: string;
  code: string;
  channel: ScanabilityChannelId;
  severity: ScanabilitySeverity;
  title: string;
  description: string;
  evidence: Record<string, string | number | boolean>;
  remediation: string;
  blocking: boolean;
  targetControl?: ScanabilityTargetControl;
  potentialImprovementScore?: number;
  suggestedFixValue?: any;
}

export interface ScanabilityCheckResult {
  channel: ScanabilityChannelId;
  channelNumber: "01" | "02" | "03" | "04" | "05" | "06" | string;
  channelName: string;
  label: string;
  status: ScanabilitySeverity;
  summary: string;
  scorePenalty: number;
  measurements: Record<string, string | number | boolean>;
}

export interface ScanabilityDeduction {
  channel: ScanabilityChannelId;
  penalty: number;
  reason: string;
}

export interface ScanabilityScoreBreakdown {
  base: number;
  deductions: ScanabilityDeduction[];
  final: number;
}

export interface ScanabilityGeometry {
  matrixSize: number;
  totalModules: number;
  quietZoneModules: number;
  logoCoveragePercent: number;
  logoModulesCount: number;
  effectiveModulePixelSize?: number;
  effectiveModulePhysicalMm?: number;
  ecRecoveryBudget: number;
  centerBox: {
    xStart: number;
    yStart: number;
    size: number;
  };
  finders?: {
    tl: { x: number; y: number; size: number };
    tr: { x: number; y: number; size: number };
    bl: { x: number; y: number; size: number };
    hasCollision: boolean;
  };
}


export interface ScanabilityResultV1 {
  schemaVersion: 1;
  policyVersion: string;
  status: ScanabilityStatus;
  score?: number; // 0-100 deterministic summary (undefined if not_ready or error)
  scoreBreakdown?: ScanabilityScoreBreakdown;
  summary: string;
  recommendationsCount: number;
  blockersCount: number;
  checks: ScanabilityCheckResult[];
  findings: ScanabilityFinding[];
  geometry?: ScanabilityGeometry;
  errorMessage?: string;
}

import { QrContentV1 } from "../content/schema";

export interface EvaluateScanabilityInput {
  content: string | QrContentV1;
  design: QrDesignV1;
  outputContext?: ScanabilityOutputContext;
}
