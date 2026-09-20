"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Globe,
  ExternalLink,
  Shield,
  Layers,
  Palette,
  Sparkles,
} from "lucide-react";
import { ScanabilityQrRecord } from "./types";

interface SelectedQrContextStripProps {
  orgSlug: string;
  qr: ScanabilityQrRecord;
}

export function SelectedQrContextStrip({ orgSlug, qr }: SelectedQrContextStripProps) {
  const ecLevel = qr.design?.errorCorrection || "Q";
  const ecPercent =
    ecLevel === "H" ? "30%" : ecLevel === "Q" ? "25%" : ecLevel === "M" ? "15%" : "7%";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs font-sans">
      {/* QR Identity Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-muted border border-border flex items-center justify-center text-primary shadow-xs">
          <QrCode className="h-5 w-5" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-sm text-foreground truncate">
              {qr.name}
            </span>
            {qr.isDynamic ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold uppercase">
                DYNAMIC &bull; REV {qr.publishedRevision}
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-medium uppercase">
                STATIC
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-medium">
              STATUS: {qr.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-primary font-medium">/{qr.slug}</span>
            <span>&bull;</span>
            <div className="flex items-center gap-1 min-w-0 truncate">
              <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-[11px]">
                {qr.defaultUrl || qr.content}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Badges */}
      <div className="flex items-center flex-wrap gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-[11px] font-mono">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">EC:</span>
          <span className="font-bold text-foreground">
            LEVEL {ecLevel} ({ecPercent})
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-[11px] font-mono">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">MODULE:</span>
          <span className="font-medium text-foreground uppercase">
            {qr.design?.moduleStyle || "SQUARES"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-[11px] font-mono">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">QUIET:</span>
          <span className="font-medium text-foreground">
            {qr.design?.quietZone ?? 4} MOD
          </span>
        </div>

        <Link
          href={`/${orgSlug}/qr/${qr.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline ml-1"
        >
          <span>Edit in Studio</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
