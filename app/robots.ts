import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/signup",
          "/signin",
          "/register",
          "/onboarding",
          "/api/",
          "/*/*/analytics",
          "/*/*/billing",
          "/*/*/brain",
          "/*/*/brand",
          "/*/*/campaigns",
          "/*/*/developers",
          "/*/*/guardian",
          "/*/*/members",
          "/*/*/qr",
          "/*/*/routes",
          "/*/*/settings",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
