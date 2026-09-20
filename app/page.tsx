import * as React from "react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingHero } from "@/components/marketing/hero";
import { PositioningStrip } from "@/components/marketing/positioning-strip";
import { DynamicQrSection } from "@/components/marketing/dynamic-qr-section";
import { StudioPreview } from "@/components/marketing/studio-preview";
import { RoutesPreview } from "@/components/marketing/routes-preview";
import { AnalyticsPreview } from "@/components/marketing/analytics-preview";
import { GuardianPreview } from "@/components/marketing/guardian-preview";
import { TeamsPreview } from "@/components/marketing/teams-preview";
import { DeveloperPreview } from "@/components/marketing/developer-preview";
import { InfrastructureSection } from "@/components/marketing/infrastructure-section";
import { SecuritySection } from "@/components/marketing/security-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingFooter } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Fixed Elevated Header */}
      <MarketingHeader />

      {/* Main Marketing Information Flow */}
      <main className="flex-1">
        {/* 01 Hero Section with Interactive Routing Simulation */}
        <MarketingHero />

        {/* 02 Positioning Strip */}
        <PositioningStrip />

        {/* 03 Dynamic QR Infrastructure */}
        <DynamicQrSection />

        {/* 04 NXTQR Studio Section */}
        <StudioPreview />

        {/* 05 NXTQR Routes Section */}
        <RoutesPreview />

        {/* 06 NXTQR Analytics Section */}
        <AnalyticsPreview />

        {/* 07 NXTQR Guardian Section */}
        <GuardianPreview />

        {/* 08 Teams & Governance */}
        <TeamsPreview />

        {/* 09 Developer Platform */}
        <DeveloperPreview />

        {/* 10 3-Plane Infrastructure Topology */}
        <InfrastructureSection />

        {/* 11 Truthful Security & Data Minimization */}
        <SecuritySection />

        {/* 12 Pricing Tiers Preview */}
        <PricingSection />

        {/* 13 High-Impact Closing CTA */}
        <FinalCta />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
