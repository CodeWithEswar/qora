"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { DomainConstellation } from "./domain-constellation";

interface DomainHeroProps {
  onConnectDomain: () => void;
  onOpenDocs?: () => void;
  primaryDomain?: string;
  hasActiveDomains?: boolean;
}

export function DomainHero({
  onConnectDomain,
  onOpenDocs,
  primaryDomain,
  hasActiveDomains,
}: DomainHeroProps) {
  return (
    <div className="relative rounded-2xl border border-border/80 bg-surface text-foreground p-6 sm:p-7 overflow-hidden shadow-xs">
      {/* Decorative ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FA520F]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Technical Narrative & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FA520F]/10 border border-[#FA520F]/20 text-[#FA520F] text-[11px] font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F] animate-ping" />
            EDGE-ROUTED NAMESPACE
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Own Your Destination
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
            Connect your custom domain to NXTQR&apos;s distributed edge resolver. Keep every dynamic scan aligned with your verified corporate brand identity while maintaining sub-millisecond edge redirects.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              onClick={onConnectDomain}
              className="bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium text-xs h-9 px-4 gap-1.5 shadow-sm cursor-pointer"
            >
              <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
              <span>Connect Domain</span>
            </Button>

            {onOpenDocs && (
              <Button
                variant="outline"
                onClick={onOpenDocs}
                className="border-border text-foreground hover:bg-surface/80 text-xs h-9 px-3.5 gap-1.5 cursor-pointer"
              >
                <Icon icon="solar:book-bookmark-linear" className="w-4 h-4" />
                <span>DNS Setup Guide</span>
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Signature Domain Constellation Graphic */}
        <div className="lg:col-span-6 w-full">
          <DomainConstellation
            primaryDomain={primaryDomain}
            hasActiveDomains={hasActiveDomains}
          />
        </div>
      </div>
    </div>
  );
}
