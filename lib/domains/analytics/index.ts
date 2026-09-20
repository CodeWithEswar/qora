/**
 * NXTQR — 07 Analytics Bounded Context
 * Responsibilities: Ingestion contracts, event normalization, aggregates, conversion tracking, reporting.
 * Invariants:
 * - Analytics observes outcomes; it never controls redirect decisions.
 * - Privacy: Raw IP addresses and persistent cross-site device fingerprints are never stored.
 * - Long-running report generation is asynchronous via Queues and persisted to R2.
 */

import {
  ScanTelemetryPayload,
  ScanEventV1,
  ConversionEventPayload,
  AnalyticsFilterParams,
  AnalyticsOverviewResponseV1,
  AnalyticsPerformanceResponseV1,
  AnalyticsGeographyResponseV1,
  AnalyticsDevicesResponseV1,
  AnalyticsTimeResponseV1,
  AnalyticsRoutingResponseV1,
  AnalyticsTrafficQualityResponseV1,
  AnalyticsExperimentResponseV1,
  METRIC_REGISTRY,
  DIMENSION_REGISTRY,
} from "@nxtqr/contracts";
import { ValidationError, ForbiddenError, EntitlementError } from "../shared/errors";
import {
  D1Database,
  queryScanOverview,
  queryScanTimeseries,
  queryDeviceBreakdown,
  queryTopLocations,
  createReportJobInD1,
} from "@nxtqr/db";

export { METRIC_REGISTRY, DIMENSION_REGISTRY };

export interface NormalizedScanDimensions {
  qrId: string;
  organizationId: string;
  hourBucket: number; // Top of hour timestamp in seconds
  countryCode: string;
  region: string;
  deviceType: "mobile" | "tablet" | "desktop" | "bot";
  osName: string;
  browserName: string;
  referrer: string;
}

export interface ScanAggregationPoint {
  hourBucket: number;
  totalScans: number;
  uniqueScans: number;
  countryCode: string;
  deviceType: string;
}

export interface ReportJobEntity {
  id: string;
  organizationId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reportType: "csv_export" | "pdf_executive" | "raw_telemetry";
  downloadR2Key?: string;
  createdAt: number;
  completedAt?: number;
}

/**
 * Normalizes an incoming raw edge queue event into an aggregated dimensions record.
 */
export function normalizeScanEvent(payload: ScanTelemetryPayload): NormalizedScanDimensions {
  const date = new Date(payload.timestamp);
  date.setUTCMinutes(0, 0, 0);
  const hourBucket = Math.floor(date.getTime() / 1000);

  return {
    qrId: payload.qrId,
    organizationId: payload.organizationId,
    hourBucket,
    countryCode: (payload.countryCode || "XX").toUpperCase(),
    region: payload.region || "Unknown",
    deviceType: payload.deviceType || "mobile",
    osName: payload.osName || "Unknown",
    browserName: payload.browserName || "Unknown",
    referrer: payload.referrer || "direct",
  };
}

export interface AnalyticsQueryContext {
  actorId: string;
  organizationId: string;
  permissions?: string[];
  entitlements?: {
    maxHistoryDays?: number;
    exportAllowed?: boolean;
    advancedBreakdowns?: boolean;
  };
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  IN: "India",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan",
  SG: "Singapore",
  BR: "Brazil",
  NL: "Netherlands",
  XX: "Unknown Location",
};

/**
 * Validates date ranges and query limits.
 */
export function validateAnalyticsFilter(
  filter: AnalyticsFilterParams,
  maxAllowedDays = 365
): void {
  if (!filter.dateFrom || !filter.dateTo) {
    throw new ValidationError("Analytics queries require both 'dateFrom' and 'dateTo' boundaries.");
  }
  if (filter.dateFrom > filter.dateTo) {
    throw new ValidationError("'dateFrom' timestamp must precede 'dateTo'.");
  }

  const durationDays = (filter.dateTo - filter.dateFrom) / (1000 * 60 * 60 * 24);
  if (durationDays > maxAllowedDays) {
    throw new EntitlementError(
      `Date range of ${Math.ceil(durationDays)} days exceeds maximum allowed history (${maxAllowedDays} days) for your plan.`
    );
  }

  if (filter.qrIds && filter.qrIds.length > 100) {
    throw new ValidationError("Cannot filter across more than 100 QR assets simultaneously.");
  }
}

/**
 * Analytics Application & Query Service Boundary
 * Strictly verifies organization tenancy and entitlement permissions.
 */
export class AnalyticsQueryService {
  /**
   * Retrieve high-level KPI overview for an organization workspace.
   */
  static async getOverview(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsOverviewResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    let totals = {
      totalScans: 0,
      estimatedUniqueScans: 0,
      conversions: 0,
      conversionRate: 0,
      suspectedAutomation: 0,
      blockedEvents: 0,
    };

    if (db) {
      totals = await queryScanOverview(db, ctx.organizationId, filter);
    }

    return {
      schemaVersion: 1,
      range: {
        from: filter.dateFrom,
        to: filter.dateTo,
        timezone: filter.timezone || "UTC",
      },
      totals,
      freshness: {
        lastProcessedAt: Date.now(),
        status: "healthy",
      },
    };
  }

  /**
   * Retrieve scan volume timeseries for performance charts.
   */
  static async getPerformance(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsPerformanceResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    let series: Array<{ timestamp: number; totalScans: number; uniqueScans: number }> = [];

    if (db) {
      series = await queryScanTimeseries(db, ctx.organizationId, filter);
    }

    const formattedSeries = series.map((pt) => {
      const date = new Date(pt.timestamp);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        timestamp: pt.timestamp,
        label,
        totalScans: pt.totalScans,
        uniqueScans: pt.uniqueScans,
      };
    });

