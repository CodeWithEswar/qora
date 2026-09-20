"use client";

import * as React from "react";
import { BrandGovernance } from "@nxtqr/contracts";
import { ShieldCheck, Lock, Unlock, ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandGuardrailsProps {
  governance: BrandGovernance;
}

export function BrandGuardrails({ governance }: BrandGuardrailsProps) {
  const isColorLocked = !governance?.allowCustomColors;
  const isLogoLocked = !governance?.allowCustomLogos;
  const isStyleLocked = !governance?.allowQrStyleOverrides;
  const isTemplateRequired = governance?.requireApprovedTemplate;
  const scanLevel = governance?.enforceScanabilityLevel || "warning";

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FA520F] mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Policy Dispatch & RBAC Enforcement</span>
          </div>
          <h3 className="text-lg font-bold text-foreground font-display">
            BRAND GUARDRAILS FLOW
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active guardrails propagated to QR Studio, Destination Studio, and publishing pipelines.
          </p>
        </div>

        <Badge
          variant="secondary"
          className="text-xs font-mono py-1 px-3 bg-surface-elevated border border-border/80"
        >
          ENFORCEMENT: {scanLevel.toUpperCase()}
        </Badge>
      </div>

      {/* Visual Guardrails Pipeline */}
      <div className="flex flex-col items-center py-4">
        {/* Top: Source Brand Authority */}
        <div className="px-5 py-2 rounded-xl border border-border bg-surface-elevated shadow-xs text-xs font-bold text-foreground font-mono text-center">
          AUTHORITATIVE BRAND KIT
        </div>

        <div className="w-0.5 h-6 bg-border my-1" />

        {/* Center: Guardrails Matrix Card */}
        <div className="w-full max-w-md p-5 rounded-xl border border-border/90 bg-surface-elevated/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FA520F]" />
              ACTIVE GUARDRAILS
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">SERVER ENFORCED</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Color Lock */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/50">
              <span className="text-foreground">Palette & Color Tokens</span>
              {isColorLocked ? (
                <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px]">
                  <Lock className="w-2.5 h-2.5 mr-1" /> LOCKED
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  <Unlock className="w-2.5 h-2.5 mr-1" /> FLEXIBLE
                </Badge>
              )}
            </div>

            {/* Logo Lock */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/50">
              <span className="text-foreground">Approved Brand Marks</span>
              {isLogoLocked ? (
                <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px]">
                  <Lock className="w-2.5 h-2.5 mr-1" /> LOCKED
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  <Unlock className="w-2.5 h-2.5 mr-1" /> FLEXIBLE
                </Badge>
              )}
            </div>

            {/* QR Style Geometry */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/50">
              <span className="text-foreground">QR Geometries & Frames</span>
              {isStyleLocked ? (
                <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px]">
                  <Lock className="w-2.5 h-2.5 mr-1" /> PRESET LOCKED
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  <Unlock className="w-2.5 h-2.5 mr-1" /> CUSTOMIZABLE
                </Badge>
              )}
            </div>

            {/* Template requirement */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/50">
              <span className="text-foreground">Template Approval</span>
              {isTemplateRequired ? (
                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px]">
                  REQUIRED
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  OPTIONAL
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="w-0.5 h-6 bg-border my-1" />

        {/* Studio Injection Node */}
        <div className="px-5 py-2 rounded-xl border border-border bg-surface shadow-xs text-xs font-bold text-foreground font-mono text-center">
          QR STUDIO & DESTINATION ENGINE
        </div>

        <div className="w-0.5 h-6 bg-border my-1" />

        {/* Final Publication Gate */}
        <div className="px-6 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 shadow-xs text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono text-center flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>GOVERNED IMMUTABLE PUBLISH</span>
        </div>
      </div>
    </div>
  );
}
