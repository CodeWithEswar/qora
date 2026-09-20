import * as React from "react";
import { cn } from "@/lib/utils";

interface QrGridProps {
  variant?: "base" | "highlight";
  className?: string;
}

/**
 * Precision QR Grid
 *
 * Simulates the precision grid used in QR matrix construction.
 * Renders 1px lines using CSS gradients to avoid DOM node overhead.
 *
 * Base variant: whisper-quiet lines (~0.035 opacity).
 * Highlight variant: warm orange/amber lines revealed under the pointer mask.
 */
export function QrGrid({ variant = "base", className }: QrGridProps) {
  const isHighlight = variant === "highlight";

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none select-none",
        isHighlight ? "z-20" : "z-0",
        className
      )}
      aria-hidden="true"
    >
      {/* Precision Grid Layer */}
      <div
        className={cn(
          "w-full h-full",
          isHighlight
            ? "opacity-90"
            : "opacity-60 dark:opacity-75"
        )}
        style={{
          backgroundImage: isHighlight
            ? `linear-gradient(to right, rgba(250, 82, 15, 0.18) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(250, 82, 15, 0.18) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(255, 255, 255, 0.032) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(255, 255, 255, 0.032) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Sparse Precision Coordinate Intersection Points */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-dots-${variant}`}
            width="180"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            {/* Primary intersection dots */}
            <circle
              cx="0"
              cy="0"
              r={isHighlight ? "2.5" : "1.5"}
              fill={
                isHighlight
                  ? "#FA520F"
                  : "rgba(255, 255, 255, 0.12)"
              }
            />
            <circle
              cx="120"
              cy="60"
              r={isHighlight ? "2" : "1"}
              fill={
                isHighlight
                  ? "#FFB83E"
                  : "rgba(255, 255, 255, 0.08)"
              }
            />
            <circle
              cx="60"
              cy="120"
              r={isHighlight ? "2" : "1"}
              fill={
                isHighlight
                  ? "#FA520F"
                  : "rgba(255, 255, 255, 0.08)"
              }
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-dots-${variant})`}
          opacity={isHighlight ? 0.9 : 0.6}
        />
      </svg>
    </div>
  );
}
