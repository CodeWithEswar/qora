import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    // 4. Resolve destination URL from version or draft
    let destinationUrl = "";
    const draft = Array.isArray(qr.qr_drafts) ? qr.qr_drafts[0] : qr.qr_drafts;

    if (qr.published_revision && qr.published_revision > 0) {
      const { data: version } = await (supabase as any)
        .from("qr_versions")
        .select("destination_json, content_json, routing_json")
        .eq("qr_id", qr.id)
        .eq("version_number", qr.published_revision)
        .maybeSingle();

      if (version) {
        destinationUrl =
          (version.destination_json as any)?.defaultUrl ||
          (version.content_json as any)?.url ||
          (version.destination_json as any)?.url ||
          (version.content_json as any)?.destination ||
          "";
      }
    }

    if (!destinationUrl && draft) {
      destinationUrl =
        (draft.destination_json as any)?.defaultUrl ||
        (draft.content_json as any)?.url ||
        (draft.destination_json as any)?.url ||
        (draft.content_json as any)?.destination ||
        "";
    }

    // 5. Guardian Fallback Check (Check if primary destination is down)
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

    // 6. Record Scan Telemetry Before Redirection
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
    const deviceType = isMobile ? "mobile" : "desktop";
    const osName = /iphone|ipad|ipod/i.test(userAgent)
      ? "iOS"
      : /android/i.test(userAgent)
      ? "Android"
      : /windows/i.test(userAgent)
      ? "Windows"
      : /macintosh|mac os x/i.test(userAgent)
      ? "macOS"
      : "Other";
    const browserName = /chrome|crios/i.test(userAgent)
      ? "Chrome"
      : /safari/i.test(userAgent)
      ? "Safari"
      : /firefox/i.test(userAgent)
      ? "Firefox"
      : "Other";

    const now = new Date();
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

    // 7. Handle Special QR Types (e.g. Landing Page)
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

    // 8. Redirect with Cache-Control no-store
    return NextResponse.redirect(destinationUrl, {
      status: 302,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
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
