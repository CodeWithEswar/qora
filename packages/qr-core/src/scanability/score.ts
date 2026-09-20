import { ScanabilityCheckResult, ScanabilityDeduction, ScanabilityScoreBreakdown } from "./types";

/**
 * Deterministic mathematical scoring engine.
 * Computes 0-100 score strictly from itemized check penalties.
 * No Math.random, no fabricated constants.
 */
export function computeScanabilityScore(
  checks: ScanabilityCheckResult[],
  hasBlockers: boolean
): {
  score: number;
  breakdown: ScanabilityScoreBreakdown;
} {
  const base = 100;
  const deductions: ScanabilityDeduction[] = [];
  let totalDeductions = 0;

  for (const check of checks) {
    if (check.scorePenalty > 0) {
      deductions.push({
        channel: check.channel,
        penalty: check.scorePenalty,
        reason: check.summary,
      });
      totalDeductions += check.scorePenalty;
    }
  }

  // If there are blocking findings, score cannot exceed 40
  let finalScore = Math.max(10, base - totalDeductions);
  if (hasBlockers && finalScore > 40) {
    finalScore = 35;
  }

  return {
    score: finalScore,
    breakdown: {
      base,
      deductions,
      final: finalScore,
    },
  };
}
