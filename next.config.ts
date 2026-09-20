import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://sdk.cashfree.com https://www.gstatic.com https://*.gstatic.com https://www.google.com https://*.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob: https://www.gstatic.com https://*.gstatic.com https://www.google.com https://*.google.com",
      "connect-src 'self' https://accounts.google.com https://api.cashfree.com https://sandbox.cashfree.com https://cloudflareinsights.com https://*.supabase.co wss://*.supabase.co https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://www.gstatic.com https://*.gstatic.com https://www.google.com https://*.google.com",
      "frame-src 'self' https://accounts.google.com https://sdk.cashfree.com https://*.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "wrangler",
    "workerd",
    "@cloudflare/workerd-windows-64",
    "miniflare",
  ],
  turbopack: {
    rules: {
      "*.md": {
        type: "raw",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
