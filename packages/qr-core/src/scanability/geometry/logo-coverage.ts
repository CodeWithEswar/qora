import { computeCenterBox } from "./matrix";

export interface LogoCoverageGeometry {
  logoModulesCount: number;
  totalModules: number;
  coveragePercent: number;
  centerBox: {
    xStart: number;
    yStart: number;
    size: number;
  };
}

/**
 * Computes exact module-level coverage and percentage area occupied by the center logo.
 */
export function computeLogoCoverage(
  matrixSize: number,
  logoScale: number,
  paddingModules = 1
): LogoCoverageGeometry {
  const totalModules = matrixSize * matrixSize;
  const rawBox = computeCenterBox(matrixSize, logoScale);

  // Logo plate clears modules including padding around the logo
  const effectiveSize = Math.min(matrixSize - 2, rawBox.size + Math.max(0, paddingModules) * 2);
  const effectiveStart = Math.max(0, Math.floor((matrixSize - effectiveSize) / 2));

  const logoModulesCount = effectiveSize * effectiveSize;
  const coveragePercent = Math.round((logoModulesCount / totalModules) * 1000) / 10;

  return {
    logoModulesCount,
    totalModules,
    coveragePercent,
    centerBox: {
      xStart: effectiveStart,
      yStart: effectiveStart,
      size: effectiveSize,
    },
  };
}
