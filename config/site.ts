/**
 * NXTQR — Site & Public Navigation Configuration
 */

import { BRAND } from "./brand";

const rawSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_SITE_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`
    : "https://nxtqr.vercel.app")
)
  .replace(/nextqr/gi, "nxtqr")
  .replace(/nxtqr\.link/gi, "nxtqr.vercel.app");

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

export {
  RESOLVER_CONFIG,
  buildQrResolverUrl,
  buildShortResolverUrl,
  type BuildQrResolverUrlOptions,
} from "@nxtqr/config";
