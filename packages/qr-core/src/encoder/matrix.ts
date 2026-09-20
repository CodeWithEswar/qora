import qrcode from "qrcode-generator";
import { QrErrorCorrectionLevel } from "../design/schema";

export interface QrMatrixResult {
  matrix: boolean[][];
  size: number;
  typeNumber: number;
  errorCorrectionLevel: QrErrorCorrectionLevel;
  isEyeModule: (row: number, col: number) => boolean;
  isFinderOuter: (row: number, col: number) => boolean;
  isFinderInner: (row: number, col: number) => boolean;
}

/**
 * Checks if a coordinate falls within any of the three standard QR finder patterns.
 */
export function getFinderPatternInfo(row: number, col: number, size: number): {
  isFinder: boolean;
  corner?: "TL" | "TR" | "BL";
  isOuter?: boolean;
  isInner?: boolean;
} {
  // Top-Left finder: [0..6, 0..6]
  if (row >= 0 && row < 7 && col >= 0 && col < 7) {
    const relR = row;
    const relC = col;
    const isOuter = relR === 0 || relR === 6 || relC === 0 || relC === 6;
    const isInner = relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4;
    return { isFinder: true, corner: "TL", isOuter, isInner };
  }

  // Top-Right finder: [0..6, (size-7)..(size-1)]
  if (row >= 0 && row < 7 && col >= size - 7 && col < size) {
    const relR = row;
    const relC = col - (size - 7);
    const isOuter = relR === 0 || relR === 6 || relC === 0 || relC === 6;
    const isInner = relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4;
    return { isFinder: true, corner: "TR", isOuter, isInner };
  }

  // Bottom-Left finder: [(size-7)..(size-1), 0..6]
  if (row >= size - 7 && row < size && col >= 0 && col < 7) {
    const relR = row - (size - 7);
    const relC = col;
    const isOuter = relR === 0 || relR === 6 || relC === 0 || relC === 6;
    const isInner = relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4;
    return { isFinder: true, corner: "BL", isOuter, isInner };
  }

  return { isFinder: false };
}

/**
 * Generates the authentic, mathematical 2D QR matrix for any payload string.
 */
export function encodeQrMatrix(
  text: string,
  errorCorrection: QrErrorCorrectionLevel = "Q"
): QrMatrixResult {
  // TypeNumber 0 tells qrcode-generator to auto-select minimum QR version (1-40) needed for payload length
  const qr = qrcode(0, errorCorrection);
  qr.addData(text || " ");
  qr.make();

  const size = qr.getModuleCount();
  const matrix: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(qr.isDark(r, c));
    }
    matrix.push(row);
  }

  return {
    matrix,
    size,
    typeNumber: (size - 17) / 4,
    errorCorrectionLevel: errorCorrection,
    isEyeModule: (r, c) => getFinderPatternInfo(r, c, size).isFinder,
    isFinderOuter: (r, c) => getFinderPatternInfo(r, c, size).isOuter ?? false,
    isFinderInner: (r, c) => getFinderPatternInfo(r, c, size).isInner ?? false,
  };
}
