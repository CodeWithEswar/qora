/**
 * NXTQR — Deterministic Static Analysis Engine (Conflict Lens)
 * Analyzes rule sets for contradictions, unreachable rules, and partial condition overlaps.
 * Pure algebra: No LLMs, repeatable, fast, zero-dependency.
 */

import { RoutingRule, RoutingCondition } from "@nxtqr/contracts";
import { normalizeFieldName, ROUTING_FIELDS } from "./registry";

export interface ContradictionIssue {
  ruleId: string;
  ruleName: string;
  field: string;
  condition1Id: string;
  condition2Id: string;
  message: string;
}

export interface ShadowedRuleIssue {
  shadowedRuleId: string;
  shadowedRuleName: string;
  shadowingRuleId: string;
  shadowingRuleName: string;
  reason: string;
  severity: "ERROR" | "WARNING";
}

export interface OverlapIssue {
  rule1Id: string;
  rule1Name: string;
  rule1Priority: number;
  rule2Id: string;
  rule2Name: string;
  rule2Priority: number;
  intersectionFields: string[];
  winningRuleName: string;
  message: string;
}

export interface StaticAnalysisReport {
  contradictions: ContradictionIssue[];
  shadowedRules: ShadowedRuleIssue[];
  overlaps: OverlapIssue[];
  hasErrors: boolean;
}

/**
 * Detects mutually exclusive condition pairs inside a single rule with matchType === 'ALL'.
 */
