"use client";

import * as React from "react";
import { Icon, addIcon } from "@iconify/react";
import { OFFLINE_ICON_DATA } from "./offline-icons-bundle";

// Pre-register all offline icons into Iconify's in-memory storage synchronously
// Ensures zero runtime network requests and 100% offline icon resolution
for (const [iconId, data] of Object.entries(OFFLINE_ICON_DATA)) {
  try {
    addIcon(iconId, {
      body: data.body,
      width: data.width,
      height: data.height,
    });
  } catch {
    // Already registered or inert
  }
}

/**
 * NXTQR QR Studio — Canonical Iconify Icon Registry
 * 
 * Strict separation:
 * 1. General product / workflow concepts -> Hugeicons collection via Iconify
 * 2. Recognizable third-party services -> Simple Icons collection via Iconify
 * 3. NXTQR Brand Mark -> Canonical local SVG (/public/brand/nxtqr-mark.svg) ONLY
 */
export const QR_TYPE_ICONS = {
  // Core & Foundational Web Workflows (Hugeicons)
  url: "hugeicons:link-01",
  text: "hugeicons:text",
  wifi: "hugeicons:wifi-01",
  vcard: "hugeicons:contact-01",
  email: "hugeicons:mail-01",
  phone: "hugeicons:call",
  sms: "hugeicons:message-01",
  location: "hugeicons:location-01",
  calendar: "hugeicons:calendar-03",
  app: "hugeicons:smart-phone-01",
  file: "hugeicons:file-02",
  pdf: "hugeicons:pdf-02",
  multi_link: "hugeicons:link-square-02",
  link_in_bio: "hugeicons:user-circle-02",
  business_card: "hugeicons:identification",
  restaurant_menu: "hugeicons:restaurant-01",
  product_catalog: "hugeicons:shopping-bag-01",
  form: "hugeicons:task-01",
  document: "hugeicons:document-attachment",

  // Social & Media Services (Simple Icons via Iconify)
  instagram: "simple-icons:instagram",
  facebook: "simple-icons:facebook",
  youtube: "simple-icons:youtube",
  linkedin: "simple-icons:linkedin",
  tiktok: "simple-icons:tiktok",
  twitter: "simple-icons:x",
  x: "simple-icons:x",
  whatsapp: "simple-icons:whatsapp",
  telegram: "simple-icons:telegram",
  discord: "simple-icons:discord",
  snapchat: "simple-icons:snapchat",
  twitch: "simple-icons:twitch",
  pinterest: "simple-icons:pinterest",
  reddit: "simple-icons:reddit",
  threads: "simple-icons:threads",
  signal: "simple-icons:signal",
  wechat: "simple-icons:wechat",
  messenger: "simple-icons:messenger",
  vimeo: "simple-icons:vimeo",
  soundcloud: "simple-icons:soundcloud",
  spotify: "simple-icons:spotify",

  // Business & Services (Simple Icons via Iconify)
  google_business: "simple-icons:google",
  google_maps: "simple-icons:googlemaps",
  tripadvisor: "simple-icons:tripadvisor",
  booking: "simple-icons:bookingdotcom",
  airbnb: "simple-icons:airbnb",
  yelp: "simple-icons:yelp",
  eventbrite: "simple-icons:eventbrite",
  calendly: "simple-icons:calendly",
  zoom: "simple-icons:zoom",

  // Productivity (Simple Icons via Iconify)
  google_drive: "simple-icons:googledrive",
  google_docs: "simple-icons:googledocs",
  google_sheets: "simple-icons:googlesheets",
  google_forms: "simple-icons:googleforms",
  slack: "simple-icons:slack",

  // AI & Technology (Simple Icons via Iconify)
  openai: "simple-icons:openai",
  chatgpt: "simple-icons:openai",

  // Modern Web & Developer Services (Simple Icons via Iconify)
  vercel: "simple-icons:vercel",
  github: "simple-icons:github",
  figma: "simple-icons:figma",
  stripe: "simple-icons:stripe",
  apple: "simple-icons:apple",
  notion: "simple-icons:notion",
  shopify: "simple-icons:shopify",
  dribbble: "simple-icons:dribbble",
  medium: "simple-icons:medium",
  canva: "simple-icons:canva",

  // Commerce (Simple Icons via Iconify)
  amazon: "simple-icons:amazon",
  etsy: "simple-icons:etsy",

  // Payments (Standard payment payloads)
  upi: "hugeicons:credit-card",
  paypal: "simple-icons:paypal",
  venmo: "simple-icons:venmo",
  cashapp: "simple-icons:cashapp",
  pix: "simple-icons:pix",
} as const;

