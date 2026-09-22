/**
 * NXTQR — QR Templates Compatibility Matrix
 * Evaluates template design compatibility with QR payload types.
 */

import { CanonicalQrCompatibilityType } from "./types";

export const SUPPORTED_COMPATIBILITY_TYPES: {
  key: CanonicalQrCompatibilityType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "UNIVERSAL",
    label: "Universal",
    description: "Adaptive design optimized across all QR payload types",
    icon: "tabler:sparkles",
  },
  {
    key: "URL",
    label: "Website / URL",
    description: "Standard web destinations and dynamic resolver links",
    icon: "tabler:world",
  },
  {
    key: "TEXT",
    label: "Plain Text",
    description: "Unformatted notes, coupons, and identifiers",
    icon: "tabler:file-text",
  },
  {
    key: "WIFI",
    label: "Wi-Fi Network",
    description: "Direct SSID and security configuration credentials",
    icon: "tabler:wifi",
  },
  {
    key: "VCARD",
    label: "vCard Contact",
    description: "Dense contact cards, telephone, and address profiles",
    icon: "tabler:id-badge-2",
  },
  {
    key: "APP",
    label: "App Store",
    description: "Deep linking to iOS App Store and Google Play",
    icon: "tabler:apps",
  },
  {
    key: "FILE",
    label: "File / PDF Vault",
    description: "Direct links to hosted PDFs, brochures, and catalogs",
    icon: "tabler:folder",
  },
];

export function isCompatibleWithQrType(
  templateCompatibility: string[] | undefined,
  targetType: string
): boolean {
  if (!templateCompatibility || templateCompatibility.length === 0) {
    return true; // Default to universal
  }
  const normalizedTarget = targetType.trim().toUpperCase();
  const normalizedComp = templateCompatibility.map((c) => c.trim().toUpperCase());

  if (normalizedComp.includes("UNIVERSAL")) {
    return true;
  }
  return normalizedComp.includes(normalizedTarget);
}

export function normalizeCompatibilityTypes(types: unknown): string[] {
  if (!Array.isArray(types) || types.length === 0) {
    return ["UNIVERSAL"];
  }
  const validKeys = new Set(SUPPORTED_COMPATIBILITY_TYPES.map((t) => t.key));
  const filtered = types
    .map((t) => String(t).trim().toUpperCase())
    .filter((t) => validKeys.has(t as CanonicalQrCompatibilityType));

  return filtered.length > 0 ? filtered : ["UNIVERSAL"];
}
