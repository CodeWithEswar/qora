import * as React from "react";
import { cn } from "@/lib/utils";

interface QrModuleFieldProps {
  variant?: "base" | "highlight";
  className?: string;
}

/**
 * Deterministic QR Module Field
 *
 * References real QR matrix grammar:
 * - Micro modules: 6px
 * - Standard modules: 12px
 * - Structural modules: 24px - 36px
 * - Grouped clusters (2x2, 3x1 bars, alignment motifs)
 *
 * Uses deterministic positioning to prevent hydration mismatch and visual instability.
 * Occupies the perimeter and quiet spaces, keeping the central auth card zone clear.
 */
interface ModuleDescriptor {
  x: string; // percentage from left
  y: string; // percentage from top
  w: number; // width in px
  h: number; // height in px
  warm?: boolean; // warm accent module
  borderOnly?: boolean;
}

const DETERMINISTIC_MODULES: ModuleDescriptor[] = [
  // Top-Left Zone (Perimeter & QR motifs)
  { x: "8%", y: "14%", w: 12, h: 12 },
  { x: "9.5%", y: "14%", w: 12, h: 12 },
  { x: "8%", y: "17%", w: 12, h: 12, warm: true },
  { x: "14%", y: "12%", w: 6, h: 6 },
  { x: "15%", y: "12%", w: 6, h: 6 },
  { x: "14%", y: "13.5%", w: 6, h: 6 },
  { x: "18%", y: "18%", w: 28, h: 28, borderOnly: true },
  { x: "19%", y: "19.5%", w: 12, h: 12, warm: true },
  { x: "5%", y: "26%", w: 12, h: 36 },
  { x: "11%", y: "28%", w: 6, h: 6 },

  // Top-Right Zone
  { x: "82%", y: "13%", w: 32, h: 32, borderOnly: true },
  { x: "83.2%", y: "14.5%", w: 14, h: 14, warm: true },
  { x: "88%", y: "16%", w: 12, h: 12 },
  { x: "89.5%", y: "16%", w: 12, h: 12 },
  { x: "91%", y: "16%", w: 12, h: 12 },
  { x: "76%", y: "11%", w: 6, h: 6 },
  { x: "77.5%", y: "11%", w: 6, h: 6 },
  { x: "86%", y: "24%", w: 12, h: 24 },
  { x: "92%", y: "27%", w: 6, h: 6, warm: true },

  // Mid-Left Flank
  { x: "6%", y: "45%", w: 36, h: 36, borderOnly: true },
  { x: "7.2%", y: "46.8%", w: 14, h: 14 },
  { x: "13%", y: "48%", w: 12, h: 12 },
  { x: "13%", y: "51%", w: 12, h: 12, warm: true },
  { x: "4%", y: "58%", w: 24, h: 12 },
  { x: "10%", y: "62%", w: 6, h: 6 },

  // Mid-Right Flank
  { x: "87%", y: "44%", w: 12, h: 12 },
  { x: "88.5%", y: "44%", w: 12, h: 12 },
  { x: "93%", y: "48%", w: 28, h: 28, borderOnly: true },
  { x: "94.2%", y: "49.5%", w: 12, h: 12, warm: true },
  { x: "84%", y: "56%", w: 36, h: 12 },
  { x: "90%", y: "61%", w: 6, h: 6 },

  // Bottom-Left Zone
  { x: "7%", y: "78%", w: 12, h: 12 },
  { x: "8.5%", y: "78%", w: 12, h: 12 },
  { x: "10%", y: "78%", w: 12, h: 12 },
  { x: "7%", y: "81%", w: 12, h: 12, warm: true },
  { x: "15%", y: "82%", w: 32, h: 32, borderOnly: true },
  { x: "16.2%", y: "83.6%", w: 14, h: 14, warm: true },
  { x: "22%", y: "86%", w: 6, h: 6 },
  { x: "12%", y: "91%", w: 24, h: 12 },

  // Bottom-Right Zone
  { x: "78%", y: "82%", w: 6, h: 6 },
  { x: "79.5%", y: "82%", w: 6, h: 6 },
  { x: "85%", y: "77%", w: 12, h: 12 },
  { x: "86.5%", y: "77%", w: 12, h: 12 },
  { x: "89%", y: "83%", w: 32, h: 32, borderOnly: true },
  { x: "90.2%", y: "84.6%", w: 14, h: 14 },
  { x: "82%", y: "88%", w: 12, h: 24, warm: true },
  { x: "74%", y: "89%", w: 6, h: 6 },
];

export function QrModuleField({ variant = "base", className }: QrModuleFieldProps) {
  const isHighlight = variant === "highlight";

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none select-none overflow-hidden",
        isHighlight ? "z-20" : "z-10",
        className
      )}
      aria-hidden="true"
    >
      {DETERMINISTIC_MODULES.map((mod, idx) => {
        let bgStyle: string;
        let borderStyle: string | undefined;

        if (isHighlight) {
          if (mod.warm) {
            bgStyle = mod.borderOnly ? "transparent" : "#FA520F";
            borderStyle = mod.borderOnly ? "1.5px solid #FA520F" : undefined;
          } else {
            bgStyle = mod.borderOnly ? "transparent" : "#FFB83E";
            borderStyle = mod.borderOnly ? "1.5px solid #FFB83E" : undefined;
          }
        } else {
          if (mod.warm) {
            bgStyle = mod.borderOnly ? "transparent" : "rgba(250, 82, 15, 0.12)";
            borderStyle = mod.borderOnly ? "1px solid rgba(250, 82, 15, 0.15)" : undefined;
          } else {
            bgStyle = mod.borderOnly ? "transparent" : "rgba(255, 255, 255, 0.045)";
            borderStyle = mod.borderOnly ? "1px solid rgba(255, 255, 255, 0.06)" : undefined;
          }
        }

        return (
          <div
            key={idx}
            className="absolute rounded-[2px] transition-transform duration-300"
            style={{
              left: mod.x,
              top: mod.y,
              width: `${mod.w}px`,
              height: `${mod.h}px`,
              backgroundColor: bgStyle,
              border: borderStyle,
              opacity: isHighlight ? 0.9 : 0.7,
            }}
          />
        );
      })}
    </div>
  );
}
