import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const routes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/features", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/solutions", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/developers", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/docs", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/security", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/status", changeFrequency: "hourly" as const, priority: 0.7 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/cookies", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
