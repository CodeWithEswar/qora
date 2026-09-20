/**
 * NXTQR — QR Core Domain Contracts
 * Formal TypeScript definitions for QR Assets, Visual Designs, Destinations, and Lifecycles.
 */

export type QRType =
  | "url"
  | "vcard"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "app"
  | "payment"
  | "location"
  | "pdf"
  | "text"
  | "event";

export type QRLifecycleState =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "SCHEDULED"
  | "EXPIRED"
  | "ARCHIVED";

export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type PixelStyle = "squares" | "rounded" | "dots";
export type EyeStyle = "square" | "rounded" | "leaf";
export type FrameStyle = "none" | "simple" | "badge" | "callout";

export interface QRGradientConfig {
  type: "linear" | "radial";
  startColor: string;
  endColor: string;
  direction?: "to-r" | "to-b" | "to-br" | "to-bl";
}

export interface QRDesignConfig {
  pixelStyle: PixelStyle;
  eyeStyle: EyeStyle;
  fgColor: string;
  bgColor: string;
  eyeColor?: string;
  gradient?: QRGradientConfig;
  logoUrl?: string;
  logoScale?: number; // 0.15 - 0.35
  logoPadding?: number;
  frameStyle: FrameStyle;
  frameText?: string;
  frameBgColor?: string;
  frameTextColor?: string;
  errorCorrection: QRErrorCorrectionLevel;
  scanabilityScore?: number;
}

export interface QRDestinationConfig {
  defaultUrl: string;
  fallbackUrl?: string;
  passwordHash?: string;
  startsAt?: number; // Unix timestamp in seconds
  expiresAt?: number; // Unix timestamp in seconds
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface QRAsset {
  id: string;
  organizationId: string;
  ownerId: string;
  folderId?: string;
  campaignId?: string;
  slug: string;
  name: string;
  qrType: QRType;
  isDynamic: boolean;
  status: QRLifecycleState;
  currentVersionId: string;
  destination: QRDestinationConfig;
  design: QRDesignConfig;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}

export interface QRVersion {
  id: string;
  qrId: string;
  versionNumber: number;
  destination: QRDestinationConfig;
  design: QRDesignConfig;
  changeSummary: string;
  createdBy: string;
  createdAt: number;
}

export interface ScanabilityIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  suggestion: string;
}

export interface ScanabilityResult {
  score: number; // 0 - 100
  rating: "Poor" | "Moderate" | "Good" | "Excellent";
  issues: ScanabilityIssue[];
  recommendedMinimumPrintMm: number;
}
