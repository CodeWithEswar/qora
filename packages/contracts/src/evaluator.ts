/**
 * NXTQR — Shared Portable Rule Evaluator (QR Brain Engine)
 * 
 * Pure, deterministic, zero-dependency evaluation engine.
 * Shared 1:1 across:
 *  - Cloudflare Edge Redirect Worker (Data Plane)
 *  - Next.js QR Brain Route Simulator (Control Plane)
 *  - Unit and integration test suites
 * 
 * Invariants:
 *  - Zero eval(), zero dynamic code execution, zero regex from user input.
 *  - Unknown context is NEVER guessed (returns false).
 *  - Deterministic rule ordering: priority ASC + stable rule ID tie-breaker.
 *  - First-match evaluation semantics.
 *  - Guardian fallback: consumed from compact published state (no network probes).
 *  - Pure function: no database, no React, no Cloudflare bindings, no Node-only APIs.
 */

import {
  RoutingRule,
  RoutingCondition,
  ResolverContext,
  RoutingSimulationResult,
  QrBrainDecisionTrace,
  QrBrainRuleEvaluationStep,
  QrBrainConditionEvaluationStep,
} from "./routing";
import {
  QrResolverSnapshotV1,
  resolveDestinationUrl,
  resolveDestinationId,
} from "./snapshot";

/**
 * Evaluates an individual routing condition against a normalized request context.
 * Invariant 09: Unknown context is never guessed; missing context returns false.
 */
export function evaluateCondition(
  condition: RoutingCondition,
  context: Partial<ResolverContext>
): boolean {
  let contextValue: unknown;

  switch (condition.type) {
    case "device":
      contextValue = context.device?.toLowerCase();
      break;

    case "os":
      contextValue = context.os?.toLowerCase();
      break;

    case "browser":
      contextValue = context.browser?.toLowerCase();
      break;

    case "language":
      contextValue = context.language?.toLowerCase();
      break;

    case "country":
      contextValue = context.country?.toUpperCase();
      break;

    case "region":
      contextValue = context.region?.toUpperCase();
      break;

    case "weekday":
      contextValue = context.weekday?.toLowerCase();
      break;

    case "time_window":
      contextValue = context.localTime; // "HH:MM" 24h
      break;

    case "date_range":
      contextValue = context.now
        ? new Date(context.now).toISOString().split("T")[0]
        : undefined;
      break;

    case "campaign_state":
      contextValue = context.campaignState;
      break;

    case "query_param": {
      const paramName = condition.paramName?.toLowerCase();
      if (!paramName || !context.queryParams) return false;
      
      const foundValue = context.queryParams[paramName];
      if (condition.operator === "exists") {
        return foundValue !== undefined && foundValue !== null;
      }
      contextValue = foundValue?.toLowerCase();
      break;
    }

    default:
      return false;
  }

  // If context value is undefined or empty string, condition cannot match (never guess)
  if (contextValue === undefined || contextValue === null || contextValue === "") {
    return false;
  }

  const targetValue = condition.value;

  switch (condition.operator) {
    case "eq": {
      if (typeof targetValue === "string" || typeof targetValue === "number") {
        return String(contextValue).toLowerCase() === String(targetValue).toLowerCase();
      }
      return false;
    }

    case "neq": {
      if (typeof targetValue === "string" || typeof targetValue === "number") {
        return String(contextValue).toLowerCase() !== String(targetValue).toLowerCase();
      }
      return true;
    }

    case "starts_with": {
      if (typeof targetValue === "string") {
        return String(contextValue).toLowerCase().startsWith(targetValue.toLowerCase());
      }
      return false;
    }

    case "contains": {
      if (typeof targetValue === "string") {
        return String(contextValue).toLowerCase().includes(targetValue.toLowerCase());
      }
      return false;
    }

    case "in": {
      if (Array.isArray(targetValue)) {
        const normalizedTargets = targetValue.map((v) => String(v).toLowerCase());
        return normalizedTargets.includes(String(contextValue).toLowerCase());
      }
      return false;
    }

    case "nin": {
      if (Array.isArray(targetValue)) {
        const normalizedTargets = targetValue.map((v) => String(v).toLowerCase());
        return !normalizedTargets.includes(String(contextValue).toLowerCase());
      }
      return true;
    }

    case "between": {
      // Handles time_window ["09:00", "17:00"] or overnight ["22:00", "06:00"]
      if (condition.type === "time_window" && Array.isArray(targetValue) && targetValue.length === 2) {
        const current = String(contextValue);
        const [start, end] = targetValue.map(String);
        
        // Overnight time window crossing midnight (e.g. 22:00 -> 06:00)
        if (start > end) {
          return current >= start || current <= end;
        }
        // Standard single-day time window (e.g. 09:00 -> 17:00)
        return current >= start && current <= end;
      }

      // Date range ["2026-01-01", "2026-12-31"]
      if (condition.type === "date_range" && Array.isArray(targetValue) && targetValue.length === 2) {
        const current = String(contextValue);
        const [start, end] = targetValue.map(String);
        return current >= start && current <= end;
      }

      return false;
    }

    case "exists":
      return contextValue !== undefined;

    default:
      return false;
  }
}

