/**
 * NXTQR — Public Marketing Demos & Previews
 * Isolated illustrative demonstration data for the PUBLIC landing page ONLY.
 * NEVER import this into authenticated application dashboards or domain logic.
 */

export const MARKETING_ROUTING_PREVIEW = {
  trigger: "Scan Detected",
  slug: "nxtqr.vercel.app/s/summer",
  nodes: [
    {
      id: "rule-1",
      condition: "Device = iOS",
      destination: "App Store (iOS App)",
      latency: "4ms",
      badge: "Mobile",
    },
    {
      id: "rule-2",
      condition: "Device = Android",
      destination: "Google Play Store",
      latency: "3ms",
      badge: "Mobile",
    },
    {
      id: "rule-3",
      condition: "Country = India & Time = 09:00-18:00",
      destination: "Regional Launch Portal",
      latency: "6ms",
      badge: "Geo + Time",
    },
    {
      id: "default",
      condition: "All other traffic",
      destination: "Global Responsive Web Portal",
      latency: "2ms",
      badge: "Default",
    },
  ],
};

export const MARKETING_ANALYTICS_PREVIEW = {
  kpis: {
    totalScans: "128,450",
    uniqueScans: "94,210",
    avgRedirectLatency: "4.8ms",
    conversionRate: "7.4%",
  },
  topDevices: [
    { name: "iOS (iPhone/iPad)", share: "62%", count: 79639, color: "#FA520F" },
    { name: "Android (Samsung/Pixel)", share: "31%", count: 39819, color: "#FFA110" },
    { name: "Desktop (macOS/Windows)", share: "7%", count: 8992, color: "#B8B5AD" },
  ],
  topCountries: [
    { code: "US", name: "United States", scans: "44,200", pct: 34 },
    { code: "IN", name: "India", scans: "32,800", pct: 25 },
    { code: "GB", name: "United Kingdom", scans: "18,600", pct: 14 },
    { code: "DE", name: "Germany", scans: "12,100", pct: 9 },
    { code: "SG", name: "Singapore", scans: "8,900", pct: 7 },
  ],
};

export const MARKETING_GUARDIAN_PREVIEW = {
  monitoredUrl: "https://shop.example.com/checkout",
  status: "Healthy",
  statusCode: 200,
  latency: "112ms",
  tlsStatus: "Valid (TLS 1.3)",
  uptime30d: "99.98%",
  lastCheck: "42s ago",
  fallbackConfigured: true,
  fallbackUrl: "https://backup-shop.example.com",
};
