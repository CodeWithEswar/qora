import { z } from "zod";

/**
 * NXTQR — Flagship QR Visual Design Schema (V1)
 * Encompasses module geometries, eye finders, frames, colors, and gradients.
 */

export const ModuleStyleSchema = z.enum([
  "squares",
  "rounded",
  "dots",
  "soft",
  "extra_rounded",
  "diamond",
]);
export type ModuleStyle = z.infer<typeof ModuleStyleSchema>;

export const EyeOuterStyleSchema = z.enum(["square", "rounded", "leaf", "circle"]);
export type EyeOuterStyle = z.infer<typeof EyeOuterStyleSchema>;

export const EyeInnerStyleSchema = z.enum(["square", "rounded", "dot", "diamond"]);
export type EyeInnerStyle = z.infer<typeof EyeInnerStyleSchema>;

export const GradientTypeSchema = z.enum(["linear", "radial"]);
export type GradientType = z.infer<typeof GradientTypeSchema>;

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hexadecimal color code");

export const QrGradientConfigSchema = z.object({
  type: GradientTypeSchema.default("linear"),
  startColor: HexColorSchema,
  endColor: HexColorSchema,
  angle: z.number().min(0).max(360).default(45),
});
export type QrGradientConfig = z.infer<typeof QrGradientConfigSchema>;

export const QrLogoConfigSchema = z.object({
  assetId: z.string().optional(),
  url: z.string().optional(),
  scale: z.number().min(0.1).max(0.35).default(0.24), // Ratio of QR size
  padding: z.number().min(0).max(12).default(4),
  shape: z.enum(["square", "circle"]).default("square"),
});
export type QrLogoConfig = z.infer<typeof QrLogoConfigSchema>;

export const QrFrameConfigSchema = z.object({
  style: z
    .enum(["none", "simple", "badge", "card", "signal_bar", "corners", "outline"])
    .default("none"),
  text: z.string().max(32).default("SCAN ME"),
  bgColor: HexColorSchema.default("#1F1F1F"),
  textColor: HexColorSchema.default("#FFFFFF"),
});
export type QrFrameConfig = z.infer<typeof QrFrameConfigSchema>;

export const QrErrorCorrectionSchema = z.enum(["L", "M", "Q", "H"]);
export type QrErrorCorrectionLevel = z.infer<typeof QrErrorCorrectionSchema>;

export const QrDesignV1Schema = z.object({
  schemaVersion: z.literal(1).default(1),
  moduleStyle: ModuleStyleSchema.default("squares"),
  eyeOuterStyle: EyeOuterStyleSchema.default("square"),
  eyeInnerStyle: EyeInnerStyleSchema.default("square"),
  fgColor: HexColorSchema.default("#1F1F1F"),
  bgColor: HexColorSchema.default("#FFFFFF"),
  eyeColor: HexColorSchema.optional(),
  eyeInnerColor: HexColorSchema.optional(),
  gradient: QrGradientConfigSchema.optional(),
  logo: QrLogoConfigSchema.optional(),
  frame: QrFrameConfigSchema.default({
    style: "none",
    text: "SCAN ME",
    bgColor: "#1F1F1F",
    textColor: "#FFFFFF",
  }),
  quietZone: z.number().int().min(1).max(10).default(4),
  errorCorrection: QrErrorCorrectionSchema.default("Q"),
});
export type QrDesignV1 = z.infer<typeof QrDesignV1Schema>;
