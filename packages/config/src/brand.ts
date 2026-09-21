/**
 * NXTQR — Canonical Brand Configuration
 * Central source of truth for brand descriptors, typography, product names, and core positioning.
 */

export const BRAND = {
  name: "NXTQR",
  descriptor: "Smart QR Infrastructure",
  tagline: "Intelligence behind every scan.",
  corePositioning: "Create once. Change anytime. Route intelligently. Measure everything.",
  description: "Production-grade, multi-tenant QR intelligence platform. Create dynamic QR codes, route scans intelligently by device, country, or time, and monitor destination health in real time.",
  
  domain: (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_DOMAIN ? process.env.NEXT_PUBLIC_SITE_DOMAIN : "nxtqr.vercel.app")
    .replace(/nextqr/gi, "nxtqr")
    .replace(/nxtqr\.link/gi, "nxtqr.vercel.app"),
  shortDomain: (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SHORT_DOMAIN ? process.env.NEXT_PUBLIC_SHORT_DOMAIN : (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_DOMAIN ? process.env.NEXT_PUBLIC_SITE_DOMAIN : "nxtqr.vercel.app"))
    .replace(/nextqr/gi, "nxtqr")
    .replace(/nxtqr\.link/gi, "nxtqr.vercel.app"),
  docsUrl: "/docs",
  helpUrl: "/docs",
  
  // Product Suite
  products: {
    studio: {
      id: "studio",
      name: "NXTQR Studio",
      subtitle: "Main QR creation and design environment",
      eyebrow: "QR ASSET STUDIO",
      headline: "Design for the scan.",
      description: "Precision visual editor with custom eyes, pixel patterns, high-contrast palette analysis, and SVG/PDF print sizing.",
    },
    routes: {
      id: "routes",
      name: "NXTQR Routes",
      subtitle: "Route every scan to the right destination",
      eyebrow: "QR BRAIN",
      headline: "One QR. Different destinations.",
      description: "Visual rule engine routing scans by device, operating system, country, language, and local scanner time window.",
    },
    analytics: {
      id: "analytics",
      name: "NXTQR Analytics",
      subtitle: "Understand what happens after every scan",
      eyebrow: "INTELLIGENCE ENGINE",
      headline: "Understand what happens after the scan.",
      description: "Privacy-safe telemetry with hourly heatmaps, estimated unique scans, device breakdowns, and conversion event tracking.",
    },
    guardian: {
      id: "guardian",
      name: "NXTQR Guardian",
      subtitle: "Keep every QR destination healthy",
      eyebrow: "LINK GUARDIAN",
      headline: "Know before a broken link costs you scans.",
      description: "Continuous HTTP/TLS monitoring, latency threshold tracking, incident alerts, and automated backup fallback routing.",
    },
    teams: {
      id: "teams",
      name: "NXTQR Teams",
      eyebrow: "GOVERNANCE & RBAC",
      headline: "Built for one person. Ready for an organization.",
      description: "Multi-tenant workspaces, granular role-based permissions, brand asset kits, review comments, and approval workflows.",
    },
    developers: {
      id: "developers",
      name: "NXTQR Developers",
      eyebrow: "DEVELOPER PLATFORM",
      headline: "QR infrastructure that fits your stack.",
      description: "REST API, scoped API tokens, signed webhooks with exponential backoff, and sub-10ms edge redirect workers.",
    },
  },

  // Color Palette Constants
  colors: {
    primary: "#FA520F",
    deepOrange: "#CC3A05",
    orange: "#FF8105",
    amber: "#FFA110",
    amberLight: "#FFB83E",
    yellow: "#FFD06A",
    brightYellow: "#FFD900",
    cream: "#FFF8E0",
    creamSurface: "#FFFAEB",
    dark: "#111111",
    darkSurface: "#151515",
    darkCard: "#191919",
    darkBorder: "rgba(255, 255, 255, 0.08)",
  },

  copyright: `© ${new Date().getFullYear()} NXTQR. All rights reserved.`,
} as const;
