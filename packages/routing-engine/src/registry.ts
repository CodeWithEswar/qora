/**
 * NXTQR — Canonical Routing Field and Operator Registries (QR Brain)
 * Runtime-neutral, strictly typed registry driving editor, validation, and evaluator.
 */

export type RoutingFieldType = "enum" | "country" | "region" | "language" | "weekday" | "time" | "query_param" | "text";

export type RoutingOperatorCode =
  | "eq"
  | "neq"
  | "in"
  | "not_in"
  | "starts_with"
  | "between"
  | "exists"
  | "not_exists";

export interface RoutingOperatorDefinition {
  code: RoutingOperatorCode;
  label: string; // Human-readable UI label (e.g., "is", "is not", "is one of")
  description: string;
}

export const ROUTING_OPERATORS: Record<RoutingOperatorCode, RoutingOperatorDefinition> = {
  eq: {
    code: "eq",
    label: "is",
    description: "Matches exact value (case-insensitive)",
  },
  neq: {
    code: "neq",
    label: "is not",
    description: "Does not match value",
  },
  in: {
    code: "in",
    label: "is one of",
    description: "Matches any value in the provided list",
  },
  not_in: {
    code: "not_in",
    label: "is not one of",
    description: "Does not match any value in the provided list",
  },
  starts_with: {
    code: "starts_with",
    label: "starts with",
    description: "Text starts with the specified prefix",
  },
  between: {
    code: "between",
    label: "is between",
    description: "Value falls within start and end boundaries (supports overnight intervals)",
  },
  exists: {
    code: "exists",
    label: "exists",
    description: "Parameter is present in the scan request",
  },
  not_exists: {
    code: "not_exists",
    label: "does not exist",
    description: "Parameter is absent from the scan request",
  },
};

export interface RoutingFieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface RoutingFieldDefinition {
  field: string;
  label: string;
  category: "DEVICE" | "LOCATION" | "TIME" | "REQUEST";
  type: RoutingFieldType;
  description: string;
  allowedOperators: RoutingOperatorCode[];
  defaultOperator: RoutingOperatorCode;
  options?: RoutingFieldOption[];
}

export const DEVICE_OPTIONS: RoutingFieldOption[] = [
  { value: "mobile", label: "Mobile", description: "Smartphones & handheld mobile devices" },
  { value: "tablet", label: "Tablet", description: "iPads, Android tablets, slate devices" },
  { value: "desktop", label: "Desktop", description: "Laptops, workstations, desktop PCs" },
];

export const OS_OPTIONS: RoutingFieldOption[] = [
  { value: "ios", label: "iOS", description: "Apple iPhone / iPadOS" },
  { value: "android", label: "Android", description: "Google Android devices" },
  { value: "macos", label: "macOS", description: "Apple Mac computers" },
  { value: "windows", label: "Windows", description: "Microsoft Windows PCs" },
  { value: "linux", label: "Linux", description: "Linux distributions" },
];

export const BROWSER_OPTIONS: RoutingFieldOption[] = [
  { value: "safari", label: "Safari", description: "Apple Safari browser" },
  { value: "chrome", label: "Chrome", description: "Google Chrome browser" },
  { value: "firefox", label: "Firefox", description: "Mozilla Firefox browser" },
  { value: "edge", label: "Edge", description: "Microsoft Edge browser" },
  { value: "samsung_internet", label: "Samsung Internet", description: "Samsung mobile browser" },
];

