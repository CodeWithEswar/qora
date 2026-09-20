"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink, Split, QrCode, Globe, BarChart2 } from "lucide-react";
import { ExperimentVariantItem } from "../types";

interface VariantInspectorSheetProps {
  variant: ExperimentVariantItem | null;
  isOpen: boolean;
  onClose: () => void;
  qrName: string;
}

export function VariantInspectorSheet({
  variant,
  isOpen,
  onClose,
  qrName,
}: VariantInspectorSheetProps) {
  if (!variant) return null;

  const convRate =
    variant.totalScans > 0 ? ((variant.conversions / variant.totalScans) * 100).toFixed(2) : "0.00";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-[#111114] border-l border-white/10 text-white p-0 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-5 sm:p-6 pb-4 border-b border-white/8 bg-[#141418] text-left">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-wider uppercase font-bold">
            <Split className="h-3.5 w-3.5" />
            <span>VARIANT ROUTING INSPECTOR</span>
          </div>
          <SheetTitle className="text-lg font-semibold text-white tracking-tight pt-1">
            {variant.name}
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400">
            Routing destination and observed telemetry for this experimental branch.
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs font-sans">
          {/* Target QR Source */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">PARENT QR ASSET</span>
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <QrCode className="h-4 w-4 text-primary shrink-0" />
              <span>{qrName}</span>
            </div>
          </div>

          {/* Destination URL */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">ROUTED DESTINATION</span>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-zinc-300 break-all">
              {variant.destinationUrl}
            </div>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="w-full h-8 text-xs bg-black/30 border-white/10 text-zinc-300 hover:text-white gap-1.5"
            >
              <a href={variant.destinationUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Open Destination in New Tab
                <ExternalLink className="h-3 w-3 ml-auto text-zinc-500" />
              </a>
            </Button>
          </div>

          {/* Telemetry Breakdown */}
          <div className="p-4 rounded-xl bg-[#0d0d10] border border-white/8 space-y-3 font-mono">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              PERFORMANCE TELEMETRY
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[10px] text-zinc-500">TRAFFIC WEIGHT</div>
                <div className="text-sm font-bold text-zinc-200">{variant.trafficWeight}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[10px] text-zinc-500">TOTAL SCANS</div>
                <div className="text-sm font-bold text-zinc-200">
                  {variant.totalScans.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[10px] text-zinc-500">CONVERSIONS</div>
                <div className="text-sm font-bold text-zinc-200">
                  {variant.conversions.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[10px] text-zinc-500">CONV. RATE</div>
                <div className="text-sm font-bold text-primary">{convRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/8 bg-[#141418] flex justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="h-8 text-xs bg-white text-black hover:bg-zinc-200"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
