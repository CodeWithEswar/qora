"use client";

import * as React from "react";
import { BrandTypographyConfig } from "@nxtqr/contracts";
import { Type, Sparkles, SlidersHorizontal, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TypographyWorkspaceProps {
  typography: BrandTypographyConfig;
  primaryColor?: string;
}

type PreviewMode = "heading" | "paragraph" | "qr_label" | "cta" | "landing";

export function TypographyWorkspace({
  typography,
  primaryColor = "#FA520F",
}: TypographyWorkspaceProps) {
  const [activePreviewMode, setActivePreviewMode] = React.useState<PreviewMode>("heading");

  const displayFont = typography?.display?.fontFamily || "var(--font-editorial, 'Instrument Serif', Georgia, serif)";
  const uiFont = typography?.ui?.fontFamily || "var(--font-sans, 'Inter', sans-serif)";
  const monoFont = typography?.mono?.fontFamily || "var(--font-mono, 'JetBrains Mono', monospace)";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
            TYPOGRAPHY SYSTEM
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Precision font hierarchies applied across editorial headers, UI components, and scannable frame labels.
          </p>
        </div>

        {/* Live Preview Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border/60 text-xs">
          <span className="text-[10px] font-mono text-muted-foreground px-2 uppercase">
            MODE:
          </span>
          {(
            [
              { id: "heading", label: "Heading" },
              { id: "paragraph", label: "Editorial" },
              { id: "qr_label", label: "QR Frame" },
              { id: "cta", label: "Button CTA" },
              { id: "landing", label: "Hero Banner" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActivePreviewMode(m.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                activePreviewMode === m.id
                  ? "bg-surface-elevated text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Specimen Preview Box */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-surface/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-3 right-3 text-[10px] font-mono text-muted-foreground uppercase px-2 py-0.5 rounded bg-surface-elevated border border-border/60">
          PREVIEW CANVAS • {activePreviewMode.toUpperCase()}
        </div>

        {activePreviewMode === "heading" && (
          <div className="space-y-3 max-w-2xl">
            <div
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight"
              style={{ fontFamily: displayFont }}
            >
              Intelligence behind every scan.
            </div>
            <p
              className="text-sm sm:text-base text-muted-foreground"
              style={{ fontFamily: uiFont }}
            >
              Dynamic routing, forensic analytics, and enterprise link health monitoring built for high-scale physical infrastructure.
            </p>
          </div>
        )}

        {activePreviewMode === "paragraph" && (
          <div className="space-y-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            <h5
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: displayFont }}
            >
              Brand Identity Continuity
            </h5>
            <p style={{ fontFamily: uiFont }}>
              When customers interact with your physical touchpoints—from premium retail packaging to international conference signage—the typography establishes instant recognition. Every vector module and accompanying label adheres strictly to the brand scale.
            </p>
            <div
              className="text-[11px] font-mono text-foreground/80 p-2.5 rounded bg-surface border border-border/60"
              style={{ fontFamily: monoFont }}
            >
              ISO 18004 COMPLIANCE • SAFE MARGIN: 4.00mm • RESOLUTION RATIO: 300DPI
            </div>
          </div>
        )}

        {activePreviewMode === "qr_label" && (
          <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/80 bg-surface-elevated shadow-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="text-sm font-bold tracking-wider uppercase text-foreground"
                style={{ fontFamily: uiFont }}
              >
                SCAN FOR EXCLUSIVE ACCESS
              </span>
            </div>
            <span
              className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest"
              style={{ fontFamily: monoFont }}
            >
              FRAME_SPEC_01 • 32 CHAR MAX
            </span>
          </div>
        )}

        {activePreviewMode === "cta" && (
          <div className="flex flex-wrap items-center justify-center gap-4 p-6">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg text-white font-medium text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{
                backgroundColor: primaryColor,
                fontFamily: uiFont,
              }}
            >
              Explore Destination Experience
            </button>
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg border border-border text-foreground font-medium text-xs bg-surface-elevated hover:bg-surface transition-colors cursor-pointer"
              style={{ fontFamily: uiFont }}
            >
              Secondary Action
            </button>
          </div>
        )}

        {activePreviewMode === "landing" && (
          <div className="p-6 rounded-xl border border-border bg-gradient-to-r from-surface to-surface-elevated max-w-xl mx-auto text-center space-y-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest text-[#FA520F]"
              style={{ fontFamily: monoFont }}
            >
              FEATURED RELEASE
            </span>
            <div
              className="text-2xl sm:text-3xl font-bold text-foreground"
              style={{ fontFamily: displayFont }}
            >
              Summer Collection 2026
            </div>
            <p
              className="text-xs text-muted-foreground"
              style={{ fontFamily: uiFont }}
            >
              Tap below to view localized lookbook and store locator.
            </p>
          </div>
        )}
      </div>

      {/* Font Specimen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Display Serif */}
        <div className="p-4 rounded-xl border border-border/80 bg-surface/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              01 DISPLAY SERIF
            </span>
            <Badge variant="outline" className="text-[9px] font-mono">
              Headers
            </Badge>
          </div>

          <div className="text-3xl font-bold text-foreground" style={{ fontFamily: displayFont }}>
            Aa
          </div>

          <div className="text-xs font-semibold text-foreground">
            {typography?.display?.label || "Instrument Serif"}
          </div>

          <div className="text-[11px] text-muted-foreground tracking-widest break-all">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
            abcdefghijklmnopqrstuvwxyz<br />
            0123456789
          </div>
        </div>

        {/* 2. UI Sans */}
        <div className="p-4 rounded-xl border border-border/80 bg-surface/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              02 SYSTEM UI
            </span>
            <Badge variant="outline" className="text-[9px] font-mono">
              Body & Controls
            </Badge>
          </div>

          <div className="text-3xl font-bold text-foreground" style={{ fontFamily: uiFont }}>
            Aa
          </div>

          <div className="text-xs font-semibold text-foreground">
            {typography?.ui?.label || "Inter"}
          </div>

          <div className="text-[11px] text-muted-foreground tracking-widest break-all">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
            abcdefghijklmnopqrstuvwxyz<br />
            0123456789
          </div>
        </div>

        {/* 3. Technical Mono */}
        <div className="p-4 rounded-xl border border-border/80 bg-surface/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              03 TECHNICAL MONO
            </span>
            <Badge variant="outline" className="text-[9px] font-mono">
              Telemetry & Slugs
            </Badge>
          </div>

          <div className="text-3xl font-bold text-foreground" style={{ fontFamily: monoFont }}>
            Aa
          </div>

          <div className="text-xs font-semibold text-foreground">
            {typography?.mono?.label || "JetBrains Mono"}
          </div>

          <div className="text-[11px] text-muted-foreground font-mono tracking-widest break-all">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
            abcdefghijklmnopqrstuvwxyz<br />
            0123456789
          </div>
        </div>
      </div>
    </div>
  );
}
