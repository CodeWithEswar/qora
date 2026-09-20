import * as React from "react";
import Link from "next/link";
import { NytraMark, NytraMarkProps } from "./nytra-mark";
import { BRAND } from "@/lib/brand";

export interface NytraLogoProps {
  /** Size tier or numeric pixel size for the mark */
  size?: "sm" | "md" | "lg" | number;
  /** Optional link destination (pass null or undefined to render as div) */
  href?: string | null;
  /** Whether to show the text wordmark (useful for collapsed sidebar) */
  showText?: boolean;
  /** Whether to show the secondary product descriptor below wordmark */
  showTagline?: boolean;
  /** Color variant for mark */
  variant?: "gradient" | "solid" | "ink" | "white";
  /** Additional styling */
  className?: string;
}

/**
 * NYTRA Brand Logo Lockup
 * Combines the NytraMark continuous routing symbol with the official NYTRA wordmark.
 */
export function NytraLogo({
  size = "md",
  href,
  showText = true,
  showTagline = false,
  variant = "gradient",
  className = "",
}: NytraLogoProps) {
  // Resolve size
  let markSize = 26;
  let textClass = "text-lg tracking-[-0.035em]";
  let descriptorClass = "text-[10px] tracking-[0.06em]";
  let gapClass = "gap-2.5";

  if (typeof size === "number") {
    markSize = size;
    if (size <= 22) {
      textClass = "text-base tracking-[-0.035em]";
      descriptorClass = "text-[9px] tracking-[0.05em]";
      gapClass = "gap-2";
    } else if (size >= 32) {
      textClass = "text-2xl tracking-[-0.035em]";
      descriptorClass = "text-xs tracking-[0.06em]";
      gapClass = "gap-3";
    }
  } else if (size === "sm") {
    markSize = 20;
    textClass = "text-base tracking-[-0.035em]";
    descriptorClass = "text-[9px] tracking-[0.05em]";
    gapClass = "gap-2";
  } else if (size === "lg") {
    markSize = 36;
    textClass = "text-2xl tracking-[-0.035em]";
    descriptorClass = "text-xs tracking-[0.06em]";
    gapClass = "gap-3";
  }

  const content = (
    <div className={`inline-flex items-center ${gapClass} group select-none ${className}`}>
      {/* Precision Geometric Symbol - Fixed Position */}
      <NytraMark
        size={markSize}
        variant={variant}
        className="transition-transform duration-200 ease-out group-hover:scale-[1.03] shrink-0"
        title="NYTRA"
      />

      {/* Official Typography Wordmark (Slide/fade when toggling) */}
      {showText && (
        <div className="flex flex-col justify-center overflow-hidden transition-all duration-200 ease-out">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-sans font-bold leading-none text-foreground ${textClass}`}
              style={{ fontWeight: 650, letterSpacing: "-0.035em" }}
            >
              {BRAND.name}
            </span>
          </div>

          {showTagline && (
            <span
              className={`font-sans font-medium uppercase text-muted-foreground leading-tight mt-0.5 ${descriptorClass}`}
            >
              {BRAND.descriptor}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
