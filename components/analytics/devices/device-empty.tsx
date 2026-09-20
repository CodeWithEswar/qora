"use client";

import * as React from "react";

export function DeviceEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
      {/* Signature 'D' QR module monogram */}
      <div className="grid grid-cols-4 gap-1 p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
        {/* Row 1 */}
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80 shadow-[0_0_6px_rgba(250,82,15,0.6)]" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05]" />

        {/* Row 2 */}
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05]" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05]" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />

        {/* Row 3 */}
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05]" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05]" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />

        {/* Row 4 */}
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05]" />
      </div>

      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
        No device telemetry yet
      </p>
      <span className="text-[11px] text-[#85827B] max-w-[200px]">
        Device distributions will populate automatically once scans are recorded.
      </span>
    </div>
  );
}