/**
 * Evaluates an individual routing rule against a normalized request context.
 * Invariant 35: ALL requires every condition to match; ANY requires at least one condition.
 * Rules with 0 conditions are rejected as ambiguous and do not match.
 */
export function evaluateRule(
  rule: RoutingRule,
  context: Partial<ResolverContext>
): { matched: boolean; steps: QrBrainConditionEvaluationStep[] } {
  const steps: QrBrainConditionEvaluationStep[] = [];

  if (!rule.isActive || !rule.conditions || rule.conditions.length === 0) {
    return { matched: false, steps };
  }

  const results: boolean[] = [];

  for (const cond of rule.conditions) {
    const isCondMatch = evaluateCondition(cond, context);
    results.push(isCondMatch);

    steps.push({
      conditionId: cond.id,
      type: cond.type,
      operator: cond.operator,
      expected: cond.value,
      actual: getContextValueForStep(cond.type, cond.paramName, context),
      matched: isCondMatch,
    });

    // Short-circuit for ALL if one condition fails
    if (rule.matchType === "ALL" && !isCondMatch) {
      return { matched: false, steps };
    }

    // Short-circuit for ANY if one condition matches
    if (rule.matchType === "ANY" && isCondMatch) {
      return { matched: true, steps };
    }
  }

  const matched =
    rule.matchType === "ANY"
      ? results.some(Boolean)
      : results.length > 0 && results.every(Boolean);

  return { matched, steps };
}

/**
 * Resolves the final destination and decision trace for a published QR snapshot.
 * 
 * Order of Precedence:
 *  1. QR Lifecycle Gate (handled before calling this, or checked here)
 *  2. Guardian Fallback (if destination is marked UNHEALTHY and fallback configured)
 *  3. Routing Rules (ordered priority ASC + id tie-breaker; first matching rule)
 *  4. Experiments (if active and weighted variants configured)
 *  5. Default Destination
 */