export function analyzeRuleContradictions(rule: RoutingRule): ContradictionIssue[] {
  const issues: ContradictionIssue[] = [];
  if (!rule.conditions || rule.conditions.length < 2 || rule.matchType !== "ALL") {
    return issues;
  }

  // Group conditions by normalized field
  const byField = new Map<string, RoutingCondition[]>();
  for (const cond of rule.conditions) {
    const field = normalizeFieldName((cond as any).field || (cond as any).type);
    const list = byField.get(field) || [];
    list.push(cond);
    byField.set(field, list);
  }

  for (const [field, conds] of byField.entries()) {
    if (conds.length < 2) continue;

    const fieldDef = ROUTING_FIELDS[field];
    const fieldLabel = fieldDef?.label || field;

    for (let i = 0; i < conds.length; i++) {
      for (let j = i + 1; j < conds.length; j++) {
        const c1 = conds[i];
        const c2 = conds[j];

        const op1 = c1.operator;
        const op2 = c2.operator;
        const v1 = String(c1.value).toLowerCase();
        const v2 = String(c2.value).toLowerCase();

        // 1. Two eq operators with different values on single-value field (e.g. Device = Mobile AND Device = Desktop)
        if (op1 === "eq" && op2 === "eq" && v1 !== v2) {
          issues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            field,
            condition1Id: c1.id,
            condition2Id: c2.id,
            message: `${fieldLabel} cannot be both '${c1.value}' and '${c2.value}' when Match ALL is selected.`,
          });
        }

        // 2. eq and neq on same value (e.g. Country is IN and Country is not IN)
        if (
          ((op1 === "eq" && op2 === "neq") || (op1 === "neq" && op2 === "eq")) &&
          v1 === v2
        ) {
          issues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            field,
            condition1Id: c1.id,
            condition2Id: c2.id,
            message: `${fieldLabel} cannot simultaneously be '${c1.value}' and not '${c2.value}'.`,
          });
        }

        // 3. eq and not_in where eq value is inside not_in array
        if (
          (op1 === "eq" && (op2 === "not_in" || (op2 as string) === "nin")) ||
          (op2 === "eq" && (op1 === "not_in" || (op1 as string) === "nin"))
        ) {
          const eqCond = op1 === "eq" ? c1 : c2;
          const ninCond = op1 === "eq" ? c2 : c1;
          const ninList = Array.isArray(ninCond.value)
            ? ninCond.value.map((v) => String(v).toLowerCase())
            : [String(ninCond.value).toLowerCase()];

          if (ninList.includes(String(eqCond.value).toLowerCase())) {
            issues.push({
              ruleId: rule.id,
              ruleName: rule.name,
              field,
              condition1Id: c1.id,
              condition2Id: c2.id,
              message: `${fieldLabel} is set to '${eqCond.value}' but also excluded in '${ninCond.operator}'.`,
            });
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Analyzes rule priority ordering to find unreachable (shadowed) rules.
 * Under first-match semantics:
 *  - If Rule A (higher priority) is a catch-all (no conditions) or covers a superset of Rule B's traffic, Rule B may never execute.
 */
export function analyzeRuleReachability(rules: RoutingRule[]): ShadowedRuleIssue[] {
  const issues: ShadowedRuleIssue[] = [];
  const activeRules = [...rules]
    .filter((r) => r.isActive)
    .sort((a, b) => (a.priority === b.priority ? a.id.localeCompare(b.id) : a.priority - b.priority));

  for (let i = 0; i < activeRules.length; i++) {
    const higherRule = activeRules[i];

    // Case 1: An earlier rule has 0 conditions -> it matches 100% of traffic, shadowing ALL subsequent rules!
    if (!higherRule.conditions || higherRule.conditions.length === 0) {
      for (let j = i + 1; j < activeRules.length; j++) {
        const lowerRule = activeRules[j];
        issues.push({
          shadowedRuleId: lowerRule.id,
          shadowedRuleName: lowerRule.name,
          shadowingRuleId: higherRule.id,
          shadowingRuleName: higherRule.name,
          reason: `Rule '${higherRule.name}' has no conditions and captures all scans first. Rule '${lowerRule.name}' will never execute.`,
          severity: "ERROR",
        });
      }
      break;
    }

    // Case 2: Subsumption analysis for 'ALL' rules
    // If higherRule (ALL) has condition subset of lowerRule (ALL), every scan matching lowerRule matches higherRule first.
    if (higherRule.matchType === "ALL") {
      for (let j = i + 1; j < activeRules.length; j++) {
        const lowerRule = activeRules[j];
        if (lowerRule.matchType === "ALL" && lowerRule.conditions && lowerRule.conditions.length > 0) {
          const isSubsumed = isConditionSetSubsumed(higherRule.conditions, lowerRule.conditions);
          if (isSubsumed) {
            issues.push({
              shadowedRuleId: lowerRule.id,
              shadowedRuleName: lowerRule.name,
              shadowingRuleId: higherRule.id,
              shadowingRuleName: higherRule.name,
              reason: `Rule '${higherRule.name}' matches all conditions of '${lowerRule.name}' and evaluates first. Rule '${lowerRule.name}' is unreachable.`,
              severity: "ERROR",
            });
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Checks if all conditions in higherConditions are present and identical in lowerConditions.
 * (If so, any context satisfying lowerConditions automatically satisfies higherConditions).
 */
function isConditionSetSubsumed(
  higherConditions: RoutingCondition[],
  lowerConditions: RoutingCondition[]
): boolean {
  if (higherConditions.length === 0) return true;
  if (higherConditions.length > lowerConditions.length) return false;

  for (const hc of higherConditions) {
    const hField = normalizeFieldName((hc as any).field || (hc as any).type);
    const hOp = hc.operator;
    const hVal = String(hc.value).toLowerCase();

    const match = lowerConditions.find((lc) => {
      const lField = normalizeFieldName((lc as any).field || (lc as any).type);
      const lOp = lc.operator;
      const lVal = String(lc.value).toLowerCase();
      return hField === lField && hOp === lOp && hVal === lVal;
    });

    if (!match) return false;
  }

  return true;
}

/**
 * Detects partial condition intersections between rules.
 * e.g. Rule 1 matches Device = Mobile, Rule 2 matches Country = IN.
 * Scans with Mobile + India will route to Rule 1 first.
 */
export function analyzeRuleOverlaps(rules: RoutingRule[]): OverlapIssue[] {
  const issues: OverlapIssue[] = [];
  const activeRules = [...rules]
    .filter((r) => r.isActive)
    .sort((a, b) => (a.priority === b.priority ? a.id.localeCompare(b.id) : a.priority - b.priority));

  for (let i = 0; i < activeRules.length; i++) {
    const r1 = activeRules[i];
    if (!r1.conditions || r1.conditions.length === 0) continue;

    for (let j = i + 1; j < activeRules.length; j++) {
      const r2 = activeRules[j];
      if (!r2.conditions || r2.conditions.length === 0) continue;

      const r1Fields = new Set(r1.conditions.map((c) => normalizeFieldName((c as any).field || (c as any).type)));
      const r2Fields = new Set(r2.conditions.map((c) => normalizeFieldName((c as any).field || (c as any).type)));

      // Different fields: e.g. Device (Rule 1) vs Country (Rule 2)
      // They overlap when a scan possesses BOTH attributes.
      const hasDifferentFields = [...r1Fields].some((f) => !r2Fields.has(f)) && [...r2Fields].some((f) => !r1Fields.has(f));

      if (hasDifferentFields) {
        issues.push({
          rule1Id: r1.id,
          rule1Name: r1.name,
          rule1Priority: r1.priority,
          rule2Id: r2.id,
          rule2Name: r2.name,
          rule2Priority: r2.priority,
          intersectionFields: [...new Set([...r1Fields, ...r2Fields])],
          winningRuleName: r1.name,
          message: `Scans matching both '${r1.name}' and '${r2.name}' will route to '${r1.name}' first because it has higher priority (${r1.priority} vs ${r2.priority}).`,
        });
      }
    }
  }

  return issues;
}

/**
 * Comprehensive static analysis across a rule set.
 */
export function runStaticRoutingAnalysis(rules: RoutingRule[]): StaticAnalysisReport {
  const contradictions: ContradictionIssue[] = [];
  for (const rule of rules) {
    contradictions.push(...analyzeRuleContradictions(rule));
  }

  const shadowedRules = analyzeRuleReachability(rules);
  const overlaps = analyzeRuleOverlaps(rules);

  const hasErrors =
    contradictions.length > 0 ||
    shadowedRules.some((s) => s.severity === "ERROR");

  return {
    contradictions,
    shadowedRules,
    overlaps,
    hasErrors,
  };
}