export type QrTypeKey = keyof typeof QR_TYPE_ICONS;

// Official brand colors applied strictly in tone="brand" mode
export const QR_TYPE_BRAND_COLORS: Partial<Record<QrTypeKey, string>> = {
  openai: "#10A37F",
  chatgpt: "#10A37F",
  vercel: "#000000",
  github: "#24292e",
  figma: "#F24E1E",
  stripe: "#635BFF",
  apple: "#000000",
  notion: "#000000",
  shopify: "#7AB55C",
  dribbble: "#EA4C89",
  canva: "#00C4CC",
  instagram: "#E4405F",
  youtube: "#FF0000",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  whatsapp: "#25D366",
  telegram: "#26A5E4",
  discord: "#5865F2",
  spotify: "#1DB954",
  twitch: "#9146FF",
  pinterest: "#BD081C",
  reddit: "#FF4500",
  slack: "#4A154B",
  paypal: "#003087",
  venmo: "#008CFF",
  cashapp: "#00D632",
  airbnb: "#FF5A5F",
  tripadvisor: "#34E0A1",
  soundcloud: "#FF5500",
  vimeo: "#1AB7EA",
};

export const QR_ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export interface QrTypeIconProps {
  type: string;
  size?: keyof typeof QR_ICON_SIZES | number;
  tone?: "default" | "brand" | "muted";
  className?: string;
  ariaLabel?: string;
  decorative?: boolean;
  faviconUrl?: string;
  domain?: string;
}

export function QrTypeIcon({
  type,
  size = "md",
  tone = "default",
  className = "",
  ariaLabel,
  decorative = true,
  faviconUrl,
  domain,
}: QrTypeIconProps) {
  const [imgError, setImgError] = React.useState(false);

  // Normalize type identifier (e.g. 'instagram' or 'wifi')
  const normalizedKey = type.toLowerCase().replace(/[-]/g, "_") as QrTypeKey;
  const iconId = QR_TYPE_ICONS[normalizedKey] || (type.includes(":") ? type : "hugeicons:link-01");

  const pixelSize = typeof size === "number" ? size : QR_ICON_SIZES[size] || 18;

  const isMonochromeBrand = ["vercel", "github", "apple", "notion", "x", "twitter"].includes(normalizedKey);

  const brandColor = tone === "brand" && !isMonochromeBrand ? QR_TYPE_BRAND_COLORS[normalizedKey] : undefined;

  const toneClass =
    tone === "muted"
      ? "text-muted-foreground"
      : isMonochromeBrand
      ? "text-foreground"
      : tone === "brand" && !brandColor
      ? "text-primary"
      : "";

  // 1. If faviconUrl or domain is provided and we don't have a curated vector icon for it, show the real website favicon
  const effectiveFavicon = faviconUrl || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : undefined);
  const hasSpecificCuratedIcon = normalizedKey in QR_TYPE_ICONS && normalizedKey !== "url";

  if (effectiveFavicon && !hasSpecificCuratedIcon && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveFavicon}
        alt={ariaLabel || domain || "Website icon"}
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 inline-block rounded-xs object-contain ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  // 2. Direct offline vector data (Guarantees zero network fetch, immediate rendering)
  const iconData = OFFLINE_ICON_DATA[iconId] || OFFLINE_ICON_DATA["hugeicons:link-01"];

  if (iconData) {
    return (
      <svg
        viewBox={`0 0 ${iconData.width} ${iconData.height}`}
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 inline-block transition-colors ${toneClass} ${className}`}
        style={brandColor ? { color: brandColor } : undefined}
        dangerouslySetInnerHTML={{ __html: iconData.body }}
        aria-hidden={decorative ? "true" : undefined}
        role={decorative ? undefined : "img"}
        aria-label={ariaLabel || (!decorative ? type : undefined)}
      />
    );
  }

  // 3. Fallback to standard Iconify Icon component
  return (
    <Icon
      icon={iconId}
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 inline-block transition-colors ${toneClass} ${className}`}
      style={brandColor ? { color: brandColor } : undefined}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      aria-label={ariaLabel || (!decorative ? type : undefined)}
    />
  );
}

