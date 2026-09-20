"use client";

import React from "react";
import type { LandingPageRecord, LandingPageConnectedQrV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DestinationTraceProps {
  page: LandingPageRecord;
  connectedQrs: LandingPageConnectedQrV1[];
  publishedVersionNumber?: number;
}

export function DestinationTrace({
  page,
  connectedQrs,
  publishedVersionNumber,
}: DestinationTraceProps) {
  const qrCount = connectedQrs.length;
  const isPublished = page.status === "published";

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#FA520F] font-bold">
            SIGNATURE ARCHITECTURE
          </span>
          <h2 className="text-base font-bold text-foreground">Destination Trace</h2>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          End-to-End Resolution Pipeline
        </Badge>
      </div>

      {/* Visual Architectural Flow Diagram */}
      <div className="flex flex-col items-center max-w-xl mx-auto py-2">
        {/* Step 1: Ingress QR Codes */}
        <div className="w-full flex flex-col items-center">
          <div className="px-4 py-2.5 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-2.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <NxtqrIcon icon="solar:qr-code-bold" size={16} />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-foreground">
                {qrCount} Connected QR Code{qrCount === 1 ? "" : "s"}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono block">
                Physical Print • Digital Scans • NFC Tagging
              </span>
            </div>
          </div>

          {/* Connector Down Arrow */}
          <div className="flex flex-col items-center my-1.5 text-muted-foreground">
            <div className="w-0.5 h-4 bg-border" />
            <NxtqrIcon icon="solar:alt-arrow-down-linear" size={14} className="text-[#FA520F]" />
          </div>
        </div>

        {/* Step 2: Routing Intelligence Layer */}
        <div className="w-full flex flex-col items-center">
          <div className="px-5 py-2.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3 shadow-2xs">
            <NxtqrIcon icon="solar:routing-2-bold" size={18} className="text-[#FA520F]" />
            <div className="text-left">
              <span className="text-xs font-bold block text-foreground">
                QR Brain &amp; Edge Resolver
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                Cloudflare Worker • Ultra-low Latency Route Match
              </span>
            </div>
          </div>

          {/* Connector Down Arrow */}
          <div className="flex flex-col items-center my-1.5 text-muted-foreground">
            <div className="w-0.5 h-4 bg-border" />
            <NxtqrIcon icon="solar:alt-arrow-down-linear" size={14} className="text-[#FA520F]" />
          </div>
        </div>

        {/* Step 3: Destination Landing Page */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-sm p-4 rounded-2xl border-2 border-[#FA520F]/40 bg-card shadow-md flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-sm text-foreground">
                {page.name}
              </span>
              <Badge
                variant={isPublished ? "default" : "secondary"}
                className={cn(
                  "text-[9px] uppercase font-mono px-1.5 py-0",
                  isPublished && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                )}
              >
                {isPublished ? `V${publishedVersionNumber || 1} LIVE` : "DRAFT"}
              </Badge>
            </div>

            <span className="text-xs font-mono text-muted-foreground">
              /p/{page.slug}
            </span>
          </div>

          {/* Connector Down Arrow */}
          <div className="flex flex-col items-center my-1.5 text-muted-foreground">
            <div className="w-0.5 h-4 bg-border" />
            <NxtqrIcon icon="solar:alt-arrow-down-linear" size={14} className="text-[#FA520F]" />
          </div>
        </div>

        {/* Step 4: Downstream Conversion Actions */}
        <div className="w-full flex justify-center gap-3">
          <div className="px-3.5 py-2 rounded-xl border border-border/80 bg-muted/20 text-center">
            <span className="text-[11px] font-bold block text-foreground">
              {page.viewCount || 0} Page Views
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Visitor Impression</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl border border-border/80 bg-muted/20 text-center">
            <span className="text-[11px] font-bold block text-foreground">
              {page.ctaCount || 0} CTA Actions
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Conversions Logged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
