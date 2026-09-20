"use client";

import * as React from "react";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Sparkles } from "lucide-react";

interface BrandKitsEmptyProps {
  onCreate: () => void;
}

export function BrandKitsEmpty({ onCreate }: BrandKitsEmptyProps) {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 rounded-2xl border border-dashed border-border/80 bg-surface/50 backdrop-blur-sm text-center max-w-2xl mx-auto my-12 overflow-hidden shadow-sm">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FA520F]/5 via-transparent to-transparent pointer-events-none" />

      {/* Signature Animated Monogram 'B' */}
      <div className="mb-6 relative">
        <QrEmptyMonogram letter="B" size="lg" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/20 mb-3">
        <Sparkles className="w-3 h-3" />
        <span>Visual Identity System</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
        BUILD YOUR FIRST BRAND SYSTEM
      </h2>

      <p className="mt-2.5 text-sm text-muted-foreground max-w-md leading-relaxed">
        Create a Brand Kit to keep colors, logos, typography, QR styles, and guidelines consistent across all QR experiences and landing destinations in this workspace.
      </p>

      {/* Key capabilities list */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-6 text-left">
        <div className="p-3 rounded-lg border border-border/60 bg-surface-elevated/40">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
            Color Tokens
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Semantic roles & contrast testing</p>
        </div>
        <div className="p-3 rounded-lg border border-border/60 bg-surface-elevated/40">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
            Branded QR Presets
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Vector geometries & scanability</p>
        </div>
        <div className="p-3 rounded-lg border border-border/60 bg-surface-elevated/40">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#FA520F]" />
            Brand Guardrails
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Role locking & revision control</p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button
          onClick={onCreate}
          size="lg"
          className="gap-2 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-md shadow-[#FA520F]/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Brand Kit</span>
        </Button>
      </div>
    </div>
  );
}