export function evaluateRoutingPolicy(
  snapshot: QrResolverSnapshotV1,
  context: Partial<ResolverContext>,
  options: {
    randomSeed?: number; // 0.0 to 1.0 (for deterministic test assignment)
    includeTrace?: boolean;
  } = {}
): RoutingSimulationResult {
  const startTime = Date.now();
  const rules = snapshot.routing?.rules || snapshot.rules || [];
  
  // Sort rules deterministically: priority ASC, tie breaker rule.id ASC
  const sortedRules = [...rules]
    .filter((r) => r.isActive)
    .sort((a, b) => (a.priority === b.priority ? a.id.localeCompare(b.id) : a.priority - b.priority));

  const defaultUrl = resolveDestinationUrl(snapshot.defaultDestination) || "";
  const defaultId = resolveDestinationId(snapshot.defaultDestination) || "";
  const fallbackUrl = resolveDestinationUrl(snapshot.fallbackDestination);
  const fallbackId = resolveDestinationId(snapshot.fallbackDestination);

  const evaluatedSteps: QrBrainRuleEvaluationStep[] = [];
  let matchedRule: RoutingRule | undefined;
  let targetUrl = defaultUrl;
  let targetId = defaultId;
  let isFallback = false;
  let fallbackReason: string | undefined;

  // 1. Guardian Check (Compact published health state)
  const isGuardianUnhealthy =
    snapshot.guardian?.state === "UNHEALTHY" ||
    snapshot.guardianHealthy === false;

  if (isGuardianUnhealthy && fallbackUrl) {
    isFallback = true;
    fallbackReason = "Guardian health state is UNHEALTHY; safe automated fallback applied";
    targetUrl = fallbackUrl;
    targetId = fallbackId || "fallback_destination";

    return {
      destinationUrl: targetUrl,
      destinationId: targetId,
      isFallback: true,
      evaluatedRulesCount: 0,
      reason: fallbackReason,
      trace: options.includeTrace
        ? {
            evaluatedRules: [],
            fallbackUsed: true,
            fallbackReason,
            finalDestinationUrl: targetUrl,
            finalDestinationId: targetId,
            evaluationDurationMs: Date.now() - startTime,
          }
        : undefined,
    };
  }

  // 2. Evaluate Ordered Rules
  for (let i = 0; i < sortedRules.length; i++) {
    const rule = sortedRules[i];
    const { matched, steps } = evaluateRule(rule, context);

    if (options.includeTrace) {
      evaluatedSteps.push({
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        matched,
        matchType: rule.matchType,
        conditionsEvaluated: steps,
        reason: matched
          ? `Matched rule '${rule.name}' (priority ${rule.priority})`
          : `Did not match all conditions (${rule.matchType})`,
      });
    }

    if (matched) {
      matchedRule = rule;
      targetUrl = rule.action.destinationUrl;
      targetId = rule.action.destinationId || rule.id;
      break; // First-match semantics
    }
  }

  // 3. Experiment Assignment (if no rule matched and active experiment configured)
  let selectedVariantId: string | undefined;
  if (
    !matchedRule &&
    snapshot.experiment &&
    snapshot.experiment.status === "ACTIVE" &&
    snapshot.experiment.variants &&
    snapshot.experiment.variants.length > 0
  ) {
    const variants = snapshot.experiment.variants;
    // Calculate total weight (typically 100 or 10000)
    const totalWeight = variants.reduce((sum, v) => sum + (v.trafficWeight || 0), 0);
    
    if (totalWeight > 0) {
      const rand = (options.randomSeed !== undefined ? options.randomSeed : Math.random()) * totalWeight;
      let cumulative = 0;
      for (const variant of variants) {
        cumulative += variant.trafficWeight || 0;
        if (rand <= cumulative) {
          targetUrl = variant.destinationUrl;
          targetId = variant.id;
          selectedVariantId = variant.id;
          break;
        }
      }
    }
  }

  const duration = Date.now() - startTime;
  const reason = matchedRule
    ? `Matched rule '${matchedRule.name}' (Priority ${matchedRule.priority})`
    : selectedVariantId
    ? `Assigned to experiment variant '${selectedVariantId}'`
    : "No rules matched; routed to default destination";

  return {
    matchedRuleId: matchedRule?.id,
    matchedRuleName: matchedRule?.name,
    destinationUrl: targetUrl,
    destinationId: targetId,
    isFallback,
    evaluatedRulesCount: matchedRule ? evaluatedSteps.length : sortedRules.length,
    reason,
    trace: options.includeTrace
      ? {
          evaluatedRules: evaluatedSteps,
          selectedRuleId: matchedRule?.id,
          selectedRuleName: matchedRule?.name,
          selectedVariantId,
          fallbackUsed: isFallback,
          fallbackReason,
          finalDestinationUrl: targetUrl,
          finalDestinationId: targetId,
          evaluationDurationMs: duration,
        }
      : undefined,
  };
}

/**
 * Diagnostic helper to pull the actual context value during rule tracing.
 */
function getContextValueForStep(
  type: RoutingCondition["type"],
  paramName: string | undefined,
  context: Partial<ResolverContext>
): unknown {
  switch (type) {
    case "device": return context.device;
    case "os": return context.os;
    case "browser": return context.browser;
    case "language": return context.language;
    case "country": return context.country;
    case "region": return context.region;
    case "weekday": return context.weekday;
    case "time_window": return context.localTime;
    case "date_range": return context.now ? new Date(context.now).toISOString().split("T")[0] : undefined;
    case "campaign_state": return context.campaignState;
    case "query_param": return paramName && context.queryParams ? context.queryParams[paramName.toLowerCase()] : undefined;
    default: return undefined;
  }
}
