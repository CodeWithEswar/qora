/**
 * Pure geometric calculation functions for QR matrix dimensions and module positions.
 */

export interface MatrixBounds {
  matrixSize: number;
  totalModules: number;
  finderPatterns: Array<{
    x: number;
    y: number;
    size: number;
    label: "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT";
  }>;
}

export function computeMatrixBounds(matrixSize: number): MatrixBounds {
  const finderSize = 7; // Standard QR finder pattern dimension is 7x7 modules
  return {
    matrixSize,
    totalModules: matrixSize * matrixSize,
    finderPatterns: [
      { x: 0, y: 0, size: finderSize, label: "TOP_LEFT" },
      { x: matrixSize - finderSize, y: 0, size: finderSize, label: "TOP_RIGHT" },
      { x: 0, y: matrixSize - finderSize, size: finderSize, label: "BOTTOM_LEFT" },
    ],
  };
}

export function computeCenterBox(matrixSize: number, scale: number): {
  xStart: number;
  yStart: number;
  size: number;
} {
  const effectiveScale = Math.max(0.05, scale);
  const boxModules = Math.max(1, Math.round(matrixSize * effectiveScale));
  const start = Math.floor((matrixSize - boxModules) / 2);
  return {
    xStart: start,
    yStart: start,
    size: boxModules,
  };
}
