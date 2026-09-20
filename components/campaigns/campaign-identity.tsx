"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getCampaignFallbackMark } from "@/lib/domains/campaigns";

export interface CampaignIdentityProps {
  name: string;
  emoji?: string | null;
  size?: "sm" | "md" | "lg" | "responsive";
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    container: "w-8 h-8 rounded-lg text-base",
    monogram: "text-xs font-semibold tracking-wider",
  },
  md: {
    container: "w-12 h-12 rounded-xl text-2xl",
    monogram: "text-sm font-bold tracking-wider",
  },
  lg: {
    container: "w-16 h-16 rounded-2xl text-3xl",
    monogram: "text-lg font-extrabold tracking-wider",
  },
  responsive: {
    container: "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl text-2xl sm:text-3xl",
    monogram: "text-sm sm:text-lg font-bold sm:font-extrabold tracking-wider",
  },
};

/**
 * CampaignIdentity — Signature visual anchor for NXTQR campaigns.
 * Uses native platform emoji when chosen, or a deterministic NXTQR letter monogram fallback mark.
 */
export function CampaignIdentity({
  name,
  emoji,
  size = "md",
  className,
}: CampaignIdentityProps) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md;
  const fallbackMark = getCampaignFallbackMark(name);

  if (emoji && emoji.trim()) {
    return (
      <div
        className={cn(
          "flex items-center justify-center shrink-0 select-none",
          "bg-[#FFF8E0] dark:bg-[#232323] border border-[#FFD06A]/30 dark:border-white/10 shadow-xs transition-transform duration-200",
          styles.container,
          className
        )}
        aria-hidden="true"
      >
        <span className="leading-none">{emoji.trim()}</span>
      </div>
    );
  }

  // Deterministic NXTQR monogram fallback mark
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 select-none font-mono relative overflow-hidden",
        "bg-surface-elevated text-primary border border-primary/20 dark:border-primary/30 shadow-xs",
        styles.container,
        className
      )}
      aria-label={`Campaign monogram: ${fallbackMark}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent pointer-events-none" />
      <span className={cn("relative z-10 font-bold", styles.monogram)}>
        {fallbackMark}
      </span>
      {/* Decorative subtle corner micro-module */}
      <div className="absolute top-1 right-1 w-1 h-1 rounded-[0.5px] bg-primary/40" />
    </div>
  );
}
