/**
 * NXTQR — Site & Public Navigation Configuration
 */

import { BRAND } from "./brand";

const rawSiteUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`
    : "https://nxtqr.vercel.app");

export const SITE = {
  name: BRAND.name,
  descriptor: BRAND.descriptor,
  title: `${BRAND.name} — ${BRAND.descriptor}`,
  description:
    "Create, manage and evolve QR experiences with NXTQR — Smart QR Infrastructure built around persistent QR identity and adaptable destinations.",
  positioning: BRAND.corePositioning,
  url: rawSiteUrl.replace(/\/$/, ""),
  ogImage: `${rawSiteUrl.replace(/\/$/, "")}/brand/og/nxtqr-og.png`,
};

export const siteConfig = {
  ...SITE,
  tagline: BRAND.tagline,

  mainNav: [
    {
      title: "Product",
      href: "/#features",
      items: [
        { title: "NXTQR Studio", href: "/#studio", description: "Design high-contrast, scan-optimized QR assets" },
        { title: "Dynamic QR", href: "/#dynamic-qr", description: "Persistent IDs with permanent edge resolution" },
        { title: "NXTQR Routes", href: "/#routes", description: "Visual conditional routing by device, country & time" },
        { title: "NXTQR Analytics", href: "/#analytics", description: "Privacy-preserving scan & conversion metrics" },
        { title: "NXTQR Guardian", href: "/#guardian", description: "Automated destination health & fallback policies" },
        { title: "NXTQR Teams", href: "/#teams", description: "Multi-tenant RBAC, brand kits & approvals" },
      ],
    },
    {
      title: "Solutions",
      href: "/solutions",
      items: [
        { title: "Marketing & Campaigns", href: "/solutions#marketing", description: "Dynamic destination re-targeting post-print" },
        { title: "Retail & Packaging", href: "/solutions#retail", description: "High-density scanability on physical goods" },
        { title: "Events & Ticketing", href: "/solutions#events", description: "Time-windowed routing & access management" },
        { title: "Enterprise Governance", href: "/solutions#enterprise", description: "Brand locking, audit logging & custom domains" },
      ],
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Developers",
      href: "/developers",
    },
    {
      title: "Resources",
      href: "/docs",
      items: [
        { title: "Documentation", href: "/docs", description: "API reference, guides, and SDKs" },
        { title: "Security & Privacy", href: "/security", description: "Architecture-level data minimization & compliance" },
        { title: "System Status", href: "/status", description: "Real-time edge network & API latency" },
        { title: "Engineering Blog", href: "/blog", description: "Deep dives on QR routing and edge computing" },
      ],
    },
  ],

  footerNav: {
    product: [
      { title: "Studio", href: "/#studio" },
      { title: "Dynamic QR", href: "/#dynamic-qr" },
      { title: "Routes", href: "/#routes" },
      { title: "Analytics", href: "/#analytics" },
      { title: "Guardian", href: "/#guardian" },
      { title: "Teams", href: "/#teams" },
    ],
    solutions: [
      { title: "Marketing", href: "/solutions#marketing" },
      { title: "Retail", href: "/solutions#retail" },
      { title: "Events", href: "/solutions#events" },
      { title: "Enterprise", href: "/solutions#enterprise" },
    ],
    developers: [
      { title: "API Reference", href: "/developers#api" },
      { title: "Webhooks", href: "/developers#webhooks" },
      { title: "Documentation", href: "/docs" },
      { title: "Edge Status", href: "/status" },
    ],
    company: [
      { title: "Security", href: "/security" },
      { title: "Blog", href: "/blog" },
      { title: "Pricing", href: "/pricing" },
      { title: "Contact", href: "/contact" },
    ],
    legal: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Cookie Policy", href: "/cookies" },
    ],
  },
};

/**
 * NXTQR Resolver Configuration
 * Governs dynamic QR short domain and resolver edge endpoints.
 * Source of truth: https://nxtqr.vercel.app with the /s/{slug} resolver contract.
 */
export const RESOLVER_CONFIG = {
  defaultHost:
    (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_RESOLVER_HOST || process.env?.RESOLVER_HOST || process.env?.NEXT_PUBLIC_SITE_DOMAIN)) ||
    "nxtqr.vercel.app",
  shortUrlBase:
    (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_SHORT_URL_BASE || process.env?.SHORT_URL_BASE || process.env?.NEXT_PUBLIC_APP_URL)) ||
    "https://nxtqr.vercel.app",
  resolverPath: "/s",
};

export interface BuildQrResolverUrlOptions {
  slug: string;
  customHost?: string;
  baseUrl?: string;
}

/**
 * Builds the canonical public resolver URL for a given QR slug and optional custom domain host or base URL.
 * Strictly respects the NXTQR resolver route contract: https://<host>/s/<slug>
 */
export function buildQrResolverUrl(
  slugOrOptions: string | BuildQrResolverUrlOptions,
  customHost?: string
): string {
  let slug: string;
  let host: string | undefined = customHost;
  let baseUrl: string | undefined;

  if (typeof slugOrOptions === "object" && slugOrOptions !== null) {
    slug = slugOrOptions.slug;
    host = slugOrOptions.customHost ?? host;
    baseUrl = slugOrOptions.baseUrl;
  } else {
    slug = slugOrOptions;
  }

  const cleanSlug = (slug || "").replace(/^\/+/, "").replace(/^s\/+/, "").trim();

  if (baseUrl) {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    return `${cleanBase}/s/${cleanSlug}`;
  }

  const rawHost = host || RESOLVER_CONFIG.defaultHost;
  const effectiveHost = rawHost.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return `https://${effectiveHost}/s/${cleanSlug}`;
}

/**
 * Backwards compatibility alias for buildQrResolverUrl.
 */
export const buildShortResolverUrl = buildQrResolverUrl;

