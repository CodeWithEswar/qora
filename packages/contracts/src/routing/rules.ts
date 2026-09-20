/**
 * NXTQR — Intelligent Routing Contracts (NXTQR Routes / QR Brain)
 * Typed conditions, operators, branching rules, safety bounds, and simulation interfaces.
 */

export const MAX_RULES_HARD_LIMIT = 50;
export const MAX_CONDITIONS_PER_RULE = 10;
export const MAX_SNAPSHOT_BYTES = 64 * 1024; // 64 KB maximum compiled snapshot size

/**
 * Normalized condition types for scan-time evaluation.
 * Note: 'device' (hardware form factor) and 'os' (operating system) are strictly separated for composability.
 */
export type ConditionType =
  | "device"          // Hardware form factor: mobile | desktop | tablet | other
  | "os"              // Operating system: ios | android | windows | macos | linux | other
  | "browser"         // Browser family: safari | chrome | firefox | edge | samsung_internet | other
  | "language"        // Primary language or locale: en, en-us, hi, te-in
  | "country"         // ISO 3166-1 alpha-2: IN, US, GB, DE, etc.
  | "region"          // Sub-national code: CA, NY, MH, KA, etc.
  | "time"            // Canonical time window alias
  | "time_window"     // HH:MM 24-hour range: ["09:00", "17:00"] or overnight ["22:00", "06:00"]
  | "weekday"         // monday..sunday
  | "date_range"      // YYYY-MM-DD range
  | "campaign_state"  // ACTIVE | SCHEDULED | PAUSED | ENDED
  | "queryParam"      // Canonical query parameter alias
  | "query_param";    // Untrusted scanner query parameter: { param: string, expected?: string }

export type ConditionOperator =
  | "eq"
  | "neq"
  | "in"
  | "nin"
  | "not_in"
  | "between"
  | "contains"
  | "starts_with"
  | "exists"
  | "not_exists";

export interface RoutingCondition {
  id: string;
  type: ConditionType;
  field?: string;     // Canonical field property
  operator: ConditionOperator;
  value: string | number | string[] | [string, string] | [number, number];
  paramName?: string; // Only populated when type === "query_param"
  key?: string;       // Alias for paramName
}

export type RoutingActionType = "redirect" | "experiment" | "fallback" | "webhook";

export interface RoutingAction {
  type: RoutingActionType;
  destinationUrl: string;
  destinationId?: string;
  experimentId?: string;
}

export interface RoutingRule {
  id: string;
  qrId: string;
  name: string;
  priority: number; // Lowest number evaluated first (1, 2, 3...)
  isActive: boolean;
  matchType: "ALL" | "ANY"; // AND vs OR across conditions
  conditions: RoutingCondition[];
  action: RoutingAction;
}

export interface RoutingSimulationContext {
  country?: string;
  region?: string;
  device?: "mobile" | "desktop" | "tablet" | "bot" | "other";
  os?: string;
  browser?: string;
  language?: string;
  languagePrimary?: string;
  localTime?: string; // "HH:MM"
  weekday?: string;
  timezone?: string;
  queryParams?: Record<string, string>;
  ipHash?: string;
  timestamp?: number;
  now?: Date | number;
  campaignState?: string;
  host?: string;
  slug?: string;
}

export interface QrBrainConditionEvaluationStep {
  conditionId: string;
  type: ConditionType;
  operator: ConditionOperator;
  expected?: unknown;
  expectedValue?: unknown;
  actual?: unknown;
  actualValue?: unknown;
  passed?: boolean;
  matched?: boolean;
}


export interface QrBrainRuleEvaluationStep {
  ruleId: string;
  ruleName: string;
  priority: number;
  matched: boolean;
  matchType?: "ALL" | "ANY";
  reason?: string;
  conditionsEvaluated: QrBrainConditionEvaluationStep[];
}

export type RuleEvaluationStep = QrBrainRuleEvaluationStep;

export interface QrBrainDecisionTrace {
  evaluatedRules: QrBrainRuleEvaluationStep[];
  selectedRuleId?: string;
  selectedRuleName?: string;
  selectedVariantId?: string;
  fallbackUsed?: boolean;
  fallbackReason?: string;
  finalDestinationUrl?: string;
  finalDestinationId?: string;
  evaluationDurationMs: number;
}

export interface RoutingEvaluationResult {
  destinationId?: string;
  destinationUrl: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
  matchedRule?: RoutingRule;
  isFallback: boolean;
  fallbackReason?: "GUARDIAN_UNHEALTHY" | "CAMPAIGN_INACTIVE" | "NO_RULES_MATCHED" | string;
  reason?: string;
  evaluatedRulesCount?: number;
  decisionTrace?: QrBrainRuleEvaluationStep[];
  trace?: QrBrainDecisionTrace;
  evaluationDurationMs?: number;
}

export type ResolverContext = RoutingSimulationContext;
export type RoutingSimulationResult = RoutingEvaluationResult;
