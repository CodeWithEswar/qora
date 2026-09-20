/**
 * NXTQR — Routing Engine Policy Validation & URL Safety
 * Multi-level pre-publication validation: ERROR, WARNING, INFO.
 */

import {
  RoutingRule,
  MAX_RULES_HARD_LIMIT,
  MAX_CONDITIONS_PER_RULE,
} from "@nxtqr/contracts";
import { normalizeFieldName, isOperatorAllowedForField, ROUTING_FIELDS, RoutingOperatorCode } from "./registry";
import { runStaticRoutingAnalysis, StaticAnalysisReport } from "./analysis";

export type ValidationSeverity = "ERROR" | "WARNING" | "INFO";

export interface ValidationItem {
  severity: ValidationSeverity;
  code: string;
  ruleId?: string;
  ruleName?: string;
  field?: string;
  message: string;
}

export interface RouteValidationReport {
  valid: boolean; // True only if 0 ERROR items
  items: ValidationItem[];
  errors: string[];
  warnings: Array<{
    ruleId: string;
    ruleName: string;
    code: string;
    message: string;
  }>;
  analysis: StaticAnalysisReport;
}

/**
 * Validates destination URL format and protocol safety.
 */
export function isValidDestinationUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validates an individual condition against the field registry and operator constraints.
 */
export function validateConditionDefinition(
  cond: any,
  ruleName: string
): ValidationItem[] {
  const items: ValidationItem[] = [];
  const rawField = cond.field || cond.type;
  if (!rawField) {
    items.push({
      severity: "ERROR",
      code: "MISSING_FIELD",
      message: `Rule '${ruleName}' contains a condition without a target field.`,
    });
    return items;
  }

  const field = normalizeFieldName(rawField);
  const fieldDef = ROUTING_FIELDS[field];

  if (!fieldDef) {
    items.push({
      severity: "ERROR",
      code: "UNKNOWN_FIELD",
      field,
      message: `Rule '${ruleName}' references unrecognized field '${rawField}'.`,
    });
    return items;
  }

  // Operator check
  const op = (cond.operator === "nin" ? "not_in" : cond.operator) as RoutingOperatorCode;
  if (!op || !isOperatorAllowedForField(field, op)) {
    items.push({
      severity: "ERROR",
      code: "INVALID_OPERATOR",
      field,
      message: `Operator '${cond.operator}' is not supported for field '${fieldDef.label}'. Allowed: ${fieldDef.allowedOperators.join(", ")}.`,
    });
  }

  // Value check
  if (op !== "exists" && op !== "not_exists") {
    if (cond.value === undefined || cond.value === null || cond.value === "") {
      items.push({
        severity: "ERROR",
        code: "EMPTY_VALUE",
        field,
        message: `Condition for '${fieldDef.label}' in rule '${ruleName}' must have a value specified.`,
      });
    }
  }

  return items;
}

/**
 * Comprehensive pre-publication rule validator and conflict detector.
 */
