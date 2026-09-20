import * as React from "react";
import { cn } from "@/lib/utils";

interface FinderFieldProps {
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
 * Never overlaps the central auth or system card.
 */
export function FinderField({
  variant = "base",
  className,
}: FinderFieldProps) {
  const isHighlight = variant === "highlight";

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
            "absolute hidden sm:flex items-center justify-center w-14 h-14 rounded-lg transition-all duration-300",
            corner.pos,
            isHighlight
              ? "border-[3px] border-[#FA520F]/30 shadow-[0_0_12px_rgba(250,82,15,0.15)]"
              : "border-[3px] border-black/[0.07] dark:border-white/[0.045]"
          )}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-xs transition-colors duration-300",
              isHighlight
                ? "bg-[#FA520F]/25"
                : "bg-black/[0.05] dark:bg-white/[0.038]"
            )}
          />
        </div>
      ))}
    </div>
  );
}
