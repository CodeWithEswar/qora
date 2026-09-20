"use client";

import * as React from "react";
import { getMonogramModules, ResolvedModule } from "./letter-masks";
import { cn } from "@/lib/utils";

export interface QrEmptyMonogramProps {
  /** The first letter of the module, e.g. "Q", "A", "C", "R", "G", "M" */
  letter?: string;
  /** Size preset: sm (52px), md (80px, default), lg (104px) */
  size?: "sm" | "md" | "lg";
  /** Optional delay offset in ms to desynchronize multiple empty cards */
  staggerBaseDelay?: number;
  /** Optional custom className */
  className?: string;
}

const SIZE_DIMENSIONS = {
  sm: { width: 52, height: 52 },
  md: { width: 80, height: 80 },
  lg: { width: 104, height: 104 },
};

export function QrEmptyMonogram({
  letter = "Q",
  size = "md",
  staggerBaseDelay = 0,
  className,
}: QrEmptyMonogramProps) {
  // Deterministic module layout computed once per letter
  const modules: ResolvedModule[] = React.useMemo(() => {
    return getMonogramModules(letter);
  }, [letter]);

  const { width, height } = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS.md;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none group/monogram",
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* Ambient background subtle radial glow behind the monogram */}
      <div
        className="absolute inset-0 rounded-2xl bg-primary/[0.03] dark:bg-primary/[0.04] blur-md pointer-events-none transition-opacity duration-300 group-hover/monogram:opacity-100"
        style={{ width, height }}
      />

      <svg
        width={width}
        height={height}
        viewBox="0 0 88 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <style>{`
            @keyframes nxtqrModuleEntry {
              0% {
                opacity: 0;
                transform: translate(var(--entry-x), var(--entry-y)) scale(0.5);
              }
              75% {
                opacity: var(--target-opacity);
                transform: translate(0, 0) scale(1.08);
              }
              100% {
                opacity: var(--target-opacity);
                transform: translate(0, 0) scale(1);
              }
            }

            @keyframes nxtqrSignalWave {
              0%, 14% {
                fill: var(--base-fill);
                filter: none;
              }
              20% {
                fill: #FA520F;
                filter: drop-shadow(0 0 2.5px rgba(250, 82, 15, 0.85));
              }
              27% {
                fill: #FF8105;
                filter: drop-shadow(0 0 2px rgba(255, 129, 5, 0.65));
              }
              34% {
                fill: #FFB83E;
                filter: none;
              }
              42%, 100% {
                fill: var(--base-fill);
                filter: none;
              }
            }

            .nxtqr-monogram-module {
              transform-box: fill-box;
              transform-origin: center;
              will-change: transform, opacity, fill;
            }

            @media (prefers-reduced-motion: reduce) {
              .nxtqr-monogram-module {
                animation: none !important;
                transform: none !important;
                opacity: var(--target-opacity) !important;
                fill: var(--base-fill) !important;
                filter: none !important;
              }
            }
          `}</style>
        </defs>

        {modules.map((m) => {
          // Color & Opacity Hierarchy based on Section 14, 15, 53
          let targetOpacity = 0.35;
          let baseFill = "currentColor";
          let classNameModule = "text-foreground";

          if (m.type === "finder") {
            targetOpacity = 0.22;
          } else if (m.type === "structural") {
            targetOpacity = 0.12;
          } else if (m.type === "letter") {
            targetOpacity = 0.38;
          } else if (m.type === "accent") {
            // Amber terminal tail on Q
            targetOpacity = 0.95;
            baseFill = "#FFB83E";
            classNameModule = "text-[#FFB83E]";
          }

          const entryDelay = staggerBaseDelay + m.order * 26;
          const signalDelay = staggerBaseDelay + 1100 + (m.signalStep ?? 0) * 130;

          const animations = [
            `nxtqrModuleEntry 320ms cubic-bezier(0.16, 1, 0.3, 1) ${entryDelay}ms both`,
          ];

          if (m.isSignal) {
            animations.push(
              `nxtqrSignalWave 4.8s cubic-bezier(0.4, 0, 0.2, 1) ${signalDelay}ms infinite`
            );
          }

          return (
            <rect
              key={m.id}
              x={m.c * 10}
              y={m.r * 10}
              width="8"
              height="8"
              rx="2"
              className={cn("nxtqr-monogram-module", classNameModule)}
              style={
                {
                  "--entry-x": `${m.entryX}px`,
                  "--entry-y": `${m.entryY}px`,
                  "--target-opacity": targetOpacity,
                  "--base-fill": baseFill,
                  fill: baseFill,
                  animation: animations.join(", "),
                } as React.CSSProperties
              }
            />
          );
        })}
      </svg>
    </div>
  );
}