export const WEEKDAY_OPTIONS: RoutingFieldOption[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const COMMON_COUNTRIES: RoutingFieldOption[] = [
  { value: "IN", label: "India (IN)" },
  { value: "US", label: "United States (US)" },
  { value: "GB", label: "United Kingdom (GB)" },
  { value: "AE", label: "United Arab Emirates (AE)" },
  { value: "SG", label: "Singapore (SG)" },
  { value: "DE", label: "Germany (DE)" },
  { value: "FR", label: "France (FR)" },
  { value: "CA", label: "Canada (CA)" },
  { value: "AU", label: "Australia (AU)" },
  { value: "JP", label: "Japan (JP)" },
];

export const COMMON_LANGUAGES: RoutingFieldOption[] = [
  { value: "en", label: "English (en)" },
  { value: "hi", label: "Hindi (hi)" },
  { value: "te", label: "Telugu (te)" },
  { value: "ta", label: "Tamil (ta)" },
  { value: "es", label: "Spanish (es)" },
  { value: "fr", label: "French (fr)" },
  { value: "de", label: "German (de)" },
  { value: "ar", label: "Arabic (ar)" },
  { value: "ja", label: "Japanese (ja)" },
];

export const ROUTING_FIELDS: Record<string, RoutingFieldDefinition> = {
  device: {
    field: "device",
    label: "Device form factor",
    category: "DEVICE",
    type: "enum",
    description: "Route based on physical form factor: mobile, tablet, or desktop.",
    allowedOperators: ["eq", "neq", "in", "not_in"],
    defaultOperator: "eq",
    options: DEVICE_OPTIONS,
  },
  os: {
    field: "os",
    label: "Operating system",
    category: "DEVICE",
    type: "enum",
    description: "Route by operating system: iOS, Android, macOS, Windows, Linux.",
    allowedOperators: ["eq", "neq", "in", "not_in"],
    defaultOperator: "eq",
    options: OS_OPTIONS,
  },
  browser: {
    field: "browser",
    label: "Browser family",
    category: "DEVICE",
    type: "enum",
    description: "Route by browser engine: Safari, Chrome, Firefox, Edge.",
    allowedOperators: ["eq", "neq", "in", "not_in"],
    defaultOperator: "eq",
    options: BROWSER_OPTIONS,
  },
  country: {
    field: "country",
    label: "Country",
    category: "LOCATION",
    type: "country",
    description: "Route using coarse scan geography derived from edge Cloudflare request context.",
    allowedOperators: ["eq", "neq", "in", "not_in"],
    defaultOperator: "eq",
    options: COMMON_COUNTRIES,
  },
  region: {
    field: "region",
    label: "Region / State",
    category: "LOCATION",
    type: "region",
    description: "Sub-national administrative subdivision code (e.g. MH, KA, CA, NY).",
    allowedOperators: ["eq", "neq", "in", "not_in"],
    defaultOperator: "eq",
  },
  weekday: {
    field: "weekday",
    label: "Day of week",
    category: "TIME",
    type: "weekday",
    description: "Route on specific days of the week in the QR Brain timezone.",
    allowedOperators: ["eq", "neq", "in", "not_in"],
    defaultOperator: "in",
    options: WEEKDAY_OPTIONS,
  },
  time: {
    field: "time",
    label: "Time window",
    category: "TIME",
    type: "time",
    description: "Route during a configured 24h interval (supports overnight midnight crossings).",
    allowedOperators: ["between"],
    defaultOperator: "between",
  },
  language: {
    field: "language",
    label: "Language",
    category: "REQUEST",
    type: "language",
    description: "Route by normalized scanner language or locale header prefix.",
    allowedOperators: ["eq", "neq", "starts_with", "in"],
    defaultOperator: "starts_with",
    options: COMMON_LANGUAGES,
  },
  queryParam: {
    field: "queryParam",
    label: "Query parameter",
    category: "REQUEST",
    type: "query_param",
    description: "Inspect bounded incoming URL query parameters (e.g. utm_source, promo).",
    allowedOperators: ["exists", "not_exists", "eq", "neq", "starts_with"],
    defaultOperator: "exists",
  },
};

/**
 * Normalizes field name aliases for runtime evaluation compatibility.
 */
export function normalizeFieldName(rawField: string): string {
  const norm = rawField.toLowerCase().trim();
  if (norm === "time_window" || norm === "time") return "time";
  if (norm === "query_param" || norm === "queryparam") return "queryParam";
  return norm;
}

/**
 * Checks whether an operator is allowed for a given field.
 */
export function isOperatorAllowedForField(field: string, operator: RoutingOperatorCode): boolean {
  const canonical = normalizeFieldName(field);
  const def = ROUTING_FIELDS[canonical];
  if (!def) return false;
  return def.allowedOperators.includes(operator);
}
