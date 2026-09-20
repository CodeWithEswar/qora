"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AmbientLights } from "./ambient-lights";
import { QrGrid } from "./qr-grid";
import { QrModuleField } from "./qr-module-field";
import { FinderField } from "./finder-field";
import { RouteField } from "./route-field";
import { PointerReveal } from "./pointer-reveal";

interface InfrastructureBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showMicrocopy?: boolean;
}

/**
 * NXTQR Shared Infrastructure Background
 *
 * Unified atmospheric environment used across:
 * - /login & /signup
 * - 401 (Identity Required)
 * - 403 (Access Restricted)
 * - 404 (Route Not Found)
 * - 500 (System Fault)
 *
 * Layers:
 * 0: Base radial depth (#171717 -> #111111 -> #0A0A0A)
 * 1: Base precision QR grid
 * 2: Base deterministic QR modules & finder corners
 * 3: Dual ambient moving lights (Orange A & Amber B on independent cycles)
 * 4: Orthogonal route traces & travelling signal pulses
 * 5: Local scanner reveal layer (masked illuminated grid & modules under pointer)
 * 6: Pointer radial spotlight glow
 * 7: Center readability mask & peripheral vignette
 * 8: Desktop coordinate microcopy
 */
export function InfrastructureBackground({
  children,
  className,
  showMicrocopy = true,
}: InfrastructureBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[100svh] w-full overflow-hidden flex flex-col justify-between select-none",
        "bg-[#FAF8F5] dark:bg-[#111111] text-[#111111] dark:text-[#F7F4EC] transition-colors duration-300",
        className
      )}
      style={{
        ["--auth-pointer-x" as string]: "-999px",
        ["--auth-pointer-y" as string]: "-999px",
        ["--auth-pointer-opacity" as string]: "0",
        ["--auth-grid-size" as string]: "60px",
      }}
    >
      {/* Layer 0: Base Radial Depth */}
      <div
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #171717 0%, #111111 50%, #0A0A0A 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 block dark:hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #FAF8F5 50%, #F0EDE5 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 1 & 2: Base QR Infrastructure */}
      <QrGrid variant="base" />
      <QrModuleField variant="base" />
      <FinderField variant="base" />

      {/* Layer 3: Dual Ambient Moving Lights */}
      <AmbientLights />

      {/* Layer 4: Routing Field & Signals */}
      <RouteField />

      {/* Layer 5: Local Reveal Layer (Masked Illuminated Copy) */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-20 transition-opacity duration-300 ease-out"
        style={{
          opacity: "var(--auth-pointer-opacity, 0)",
          WebkitMaskImage: `radial-gradient(
            circle 280px at var(--auth-pointer-x, -999px) var(--auth-pointer-y, -999px),
            black 0%,
            rgba(0, 0, 0, 0.45) 50%,
            transparent 100%
          )`,
          maskImage: `radial-gradient(
            circle 280px at var(--auth-pointer-x, -999px) var(--auth-pointer-y, -999px),
            black 0%,
            rgba(0, 0, 0, 0.45) 50%,
            transparent 100%
          )`,
        }}
        aria-hidden="true"
      >
        <QrGrid variant="highlight" />
        <QrModuleField variant="highlight" />
        <FinderField variant="highlight" />
      </div>

      {/* Layer 6: Pointer Radial Spotlight */}
      <PointerReveal containerRef={containerRef} />

      {/* Layer 7: Readability Mask & Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-25 hidden dark:block"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(17, 17, 17, 0.85) 0%, rgba(17, 17, 17, 0.4) 40%, transparent 75%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-25 block dark:hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(250, 248, 245, 0.85) 0%, rgba(250, 248, 245, 0.4) 40%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none z-25 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0, 0, 0, 0.20) 70%, rgba(0, 0, 0, 0.55) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-25 block dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0.06) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 8: Desktop Positioning Microcopy */}
      {showMicrocopy && (
        <div
          className="absolute inset-0 pointer-events-none z-28 hidden lg:block overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-20 left-12 font-mono text-[9px] tracking-[0.26em] uppercase text-primary/35 select-none">
            CREATE ONCE.
          </div>
          <div className="absolute top-20 right-12 font-mono text-[9px] tracking-[0.26em] uppercase text-[#FFB83E]/35 select-none">
            CHANGE ANYTIME.
          </div>
          <div className="absolute bottom-20 left-12 font-mono text-[9px] tracking-[0.26em] uppercase text-primary/35 select-none">
            ROUTE INTELLIGENTLY.
          </div>
          <div className="absolute bottom-20 right-12 font-mono text-[9px] tracking-[0.26em] uppercase text-[#FFB83E]/35 select-none">
            MEASURE EVERYTHING.
          </div>
        </div>
      )}

      {/* Layer 9: Interactive Content */}
      <div className="relative z-30 flex flex-col justify-between flex-1 w-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
