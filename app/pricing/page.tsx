import * as React from "react";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingFooter } from "@/components/marketing/footer";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent infrastructure pricing for creators, growing teams, and global enterprise operations.",
};

export default function PricingPage() {
  const comparisonRows = [
    { feature: "Active Dynamic QR Codes", free: "10", pro: "100", business: "500", enterprise: "Unlimited" },
    { feature: "Scan Telemetry Retention", free: "7 Days", pro: "365 Days", business: "365 Days", enterprise: "Configurable (Unlimited)" },
    { feature: "Export Formats", free: "PNG", pro: "SVG, PDF, PNG", business: "SVG, PDF, PNG, CMYK", businessCustom: true, enterprise: "All Formats" },
    { feature: "Intelligent QR Routing", free: "Disabled", pro: "Basic (Device, Time)", business: "Advanced Visual Rules", enterprise: "Full Rule Engine" },
    { feature: "Link Guardian Health Monitoring", free: "Manual", pro: "HTTP/TLS Checks & Alerts", business: "Automated Backup Failover", enterprise: "Custom Probe Intervals" },
    { feature: "Team Collaboration & Seats", free: "1 Seat", pro: "3 Seats", business: "10 Seats", enterprise: "Custom Seats" },
    { feature: "Developer API & Webhooks", free: "Disabled", pro: "10,000 req/mo", business: "100,000 req/mo", enterprise: "Custom Quotas" },
    { feature: "Custom Short Domains", free: "Disabled", pro: "Disabled", business: "1 Custom Domain", enterprise: "Multiple Custom Domains" },
    { feature: "White Labeling", free: "Disabled", pro: "Disabled", business: "Standard", enterprise: "Complete White Label" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <span>PRICING & ENTITLEMENTS</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
              Predictable, entitlement-driven pricing.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Every plan is backed by our centralized entitlement engine. No surprise bill spikes, no hidden paywalls on core scan reliability.
            </p>
          </div>

          {/* Pricing Cards */}
          <PricingSection />

          {/* Comparison Matrix Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm space-y-4 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Detailed Feature Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-border bg-muted/40 font-semibold text-foreground">
                  <tr>
                    <th className="py-3 px-4">Feature / Capability</th>
                    <th className="py-3 px-4">Free</th>
                    <th className="py-3 px-4 text-primary">Pro</th>
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{row.feature}</td>
                      <td className="py-3 px-4 text-muted-foreground">{row.free}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{row.pro}</td>
                      <td className="py-3 px-4 text-foreground">{row.business}</td>
                      <td className="py-3 px-4 text-foreground">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
