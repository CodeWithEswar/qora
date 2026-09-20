import * as React from "react";
import { cn } from "@/lib/utils";

interface QrFinderPatternProps {
  variant?: "base" | "highlight";
  className?: string;
}

/**
 * QR Finder Pattern Corner Motifs
 *
 * Implements the iconic 7x7 concentric square grammar of QR finders:
 * - Outer boundary: 56px with 4px border
 * - Quiet spacing: 8px transparent channel
 * - Inner core: 24px solid square
 *
 * Positioned in peripheral quadrants (top-left, top-right, bottom-left, bottom-right).
 * Never overlaps the central auth card or Google button.
 */
export function QrFinderPattern({
  variant = "base",
  className,
}: QrFinderPatternProps) {
  const isHighlight = variant === "highlight";

  const finderColor = isHighlight
    ? {
        border: "rgba(250, 82, 15, 0.30)",
        core: "rgba(250, 82, 15, 0.24)",
        glow: "rgba(250, 82, 15, 0.15)",
      }
    : {
        border: "rgba(255, 255, 255, 0.045)",
        core: "rgba(255, 255, 255, 0.038)",
        glow: "transparent",
      };

  const corners = [
    { pos: "top-8 left-8 sm:top-12 sm:left-12" },
    { pos: "top-8 right-8 sm:top-12 sm:right-12" },
    { pos: "bottom-12 left-8 sm:bottom-16 sm:left-12" },
    { pos: "bottom-12 right-8 sm:bottom-16 sm:right-12" },
  ];

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none select-none overflow-hidden",
        isHighlight ? "z-20" : "z-10",
        className
      )}
      aria-hidden="true"
    >
      {corners.map((corner, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute hidden sm:flex items-center justify-center w-14 h-14 rounded-lg",
            corner.pos
          )}
          style={{
            border: `3px solid ${finderColor.border}`,
            boxShadow: isHighlight ? `0 0 12px ${finderColor.glow}` : "none",
          }}
        >
          {/* Inner solid finder core */}
          <div
            className="w-6 h-6 rounded-xs"
            style={{
              backgroundColor: finderColor.core,
            }}
          />
        </div>
      ))}
    </div>
  );
}
