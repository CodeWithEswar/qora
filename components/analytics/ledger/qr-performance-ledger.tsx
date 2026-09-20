"use client";

import * as React from "react";
import Link from "next/link";
import { QrCode, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QrPerformanceItem {
  id: string;
  name: string;
  slug: string;
  campaignName: string;
  destination: string;
  totalScans: number;
  uniqueScans: number;
  trend: number;
  status: string;
}

interface QrPerformanceLedgerProps {
  assets?: QrPerformanceItem[];
  orgSlug: string;
  onSelectQr?: (qrId: string) => void;
  className?: string;
}

export function QrPerformanceLedger({
  assets = [],
  orgSlug,
  onSelectQr,
  className,
}: QrPerformanceLedgerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
              QR Performance Ledger
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Top performing published QR assets across active scan telemetry
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            {assets.length} ASSETS
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {assets.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No QR scan telemetry recorded in this period.
            </div>
          ) : (
            assets.slice(0, 8).map((qr, idx) => (
              <div
                key={qr.id}
                onClick={() => onSelectQr?.(qr.id)}
                className="p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10px] text-muted-foreground/60 w-3">
                    0{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate text-xs font-sans">
                        {qr.name}
                      </p>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                        {qr.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-[180px] sm:max-w-[260px]">
                      → {qr.destination}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-right shrink-0">
                  <div>
                    <span className="text-xs font-bold text-foreground tabular-nums block">
                      {qr.totalScans.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {qr.uniqueScans.toLocaleString()} unique
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Open QR Studio"
                  >
                    <Link href={`/${orgSlug}/qr/${qr.id}/analytics`}>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Click asset to filter workspace</span>
        <span>Ranked by Total Scans</span>
      </div>
    </div>
  );
}
