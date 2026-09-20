/**
 * NXTQR — Analytics Contracts, Registries & Response DTOs
 * Standardized contracts for Edge Telemetry, Aggregation, Reporting, and UI.
 */

export type DeviceClass = "MOBILE" | "DESKTOP" | "TABLET" | "OTHER" | "UNKNOWN";
export type OSFamily = "ANDROID" | "IOS" | "WINDOWS" | "MACOS" | "LINUX" | "CHROME_OS" | "OTHER" | "UNKNOWN";
export type BrowserFamily = "CHROME" | "SAFARI" | "EDGE" | "FIREFOX" | "SAMSUNG_INTERNET" | "OTHER" | "UNKNOWN";
export type ReferrerClass = "DIRECT_OR_UNKNOWN" | "WEB" | "SOCIAL" | "SEARCH" | "INTERNAL" | "OTHER";
export type TrafficQualityClass = "NORMAL" | "SUSPECTED_AUTOMATION" | "BLOCKED" | "UNKNOWN";
export type ResponseClass = "REDIRECTED" | "BLOCKED" | "INACTIVE" | "EXPIRED" | "NOT_FOUND";

export interface MetricDefinition {
  key: string;
  name: string;
  description: string;
  category: "volume" | "quality" | "outcome" | "performance";
  unit: "count" | "percentage" | "currency" | "milliseconds";
  isEstimated: boolean;
  formula: string;
}

export const METRIC_REGISTRY: Record<string, MetricDefinition> = {
  total_scans: {
    key: "total_scans",
    name: "Total Scans",
    description: "Total accepted scan signals observed across published QR destinations.",
    category: "volume",
    unit: "count",
    isEstimated: false,
    formula: "SUM(total_scans WHERE responseClass = 'REDIRECTED')",
  },
  estimated_unique_scans: {
    key: "estimated_unique_scans",
    name: "Estimated Unique Scans",
    description: "An approximate count based on NXTQR's privacy-aware daily salted hashing method. Does not represent verified individual people.",
    category: "volume",
    unit: "count",
    isEstimated: true,
    formula: "COUNT(DISTINCT ip_hash_daily)",
  },
  conversions: {
    key: "conversions",
    name: "Conversions",
    description: "Recorded post-scan conversion events associated with target QR destinations.",
    category: "outcome",
    unit: "count",
    isEstimated: false,
    formula: "COUNT(conversion_events)",
  },
  conversion_rate: {
    key: "conversion_rate",
    name: "Conversion Rate",
    description: "Percentage of accepted scan exposures that resulted in an active conversion occurrence.",
    category: "outcome",
    unit: "percentage",
    isEstimated: false,
    formula: "conversions / total_scans * 100",
  },
  suspected_automation: {
    key: "suspected_automation",
    name: "Suspected Automation",
    description: "Scans exhibiting crawler, preview bot, or automated request characteristics.",
    category: "quality",
    unit: "count",
    isEstimated: false,
    formula: "SUM(total_scans WHERE trafficQuality = 'SUSPECTED_AUTOMATION')",
  },
  blocked_events: {
    key: "blocked_events",
    name: "Blocked Events",
    description: "Requests rejected or halted by lifecycle status or edge security policies.",
    category: "quality",
    unit: "count",
    isEstimated: false,
    formula: "SUM(total_scans WHERE responseClass = 'BLOCKED')",
  },
  fallback_rate: {
    key: "fallback_rate",
    name: "Fallback Rate",
    description: "Percentage of scans served using Guardian fallback destination due to health degradation.",
    category: "performance",
    unit: "percentage",
    isEstimated: false,
    formula: "fallback_scans / total_scans * 100",
  },
};

export interface DimensionDefinition {
  key: string;
  name: string;
  description: string;
  values?: readonly string[];
}

export const DIMENSION_REGISTRY: Record<string, DimensionDefinition> = {
  country: {
    key: "country",
    name: "Country",
    description: "ISO 3166-1 alpha-2 coarse geography determined at edge resolver.",
  },
  region: {
    key: "region",
    name: "Region",
    description: "Administrative region or province where coarse data is available.",
  },
  device_class: {
    key: "device_class",
    name: "Device Class",
    description: "Coarse form factor derived from User-Agent without storing raw agent string.",
    values: ["MOBILE", "DESKTOP", "TABLET", "OTHER", "UNKNOWN"] as const,
  },
  os_family: {
    key: "os_family",
    name: "Operating System",
    description: "Operating system family detected with high confidence.",
    values: ["ANDROID", "IOS", "WINDOWS", "MACOS", "LINUX", "CHROME_OS", "OTHER", "UNKNOWN"] as const,
  },
  browser_family: {
    key: "browser_family",
    name: "Browser",
    description: "Normalized web client browser family.",
    values: ["CHROME", "SAFARI", "EDGE", "FIREFOX", "SAMSUNG_INTERNET", "OTHER", "UNKNOWN"] as const,
  },
  referrer_class: {
    key: "referrer_class",
    name: "Referrer Class",
    description: "Sanitized origin domain category without private URL path or query params.",
    values: ["DIRECT_OR_UNKNOWN", "WEB", "SOCIAL", "SEARCH", "INTERNAL", "OTHER"] as const,
  },
  traffic_quality: {
    key: "traffic_quality",
    name: "Traffic Quality",
    description: "Conservative classification of scan request characteristics.",
    values: ["NORMAL", "SUSPECTED_AUTOMATION", "BLOCKED", "UNKNOWN"] as const,
  },
};

