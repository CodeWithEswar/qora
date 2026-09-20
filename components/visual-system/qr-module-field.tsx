import * as React from "react";
import { cn } from "@/lib/utils";

interface QrModuleFieldProps {
  variant?: "base" | "highlight";
  className?: string;
}

interface ModuleDescriptor {
  x: string;
  y: string;
  w: number;
  h: number;
  warm?: boolean;
  borderOnly?: boolean;
}

const DETERMINISTIC_MODULES: ModuleDescriptor[] = [
  // Top-Left Zone
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

export function QrModuleField({
  variant = "base",
  className,
}: QrModuleFieldProps) {
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
        let colorClasses: string;

        if (isHighlight) {
          if (mod.warm) {
            colorClasses = mod.borderOnly
              ? "border-[1.5px] border-[#FA520F] bg-transparent"
              : "bg-[#FA520F]";
          } else {
            colorClasses = mod.borderOnly
              ? "border-[1.5px] border-[#FFB83E] bg-transparent"
              : "bg-[#FFB83E]";
          }
        } else {
          if (mod.warm) {
            colorClasses = mod.borderOnly
              ? "border border-[#FA520F]/25 bg-transparent"
              : "bg-[#FA520F]/15 dark:bg-[#FA520F]/12";
          } else {
            colorClasses = mod.borderOnly
              ? "border border-black/[0.08] dark:border-white/[0.06] bg-transparent"
              : "bg-black/[0.05] dark:bg-white/[0.045]";
          }
        }

        return (
          <div
            key={idx}
            className={cn(
              "absolute rounded-[2px] transition-all duration-300",
              colorClasses,
              isHighlight ? "opacity-90" : "opacity-80 dark:opacity-70"
            )}
            style={{
              left: mod.x,
              top: mod.y,
              width: `${mod.w}px`,
              height: `${mod.h}px`,
            }}
          />
        );
      })}
    </div>
  );
}