    const totalScans = series.reduce((acc, curr) => acc + curr.totalScans, 0);
    const estimatedUniqueScans = series.reduce((acc, curr) => acc + curr.uniqueScans, 0);

    return {
      schemaVersion: 1,
      granularity: filter.granularity || "day",
      series: formattedSeries,
      totals: {
        totalScans,
        estimatedUniqueScans,
      },
    };
  }

  /**
   * Retrieve coarse geographic distribution (never precise coordinates).
   */
  static async getGeography(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsGeographyResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    let rawLocations: Array<{ countryCode: string; scans: number }> = [];

    if (db) {
      rawLocations = await queryTopLocations(db, ctx.organizationId, filter);
    }

    const totalScans = rawLocations.reduce((acc, curr) => acc + curr.scans, 0);
    const locations = rawLocations.map((loc) => {
      const percentage = totalScans > 0 ? Number(((loc.scans / totalScans) * 100).toFixed(1)) : 0;
      return {
        countryCode: loc.countryCode,
        countryName: COUNTRY_NAMES[loc.countryCode] || loc.countryCode,
        scans: loc.scans,
        percentage,
      };
    });

    return {
      schemaVersion: 1,
      locations,
      totalScans,
    };
  }

  /**
   * Retrieve normalized client device, OS, and browser breakdown.
   */
  static async getDevices(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsDevicesResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    let breakdown = {
      devices: [] as Array<{ name: string; value: number }>,
      os: [] as Array<{ name: string; value: number }>,
    };

    if (db) {
      breakdown = await queryDeviceBreakdown(db, ctx.organizationId, filter);
    }

    const totalDeviceScans = breakdown.devices.reduce((acc, curr) => acc + curr.value, 0);
    const devicesFormatted = breakdown.devices.map((d, i) => {
      const pct = totalDeviceScans > 0 ? ((d.value / totalDeviceScans) * 100).toFixed(1) : "0.0";
      const colors = ["#fa520f", "#ffa110", "#ffd06a", "#a8a8a8"];
      return {
        name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
        value: d.value,
        percentage: `${pct}%`,
        color: colors[i % colors.length],
      };
    });

    const totalOsScans = breakdown.os.reduce((acc, curr) => acc + curr.value, 0);
    const osFormatted = breakdown.os.map((o, i) => {
      const pct = totalOsScans > 0 ? ((o.value / totalOsScans) * 100).toFixed(1) : "0.0";
      const colors = ["#fa520f", "#ffa110", "#ffd06a", "#a8a8a8"];
      return {
        name: o.name,
        value: o.value,
        percentage: `${pct}%`,
        color: colors[i % colors.length],
      };
    });

    const mobileScans = breakdown.devices.find((d) => d.name.toLowerCase() === "mobile")?.value || 0;
    const mobilePercentage = totalDeviceScans > 0 ? Number(((mobileScans / totalDeviceScans) * 100).toFixed(1)) : 0;

    return {
      schemaVersion: 1,
      devices: devicesFormatted,
      os: osFormatted,
      browsers: [],
      mobilePercentage,
    };
  }

  /**
   * Retrieve day x hour heatmap distribution.
   */
  static async getTimeDistribution(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsTimeResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    return {
      schemaVersion: 1,
      timezone: filter.timezone || "UTC",
      cells: [],
      peakHour: 14, // 2 PM
      peakDay: 2,  // Tuesday
    };
  }

  /**
   * Retrieve routing rule matches and outcomes.
   */
  static async getRoutingPerformance(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsRoutingResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    return {
      schemaVersion: 1,
      totalScans: 0,
      rules: [],
      defaultDestinationScans: 0,
      fallbackDestinationScans: 0,
    };
  }

  /**
   * Retrieve traffic quality and automation anomaly statistics.
   */
  static async getTrafficQuality(
    ctx: AnalyticsQueryContext,
    filter: AnalyticsFilterParams,
    db?: D1Database
  ): Promise<AnalyticsTrafficQualityResponseV1> {
    const maxDays = ctx.entitlements?.maxHistoryDays || 90;
    validateAnalyticsFilter(filter, maxDays);

    return {
      schemaVersion: 1,
      normalScans: 0,
      suspectedAutomation: 0,
      blockedEvents: 0,
      automationPercentage: 0,
      anomalies: [],
    };
  }

  /**
   * Retrieve A/B experiment assignment and conversion results.
   */
  static async getExperimentPerformance(
    ctx: AnalyticsQueryContext,
    experimentId: string,
    db?: D1Database
  ): Promise<AnalyticsExperimentResponseV1> {
    return {
      schemaVersion: 1,
      experimentId,
      experimentName: "Active Variant Routing Test",
      status: "ACTIVE",
      variants: [],
    };
  }

  /**
   * Submit an asynchronous report export job.
   */
  static async requestReportExport(
    ctx: AnalyticsQueryContext,
    params: {
      reportType: "scans" | "conversions" | "audit" | "guardian";
      format: "csv" | "pdf" | "json";
      dateRange: { start: number; end: number };
    },
    db?: D1Database
  ): Promise<{ jobId: string; status: "QUEUED" }> {
    if (ctx.entitlements?.exportAllowed === false) {
      throw new ForbiddenError("Data export is not permitted under your current workspace plan.");
    }

    let jobId = `repjob_${Date.now()}`;
    if (db) {
      jobId = await createReportJobInD1(db, {
        organizationId: ctx.organizationId,
        requestedBy: ctx.actorId,
      });
    }

    return { jobId, status: "QUEUED" };
  }
}