/**
 * Common Analytics Query Filters
 */
export interface AnalyticsFilterParams {
  dateFrom: number; // Unix timestamp in ms
  dateTo: number; // Unix timestamp in ms
  timezone?: string; // Target display timezone (e.g. "UTC", "Asia/Kolkata")
  qrIds?: string[];
  campaignIds?: string[];
  country?: string;
  deviceClass?: DeviceClass;
  osFamily?: OSFamily;
  browserFamily?: BrowserFamily;
  routingRuleId?: string;
  experimentId?: string;
  trafficQuality?: TrafficQualityClass;
  granularity?: "hour" | "day" | "week";
}

/**
 * Response DTOs
 */
export interface AnalyticsOverviewResponseV1 {
  schemaVersion: 1;
  range: {
    from: number;
    to: number;
    timezone: string;
  };
  totals: {
    totalScans: number;
    estimatedUniqueScans: number;
    conversions: number;
    conversionRate: number;
    suspectedAutomation: number;
    blockedEvents: number;
  };
  comparison?: {
    totalScansChange: number;
    uniqueScansChange: number;
    conversionRateChange: number;
    previousPeriodLabel: string;
  };
  freshness: {
    lastProcessedAt: number;
    status: "healthy" | "lagging";
  };
}

export interface AnalyticsTimeseriesPointV1 {
  timestamp: number; // UTC timestamp of bucket
  label: string; // Formatted date in requested timezone
  totalScans: number;
  uniqueScans: number;
}

export interface AnalyticsPerformanceResponseV1 {
  schemaVersion: 1;
  granularity: "hour" | "day" | "week";
  series: AnalyticsTimeseriesPointV1[];
  totals: {
    totalScans: number;
    estimatedUniqueScans: number;
  };
}

export interface AnalyticsGeographyPointV1 {
  countryCode: string;
  countryName: string;
  scans: number;
  percentage: number;
}

export interface AnalyticsGeographyResponseV1 {
  schemaVersion: 1;
  locations: AnalyticsGeographyPointV1[];
  totalScans: number;
}

export interface AnalyticsDeviceBreakdownPointV1 {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

export interface AnalyticsDevicesResponseV1 {
  schemaVersion: 1;
  devices: AnalyticsDeviceBreakdownPointV1[];
  os: AnalyticsDeviceBreakdownPointV1[];
  browsers: AnalyticsDeviceBreakdownPointV1[];
  mobilePercentage: number;
}

export interface AnalyticsHeatmapCellV1 {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  hourOfDay: number; // 0..23
  scans: number;
}

export interface AnalyticsTimeResponseV1 {
  schemaVersion: 1;
  timezone: string;
  cells: AnalyticsHeatmapCellV1[];
  peakHour: number;
  peakDay: number;
}

export interface AnalyticsRoutingRuleStatV1 {
  ruleId: string;
  ruleName: string;
  destinationUrl: string;
  scansRouted: number;
  sharePercentage: number;
  conversions: number;
}

export interface AnalyticsRoutingResponseV1 {
  schemaVersion: 1;
  totalScans: number;
  rules: AnalyticsRoutingRuleStatV1[];
  defaultDestinationScans: number;
  fallbackDestinationScans: number;
}

export interface AnalyticsTrafficQualityResponseV1 {
  schemaVersion: 1;
  normalScans: number;
  suspectedAutomation: number;
  blockedEvents: number;
  automationPercentage: number;
  anomalies: Array<{
    id: string;
    category: string;
    severity: "low" | "medium" | "high";
    timestamp: number;
    summary: string;
  }>;
}

export interface AnalyticsExperimentResponseV1 {
  schemaVersion: 1;
  experimentId: string;
  experimentName: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  variants: Array<{
    variantId: string;
    name: string;
    destinationUrl: string;
    trafficWeight: number;
    exposures: number;
    conversions: number;
    conversionRate: number;
    isCurrentLeader: boolean;
  }>;
}

export interface AnalyticsCampaignResponseV1 {
  schemaVersion: 1;
  campaignId: string;
  campaignName: string;
  totalScans: number;
  totalQRs: number;
  conversions: number;
  qrBreakdown: Array<{
    qrId: string;
    qrName: string;
    slug: string;
    scans: number;
    conversions: number;
  }>;
}
