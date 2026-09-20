import { QrDesignV1 } from "./schema";

/**
 * NXTQR — Canonical Design Presets
 * System design defaults are legitimate configuration, not fake business data.
 */

export const CANONICAL_QR_DESIGN_DEFAULTS: QrDesignV1 = {
  schemaVersion: 1,
  moduleStyle: "squares",
  eyeOuterStyle: "square",
  eyeInnerStyle: "square",
  fgColor: "#1F1F1F",
  bgColor: "#FFFFFF",
  frame: {
    style: "none",
    text: "SCAN ME",
    bgColor: "#1F1F1F",
    textColor: "#FFFFFF",
  },
  quietZone: 4,
  errorCorrection: "Q",
};

export const SYSTEM_DESIGN_PRESETS: Array<{ id: string; name: string; description: string; design: Partial<QrDesignV1> }> = [
  {
    id: "classic-editorial",
    name: "Classic Editorial",
    description: "Crisp black squares on white with generous 4-module quiet zone.",
    design: {
      moduleStyle: "squares",
      eyeOuterStyle: "square",
      eyeInnerStyle: "square",
      fgColor: "#1F1F1F",
      bgColor: "#FFFFFF",
      errorCorrection: "Q",
    },
  },
  {
    id: "nxtqr-signal",
    name: "NXTQR Signal",
    description: "Smooth rounded geometry with NXTQR signal orange accent.",
    design: {
      moduleStyle: "rounded",
      eyeOuterStyle: "rounded",
      eyeInnerStyle: "dot",
      fgColor: "#FA520F",
      bgColor: "#FFFFFF",
      errorCorrection: "Q",
    },
  },
  {
    id: "modern-dots",
    name: "Modern Dots",
    description: "Circular module matrix with matching rounded finder eyes.",
    design: {
      moduleStyle: "dots",
      eyeOuterStyle: "rounded",
      eyeInnerStyle: "dot",
      fgColor: "#09090B",
      bgColor: "#FFFFFF",
      errorCorrection: "H",
    },
  },
  {
    id: "precision-dark",
    name: "Precision Dark",
    description: "Inverted high-contrast dark theme with diamond modules.",
    design: {
      moduleStyle: "diamond",
      eyeOuterStyle: "leaf",
      eyeInnerStyle: "square",
      fgColor: "#FFFFFF",
      bgColor: "#18181B",
      errorCorrection: "Q",
    },
  },
];
