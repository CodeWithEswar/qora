/**
 * @nxtqr/billing
 * Provider-neutral subscription state machine, plan catalog,
 * entitlement projection, non-destructive downgrade policies, and usage metering.
 */

import {
  PlanCode,
  PlanDefinition,
  PLAN_CATALOG,
  getPlanByCode,
  getPlanByTier,
  SubscriptionStatus,
  UsageMetricKey,
  SaaSTier,
  PlanEntitlements,
  TIER_DEFAULT_ENTITLEMENTS,
} from "@nxtqr/contracts";

export {
  PLAN_CATALOG,
  getPlanByCode,
  getPlanByTier,
};

export class SubscriptionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    PENDING: ["ACTIVE", "CANCELLED", "EXPIRED"],
    ACTIVE: ["PAST_DUE", "ON_HOLD", "CANCEL_PENDING", "CANCELLED", "EXPIRED"],
    PAST_DUE: ["ACTIVE", "ON_HOLD", "CANCELLED", "EXPIRED"],
    ON_HOLD: ["ACTIVE", "CANCELLED", "EXPIRED"],
    CANCEL_PENDING: ["CANCELLED", "ACTIVE"],
    CANCELLED: [], // Terminal state
    EXPIRED: [],   // Terminal state
  };

  /**
   * Checks if a transition from currentStatus to targetStatus is valid.
   */
  static canTransition(current: SubscriptionStatus, target: SubscriptionStatus): boolean {
    if (current === target) return true;
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  /**
   * Enforces transition rules, rejecting invalid or out-of-order state regressions.
   */
  static assertTransition(current: SubscriptionStatus, target: SubscriptionStatus): void {
    if (!this.canTransition(current, target)) {
      throw new Error(
        `Invalid subscription state transition: Cannot change from '${current}' to '${target}'.`
      );
    }
  }

  /**
   * Resolves out-of-order event delivery: If an event with an older timestamp arrives,
   * determines whether the incoming status should override current state.
   */
  static resolveEffectiveStatus(
    current: SubscriptionStatus,
    incoming: SubscriptionStatus
  ): SubscriptionStatus {
    // If subscription is already ACTIVE or CANCELLED, do not allow an incoming PENDING to revert it
    if (current === "ACTIVE" && incoming === "PENDING") {
      return "ACTIVE";
    }
    if (current === "CANCELLED" && incoming !== "CANCELLED") {
      return "CANCELLED";
    }
    return this.canTransition(current, incoming) ? incoming : current;
  }
}

export interface DowngradeImpact {
  currentTier: SaaSTier;
  targetTier: SaaSTier;
  isDowngrade: boolean;
  overLimitFeatures: {
    featureKey: keyof PlanEntitlements;
    currentUsage: number;
    targetLimit: number;
    exceededBy: number;
  }[];
  guidanceMessage: string;
}

export class DowngradeService {
  /**
   * Computes non-destructive downgrade impact.
   * NXTQR Invariant: Downgrading never deletes customer data. Existing resources
   * remain readable/accessible; creation of new items is restricted until within limits.
   */
  static calculateDowngradeImpact(
    currentTier: SaaSTier,
    targetTier: SaaSTier,
    currentUsage: Record<string, number>
  ): DowngradeImpact {
    const tierRanks: Record<SaaSTier, number> = {
      FREE: 0,
      PRO: 1,
      BUSINESS: 2,
      ENTERPRISE: 3,
    };

    const isDowngrade = tierRanks[targetTier] < tierRanks[currentTier];
    const targetLimits = TIER_DEFAULT_ENTITLEMENTS[targetTier];
    const overLimitFeatures: DowngradeImpact["overLimitFeatures"] = [];

    if (isDowngrade) {
      for (const [key, val] of Object.entries(targetLimits)) {
        if (typeof val === "number") {
          const used = currentUsage[key] ?? 0;
          if (used > val) {
            overLimitFeatures.push({
              featureKey: key as keyof PlanEntitlements,
              currentUsage: used,
              targetLimit: val,
              exceededBy: used - val,
            });
          }
        }
      }
    }

    let guidanceMessage = "Downgrade successful. Your workspace features have been adjusted.";
    if (overLimitFeatures.length > 0) {
      guidanceMessage = `Your workspace exceeds ${targetTier} plan limits for ${overLimitFeatures.length} resource(s). Existing items will remain active and readable, but new creations or publishing will be restricted until usage is within quota.`;
    }

    return {
      currentTier,
      targetTier,
      isDowngrade,
      overLimitFeatures,
      guidanceMessage,
    };
  }
}

export class UsageCounterService {
  /**
   * Generates standard period key for monthly quotas: "YYYY-MM"
   */
  static getPeriodKey(date: Date = new Date()): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  /**
   * Determines if a metric requires strict synchronous enforcement or async aggregation.
   */
  static isStrictMetric(metricKey: UsageMetricKey): boolean {
    switch (metricKey) {
      case "qr.dynamic.active":
      case "team.seats":
      case "domains.custom":
      case "brand_kits.count":
        return true;
      case "scan.count":
      case "api.requests":
      case "qr.static.created":
        return false;
    }
  }
}

export class ReconciliationService {
  /**
   * Compares local D1 subscription status with provider status and returns reconciliation action.
   */
  static reconcileState(
    localStatus: SubscriptionStatus,
    providerOrderStatus: string
  ): {
    needsUpdate: boolean;
    recommendedStatus: SubscriptionStatus;
    reason: string;
  } {
    if (providerOrderStatus === "PAID" && localStatus !== "ACTIVE") {
      return {
        needsUpdate: true,
        recommendedStatus: "ACTIVE",
        reason: "Provider order is PAID; activating local subscription.",
      };
    }

    if (
      (providerOrderStatus === "EXPIRED" || providerOrderStatus === "TERMINATED") &&
      localStatus === "ACTIVE"
    ) {
      return {
        needsUpdate: true,
        recommendedStatus: "EXPIRED",
        reason: "Provider status is EXPIRED; expiring local subscription.",
      };
    }

    if (providerOrderStatus === "FAILED" && localStatus === "PENDING") {
      return {
        needsUpdate: true,
        recommendedStatus: "CANCELLED",
        reason: "Provider payment failed; cancelling pending subscription.",
      };
    }

    return {
      needsUpdate: false,
      recommendedStatus: localStatus,
      reason: "Local and provider states are in sync.",
    };
  }
}