export function validateRoutingPolicyBeforePublish(
  rules: RoutingRule[],
  defaultDestinationUrl: string,
  fallbackDestinationUrl?: string
): RouteValidationReport {
  const items: ValidationItem[] = [];

  // 1. Validate Default Destination
  if (!defaultDestinationUrl || !isValidDestinationUrl(defaultDestinationUrl)) {
    items.push({
      severity: "ERROR",
      code: "INVALID_DEFAULT_URL",
      message: "Default destination must be a valid HTTP or HTTPS URL.",
    });
  }

  // 2. Validate Fallback Destination if provided
  if (fallbackDestinationUrl && !isValidDestinationUrl(fallbackDestinationUrl)) {
    items.push({
      severity: "ERROR",
      code: "INVALID_FALLBACK_URL",
      message: "Fallback destination must be a valid HTTP or HTTPS URL.",
    });
  }

  // Circular fallback check
  if (fallbackDestinationUrl && defaultDestinationUrl.trim() === fallbackDestinationUrl.trim()) {
    items.push({
      severity: "WARNING",
      code: "IDENTICAL_FALLBACK",
      ruleId: "fallback",
      ruleName: "Guardian Fallback",
      message: "Fallback destination is identical to the default destination.",
    });
  }

  // 3. Safety Bounds: Maximum Rules
  if (rules.length > MAX_RULES_HARD_LIMIT) {
    items.push({
      severity: "ERROR",
      code: "MAX_RULES_EXCEEDED",
      message: `Rule count (${rules.length}) exceeds maximum safety limit of ${MAX_RULES_HARD_LIMIT}.`,
    });
  }

  const seenPriorities = new Map<number, string>();
  const activeRules = rules.filter((r) => r.isActive);

  for (let i = 0; i < activeRules.length; i++) {
    const rule = activeRules[i];

    // Priority checks
    if (seenPriorities.has(rule.priority)) {
      items.push({
        severity: "WARNING",
        code: "DUPLICATE_PRIORITY",
        ruleId: rule.id,
        ruleName: rule.name,
        message: `Rule '${rule.name}' shares priority ${rule.priority} with '${seenPriorities.get(rule.priority)}'. Deterministic tie-breaker will use rule ID.`,
      });
    } else {
      seenPriorities.set(rule.priority, rule.name);
    }

    // Conditions count checks
    if (!rule.conditions || rule.conditions.length === 0) {
      items.push({
        severity: "WARNING",
        code: "EMPTY_CONDITIONS",
        ruleId: rule.id,
        ruleName: rule.name,
        message: `Rule '${rule.name}' has no conditions and will capture all scans under first-match evaluation.`,
      });
    } else if (rule.conditions.length > MAX_CONDITIONS_PER_RULE) {
      items.push({
        severity: "ERROR",
        code: "MAX_CONDITIONS_EXCEEDED",
        ruleId: rule.id,
        ruleName: rule.name,
        message: `Rule '${rule.name}' has ${rule.conditions.length} conditions, exceeding limit of ${MAX_CONDITIONS_PER_RULE}.`,
      });
    }

    // Condition definitions check
    if (rule.conditions) {
      for (const cond of rule.conditions) {
        items.push(...validateConditionDefinition(cond, rule.name));
      }
    }

    // Destination checks
    const targetUrl = rule.action?.destinationUrl;
    if (!targetUrl || !isValidDestinationUrl(targetUrl)) {
      items.push({
        severity: "ERROR",
        code: "INVALID_RULE_DESTINATION",
        ruleId: rule.id,
        ruleName: rule.name,
        message: `Rule '${rule.name}' destination '${targetUrl || ""}' is not a valid HTTP/HTTPS URL.`,
      });
    }
  }

  // 4. Run static algebra analysis
  const analysis = runStaticRoutingAnalysis(rules);

  // Add contradiction errors
  for (const c of analysis.contradictions) {
    items.push({
      severity: "ERROR",
      code: "CONTRADICTION",
      ruleId: c.ruleId,
      ruleName: c.ruleName,
      field: c.field,
      message: c.message,
    });
  }

  // Add shadowed rule errors / warnings
  for (const s of analysis.shadowedRules) {
    items.push({
      severity: s.severity,
      code: "SHADOWED_RULE",
      ruleId: s.shadowedRuleId,
      ruleName: s.shadowedRuleName,
      message: s.reason,
    });
  }

  // Add overlap warnings
  for (const o of analysis.overlaps) {
    items.push({
      severity: "INFO",
      code: "PARTIAL_OVERLAP",
      ruleId: o.rule2Id,
      ruleName: o.rule2Name,
      message: o.message,
    });
  }

  const errors = items.filter((it) => it.severity === "ERROR").map((it) => it.message);
  const warnings = items
    .filter((it) => it.severity === "WARNING" || it.severity === "INFO")
    .map((it) => ({
      ruleId: it.ruleId || "",
      ruleName: it.ruleName || "",
      code: it.code,
      message: it.message,
    }));

  return {
    valid: errors.length === 0,
    items,
    errors,
    warnings,
    analysis,
  };
}
