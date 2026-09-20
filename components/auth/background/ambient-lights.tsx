import * as React from "react";
import { cn } from "@/lib/utils";

interface AmbientLightsProps {
  className?: string;
}

/**
 * Dual Ambient Moving Lights
 *
 * Light A: Warm NXTQR Orange (#FA520F -> #FF8105) with 24s ease-in-out cycle.
 * Light B: Warm Amber/Gold (#FFB83E -> #FFD06A) with 31s ease-in-out cycle.
 *
 * Both move continuously and independently across asymmetrical trajectories,
 * giving organic life to the background even when the mouse is stationary.
 */
export function AmbientLights({ className }: AmbientLightsProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none z-10",
        className
      )}
      aria-hidden="true"
    >
      {/* Light A: Warm NXTQR Orange Elliptical Field */}
      <div
        className="absolute top-1/4 left-1/4 w-[55vw] h-[55vw] min-w-[480px] min-h-[480px] max-w-[850px] max-h-[850px] rounded-full blur-[110px] sm:blur-[140px] opacity-[0.10] dark:opacity-[0.12] animate-nxtqr-ambient-a will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse at 40% 40%, #FA520F 0%, #FF8105 45%, transparent 72%)",
        }}
      />

      {/* Light B: Warm Amber/Gold Asymmetrical Field */}
      <div
        className="absolute bottom-1/4 right-1/4 w-[48vw] h-[48vw] min-w-[420px] min-h-[420px] max-w-[750px] max-h-[750px] rounded-full blur-[100px] sm:blur-[130px] opacity-[0.08] dark:opacity-[0.09] animate-nxtqr-ambient-b will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 60% 55%, #FFB83E 0%, #FFD06A 40%, transparent 70%)",
        }}
      />
    </div>
  );
}
