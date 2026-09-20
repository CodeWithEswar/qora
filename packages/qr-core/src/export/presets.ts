export interface PrintPreset {
  id: string;
  name: string;
  description: string;
  pageWidthMm: number;
  pageHeightMm: number;
  qrSizeMm: number;
  pageWidthPt: number;
  pageHeightPt: number;
  qrSizePt: number;
}

// 1 mm = 72 / 25.4 = 2.83464567 pt
const mmToPt = (mm: number) => Math.round(mm * 2.83465 * 10) / 10;

export const PRINT_PRESETS: Record<string, PrintPreset> = {
  "business-card": {
    id: "business-card",
    name: "Business Card",
    description: "Standard 85 × 55 mm business card with 28 mm QR footprint.",
    pageWidthMm: 85,
    pageHeightMm: 55,
    qrSizeMm: 28,
    pageWidthPt: mmToPt(85),
    pageHeightPt: mmToPt(55),
    qrSizePt: mmToPt(28),
  },
  "table-tent": {
    id: "table-tent",
    name: "Table Tent / Menu Stand",
    description: "100 × 150 mm vertical table display with 65 mm QR footprint.",
    pageWidthMm: 100,
    pageHeightMm: 150,
    qrSizeMm: 65,
    pageWidthPt: mmToPt(100),
    pageHeightPt: mmToPt(150),
    qrSizePt: mmToPt(65),
  },
  sticker: {
    id: "sticker",
    name: "Product Sticker",
    description: "50 × 50 mm square adhesive sticker with 40 mm QR footprint.",
    pageWidthMm: 50,
    pageHeightMm: 50,
    qrSizeMm: 40,
    pageWidthPt: mmToPt(50),
    pageHeightPt: mmToPt(50),
    qrSizePt: mmToPt(40),
  },
  "poster-a4": {
    id: "poster-a4",
    name: "A4 Poster Sheet",
    description: "210 × 297 mm international standard A4 sheet with 120 mm QR footprint.",
    pageWidthMm: 210,
    pageHeightMm: 297,
    qrSizeMm: 120,
    pageWidthPt: mmToPt(210),
    pageHeightPt: mmToPt(297),
    qrSizePt: mmToPt(120),
  },
};

export const PRINT_PRESET_LIST = Object.values(PRINT_PRESETS);
