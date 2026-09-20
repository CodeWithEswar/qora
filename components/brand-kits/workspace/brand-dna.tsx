"use client";

import * as React from "react";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import { Sparkles, ArrowDown, CheckCircle2, Shield } from "lucide-react";

interface BrandDnaProps {
  kit: BrandKitDetailV1;
}

export function BrandDna({ kit }: BrandDnaProps) {
  const primaryColor = kit.primaryColor || "#FA520F";
  const primaryLogo = kit.logos.find((l) => l.isPrimary) || kit.logos[0];
  const activePreset = kit.qrPresets.find((p) => p.isDefault) || kit.qrPresets[0];

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FA520F] mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Deterministic Graph Architecture</span>
          </div>
          <h3 className="text-lg font-bold text-foreground font-display">
            BRAND DNA CONSTELLATION
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time topology demonstrating how identity tokens flow from source authority into scannable outputs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-surface-elevated/60 px-2.5 py-1 rounded-md border border-border/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYNCHRONIZED WITH REVISION {kit.publishedRevision}</span>
        </div>
      </div>

      {/* Visual Constellation Map (Pure SVG + HTML layout) */}
      <div className="relative py-4 flex flex-col items-center">
        {/* Level 1: Root Node (Brand Kit Authority) */}
        <div className="relative z-10 px-5 py-2.5 rounded-xl border-2 border-[#FA520F] bg-surface-elevated shadow-md text-center max-w-xs">
          <div className="text-[10px] font-mono tracking-widest text-[#FA520F] uppercase font-bold">
            AUTHORITATIVE IDENTITY
          </div>
          <div className="text-sm font-bold text-foreground mt-0.5 font-display">
            {kit.name}
          </div>
        </div>

        {/* Connecting Lines 1 */}
        <div className="w-0.5 h-8 bg-gradient-to-b from-[#FA520F] to-border my-1" />

        {/* Level 2: Core Identity Pillars (Logo, Colors, Typography) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          {/* Node 1: Logos */}
          <div className="p-3 rounded-xl border border-border bg-surface-elevated/80 shadow-xs flex flex-col items-center text-center">
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
              01 LOGO ASSETS
            </div>
            <div className="mt-2 w-8 h-8 rounded-lg border border-border bg-white dark:bg-black/30 flex items-center justify-center p-1 overflow-hidden">
              {primaryLogo?.url ? (
                <img
                  src={primaryLogo.url}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-[#FA520F]">
                  {kit.name.slice(0, 1)}
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-foreground mt-1.5 truncate max-w-[140px]">
              {primaryLogo?.name || "No logo uploaded"}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {kit.logos.length} {kit.logos.length === 1 ? "variant" : "variants"}
            </div>
          </div>

          {/* Node 2: Color System */}
          <div className="p-3 rounded-xl border border-border bg-surface-elevated/80 shadow-xs flex flex-col items-center text-center">
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
              02 COLOR SYSTEM
            </div>
            <div className="mt-2 flex items-center gap-1">
              {kit.colors.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="w-6 h-6 rounded-md border border-border/80 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.hex})`}
                />
              ))}
            </div>
            <div className="text-xs font-semibold text-foreground mt-1.5 font-mono">
              {primaryColor}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {kit.colors.length} semantic tokens
            </div>
          </div>

          {/* Node 3: Typography */}
          <div className="p-3 rounded-xl border border-border bg-surface-elevated/80 shadow-xs flex flex-col items-center text-center">
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
              03 TYPOGRAPHY
            </div>
            <div className="mt-2 text-base font-bold text-foreground font-display">
              Aa
            </div>
            <div className="text-xs font-semibold text-foreground mt-1.5 truncate max-w-[140px]">
              {kit.typography?.display?.label || "Instrument Serif"}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              UI: {kit.typography?.ui?.label || "Inter"}
            </div>
          </div>
        </div>

        {/* Connecting Lines 2 */}
        <div className="w-0.5 h-8 bg-gradient-to-b from-border to-[#FA520F]/60 my-1" />

        {/* Level 3: Reusable Design Presets (QR Styles & Guardrails) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {/* Preset Node */}
          <div className="p-3.5 rounded-xl border border-border/90 bg-surface-elevated shadow-xs text-center">
            <div className="text-[10px] font-mono uppercase font-bold text-[#FA520F]">
              BRANDED QR PRESET
            </div>
            <div className="text-xs font-bold text-foreground mt-1">
              {activePreset?.name || "Standard Geometry"}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Shape: {activePreset?.design?.moduleStyle || "squares"} • Eye: {activePreset?.design?.eyeOuterStyle || "square"}
            </div>
          </div>

          {/* Guardrails Node */}
          <div className="p-3.5 rounded-xl border border-border/90 bg-surface-elevated shadow-xs text-center">
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-500">
              GOVERNANCE GUARDRAILS
            </div>
            <div className="text-xs font-bold text-foreground mt-1">
              {kit.governance?.lockedFields?.length || 0} Locked Rules Active
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Scanability check: {kit.governance?.enforceScanabilityLevel || "warning"}
            </div>
          </div>
        </div>

        {/* Connecting Lines 3 */}
        <div className="w-0.5 h-8 bg-gradient-to-b from-[#FA520F]/60 to-emerald-500 my-1" />

        {/* Level 4: Production Outputs */}
        <div className="relative z-10 px-6 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 shadow-xs text-center max-w-md w-full">
          <div className="text-[10px] font-mono tracking-wider text-emerald-500 uppercase font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>AUTHENTICATED PRODUCTION OUTPUTS</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs font-medium text-foreground">
            <div className="py-1 px-2 rounded bg-surface border border-border/60">
              QR Codes
            </div>
            <div className="py-1 px-2 rounded bg-surface border border-border/60">
              Landing Pages
            </div>
            <div className="py-1 px-2 rounded bg-surface border border-border/60">
              Physical Print
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
