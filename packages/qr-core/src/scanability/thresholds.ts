/**
 * Centralized, documented Scanability Policy V1
 * Defines mathematical thresholds backed by ISO/IEC 18004 standards and empirical camera optics.
 */

export const SCANABILITY_POLICY_VERSION = "2026.1";

export const SCANABILITY_POLICY_V1 = {
  version: SCANABILITY_POLICY_VERSION,

  contrast: {
    // Standard ISO/IEC and WCAG-aligned optical ratios
    optimalRatio: 7.0,
    minimumRatio: 4.5,
    suboptimalRatio: 3.0,
    criticalRatio: 2.0,
    // Deductions for scoring
    penalties: {
      suboptimal: 15,
      critical: 35,
    },
  },

  quietZone: {
    // ISO/IEC 18004 requires minimum 4 modules of clear margin
    standardModules: 4,
    minimumSafetyModules: 4,
    criticalModules: 2, // Less than 2 modules breaks finder pattern scan bounds
    penalties: {
      reduced: 12,
      deficient: 30,
    },
  },

  logoArea: {
    // Maximum percentage of total matrix modules that can be occluded per EC level
    ecLimits: {
      L: 7,
      M: 15,
      Q: 25,
      H: 30,
    } as Record<"L" | "M" | "Q" | "H", number>,
    // Safe operational headroom (65% of the total Reed-Solomon budget)
    safeBudgetFactor: 0.65,
    penalties: {
      highCoverage: 15,
      exceedsCapacity: 40,
    },
  },

  moduleSize: {
    // Screen / Digital Export minimum module pixel sizes
    digital: {
      optimalPx: 8,
      minimumPx: 5,
      criticalPx: 3,
      penalties: {
        small: 10,
        critical: 25,
      },
    },
    // Physical Press / Print module sizes in millimeters
    print: {
      optimalMm: 1.0,
      minimumMm: 0.7,
      criticalMm: 0.5, // Standard phone camera optical sensor resolving limit
      penalties: {
        small: 15,
        critical: 30,
      },
    },
  },

  errorCorrection: {
    // Penalty when high matrix density combines with low redundancy (L)
    denseMatrixThreshold: 45, // Version 7+ (45x45)
    densityPenalty: 8,
  },

  finderIntegrity: {
    // Clearance required between logo bounding box and any of the 3 finder eyes
    minimumClearanceModules: 1,
    penalties: {
      collision: 45,
      lowContrast: 20,
      criticalContrast: 35,
    },
  },
};

