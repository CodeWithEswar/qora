/**
 * @nxtqr/entitlements
 * Commercial capabilities, plan limits, and entitlement enforcement.
 */

import {
  SaaSTier,
  PlanEntitlements,
  TIER_DEFAULT_ENTITLEMENTS,
} from "@nxtqr/contracts";

export interface EntitlementQuotaCheck {
  featureKey: keyof PlanEntitlements;
  currentCount?: number;
  requestedIncrement?: number;
}

export class EntitlementService {
  /**
   * Asserts whether an organization's plan tier allows a feature or has remaining quota.
   */
  static assertEntitlement(tier: SaaSTier, check: EntitlementQuotaCheck): void {
    const entitlements = TIER_DEFAULT_ENTITLEMENTS[tier] || TIER_DEFAULT_ENTITLEMENTS.FREE;
    const feature = entitlements[check.featureKey];

    if (typeof feature === "boolean") {
      if (!feature) {
        throw new Error(
          `Feature '${String(check.featureKey)}' is not available on the ${tier} plan. Please upgrade to unlock.`
        );
      }
    } else if (typeof feature === "number") {
      const current = check.currentCount ?? 0;
      const increment = check.requestedIncrement ?? 1;
      if (current + increment > feature) {
        throw new Error(
          `Plan quota exceeded for '${String(check.featureKey)}'. Limit: ${feature}, Current: ${current}, Requested: ${increment}.`
        );
      }
    }
  }

  /**
   * Checks limit availability and returns remaining capacity.
   */
  static checkLimit(
    tier: SaaSTier,
    key: keyof PlanEntitlements,
    currentUsage: number,
    increment = 1
  ): { allowed: boolean; limit: number; remaining: number } {
    const entitlements = TIER_DEFAULT_ENTITLEMENTS[tier] || TIER_DEFAULT_ENTITLEMENTS.FREE;
    const limit = entitlements[key];

    if (typeof limit !== "number") {
      return { allowed: Boolean(limit), limit: Boolean(limit) ? 1 : 0, remaining: Boolean(limit) ? 1 : 0 };
    }

    const remaining = Math.max(0, limit - currentUsage);
    const allowed = currentUsage + increment <= limit;
    return { allowed, limit, remaining };
  }
}
