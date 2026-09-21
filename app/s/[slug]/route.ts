import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateRule } from "@nxtqr/routing-engine";
import type { RoutingRule, ResolverContext } from "@nxtqr/contracts";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Branded public status page renderer for scanner errors and non-active QR states.
 */
function renderStatusPage(
  status: number,
  title: string,
  message: string,
  accentColor: string
): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — NXTQR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0D0D0D;
      color: #F7F4EC;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${accentColor};
      margin-bottom: 20px;
      box-shadow: 0 0 12px ${accentColor};
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #B8B5AD;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 16px;
      font-size: 12px;
      color: #85827B;
      letter-spacing: 0.04em;
    }
    .brand {
      color: #FA520F;
      font-weight: 600;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"></div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">Powered by <a class="brand" href="https://nxtqr.vercel.app">NXTQR</a> Intelligence</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

/**
 * GET /s/[slug] — NXTQR Canonical Edge Resolver Route
 * Resolves published dynamic QR codes, landing pages, and Guardian fallback policies.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!slug || slug.length < 2 || slug.length > 64) {
    return renderStatusPage(
      404,
      "QR Code Not Found",
      "The requested QR destination code is invalid or missing.",
      "#FA520F"
    );
  }

  const cleanSlug = slug.replace(/^\/+/, "").replace(/^s\/+/, "").trim();

  try {
    const supabase = createAdminClient();

    // 1. Fetch QR code asset
    const { data: qr, error: qrError } = await (supabase as any)
      .from("qr_codes")
      .select(`
        id,
        organization_id,
        slug,
        name,
        qr_type,
        is_dynamic,
        status,
        published_revision,
        qr_drafts (
          content_json,
          destination_json,
          routing_json
        )
      `)
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (qrError) {
      console.error("[QR Resolver] Supabase lookup error:", qrError);
    }

    // 2. If no QR found, check published landing pages
    if (!qr) {
      const { data: page } = await (supabase as any)
        .from("landing_pages")
        .select("id, slug, status, organization_id")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (page && (page.status?.toLowerCase() === "published" || page.status === "PUBLISHED")) {
        const userAgent = request.headers.get("user-agent") || "";
        const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
        const referrer = request.headers.get("referer") || "direct";
        try {
          await Promise.race([
            (supabase as any).from("landing_page_events").insert({
              landing_page_id: page.id,
              organization_id: page.organization_id,
              event_type: "view",
              device_type: isMobile ? "mobile" : "desktop",
              referrer: referrer.slice(0, 255),
            }),
            new Promise((resolve) => setTimeout(resolve, 800)),
          ]);
        } catch (e) {
          console.warn("[QR Resolver] Landing page view event notice:", e);
        }
        return NextResponse.redirect(new URL(`/p/${cleanSlug}`, request.url), 302);
      }

      return renderStatusPage(
        404,
        "QR Code Not Found",
        "The requested QR code destination does not exist or has been removed.",
        "#FA520F"
      );
    }

    // 3. Status Gates
    if (qr.status === "ARCHIVED") {
      return renderStatusPage(
        410,
        "QR Code Removed",
        "This QR code has been archived or removed by its owner.",
        "#6A6A6A"
      );
    }

    if (qr.status === "PAUSED") {
      return renderStatusPage(
        403,
        "QR Code Paused",
        "This QR campaign is temporarily inactive. Please check back later.",
        "#FFA110"
      );
    }

    if (qr.status === "EXPIRED") {
      return renderStatusPage(
        410,
        "QR Code Expired",
        "This campaign or offer has concluded.",
        "#6A6A6A"
      );
      
    }

    // 4. Scanner Context Extraction for Telemetry & QR Brain Rule Evaluation
    const userAgent = request.headers.get("user-agent") || "";
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      "XX";
    const region =
      request.headers.get("x-vercel-ip-country-region") ||
      request.headers.get("cf-region") ||
      "Unknown";
    const referrer = request.headers.get("referer") || "direct";

    const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
    const isTablet = /ipad|tablet|(android(?!.*mobile))/i.test(userAgent);
    const isBot = /bot|crawler|spider|crawling|whatsapp|facebookexternalhit|preview/i.test(userAgent);
    const deviceType: "mobile" | "desktop" | "tablet" | "bot" = isBot
      ? "bot"
      : isTablet
      ? "tablet"
      : isMobile
      ? "mobile"
      : "desktop";

    const osName = /iphone|ipad|ipod/i.test(userAgent)
      ? "iOS"
      : /android/i.test(userAgent)
      ? "Android"
      : /windows/i.test(userAgent)
      ? "Windows"
      : /macintosh|mac os x/i.test(userAgent)
      ? "macOS"
      : /linux/i.test(userAgent)
      ? "Linux"
      : "Other";

    const browserName = /edg\//i.test(userAgent)
      ? "Edge"
      : /chrome|crios/i.test(userAgent) && !/opr|brave/i.test(userAgent)
      ? "Chrome"
      : /safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)
      ? "Safari"
      : /firefox|fxios/i.test(userAgent)
      ? "Firefox"
      : "Other";

    const primaryLang =
      request.headers.get("accept-language")?.split(",")[0]?.split("-")[0]?.trim().toLowerCase() || "en";

    const now = new Date();
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentWeekday = daysOfWeek[now.getUTCDay()];
    const localTime = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;

    const queryParams: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((val, key) => {
      queryParams[key.toLowerCase()] = val;
    });

    const scannerContext: Partial<ResolverContext> = {
      country: country.toUpperCase(),
      region: region.toUpperCase(),
      device: deviceType,
      os: osName,
      browser: browserName,
      language: primaryLang,
      localTime,
      weekday: currentWeekday,
      queryParams,
      now,
      slug: cleanSlug,
    };

    // 5. Fetch Version & Draft State
    const draft = Array.isArray(qr.qr_drafts) ? qr.qr_drafts[0] : qr.qr_drafts;
    let versionData: any = null;

    if (qr.published_revision && qr.published_revision > 0) {
      const { data: version } = await (supabase as any)
        .from("qr_versions")
        .select("destination_json, content_json, routing_json")
        .eq("qr_id", qr.id)
        .eq("version_number", qr.published_revision)
        .maybeSingle();

      versionData = version;
    }

    // Determine Base Default Destination URL
    let defaultUrl =
      (versionData?.destination_json as any)?.defaultUrl ||
      (versionData?.content_json as any)?.url ||
      (draft?.destination_json as any)?.defaultUrl ||
      (draft?.content_json as any)?.url ||
      "";

    // If defaultUrl points to platform URL itself, check if draft contains the true user destination
    if (!defaultUrl || defaultUrl.includes("nxtqr.vercel.app") || defaultUrl.includes("nextqr.vercel.app")) {
      const draftUrl = (draft?.content_json as any)?.url || (draft?.destination_json as any)?.defaultUrl;
      if (draftUrl && !draftUrl.includes("nxtqr.vercel.app") && !draftUrl.includes("nextqr.vercel.app")) {
        defaultUrl = draftUrl;
      }
    }

    // 6. Evaluate QR Brain Dynamic Routing Rules
    let destinationUrl = "";
    let matchedRuleId: string | undefined;

    let rawRules: any = versionData?.routing_json || draft?.routing_json;
    let rules: RoutingRule[] = [];

    if (typeof rawRules === "string") {
      try {
        rules = JSON.parse(rawRules);
      } catch {
        rules = [];
      }
    } else if (Array.isArray(rawRules)) {
      rules = rawRules;
    }

    // Fallback: check relational qr_rules table if not present in JSON
    if (!rules || rules.length === 0) {
      const { data: dbRules } = await (supabase as any)
        .from("qr_rules")
        .select("*")
        .eq("qr_id", qr.id)
        .eq("is_active", true)
        .order("priority", { ascending: true });

      if (dbRules && dbRules.length > 0) {
        rules = dbRules.map((r: any) => ({
          id: r.id,
          qrId: r.qr_id,
          name: r.name,
          priority: Number(r.priority || 1),
          isActive: r.is_active !== false,
          matchType: (r.match_type as any) || "ALL",
          conditions: Array.isArray(r.conditions_json)
            ? r.conditions_json
            : typeof r.conditions_json === "string"
            ? JSON.parse(r.conditions_json)
            : [],
          action: {
            type: (r.action_type as any) || "redirect",
            destinationUrl: r.destination_url,
            destinationId: r.destination_id,
          },
        }));
      }
    }

    // Execute rule evaluator
    if (Array.isArray(rules) && rules.length > 0) {
      const activeRules = rules
        .filter((r) => r && r.isActive !== false && Array.isArray(r.conditions) && r.conditions.length > 0)
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      for (const rule of activeRules) {
        try {
          const { matched } = evaluateRule(rule, scannerContext);
          if (matched && rule.action?.destinationUrl) {
            destinationUrl = rule.action.destinationUrl.trim();
            matchedRuleId = rule.id;
            break;
          }
        } catch (ruleErr) {
          console.warn("[QR Resolver] Rule evaluation notice:", ruleErr);
        }
      }
    }

    // If no dynamic rule matched, fall back to user-configured defaultUrl
    if (!destinationUrl) {
      destinationUrl = defaultUrl;
    }

    // If destinationUrl still points to self-domain, check if any rule has an external destination
    if (!destinationUrl || destinationUrl.includes("nxtqr.vercel.app") || destinationUrl.includes("nextqr.vercel.app")) {
      const ruleWithExternal = rules?.find((r) => r?.action?.destinationUrl && !r.action.destinationUrl.includes("nxtqr.vercel.app") && !r.action.destinationUrl.includes("nextqr.vercel.app"));
      if (ruleWithExternal?.action?.destinationUrl) {
        destinationUrl = ruleWithExternal.action.destinationUrl.trim();
      }
    }

    // 7. Guardian Fallback Check (Apply backup if primary destination is down)
    try {
      const { data: monitor } = await (supabase as any)
        .from("guardian_monitors")
        .select("id, current_health, status")
        .eq("qr_id", qr.id)
        .maybeSingle();

      if (monitor && (monitor.current_health === "UNAVAILABLE" || monitor.status === "DOWN")) {
        const { data: fallback } = await (supabase as any)
          .from("fallback_policies")
          .select("backup_url, auto_switch")
          .or(`qr_id.eq.${qr.id},monitor_id.eq.${monitor.id}`)
          .maybeSingle();

        if (fallback && fallback.auto_switch && fallback.backup_url) {
          destinationUrl = fallback.backup_url;
        }
      }
    } catch {
      // Guardian lookup errors must never block resolution
    }

    // Prevent Circular Redirection Loop
    const currentHost = request.headers.get("host") || request.nextUrl.host;
    if (
      destinationUrl.includes(`${currentHost}/s/${cleanSlug}`) ||
      destinationUrl === request.url ||
      destinationUrl === `https://nxtqr.vercel.app/s/${cleanSlug}` ||
      destinationUrl === `https://nextqr.vercel.app/s/${cleanSlug}`
    ) {
      console.warn(`[QR Resolver] Circular redirect prevented for ${cleanSlug}`);
      return renderStatusPage(
        508,
        "Redirect Loop Detected",
        "This QR destination is configured to point back to its own scan URL. Please update its destination in the dashboard.",
        "#FA520F"
      );
    }

    // 8. Record Scan Telemetry Before Redirection
    now.setMinutes(0, 0, 0);
    const hourBucket = now.toISOString();

    try {
      await Promise.race([
        (supabase as any).from("scan_events_hourly").insert({
          qr_id: qr.id,
          organization_id: qr.organization_id,
          hour_bucket: hourBucket,
          total_scans: 1,
          unique_scans: 1,
          country_code: country,
          region: region,
          device_type: deviceType,
          os_name: osName,
          browser_name: browserName,
          referrer: referrer.slice(0, 255),
          destination_url: destinationUrl || null,
        }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (err) {
      console.warn("[QR Resolver] Scan telemetry insert notice:", err);
    }

    // 9. Handle Special QR Types (e.g. Landing Page)
    if (qr.qr_type === "landing_page" || (draft?.content_json as any)?.type === "landing_page") {
      const pageSlug = (draft?.content_json as any)?.landingPageSlug || destinationUrl || cleanSlug;
      return NextResponse.redirect(new URL(`/p/${pageSlug}?qr_id=${qr.id}`, request.url), 302);
    }

    if (!destinationUrl) {
      return renderStatusPage(
        404,
        "Destination Not Configured",
        "This QR code is active but its destination has not been configured yet.",
        "#FFA110"
      );
    }

    // Normalize protocol
    if (!/^https?:\/\//i.test(destinationUrl)) {
      destinationUrl = `https://${destinationUrl}`;
    }

    // 10. Redirect with Cache-Control no-store
    return NextResponse.redirect(destinationUrl, {
      status: 302,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-NXTQR-Destination": destinationUrl,
        ...(matchedRuleId ? { "X-NXTQR-Matched-Rule": matchedRuleId } : {}),
      },
    });
  } catch (err) {
    console.error("[QR Resolver] Unexpected error during resolution:", err);
    return renderStatusPage(
      500,
      "Service Temporarily Unavailable",
      "We encountered an unexpected error while resolving this QR destination. Please try again.",
      "#FA520F"
    );
  }
}

/**
 * HEAD /s/[slug] — Method support for HEAD probes and link verification
 */
export async function HEAD(request: NextRequest, context: RouteParams) {
  return GET(request, context);
}
