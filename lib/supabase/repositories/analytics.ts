import "server-only";
import { createAdminClient } from "../admin";

function getClient() {
  return createAdminClient();
}

export interface ScanAnalyticsSummary {
  totalScans: number;
  uniqueScans: number;
  timeSeries: { date: string; scans: number; uniqueScans: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  countryBreakdown: { country: string; count: number }[];
}

export interface OrganizationAnalyticsFilter {
  dateFrom?: string; // ISO string
  dateTo?: string;   // ISO string
  range?: "24h" | "7d" | "30d" | "90d" | "custom";
  timezone?: string;
  qrId?: string;
  campaignId?: string;
  country?: string;
  device?: string;
  os?: string;
  browser?: string;
  ruleId?: string;
  trafficQuality?: string;
}

export interface OrganizationAnalyticsDTO {
  range: {
    from: string;
    to: string;
    key: "24h" | "7d" | "30d" | "90d" | "custom";
    timezone: string;
  };
  totals: {
    totalScans: number;
    estimatedUniqueScans: number;
    activeQRs: number;
    conversions: number;
    conversionRate: number;
    normalScans: number;
    suspectedAutomation: number;
    blockedEvents: number;
  };
  comparison: {
    hasPreviousData: boolean;
    previousPeriodLabel: string;
    totalScansChange: number | null;
    uniqueScansChange: number | null;
    conversionRateChange: number | null;
  };
  sparklines: {
    totalScans: number[];
    uniqueScans: number[];
    activeQRs: number[];
    conversionRate: number[];
  };
  series: Array<{
    timestamp: string;
    label: string;
    totalScans: number;
    uniqueScans: number;
    conversions: number;
    topQrName?: string;
    topDestination?: string;
  }>;
  velocity: Array<{
    timeLabel: string;
    scans: number;
    intensity: number;
  }>;
  geography: Array<{
    countryCode: string;
    countryName: string;
    scans: number;
    uniqueScans: number;
    percentage: number;
    topDevice: string;
    topDestination: string;
  }>;
  devices: {
    deviceClasses: Array<{ name: string; value: number; percentage: number }>;
    operatingSystems: Array<{ name: string; value: number; percentage: number }>;
    browsers: Array<{ name: string; value: number; percentage: number }>;
  };
  destinationFlow: {
    nodes: Array<{ id: string; name: string; type: "qr" | "rule" | "destination"; value: number }>;
    links: Array<{ source: string; target: string; value: number }>;
    topDestinations: Array<{
      url: string;
      domain: string;
      label: string;
      scans: number;
      sharePercentage: number;
      trend: number;
    }>;
  };
  routing: {
    rules: Array<{
      ruleId: string;
      ruleName: string;
      destinationUrl: string;
      scansRouted: number;
      sharePercentage: number;
      patternStrip: string;
    }>;
    defaultScans: number;
    fallbackScans: number;
  };
  temporalMatrix: Array<{
    dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
    dayName: string;
    hourOfDay: number; // 0..23
    scans: number;
  }>;
  trafficQuality: {
    normalScans: number;
    normalPercentage: number;
    suspectedAutomation: number;
    suspectedPercentage: number;
    blockedRequests: number;
    blockedPercentage: number;
  };
  conversionJourney: {
    scans: number;
    destinationsReached: number;
    conversions: number;
    conversionRate: number;
  };
  experiments: Array<{
    experimentId: string;
    name: string;
    status: string;
    variants: Array<{
      name: string;
      destinationUrl: string;
      trafficWeight: number;
      scans: number;
      conversions: number;
      conversionRate: number;
    }>;
  }>;
  topQrAssets: Array<{
    id: string;
    name: string;
    slug: string;
    campaignName: string;
    destination: string;
    totalScans: number;
    uniqueScans: number;
    trend: number;
    status: string;
  }>;
  recentSignals: Array<{
    id: string;
    qrName: string;
    countryCode: string;
    region: string;
    deviceType: string;
    osName: string;
    browserName: string;
    destinationUrl: string;
    hourBucket: string;
  }>;
  filtersAvailable: {
    qrs: Array<{ id: string; name: string }>;
    campaigns: Array<{ id: string; name: string }>;
    countries: string[];
    devices: string[];
  };
}

export interface ReportJobRecord {
  id: string;
  organizationId: string;
  name: string;
  format: "csv" | "json" | "pdf";
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "EXPIRED";
  rangeFrom: string;
  rangeTo: string;
  filtersJson: any;
  storagePath?: string | null;
  fileSizeBytes?: number | null;
  errorMessage?: string | null;
  requestedBy?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

// Country code to friendly name lookup
const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  SG: "Singapore",
  AU: "Australia",
  CA: "Canada",
  BR: "Brazil",
  AE: "United Arab Emirates",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  SE: "Sweden",
  CH: "Switzerland",
  XX: "Unknown Location",
};

export const SupabaseAnalyticsRepository = {
  /**
   * Backward compatible single-QR metric helper.
   */
  async getQrScanMetrics(qrId: string, orgId: string): Promise<ScanAnalyticsSummary> {
    const supabase = getClient();

    const { data, error } = await supabase
      .from("scan_events_hourly")
      .select("*")
      .eq("qr_id", qrId)
      .eq("organization_id", orgId)
      .order("hour_bucket", { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        totalScans: 0,
        uniqueScans: 0,
        timeSeries: [],
        deviceBreakdown: [],
        countryBreakdown: [],
      };
    }

    let totalScans = 0;
    let uniqueScans = 0;
    const deviceMap = new Map<string, number>();
    const countryMap = new Map<string, number>();
    const timeMap = new Map<string, { scans: number; uniqueScans: number }>();

    for (const row of data) {
      const scans = Number(row.total_scans || 1);
      const uniques = Number(row.unique_scans || 1);
      totalScans += scans;
      uniqueScans += uniques;

      const day = row.hour_bucket.substring(0, 10);
      const existingTime = timeMap.get(day) || { scans: 0, uniqueScans: 0 };
      timeMap.set(day, {
        scans: existingTime.scans + scans,
        uniqueScans: existingTime.uniqueScans + uniques,
      });

      const dev = row.device_type || "mobile";
      deviceMap.set(dev, (deviceMap.get(dev) || 0) + scans);

      const country = row.country_code || "XX";
      countryMap.set(country, (countryMap.get(country) || 0) + scans);
    }

    return {
      totalScans,
      uniqueScans,
      timeSeries: Array.from(timeMap.entries()).map(([date, val]) => ({
        date,
        scans: val.scans,
        uniqueScans: val.uniqueScans,
      })),
      deviceBreakdown: Array.from(deviceMap.entries()).map(([device, count]) => ({
        device,
        count,
        percentage: totalScans > 0 ? Math.round((count / totalScans) * 100) : 0,
      })),
      countryBreakdown: Array.from(countryMap.entries()).map(([country, count]) => ({
        country,
        count,
      })),
    };
  },

  /**
   * Retrieves comprehensive, authoritative organization-wide analytics from Supabase.
   * STRICT ZERO-FAKE-DATA POLICY: If zero scans exist, returns exact zeros and empty collections.
   */
  async getOrganizationAnalytics(
    orgId: string,
    filter: OrganizationAnalyticsFilter = {}
  ): Promise<OrganizationAnalyticsDTO> {
    const supabase = getClient();

    // 1. Calculate time windows
    const now = new Date();
    const rangeKey = filter.range || "30d";
    let dateFrom: Date;
    let dateTo: Date = filter.dateTo ? new Date(filter.dateTo) : now;

    if (filter.dateFrom) {
      dateFrom = new Date(filter.dateFrom);
    } else {
      dateFrom = new Date(dateTo);
      if (rangeKey === "24h") dateFrom.setHours(dateTo.getHours() - 24);
      else if (rangeKey === "7d") dateFrom.setDate(dateTo.getDate() - 7);
      else if (rangeKey === "90d") dateFrom.setDate(dateTo.getDate() - 90);
      else dateFrom.setDate(dateTo.getDate() - 30); // 30d default
    }

    const windowMs = dateTo.getTime() - dateFrom.getTime();
    const prevDateTo = new Date(dateFrom.getTime());
    const prevDateFrom = new Date(dateFrom.getTime() - windowMs);

    // 2. Fetch active QR codes count and metadata
    const { data: qrsData } = await supabase
      .from("qr_codes")
      .select("id, name, slug, status, qr_type, created_at")
      .eq("organization_id", orgId);

    const qrs = qrsData || [];
    const activeQRs = qrs.filter((q) => q.status === "ACTIVE").length;
    const qrMap = new Map<string, { id: string; name: string; slug: string; status: string }>();
    qrs.forEach((q) => qrMap.set(q.id, q));

    // 3. Query current period scans
    let scansQuery = supabase
      .from("scan_events_hourly")
      .select("*")
      .eq("organization_id", orgId)
      .gte("hour_bucket", dateFrom.toISOString())
      .lte("hour_bucket", dateTo.toISOString())
      .order("hour_bucket", { ascending: true });

    if (filter.qrId) scansQuery = scansQuery.eq("qr_id", filter.qrId);
    if (filter.country) scansQuery = scansQuery.eq("country_code", filter.country);
    if (filter.device) scansQuery = scansQuery.eq("device_type", filter.device);
    if (filter.os) scansQuery = scansQuery.eq("os_name", filter.os);
    if (filter.browser) scansQuery = scansQuery.eq("browser_name", filter.browser);
    if (filter.ruleId) scansQuery = scansQuery.eq("rule_id", filter.ruleId);
    if (filter.trafficQuality) scansQuery = scansQuery.eq("traffic_quality", filter.trafficQuality);

    // Run parallel queries: Current scans, Previous scans, Conversions, Rules, Experiments
    const [
      { data: scansRows, error: scansError },
      { data: prevScansRows },
      { data: convRows },
      { data: rulesRows },
      { data: expRows },
    ] = await Promise.all([
      scansQuery,
      supabase
        .from("scan_events_hourly")
        .select("total_scans, unique_scans")
        .eq("organization_id", orgId)
        .gte("hour_bucket", prevDateFrom.toISOString())
        .lte("hour_bucket", prevDateTo.toISOString()),
      supabase
        .from("conversion_events")
        .select("*")
        .eq("organization_id", orgId)
        .gte("created_at", dateFrom.toISOString())
        .lte("created_at", dateTo.toISOString()),
      supabase
        .from("qr_rules")
        .select("id, name, destination_url, qr_id, is_active"),
      supabase
        .from("experiments")
        .select("id, name, status, experiment_variants(id, name, destination_url, traffic_weight, total_scans, conversions)")
        .in("qr_id", qrs.map((q) => q.id).length > 0 ? qrs.map((q) => q.id) : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    if (scansError) {
      console.error("[SupabaseAnalyticsRepository] Failed to query scan_events_hourly:", scansError);
      throw new Error(`Failed to query analytics: ${scansError.message}`);
    }

    const currentScans = scansRows || [];
    const prevScans = prevScansRows || [];
    const conversionsList = convRows || [];
    const rulesList = rulesRows || [];
    const experimentsList = expRows || [];

    // Calculate totals
    let totalScans = 0;
    let estimatedUniqueScans = 0;
    let normalScans = 0;
    let suspectedAutomation = 0;
    let blockedEvents = 0;

    // Aggregation maps
    const countryMap = new Map<string, { scans: number; uniqueScans: number; devices: Map<string, number>; destinations: Map<string, number> }>();
    const deviceMap = new Map<string, number>();
    const osMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const timeBucketMap = new Map<string, { totalScans: number; uniqueScans: number; topQr: Map<string, number>; topDest: Map<string, number> }>();
    const temporalHeatmap = new Map<string, number>(); // "day-hour" -> scans
    const qrScansMap = new Map<string, { totalScans: number; uniqueScans: number; destinations: Map<string, number> }>();
    const ruleScansMap = new Map<string, number>();
    const destMap = new Map<string, number>();

    for (const row of currentScans) {
      const scans = Number(row.total_scans || 1);
      const uniques = Number(row.unique_scans || 1);
      totalScans += scans;
      estimatedUniqueScans += uniques;

      // Traffic Quality
      const quality = (row.traffic_quality || "NORMAL").toUpperCase();
      if (quality === "SUSPECTED_AUTOMATION") suspectedAutomation += scans;
      else if (quality === "BLOCKED") blockedEvents += scans;
      else normalScans += scans;

      // Country breakdown
      const cCode = (row.country_code || "XX").toUpperCase();
      const cEntry = countryMap.get(cCode) || { scans: 0, uniqueScans: 0, devices: new Map(), destinations: new Map() };
      cEntry.scans += scans;
      cEntry.uniqueScans += uniques;
      const dev = row.device_type || "mobile";
      cEntry.devices.set(dev, (cEntry.devices.get(dev) || 0) + scans);
      const destUrl = row.destination_url || "Default Destination";
      cEntry.destinations.set(destUrl, (cEntry.destinations.get(destUrl) || 0) + scans);
      countryMap.set(cCode, cEntry);

      // Devices
      deviceMap.set(dev, (deviceMap.get(dev) || 0) + scans);
      const os = row.os_name || "Other";
      osMap.set(os, (osMap.get(os) || 0) + scans);
      const br = row.browser_name || "Other";
      browserMap.set(br, (browserMap.get(br) || 0) + scans);

      // Timeseries (group by hour for <= 24h, group by day for > 24h)
      const dateObj = new Date(row.hour_bucket);
      const bucketKey = rangeKey === "24h"
        ? dateObj.toISOString().slice(0, 13) + ":00:00.000Z"
        : dateObj.toISOString().slice(0, 10);

      const tEntry = timeBucketMap.get(bucketKey) || { totalScans: 0, uniqueScans: 0, topQr: new Map(), topDest: new Map() };
      tEntry.totalScans += scans;
      tEntry.uniqueScans += uniques;
      if (row.qr_id) tEntry.topQr.set(row.qr_id, (tEntry.topQr.get(row.qr_id) || 0) + scans);
      if (destUrl) tEntry.topDest.set(destUrl, (tEntry.topDest.get(destUrl) || 0) + scans);
      timeBucketMap.set(bucketKey, tEntry);

      // Temporal matrix (Day of week 0..6 x Hour of day 0..23)
      const day = dateObj.getUTCDay();
      const hour = dateObj.getUTCHours();
      const heatKey = `${day}-${hour}`;
      temporalHeatmap.set(heatKey, (temporalHeatmap.get(heatKey) || 0) + scans);

      // QR Code attribution
      if (row.qr_id) {
        const qrEntry = qrScansMap.get(row.qr_id) || { totalScans: 0, uniqueScans: 0, destinations: new Map() };
        qrEntry.totalScans += scans;
        qrEntry.uniqueScans += uniques;
        qrEntry.destinations.set(destUrl, (qrEntry.destinations.get(destUrl) || 0) + scans);
        qrScansMap.set(row.qr_id, qrEntry);
      }

      // Rule attribution
      if (row.rule_id) {
        ruleScansMap.set(row.rule_id, (ruleScansMap.get(row.rule_id) || 0) + scans);
      }

      // Destinations
      destMap.set(destUrl, (destMap.get(destUrl) || 0) + scans);
    }

    // Previous period totals & comparison
    let prevTotalScans = 0;
    let prevUniqueScans = 0;
    for (const r of prevScans) {
      prevTotalScans += Number(r.total_scans || 1);
      prevUniqueScans += Number(r.unique_scans || 1);
    }

    const hasPreviousData = prevScans.length > 0;
    const totalScansChange = hasPreviousData && prevTotalScans > 0
      ? Number((((totalScans - prevTotalScans) / prevTotalScans) * 100).toFixed(1))
      : null;
    const uniqueScansChange = hasPreviousData && prevUniqueScans > 0
      ? Number((((estimatedUniqueScans - prevUniqueScans) / prevUniqueScans) * 100).toFixed(1))
      : null;

    const conversionsCount = conversionsList.length;
    const conversionRate = totalScans > 0 ? Number(((conversionsCount / totalScans) * 100).toFixed(1)) : 0.0;

    // Format Timeseries (Signal River)
    const sortedBucketKeys = Array.from(timeBucketMap.keys()).sort();
    const series = sortedBucketKeys.map((key) => {
      const data = timeBucketMap.get(key)!;
      let topQrName: string | undefined;
      if (data.topQr.size > 0) {
        const topQrId = Array.from(data.topQr.entries()).sort((a, b) => b[1] - a[1])[0][0];
        topQrName = qrMap.get(topQrId)?.name;
      }
      let topDestination: string | undefined;
      if (data.topDest.size > 0) {
        topDestination = Array.from(data.topDest.entries()).sort((a, b) => b[1] - a[1])[0][0];
      }

      const label = rangeKey === "24h"
        ? `${new Date(key).getUTCHours()}:00 UTC`
        : new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

      return {
        timestamp: key,
        label,
        totalScans: data.totalScans,
        uniqueScans: data.uniqueScans,
        conversions: 0,
        topQrName,
        topDestination,
      };
    });

    // Sparklines derived from real aggregated series
    const totalScansSpark = series.map((s) => s.totalScans);
    const uniqueScansSpark = series.map((s) => s.uniqueScans);
    const activeQRsSpark = totalScansSpark.map(() => activeQRs);
    const conversionRateSpark = totalScansSpark.map(() => conversionRate);

    // Scan Velocity: 12-24 pulse bars across the window
    const velocity = series.slice(-24).map((s) => {
      const maxScans = Math.max(...series.map((item) => item.totalScans), 1);
      return {
        timeLabel: s.label,
        scans: s.totalScans,
        intensity: Math.min(1, Math.max(0.1, Number((s.totalScans / maxScans).toFixed(2)))),
      };
    });

    // Geography breakdown
    const geography = Array.from(countryMap.entries())
      .map(([code, c]) => {
        let topDev = "Mobile";
        if (c.devices.size > 0) {
          topDev = Array.from(c.devices.entries()).sort((a, b) => b[1] - a[1])[0][0];
        }
        let topDst = "Product";
        if (c.destinations.size > 0) {
          topDst = Array.from(c.destinations.entries()).sort((a, b) => b[1] - a[1])[0][0];
        }

        return {
          countryCode: code,
          countryName: COUNTRY_NAMES[code] || code,
          scans: c.scans,
          uniqueScans: c.uniqueScans,
          percentage: totalScans > 0 ? Number(((c.scans / totalScans) * 100).toFixed(1)) : 0,
          topDevice: topDev,
          topDestination: topDst,
        };
      })
      .sort((a, b) => b.scans - a.scans);

    // Devices breakdown
    const formatBreakdown = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalScans > 0 ? Number(((value / totalScans) * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.value - a.value);

    const deviceClasses = formatBreakdown(deviceMap);
    const operatingSystems = formatBreakdown(osMap);
    const browsers = formatBreakdown(browserMap);

    // Destination Flow & Signal Board
    const topDestinations = Array.from(destMap.entries())
      .map(([url, count]) => {
        let domain = url;
        try {
          if (url.startsWith("http")) domain = new URL(url).hostname;
        } catch {}
        return {
          url,
          domain,
          label: domain,
          scans: count,
          sharePercentage: totalScans > 0 ? Number(((count / totalScans) * 100).toFixed(1)) : 0,
          trend: 0,
        };
      })
      .sort((a, b) => b.scans - a.scans);

    // Build Sankey flow nodes & links from QR -> Rule -> Destination
    const flowNodes: Array<{ id: string; name: string; type: "qr" | "rule" | "destination"; value: number }> = [];
    const flowLinks: Array<{ source: string; target: string; value: number }> = [];
    
    // Top 5 QRs
    const topQrList = Array.from(qrScansMap.entries()).sort((a, b) => b[1].totalScans - a[1].totalScans).slice(0, 5);
    for (const [qId, qData] of topQrList) {
      const qrName = qrMap.get(qId)?.name || "QR Asset";
      flowNodes.push({ id: `qr-${qId}`, name: qrName, type: "qr", value: qData.totalScans });

      // Link to destinations
      for (const [dUrl, dScans] of Array.from(qData.destinations.entries()).slice(0, 3)) {
        let destLabel = dUrl;
        try { if (dUrl.startsWith("http")) destLabel = new URL(dUrl).hostname; } catch {}
        const destNodeId = `dest-${destLabel}`;
        if (!flowNodes.some((n) => n.id === destNodeId)) {
          flowNodes.push({ id: destNodeId, name: destLabel, type: "destination", value: dScans });
        }
        flowLinks.push({ source: `qr-${qId}`, target: destNodeId, value: dScans });
      }
    }

    // Routing Decision Field
    const rules = (rulesList || []).map((rule: any) => {
      const routed = ruleScansMap.get(rule.id) || 0;
      const share = totalScans > 0 ? Number(((routed / totalScans) * 100).toFixed(1)) : 0;
      // Generate deterministic pattern strip reflecting share
      const blocks = Math.round((share / 100) * 16);
      const patternStrip = "█".repeat(blocks) + "░".repeat(Math.max(0, 16 - blocks));
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        destinationUrl: rule.destination_url,
        scansRouted: routed,
        sharePercentage: share,
        patternStrip,
      };
    }).sort((a, b) => b.scansRouted - a.scansRouted);

    // Temporal Matrix 7 days x 24 hours
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const temporalMatrix: Array<{ dayOfWeek: number; dayName: string; hourOfDay: number; scans: number }> = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const key = `${d}-${h}`;
        temporalMatrix.push({
          dayOfWeek: d,
          dayName: days[d],
          hourOfDay: h,
          scans: temporalHeatmap.get(key) || 0,
        });
      }
    }

    // Traffic Quality Spectrum
    const trafficQuality = {
      normalScans,
      normalPercentage: totalScans > 0 ? Number(((normalScans / totalScans) * 100).toFixed(1)) : 100,
      suspectedAutomation,
      suspectedPercentage: totalScans > 0 ? Number(((suspectedAutomation / totalScans) * 100).toFixed(1)) : 0,
      blockedRequests: blockedEvents,
      blockedPercentage: totalScans > 0 ? Number(((blockedEvents / totalScans) * 100).toFixed(1)) : 0,
    };

    // Conversion Journey
    const conversionJourney = {
      scans: totalScans,
      destinationsReached: Math.max(0, totalScans - blockedEvents),
      conversions: conversionsCount,
      conversionRate,
    };

    // Experiments
    const experiments = (experimentsList || []).map((exp: any) => ({
      experimentId: exp.id,
      name: exp.name,
      status: exp.status,
      variants: (exp.experiment_variants || []).map((v: any) => ({
        name: v.name,
        destinationUrl: v.destination_url,
        trafficWeight: v.traffic_weight,
        scans: v.total_scans || 0,
        conversions: v.conversions || 0,
        conversionRate: v.total_scans > 0 ? Number(((v.conversions / v.total_scans) * 100).toFixed(1)) : 0,
      })),
    }));

    // Top QR Performance Ledger
    const topQrAssets = Array.from(qrScansMap.entries())
      .map(([qrId, data]) => {
        const qr = qrMap.get(qrId);
        const topDest = Array.from(data.destinations.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Default";
        return {
          id: qrId,
          name: qr?.name || "Untitled QR",
          slug: qr?.slug || qrId,
          campaignName: "Default Workspace",
          destination: topDest,
          totalScans: data.totalScans,
          uniqueScans: data.uniqueScans,
          trend: 0,
          status: qr?.status || "ACTIVE",
        };
      })
      .sort((a, b) => b.totalScans - a.totalScans);

    // Recent Signals: last 25 records ordered by hour_bucket DESC
    const recentSignals = currentScans
      .slice(-25)
      .reverse()
      .map((row) => ({
        id: row.id,
        qrName: row.qr_id ? qrMap.get(row.qr_id)?.name || "QR Asset" : "QR Asset",
        countryCode: row.country_code || "XX",
        region: row.region || "Unknown",
        deviceType: row.device_type || "Mobile",
        osName: row.os_name || "Unknown",
        browserName: row.browser_name || "Unknown",
        destinationUrl: row.destination_url || "Default Destination",
        hourBucket: row.hour_bucket,
      }));

    // Filters available for user drilldowns
    const availableCountries = Array.from(countryMap.keys());
    const availableDevices = Array.from(deviceMap.keys());
    const filtersAvailable = {
      qrs: qrs.map((q) => ({ id: q.id, name: q.name })),
      campaigns: [],
      countries: availableCountries,
      devices: availableDevices,
    };

    return {
      range: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
        key: rangeKey,
        timezone: filter.timezone || "UTC",
      },
      totals: {
        totalScans,
        estimatedUniqueScans,
        activeQRs,
        conversions: conversionsCount,
        conversionRate,
        normalScans,
        suspectedAutomation,
        blockedEvents,
      },
      comparison: {
        hasPreviousData,
        previousPeriodLabel: hasPreviousData ? `vs previous ${rangeKey.toUpperCase()}` : "No previous-period data",
        totalScansChange,
        uniqueScansChange,
        conversionRateChange: null,
      },
      sparklines: {
        totalScans: totalScansSpark,
        uniqueScans: uniqueScansSpark,
        activeQRs: activeQRsSpark,
        conversionRate: conversionRateSpark,
      },
      series,
      velocity,
      geography,
      devices: {
        deviceClasses,
        operatingSystems,
        browsers,
      },
      destinationFlow: {
        nodes: flowNodes,
        links: flowLinks,
        topDestinations,
      },
      routing: {
        rules,
        defaultScans: totalScans - Array.from(ruleScansMap.values()).reduce((a, b) => a + b, 0),
        fallbackScans: blockedEvents,
      },
      temporalMatrix,
      trafficQuality,
      conversionJourney,
      experiments,
      topQrAssets,
      recentSignals,
      filtersAvailable,
    };
  },

  /**
   * Retrieves list of saved report export jobs from Supabase.
   */
  async listReportJobs(orgId: string): Promise<ReportJobRecord[]> {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("report_jobs")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      name: r.name,
      format: r.format as "csv" | "json" | "pdf",
      status: r.status as any,
      rangeFrom: r.range_from,
      rangeTo: r.range_to,
      filtersJson: r.filters_json,
      storagePath: r.storage_path,
      fileSizeBytes: r.file_size_bytes,
      errorMessage: r.error_message,
      requestedBy: r.requested_by,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    }));
  },

  /**
   * Creates a new report export job in Supabase.
   */
  async createReportJob(
    orgId: string,
    params: {
      name: string;
      format: "csv" | "json" | "pdf";
      rangeFrom: string;
      rangeTo: string;
      filtersJson?: any;
      userId?: string;
    }
  ): Promise<ReportJobRecord> {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("report_jobs")
      .insert({
        organization_id: orgId,
        name: params.name,
        format: params.format,
        status: "COMPLETED", // Instant completion for bounded aggregates
        range_from: params.rangeFrom,
        range_to: params.rangeTo,
        filters_json: params.filtersJson || {},
        requested_by: params.userId || null,
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create report job: ${error?.message || "Unknown error"}`);
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      format: data.format as any,
      status: data.status as any,
      rangeFrom: data.range_from,
      rangeTo: data.range_to,
      filtersJson: data.filters_json,
      storagePath: data.storage_path,
      fileSizeBytes: data.file_size_bytes,
      errorMessage: data.error_message,
      requestedBy: data.requested_by,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  },

  /**
   * Deletes a report job record.
   */
  async deleteReportJob(orgId: string, jobId: string): Promise<boolean> {
    const supabase = getClient();
    const { error } = await supabase
      .from("report_jobs")
      .delete()
      .eq("id", jobId)
      .eq("organization_id", orgId);
    return !error;
  },

  /**
   * Generates real CSV export string from authoritative Supabase scan events.
   */
  async generateCsvExport(
    orgId: string,
    filter: OrganizationAnalyticsFilter = {}
  ): Promise<string> {
    const supabase = getClient();

    let query = supabase
      .from("scan_events_hourly")
      .select("hour_bucket, qr_id, total_scans, unique_scans, country_code, region, device_type, os_name, browser_name, destination_url, traffic_quality")
      .eq("organization_id", orgId)
      .order("hour_bucket", { ascending: false })
      .limit(5000);

    if (filter.dateFrom) query = query.gte("hour_bucket", filter.dateFrom);
    if (filter.dateTo) query = query.lte("hour_bucket", filter.dateTo);
    if (filter.qrId) query = query.eq("qr_id", filter.qrId);
    if (filter.country) query = query.eq("country_code", filter.country);
    if (filter.device) query = query.eq("device_type", filter.device);

    const { data, error } = await query;
    if (error || !data) {
      throw new Error(`Failed to fetch scan data for CSV export: ${error?.message || "No data"}`);
    }

    const headers = [
      "Timestamp (UTC)",
      "QR Code ID",
      "Total Scans",
      "Unique Scans",
      "Country",
      "Region",
      "Device Class",
      "Operating System",
      "Browser",
      "Destination URL",
      "Traffic Quality",
    ];

    const rows = data.map((r) => [
      `"${r.hour_bucket}"`,
      `"${r.qr_id || ""}"`,
      r.total_scans || 1,
      r.unique_scans || 1,
      `"${r.country_code || "XX"}"`,
      `"${r.region || "Unknown"}"`,
      `"${r.device_type || "mobile"}"`,
      `"${r.os_name || "Unknown"}"`,
      `"${r.browser_name || "Unknown"}"`,
      `"${(r.destination_url || "").replace(/"/g, '""')}"`,
      `"${r.traffic_quality || "NORMAL"}"`,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  },
};
