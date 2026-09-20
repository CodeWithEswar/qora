import * as React from "react";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { DeveloperPreview } from "@/components/marketing/developer-preview";
import { MarketingFooter } from "@/components/marketing/footer";
import { Terminal, Key, Webhook, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Programmatic QR creation, dynamic routing rules, webhook telemetry, and high-performance edge redirects with the NXTQR REST API.",
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <span>DEVELOPER INFRASTRUCTURE</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
              Automate QR lifecycle at scale.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Programmatic QR creation, dynamic routing rules, webhook telemetry, and sub-10ms edge redirects with our REST API.
            </p>
          </div>

          <DeveloperPreview />

          {/* Quickstart guide cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">1. Generate API Keys</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create secret keys with scoped permissions in your dashboard under Developers → API Keys.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">2. Create Dynamic QR Assets</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dispatch a single POST request to generate SVG/PNG assets and retrieve permanent redirect slugs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <Webhook className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">3. Listen to Scan Webhooks</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive real-time signed webhook payloads as scans and conversion goals trigger worldwide.
              </p>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
