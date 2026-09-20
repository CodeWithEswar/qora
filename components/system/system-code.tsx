import * as React from "react";
import { cn } from "@/lib/utils";

export type SystemCodeType = "401" | "403" | "404" | "500";

interface SystemCodeProps {
  code: SystemCodeType;
  eyebrow?: string;
  className?: string;
}

const SYSTEM_CODE_METADATA: Record<
  SystemCodeType,
  {
    eyebrow: string;
    microStatus: string;
    accentColor: string;
    statusIcon: string;
  }
> = {
  "404": {
    eyebrow: "NXTQR / ROUTE RESOLUTION",
    microStatus: "ROUTE UNRESOLVED",
    accentColor: "#FA520F",
    statusIcon: "●",
  },
  "401": {
    eyebrow: "NXTQR / IDENTITY REQUIRED",
    microStatus: "IDENTITY REQUIRED",
    accentColor: "#FF8105",
    statusIcon: "○",
  },
  "403": {
    eyebrow: "NXTQR / ACCESS CONTROL",
    microStatus: "ACCESS RESTRICTED",
    accentColor: "#FFB83E",
    statusIcon: "◇",
  },
  "500": {
    eyebrow: "NXTQR / SYSTEM RECOVERY",
    microStatus: "SYSTEM FAULT",
    accentColor: "#FA520F",
    statusIcon: "△",
  },
};

/**
 * SystemCode
 *
 * Renders large technical QR-integrated numbers with subtle geometric
 * motifs and technical status badges.
 */
export function SystemCode({ code, eyebrow, className }: SystemCodeProps) {
  const meta = SYSTEM_CODE_METADATA[code] || SYSTEM_CODE_METADATA["404"];
  const displayEyebrow = eyebrow || meta.eyebrow;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none",
        className
      )}
    >
      {/* Top Technical Label & Micro Status */}
      <div className="flex items-center gap-2.5 px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.02] backdrop-blur-md mb-2">
        <span
          className="text-[9px] font-mono font-bold"
          style={{ color: meta.accentColor }}
        >
          {meta.statusIcon}
        </span>
        <span className="text-[9px] font-mono tracking-[0.20em] uppercase text-foreground/80 dark:text-[#B8B5AD]">
          {displayEyebrow}
        </span>
        <span className="text-foreground/25 dark:text-white/20 text-[8px]">•</span>
        <span className="text-[9px] font-mono tracking-[0.16em] uppercase text-muted-foreground dark:text-[#7A7A7A]">
          {meta.microStatus}
        </span>
      </div>

      {/* Large Technical Error Number with Integrated QR Infrastructure Geometry */}
      <div className="relative flex items-center justify-center font-mono font-black tracking-tight leading-none my-1">
        {/* Subtle Horizontal Grid Line Through Number Axis */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent, ${meta.accentColor} 40%, rgba(255,184,62,0.4) 60%, transparent)`,
          }}
          aria-hidden="true"
        />

        {/* Dark Mode Error Number */}
        <span
          className="relative z-10 hidden dark:inline-block text-[clamp(5.5rem,15vw,10.5rem)] font-bold tracking-tight select-none"
          style={{
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F7F4EC 45%, #9E9B93 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 24px rgba(0, 0, 0, 0.7))",
          }}
        >
          {code}
        </span>

        {/* Light Mode Error Number */}
        <span
          className="relative z-10 inline-block dark:hidden text-[clamp(5.5rem,15vw,10.5rem)] font-bold tracking-tight select-none"
          style={{
            background:
              "linear-gradient(180deg, #111111 0%, #262626 50%, #525252 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 16px rgba(0, 0, 0, 0.10))",
          }}
        >
          {code}
        </span>

        {/* Small QR Alignment Box Inset Motif on Center Digit */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-primary/30 rounded-xs pointer-events-none opacity-30 hidden sm:block"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
