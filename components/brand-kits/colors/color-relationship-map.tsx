"use client";

import * as React from "react";
import { BrandColorToken } from "@nxtqr/contracts";
import { GitCommit, ArrowRight, Layers } from "lucide-react";

interface ColorRelationshipMapProps {
  tokens: BrandColorToken[];
}

export function ColorRelationshipMap({ tokens }: ColorRelationshipMapProps) {
  const primaryToken =
    tokens.find((t) => t.role === "primary") ||
    tokens.find((t) => t.role === "qr_foreground") ||
    tokens[0];

  const surfaceToken =
    tokens.find((t) => t.role === "surface") ||
    tokens.find((t) => t.role === "background") ||
    tokens.find((t) => t.role === "qr_background") ||
    tokens[1] ||
    tokens[0];

  const accentToken =
    tokens.find((t) => t.role === "accent") ||
    tokens.find((t) => t.role === "secondary") ||
    tokens[2] ||
    tokens[0];

  return (
    <div className="rounded-xl border border-border/80 bg-surface/40 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#FA520F]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            COLOR RELATIONSHIP MAP
          </h4>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          DESIGN SYSTEM DISPATCH
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Branch 1: Primary Dominance */}
        {primaryToken && (
          <div className="p-3.5 rounded-lg border border-border/60 bg-surface-elevated/40 space-y-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-border shadow-2xs"
                style={{ backgroundColor: primaryToken.hex }}
              />
              <span className="font-bold text-foreground">
                PRIMARY ({primaryToken.hex})
              </span>
            </div>

            <div className="pl-6 space-y-2 border-l border-border/70 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-[#FA520F]" />
                <span className="text-foreground">QR Foreground Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-[#FA520F]" />
                <span className="text-foreground">Primary CTA Buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-[#FA520F]" />
                <span className="text-foreground">Frame Badges & Outer Rims</span>
              </div>
            </div>
          </div>
        )}

        {/* Branch 2: Surface & Quiet Zone */}
        {surfaceToken && (
          <div className="p-3.5 rounded-lg border border-border/60 bg-surface-elevated/40 space-y-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-border shadow-2xs"
                style={{ backgroundColor: surfaceToken.hex }}
              />
              <span className="font-bold text-foreground">
                SURFACE ({surfaceToken.hex})
              </span>
            </div>

            <div className="pl-6 space-y-2 border-l border-border/70 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-emerald-500" />
                <span className="text-foreground">QR Background Matrix</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-emerald-500" />
                <span className="text-foreground">Quiet Zone Margin (4+ Modules)</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-emerald-500" />
                <span className="text-foreground">Landing Destination Card Canvas</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
