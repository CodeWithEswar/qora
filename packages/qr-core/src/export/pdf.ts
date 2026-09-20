import { QrDesignV1 } from "../design/schema";
import { encodeQrMatrix, getFinderPatternInfo } from "../encoder/matrix";
import { PRINT_PRESETS, PrintPreset } from "./presets";
import { hexToRgb } from "../scanability/contrast";

export interface PdfExportOptions {
  content: string;
  design: QrDesignV1;
  presetId?: string; // key of PRINT_PRESETS, default 'sticker'
  fileName?: string;
}

/**
 * Deterministic Vector PDF 1.4 Generator
 * Emits raw vector PDF byte streams with exact physical point geometries.
 * Fully compatible with Node, edge workers, and browsers without any native dependencies.
 */
export function exportQrPdf(options: PdfExportOptions): {
  pdfBuffer: Uint8Array;
  mimeType: string;
  fileName: string;
} {
  const preset: PrintPreset = PRINT_PRESETS[options.presetId || "sticker"] || PRINT_PRESETS["sticker"];
  const { content, design } = options;
  const qr = encodeQrMatrix(content || " ", design.errorCorrection);
  const matrixSize = qr.size;
  const quietZone = Math.max(1, design.quietZone || 4);
  const totalModules = matrixSize + quietZone * 2;

  const pageWidth = preset.pageWidthPt;
  const pageHeight = preset.pageHeightPt;
  const qrSizePt = Math.min(preset.qrSizePt, Math.min(pageWidth, pageHeight) - 20);

  const moduleSizePt = qrSizePt / totalModules;
  const originX = (pageWidth - qrSizePt) / 2;
  const originY = (pageHeight - qrSizePt) / 2;

  // Convert colors to PDF RGB (0.0 - 1.0)
  const bgRgb = hexToRgb(design.bgColor);
  const fgRgb = hexToRgb(design.fgColor);
  const bgPdf = `${(bgRgb.r / 255).toFixed(3)} ${(bgRgb.g / 255).toFixed(3)} ${(bgRgb.b / 255).toFixed(3)} rg`;
  const fgPdf = `${(fgRgb.r / 255).toFixed(3)} ${(fgRgb.g / 255).toFixed(3)} ${(fgRgb.b / 255).toFixed(3)} rg`;

  // Build PDF Graphics Stream
  const streamLines: string[] = [];

  // 1. Page Background
  streamLines.push("q");
  streamLines.push(bgPdf);
  streamLines.push(`0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)} re f`);

  // 2. QR Background / Quiet zone plate
  streamLines.push(bgPdf);
  streamLines.push(`${originX.toFixed(2)} ${originY.toFixed(2)} ${qrSizePt.toFixed(2)} ${qrSizePt.toFixed(2)} re f`);

  // 3. QR Modules
  streamLines.push(fgPdf);

  // Note: PDF coordinate origin (0,0) is at Bottom-Left, so y runs upwards
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (qr.matrix[r][c]) {
        const x = originX + (c + quietZone) * moduleSizePt;
        // Invert r for bottom-left origin: row 0 is top
        const y = originY + (totalModules - 1 - (r + quietZone)) * moduleSizePt;
        streamLines.push(`${x.toFixed(2)} ${y.toFixed(2)} ${moduleSizePt.toFixed(2)} ${moduleSizePt.toFixed(2)} re`);
      }
    }
  }

  // Fill all QR rectangles in one batch for maximum performance
  streamLines.push("f");
  streamLines.push("Q");

  const streamContent = streamLines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  // Construct PDF Objects
  const objects: string[] = [];
  const offsets: number[] = [];

  // Header
  let pdf = "%PDF-1.4\n";

  // Obj 1: Catalog
  offsets.push(pdf.length);
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  pdf += obj1;

  // Obj 2: Pages
  offsets.push(pdf.length);
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  pdf += obj2;

  // Obj 3: Page
  offsets.push(pdf.length);
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents 4 0 R >>\nendobj\n`;
  pdf += obj3;

  // Obj 4: Content Stream
  offsets.push(pdf.length);
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  pdf += obj4;

  // Xref table
  const startXref = pdf.length;
  let xref = "xref\n0 5\n0000000000 65535 f \n";
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  pdf += xref + trailer;

  const cleanName = (options.fileName || "nxtqr-print")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);

  const encoder = new TextEncoder();
  return {
    pdfBuffer: encoder.encode(pdf),
    mimeType: "application/pdf",
    fileName: `${cleanName || "nxtqr-print"}.pdf`,
  };
}
