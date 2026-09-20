"use client";

import * as React from "react";
import { Plus, BookOpen, Sparkles, ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";

interface DomainsEmptyProps {
  onConnect?: () => void;
  onConnectDomain?: () => void;
  onOpenDocs?: () => void;
}

export function DomainsEmpty({ onConnect, onConnectDomain, onOpenDocs }: DomainsEmptyProps) {
  const handleConnect = onConnectDomain || onConnect || (() => {});

  return (
    <div className="relative rounded-2xl border border-dashed border-border/80 bg-surface/80 text-foreground p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6 overflow-hidden min-h-[460px] shadow-2xs">
      {/* Background radial ambient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-[#FA520F]/5 via-transparent to-transparent pointer-events-none" />

      {/* Signature Deterministic QR Monogram "D" */}
      <div className="relative mb-2 flex items-center justify-center">
        <QrEmptyMonogram letter="D" size="lg" />
      </div>

      {/* Title & Technical Descriptor */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FA520F]/10 border border-[#FA520F]/20 text-[#FA520F] text-[10px] font-bold tracking-wider uppercase font-mono">
          <Sparkles className="w-3 h-3" />
          <span>Brand Routing Control Center</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif">
          OWN YOUR QR DOMAIN
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Connect your custom domain to route branded QR scans directly through your trusted identity. Every scan will resolve deterministically through your isolated brand namespace.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          onClick={handleConnect}
          className="bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium text-xs h-10 px-5 shadow-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Domain</span>
        </Button>
        {onOpenDocs && (
          <Button
            variant="outline"
            onClick={onOpenDocs}
            className="text-xs h-10 px-4 flex items-center gap-2 cursor-pointer w-full sm:w-auto border-border bg-surface hover:bg-surface/90 text-foreground"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DNS Setup Guide</span>
          </Button>
        )}
      </div>

      {/* Infrastructure Capabilities Cards */}
      <div className="pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs max-w-lg w-full text-left">
        <div className="p-3 rounded-lg border border-border/70 bg-surface/50">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FA520F]" />
            Zero Edge Latency
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Distributed edge resolver routing</p>
        </div>
        <div className="p-3 rounded-lg border border-border/70 bg-surface/50">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Automatic TLS / SSL
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Automated certificate management</p>
        </div>
        <div className="p-3 rounded-lg border border-border/70 bg-surface/50">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#FA520F]" />
            Isolated Namespace
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Conflict-free slug resolution</p>
        </div>
      </div>
    </div>
  );
}

export const DomainsTrueEmptyState = DomainsEmpty;
