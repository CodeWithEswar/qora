"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

interface DomainConstellationProps {
  primaryDomain?: string;
  hasActiveDomains?: boolean;
}

export function DomainConstellation({
  primaryDomain,
  hasActiveDomains = false,
}: DomainConstellationProps) {
  return (
    <div className="relative w-full h-48 sm:h-52 rounded-xl bg-surface/90 border border-border/80 overflow-hidden flex items-center justify-center p-4 shadow-2xs">
      {/* Background ambient grid with QR matrix hints */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#FA520F 1px, transparent 1px), radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "20px 20px, 10px 10px",
          backgroundPosition: "0 0, 5px 5px",
        }}
      />

      {/* Subtle decorative background QR modules */}
      <div className="absolute top-2 right-2 opacity-15 flex gap-0.5 pointer-events-none">
        <div className="w-2 h-2 bg-foreground" />
        <div className="w-2 h-2 bg-foreground" />
        <div className="w-2 h-2" />
        <div className="w-2 h-2 bg-[#FA520F]" />
      </div>
      <div className="absolute bottom-2 left-2 opacity-15 flex gap-0.5 pointer-events-none">
        <div className="w-2 h-2 bg-[#FA520F]" />
        <div className="w-2 h-2" />
        <div className="w-2 h-2 bg-foreground" />
        <div className="w-2 h-2 bg-foreground" />
      </div>

      {/* Active Pipeline Flow */}
      <div className="relative z-10 w-full max-w-xl flex items-center justify-between px-2 sm:px-6">
        {/* Node 1: Brand Domain */}
        <div className="flex flex-col items-center text-center group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface border border-[#FA520F]/40 shadow-xs flex items-center justify-center text-[#FA520F] relative">
            <Icon icon="solar:global-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FA520F] ring-2 ring-surface animate-pulse" />
          </div>
          <span className="mt-2 text-[11px] font-mono font-semibold text-foreground truncate max-w-[90px] sm:max-w-[120px]">
            {primaryDomain || "example.com"}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Brand Domain
          </span>
        </div>

        {/* Connector 1: DNS verification flow */}
        <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center relative">
          <div className="w-full h-0.5 bg-border relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#FA520F] via-emerald-500 to-[#FA520F] animate-[shimmer_2s_infinite]"
              style={{ width: "40%" }}
            />
          </div>
          <span className="mt-1 text-[8px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-medium">
            DNS CNAME/TXT
          </span>
        </div>

        {/* Node 2: DNS & Edge */}
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface border border-emerald-500/40 shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
            <Icon icon="solar:shield-check-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
            {hasActiveDomains && (
              <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-surface" />
            )}
          </div>
          <span className="mt-2 text-[11px] font-semibold text-foreground">
            DNS Verified
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            TLS Ready
          </span>
        </div>

        {/* Connector 2: Edge resolution flow */}
        <div className="flex-1 mx-2 sm:mx-4 flex flex-col items-center relative">
          <div className="w-full h-0.5 bg-border relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-[#FA520F] to-emerald-500 animate-[shimmer_2.5s_infinite]"
              style={{ width: "40%" }}
            />
          </div>
          <span className="mt-1 text-[8px] font-mono uppercase text-[#FA520F] font-medium">
            Edge Cache
          </span>
        </div>

        {/* Node 3: Routing & QR Resolver */}
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface border border-[#FA520F]/40 shadow-xs flex items-center justify-center text-[#FA520F] relative">
            <Icon icon="solar:qr-code-bold" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="mt-2 text-[11px] font-semibold text-foreground">
            QR Resolver
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Slug Namespace
          </span>
        </div>
      </div>
    </div>
  );
}
