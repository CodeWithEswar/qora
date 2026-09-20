/**
 * NXTQR — Edge Request Context Normalizer & Scanner Intelligence
 * Extracts normalized context from Cloudflare Worker Request.
 */

import {
  ResolverContext,
  DeviceClass,
  OSFamily,
  BrowserFamily,
  ReferrerClass,
  TrafficQualityClass,
} from "@nxtqr/contracts";
import {
  evaluateCondition,
  evaluateRule,
  evaluateRoutingPolicy,
} from "@nxtqr/routing-engine";

export { evaluateCondition, evaluateRule, evaluateRoutingPolicy };

export interface NormalizedScannerDimensions {
  country: string;
  region?: string;
  deviceClass: DeviceClass;
  osFamily: OSFamily;
  browserFamily: BrowserFamily;
  referrerClass: ReferrerClass;
  trafficQuality: TrafficQualityClass;
}

/**
 * Parses coarse telemetry dimensions for high-volume analytics.
 */
export function parseNormalizedTelemetryDimensions(request: Request): NormalizedScannerDimensions {
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";
  const cf = (request as any).cf || {};
  const country = (cf.country || "XX").toUpperCase();
  const region = cf.region || undefined;
  const ua = userAgent.toLowerCase();

  // 1. Traffic Quality: Conservative classification (known automation/crawlers)
  let trafficQuality: TrafficQualityClass = "NORMAL";
  if (/bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp|preview|curl|wget|python|postman|go-http/i.test(ua)) {
    trafficQuality = "SUSPECTED_AUTOMATION";
  }

  // 2. Device Class
  let deviceClass: DeviceClass = "DESKTOP";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceClass = "TABLET";
  } else if (/mobi|iphone|ipod|android/i.test(ua)) {
    deviceClass = "MOBILE";
  } else if (!ua || ua.trim() === "") {
    deviceClass = "UNKNOWN";
  }

  // 3. OS Family
  let osFamily: OSFamily = "UNKNOWN";
  if (/iphone|ipad|ipod/i.test(ua)) {
    osFamily = "IOS";
  } else if (/android/i.test(ua)) {
    osFamily = "ANDROID";
  } else if (/macintosh|mac os x/i.test(ua)) {
    osFamily = "MACOS";
  } else if (/windows nt/i.test(ua)) {
    osFamily = "WINDOWS";
  } else if (/cros/i.test(ua)) {
    osFamily = "CHROME_OS";
  } else if (/linux/i.test(ua)) {
    osFamily = "LINUX";
  }

  // 4. Browser Family
  let browserFamily: BrowserFamily = "UNKNOWN";
  if (/samsungbrowser/i.test(ua)) {
    browserFamily = "SAMSUNG_INTERNET";
  } else if (/edg\//i.test(ua)) {
    browserFamily = "EDGE";
  } else if (/chrome|crios/i.test(ua) && !/opr|brave/i.test(ua)) {
    browserFamily = "CHROME";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browserFamily = "SAFARI";
  } else if (/firefox|fxios/i.test(ua)) {
    browserFamily = "FIREFOX";
  }

  // 5. Referrer Class (Sanitized, no paths or private query strings)
  let referrerClass: ReferrerClass = "DIRECT_OR_UNKNOWN";
  if (referrer) {
    const refLower = referrer.toLowerCase();
    if (/google\.|bing\.|duckduckgo\.|yahoo\.|baidu\./i.test(refLower)) {
      referrerClass = "SEARCH";
    } else if (/facebook\.|instagram\.|twitter\.|t\.co|linkedin\.|tiktok\.|reddit\.|pinterest\.|whatsapp\./i.test(refLower)) {
      referrerClass = "SOCIAL";
    } else if (/nxtqr\./i.test(refLower)) {
      referrerClass = "INTERNAL";
    } else if (refLower.startsWith("http://") || refLower.startsWith("https://")) {
      referrerClass = "WEB";
    } else {
      referrerClass = "OTHER";
    }
  }

  return {
    country,
    region,
    deviceClass,
    osFamily,
    browserFamily,
    referrerClass,
    trafficQuality,
  };
}

/**
 * Builds normalized ResolverContext for pure rule evaluation.
 * Computed ONCE per scan request.
 */
export function buildResolverContext(
  request: Request,
  host: string,
  slug: string,
  targetTimezone = "UTC"
): ResolverContext {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const cf = (request as any).cf || {};

  const country = cf.country ? String(cf.country).toUpperCase() : undefined;
  const region = cf.region ? String(cf.region).toUpperCase() : undefined;
  const ua = userAgent.toLowerCase();

  // 1. Device Form Factor
  let device: "mobile" | "desktop" | "tablet" | "other" = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = "tablet";
  } else if (/mobi|iphone|ipod|android/i.test(ua)) {
    device = "mobile";
  } else if (/bot|spider|crawl|slurp/i.test(ua)) {
    device = "other";
  }

  // 2. Composable OS Family
  let os: "ios" | "android" | "windows" | "macos" | "linux" | "other" = "other";
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = "ios";
  } else if (/android/i.test(ua)) {
    os = "android";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macos";
  } else if (/windows nt/i.test(ua)) {
    os = "windows";
  } else if (/linux/i.test(ua)) {
    os = "linux";
  }

  // 3. Browser Family
  let browser: "safari" | "chrome" | "firefox" | "edge" | "samsung_internet" | "other" = "other";
  if (/samsungbrowser/i.test(ua)) {
    browser = "samsung_internet";
  } else if (/edg\//i.test(ua)) {
    browser = "edge";
  } else if (/chrome|crios/i.test(ua) && !/opr|brave/i.test(ua)) {
    browser = "chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = "safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "firefox";
  }

  // 4. Language Normalization
  const primaryLocale = acceptLanguage.split(",")[0]?.trim().toLowerCase() || "en";
  const languagePrimary = primaryLocale.split("-")[0];

  // 5. Time and Weekday in target timezone
  const now = Date.now();
  const dateObj = new Date(now);
  let localHour = dateObj.getUTCHours();
  let localMinute = dateObj.getUTCMinutes();
  let localDay = dateObj.getUTCDay(); // 0 = Sun

  const effectiveTz = targetTimezone || cf.timezone || "UTC";
  try {
    const tzString = dateObj.toLocaleTimeString("en-US", {
      timeZone: effectiveTz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const [h, m] = tzString.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      localHour = h;
      localMinute = m;
    }
  } catch {
    // Fallback to UTC if timezone is unrecognized
  }

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const currentWeekday = daysOfWeek[localDay];
  const localTime = `${String(localHour).padStart(2, "0")}:${String(localMinute).padStart(2, "0")}`;

  // 6. Untrusted Query Parameters (Bounded to 10 keys, max 64 chars per value)
  const queryParams: Record<string, string> = {};
  let paramCount = 0;
  for (const [k, v] of url.searchParams.entries()) {
    if (paramCount++ >= 10) break;
    const cleanKey = k.toLowerCase().slice(0, 32);
    const cleanVal = v.slice(0, 64);
    queryParams[cleanKey] = cleanVal;
  }

  return {
    now,
    host,
    slug,
    device,
    os,
    browser,
    language: primaryLocale,
    languagePrimary,
    country,
    region,
    timezone: effectiveTz,
    localTime,
    weekday: currentWeekday,
    queryParams,
  };
}

export function parseScannerContext(request: Request): ResolverContext {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[0] === "s" ? parts[1] : parts[0] || "unknown";
  return buildResolverContext(request, url.hostname, slug);
}
