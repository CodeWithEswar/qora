/**
 * NXTQR — QR Template Governance & Brand Kit Inheritance
 * Enforces brand consistency and validates immutable locked fields.
 */

import { QrDesignV1 } from "@nxtqr/qr-core";

export const SUPPORTED_LOCKED_FIELDS = [
  {
    key: "colors",
    label: "Brand Colors",
    description: "Foreground color, background, and gradient are locked to the Brand Kit",
    icon: "tabler:palette",
  },
  {
    key: "logo",
    label: "Brand Mark / Logo",
    description: "Logo graphic and safe margin scaling cannot be altered",
    icon: "tabler:brand-apple",
  },
  {
    key: "frame",
    label: "Brand Frame & CTA",
    description: "Border treatment and frame styling are enforced",
    icon: "tabler:border-all",
  },
  {
    key: "modules",
    label: "Module Geometry",
    description: "Pattern style and finder eyes are locked to the corporate identity",
    icon: "tabler:layout-grid",
  },
] as const;

export type LockedFieldKey = "colors" | "logo" | "frame" | "modules";

/**
 * Inherits colors or logos from a Brand Kit into a template design.
 */
export function applyBrandKitToDesign(
  design: QrDesignV1,
  brandKit: {
    primaryColor?: string;
    colors?: Array<{ hex: string; role?: string }>;
    logoUrl?: string | null;
    logos?: Array<{ url: string; isPrimary?: boolean; assetId?: string }>;
  },
  lockedFields: string[] = []
): QrDesignV1 {
  const next: QrDesignV1 = JSON.parse(JSON.stringify(design));

  // 1. Inherit Primary Color if colors locked or unset
  if (brandKit.primaryColor && (!next.fgColor || lockedFields.includes("colors"))) {
    next.fgColor = brandKit.primaryColor;
  }

  // 2. Inherit Primary Logo if logo locked or unset
  const primaryLogo = brandKit.logos?.find((l) => l.isPrimary) || brandKit.logos?.[0];
  const logoUrl = primaryLogo?.url || brandKit.logoUrl;
  const assetId = primaryLogo?.assetId;

  if (logoUrl && (!next.logo?.url || lockedFields.includes("logo"))) {
    next.logo = {
      ...(next.logo || { scale: 0.24, padding: 4, shape: "square" }),
      url: logoUrl,
      assetId: assetId || next.logo?.assetId,
    };
  }

  return next;
}

/**
 * Validates that an updated design does not mutate fields marked as locked.
 */
export function validateLockedFieldMutations(
  originalDesign: QrDesignV1,
  updatedDesign: QrDesignV1,
  lockedFields: string[]
): { valid: boolean; violation?: string } {
  if (!lockedFields || lockedFields.length === 0) {
    return { valid: true };
  }

  for (const field of lockedFields) {
    switch (field) {
      case "colors":
        if (
          originalDesign.fgColor !== updatedDesign.fgColor ||
          originalDesign.bgColor !== updatedDesign.bgColor ||
          JSON.stringify(originalDesign.gradient) !== JSON.stringify(updatedDesign.gradient)
        ) {
          return {
            valid: false,
            violation: "Colors and gradients are brand-locked and cannot be modified on this template.",
          };
        }
        break;

      case "logo":
        if (
          originalDesign.logo?.url !== updatedDesign.logo?.url ||
          originalDesign.logo?.assetId !== updatedDesign.logo?.assetId
        ) {
          return {
            valid: false,
            violation: "The logo asset is brand-locked and cannot be modified on this template.",
          };
        }
        break;

      case "frame":
        if (
          originalDesign.frame?.style !== updatedDesign.frame?.style ||
          originalDesign.frame?.bgColor !== updatedDesign.frame?.bgColor ||
          originalDesign.frame?.textColor !== updatedDesign.frame?.textColor
        ) {
          return {
            valid: false,
            violation: "Frame styling is brand-locked and cannot be modified on this template.",
          };
        }
        break;

      case "modules":
        if (
          originalDesign.moduleStyle !== updatedDesign.moduleStyle ||
          originalDesign.eyeOuterStyle !== updatedDesign.eyeOuterStyle ||
          originalDesign.eyeInnerStyle !== updatedDesign.eyeInnerStyle
        ) {
          return {
            valid: false,
            violation: "Module geometry and finder styles are brand-locked on this template.",
          };
        }
        break;
    }
  }

  return { valid: true };
}