export interface CleanedDomainInfo {
  cleanDomain: string;
  brandKey: string;
  displayName: string;
  faviconUrl: string;
  hasCuratedIcon: boolean;
}

/**
 * Parses any pasted URL format, strips protocols/subdomains/tracking query parameters,
 * extracts the clean domain name, and maps to the appropriate icon and brand metadata.
 */
export function cleanDomainFromUrl(rawUrl: string): CleanedDomainInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { cleanDomain: "", brandKey: "url", displayName: "Website", faviconUrl: "", hasCuratedIcon: false };
  }

  let url = rawUrl.trim();
  let hostname = "";

  try {
    const parsed = new URL(url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`);
    hostname = parsed.hostname.toLowerCase();
  } catch {
    hostname = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split(/[\/\?\#]/)[0].toLowerCase();
  }

  hostname = hostname.replace(/^www\./, "");
  if (!hostname) {
    return { cleanDomain: "", brandKey: "url", displayName: "Website", faviconUrl: "", hasCuratedIcon: false };
  }

  // Curated domain-to-brand dictionary
  const DOMAIN_MAP: Record<string, { brandKey: string; displayName: string }> = {
    "chatgpt.com": { brandKey: "chatgpt", displayName: "ChatGPT" },
    "openai.com": { brandKey: "openai", displayName: "OpenAI" },
    "vercel.app": { brandKey: "vercel", displayName: "Vercel" },
    "vercel.com": { brandKey: "vercel", displayName: "Vercel" },
    "github.com": { brandKey: "github", displayName: "GitHub" },
    "github.io": { brandKey: "github", displayName: "GitHub" },
    "figma.com": { brandKey: "figma", displayName: "Figma" },
    "stripe.com": { brandKey: "stripe", displayName: "Stripe" },
    "notion.so": { brandKey: "notion", displayName: "Notion" },
    "notion.site": { brandKey: "notion", displayName: "Notion" },
    "apple.com": { brandKey: "apple", displayName: "Apple" },
    "shopify.com": { brandKey: "shopify", displayName: "Shopify" },
    "myshopify.com": { brandKey: "shopify", displayName: "Shopify" },
    "google.com": { brandKey: "google", displayName: "Google" },
    "youtube.com": { brandKey: "youtube", displayName: "YouTube" },
    "youtu.be": { brandKey: "youtube", displayName: "YouTube" },
    "instagram.com": { brandKey: "instagram", displayName: "Instagram" },
    "twitter.com": { brandKey: "x", displayName: "X (Twitter)" },
    "x.com": { brandKey: "x", displayName: "X" },
    "t.co": { brandKey: "x", displayName: "X" },
    "linkedin.com": { brandKey: "linkedin", displayName: "LinkedIn" },
    "lnkd.in": { brandKey: "linkedin", displayName: "LinkedIn" },
    "facebook.com": { brandKey: "facebook", displayName: "Facebook" },
    "fb.com": { brandKey: "facebook", displayName: "Facebook" },
    "fb.me": { brandKey: "facebook", displayName: "Facebook" },
    "whatsapp.com": { brandKey: "whatsapp", displayName: "WhatsApp" },
    "wa.me": { brandKey: "whatsapp", displayName: "WhatsApp" },
    "telegram.org": { brandKey: "telegram", displayName: "Telegram" },
    "t.me": { brandKey: "telegram", displayName: "Telegram" },
    "tiktok.com": { brandKey: "tiktok", displayName: "TikTok" },
    "discord.com": { brandKey: "discord", displayName: "Discord" },
    "discord.gg": { brandKey: "discord", displayName: "Discord" },
    "spotify.com": { brandKey: "spotify", displayName: "Spotify" },
    "spoti.fi": { brandKey: "spotify", displayName: "Spotify" },
    "twitch.tv": { brandKey: "twitch", displayName: "Twitch" },
    "pinterest.com": { brandKey: "pinterest", displayName: "Pinterest" },
    "reddit.com": { brandKey: "reddit", displayName: "Reddit" },
    "slack.com": { brandKey: "slack", displayName: "Slack" },
    "amazon.com": { brandKey: "amazon", displayName: "Amazon" },
    "amzn.to": { brandKey: "amazon", displayName: "Amazon" },
    "dribbble.com": { brandKey: "dribbble", displayName: "Dribbble" },
    "medium.com": { brandKey: "medium", displayName: "Medium" },
    "canva.com": { brandKey: "canva", displayName: "Canva" },
    "paypal.com": { brandKey: "paypal", displayName: "PayPal" },
    "paypal.me": { brandKey: "paypal", displayName: "PayPal" },
    "calendly.com": { brandKey: "calendly", displayName: "Calendly" },
    "zoom.us": { brandKey: "zoom", displayName: "Zoom" },
    "airbnb.com": { brandKey: "airbnb", displayName: "Airbnb" },
    "tripadvisor.com": { brandKey: "tripadvisor", displayName: "TripAdvisor" },
    "booking.com": { brandKey: "booking", displayName: "Booking.com" },
    "soundcloud.com": { brandKey: "soundcloud", displayName: "SoundCloud" },
    "vimeo.com": { brandKey: "vimeo", displayName: "Vimeo" },
  };

  const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

  // 1. Direct match
  if (DOMAIN_MAP[hostname]) {
    return {
      cleanDomain: hostname,
      brandKey: DOMAIN_MAP[hostname].brandKey,
      displayName: DOMAIN_MAP[hostname].displayName,
      faviconUrl: favicon,
      hasCuratedIcon: true,
    };
  }

  // 2. Subdomain check (e.g. nxtqr.vercel.app -> vercel)
  for (const [keyDomain, val] of Object.entries(DOMAIN_MAP)) {
    if (hostname.endsWith(`.${keyDomain}`)) {
      return {
        cleanDomain: hostname,
        brandKey: val.brandKey,
        displayName: val.displayName,
        faviconUrl: favicon,
        hasCuratedIcon: true,
      };
    }
  }

  // 3. Google specialized subdomains
  if (hostname === "docs.google.com") return { cleanDomain: hostname, brandKey: "google_docs", displayName: "Google Docs", faviconUrl: favicon, hasCuratedIcon: true };
  if (hostname === "drive.google.com") return { cleanDomain: hostname, brandKey: "google_drive", displayName: "Google Drive", faviconUrl: favicon, hasCuratedIcon: true };
  if (hostname === "sheets.google.com") return { cleanDomain: hostname, brandKey: "google_sheets", displayName: "Google Sheets", faviconUrl: favicon, hasCuratedIcon: true };
  if (hostname === "forms.google.com") return { cleanDomain: hostname, brandKey: "google_forms", displayName: "Google Forms", faviconUrl: favicon, hasCuratedIcon: true };
  if (hostname.includes("google.com/maps") || hostname === "maps.google.com") return { cleanDomain: hostname, brandKey: "google_maps", displayName: "Google Maps", faviconUrl: favicon, hasCuratedIcon: true };

  // 4. Clean domain name fallback
  const parts = hostname.split(".");
  const namePart = parts.length > 2 ? parts[parts.length - 2] : parts[0];
  const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  return {
    cleanDomain: hostname,
    brandKey: "url",
    displayName: capitalized || hostname,
    faviconUrl: favicon,
    hasCuratedIcon: false,
  };
}

/**
 * Intelligently resolve the most accurate QR type / brand key from QR metadata
 */
export function resolveQrTypeFromMetadata(qr: {
  qrType?: string;
  type?: string;
  destination?: string;
  destinationUrl?: string;
  name?: string;
}): string {
  // 1. Check clean domain from destination URL
  const dest = qr.destination || qr.destinationUrl || "";
  if (dest) {
    const info = cleanDomainFromUrl(dest);
    if (info.hasCuratedIcon && info.brandKey !== "url") {
      return info.brandKey;
    }
  }

  // 2. Check explicit non-generic type (e.g. wifi, vcard, pdf)
  const explicitType = (qr.qrType || qr.type || "").toLowerCase().replace(/[-]/g, "_");
  if (explicitType && !["url", "website", "link", "dynamic", "static"].includes(explicitType)) {
    return explicitType;
  }

  // 3. Check name clues (e.g. "chatgpt" or "github")
  const nameLower = (qr.name || "").toLowerCase();
  if (nameLower.includes("chatgpt") || nameLower.includes("openai")) return "chatgpt";
  if (nameLower.includes("vercel")) return "vercel";
  if (nameLower.includes("github")) return "github";
  if (nameLower.includes("figma")) return "figma";
  if (nameLower.includes("youtube")) return "youtube";
  if (nameLower.includes("instagram")) return "instagram";
  if (nameLower.includes("spotify")) return "spotify";

  return explicitType || "url";
}

