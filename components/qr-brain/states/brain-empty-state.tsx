"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface BrainEmptyStateProps {
  defaultDestinationUrl: string;
  onCreateRule: () => void;
  onSimulateDefault: () => void;
}

export function BrainEmptyState({
  defaultDestinationUrl,
  onCreateRule,
  onSimulateDefault,
}: BrainEmptyStateProps) {
  return (
    <div className="w-full max-w-lg mx-auto py-16 px-6 text-center space-y-6 font-mono select-none">
      {/* NXTQR Routing Monogram 'R' formed from QR modules */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        {/* Decorative ambient glow */}
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl animate-pulse" />

        {/* Modular SVG Monogram */}
        <div className="relative w-20 h-20 rounded-2xl border border-border/80 bg-card dark:bg-[#161616] p-3 shadow-xl flex items-center justify-center">
          <svg
            viewBox="0 0 48 48"
            className="w-12 h-12 text-primary"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top-left corner finder block */}
            <rect x="4" y="4" width="12" height="12" rx="2" className="text-primary fill-current" />
            <rect x="7" y="7" width="6" height="6" className="fill-card dark:fill-[#161616]" />
            <rect x="9" y="9" width="2" height="2" className="text-primary fill-current" />

            {/* Top-right corner finder block */}
            <rect x="32" y="4" width="12" height="12" rx="2" className="text-primary fill-current" />
            <rect x="35" y="7" width="6" height="6" className="fill-card dark:fill-[#161616]" />
            <rect x="37" y="9" width="2" height="2" className="text-primary fill-current" />

            {/* Bottom-left corner finder block */}
            <rect x="4" y="32" width="12" height="12" rx="2" className="text-primary fill-current" />
            <rect x="7" y="35" width="6" height="6" className="fill-card dark:fill-[#161616]" />
            <rect x="9" y="37" width="2" height="2" className="text-primary fill-current" />

            {/* Central routing spine modules forming 'R' */}
            <rect x="20" y="8" width="4" height="32" rx="1" className="text-primary fill-current opacity-90" />
            <rect x="24" y="8" width="10" height="4" rx="1" className="text-primary fill-current" />
            <rect x="30" y="12" width="4" height="8" rx="1" className="text-primary fill-current" />
            <rect x="24" y="20" width="10" height="4" rx="1" className="text-primary fill-current" />
            <rect x="26" y="24" width="4" height="6" rx="1" className="text-primary fill-current" />
            <rect x="30" y="30" width="5" height="10" rx="1" className="text-primary fill-current" />
          </svg>
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold font-serif text-foreground">
          No routing rules yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          This QR currently resolves through its default destination.
          Add a rule when you want scans to branch by device, geography, time, or campaigns.
        </p>
        {defaultDestinationUrl && (
          <div className="text-[11px] text-muted-foreground/70 font-mono pt-1">
            Default destination:{" "}
            <span className="text-foreground underline decoration-border">{defaultDestinationUrl}</span>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={onCreateRule}
          className="h-8 px-4 text-xs font-mono gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold cursor-pointer"
        >
          <NxtqrIcon icon="solar:add-circle-bold" size={14} />
          <span>Create First Rule</span>
        </Button>

        <Button
          variant="outline"
          onClick={onSimulateDefault}
          className="h-8 px-4 text-xs font-mono gap-1.5 border-border hover:bg-muted dark:hover:bg-white/5 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <NxtqrIcon icon="solar:play-bold" size={13} className="text-primary" />
          <span>Simulate Default Route</span>
        </Button>
      </div>
    </div>
  );
}
