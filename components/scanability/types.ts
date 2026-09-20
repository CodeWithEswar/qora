import {
  QrDesignV1,
  ScanabilityCheckResult,
  ScanabilityFinding,
  ScanabilityGeometry,
  ScanabilityResultV1,
  ScanabilityStatus,
} from "@nxtqr/qr-core";

export interface ScanabilityQrRecord {
  id: string;
  name: string;
  slug: string;
  qrType: string;
  status: string;
  isDynamic: boolean;
  publishedRevision: number;
  content: string;
  defaultUrl: string;
  design: QrDesignV1;
  createdAt: string;
  updatedAt: string;
}

export type OverlayLayerId =
  | "quiet_zone"
  | "finders"
  | "logo_safety"
  | "module_grid"
  | "contrast_field";

export interface OutputPreset {
  id: string;
  name: string;
  category: "digital" | "print";
  widthMm?: number;
  exportSizePx?: number;
  targetDpi: number;
  description: string;
  recommendedMinDistanceM: number;
  iconName: string;
}

export const PRINT_PRESETS: OutputPreset[] = [
  {
    id: "digital_screen",
    name: "Digital Display / Mobile",
    category: "digital",
    exportSizePx: 600,
    targetDpi: 72,
    description: "Websites, social media, app screens, email signatures",
    recommendedMinDistanceM: 0.3,
    iconName: "Monitor",
  },
  {
    id: "business_card",
    name: "Business Card",
    category: "print",
    widthMm: 45,
    targetDpi: 300,
    description: "Ultra-compact physical print (45 × 45 mm)",
    recommendedMinDistanceM: 0.45,
    iconName: "CreditCard",
  },
  {
    id: "packaging_label",
    name: "Packaging / Product Label",
    category: "print",
    widthMm: 30,
    targetDpi: 300,
    description: "High-density product packaging or bottle label (30 × 30 mm)",
    recommendedMinDistanceM: 0.3,
    iconName: "Tag",
  },
  {
    id: "flyer_a5",
    name: "Flyer / Table Tent / Menu",
    category: "print",
    widthMm: 75,
    targetDpi: 300,
    description: "Restaurant tables, event flyers, brochures (75 × 75 mm)",
    recommendedMinDistanceM: 0.75,
    iconName: "FileText",
  },
  {
    id: "poster_a3",
    name: "Poster / Wall Signage",
    category: "print",
    widthMm: 180,
    targetDpi: 150,
    description: "Storefront windows, indoor posters, event boards (180 × 180 mm)",
    recommendedMinDistanceM: 1.8,
    iconName: "Layers",
  },
  {
    id: "billboard",
    name: "Billboard / Exterior Banner",
    category: "print",
    widthMm: 600,
    targetDpi: 72,
    description: "Large format outdoor advertising (600 × 600 mm)",
    recommendedMinDistanceM: 6.0,
    iconName: "Tv",
  },
];
