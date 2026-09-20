"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";

interface GuardianEmptyProps {
  onAddMonitor: () => void;
}

export function GuardianEmpty({ onAddMonitor }: GuardianEmptyProps) {
  return (
    <div className="relative rounded-2xl border border-dashed border-border/80 bg-surface/80 text-foreground p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6 overflow-hidden min-h-[440px] shadow-2xs">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-[#FA520F]/5 via-transparent to-transparent pointer-events-none" />

      {/* Signature Deterministic QR Monogram "G" */}
      <div className="relative mb-2 flex items-center justify-center">
        <QrEmptyMonogram letter="G" size="lg" />
      </div>

      {/* Title & Technical Descriptor */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FA520F]/10 border border-[#FA520F]/20 text-[#FA520F] text-[10px] font-bold tracking-wider uppercase font-mono">
          <Icon icon="solar:shield-check-bold" className="w-3 h-3" />
          <span>Destination Reliability</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif">
          GUARDIAN IS READY
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Monitor important QR destinations and prepare recovery behavior before link failures affect future scans.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          onClick={onAddMonitor}
          className="bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium text-xs h-10 px-5 shadow-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
          <span>Add First Monitor</span>
        </Button>
      </div>
    </div>
  );
}
