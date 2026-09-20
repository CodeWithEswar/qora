import * as React from "react";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Sparkles, RefreshCw, GitFork, BarChart3, ShieldCheck, Users, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore the core capabilities of the NXTQR platform: Studio, Dynamic QR, Routes, Analytics, and Link Guardian.",
};

export default function FeaturesPage() {
  const featureList = [
    {
      id: "studio",
      title: BRAND.products.studio.name,
      description: BRAND.products.studio.description,
      icon: Sparkles,
      href: "/#studio",
    },
    {
      id: "dynamic",
      title: "Dynamic QR Infrastructure",
      description: "Separate design, identity, and destination. Re-point scans anytime post-print with sub-10ms edge resolution.",
      icon: RefreshCw,
      href: "/#dynamic-qr",
    },
    {
      id: "routes",
      title: BRAND.products.routes.name,
      description: BRAND.products.routes.description,
      icon: GitFork,
      href: "/#routes",
    },
    {
      id: "analytics",
      title: BRAND.products.analytics.name,
      description: BRAND.products.analytics.description,
      icon: BarChart3,
      href: "/#analytics",
    },
    {
      id: "guardian",
      title: BRAND.products.guardian.name,
      description: BRAND.products.guardian.description,
      icon: ShieldCheck,
      href: "/#guardian",
    },
    {
      id: "teams",
      title: BRAND.products.teams.name,
      description: BRAND.products.teams.description,
      icon: Users,
      href: "/#teams",
    },
    {
      id: "developers",
      title: BRAND.products.developers.name,
      description: BRAND.products.developers.description,
      icon: Code2,
      href: "/#developers",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <span>PLATFORM CAPABILITIES</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
              Everything required for managed QR assets.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Explore the complete NXTQR intelligence suite. From vector pixel design to edge failover routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.id} className="p-7 rounded-2xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 w-fit">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{f.title}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <Link href={f.href}>
                      <span>Explore Feature</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
