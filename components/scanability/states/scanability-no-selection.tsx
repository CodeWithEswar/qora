"use client";

import * as React from "react";
import { Scan, Search, ArrowRight, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanabilityQrRecord } from "../types";

interface ScanabilityNoSelectionProps {
  qrs: ScanabilityQrRecord[];
  onSelectQr: (qr: ScanabilityQrRecord) => void;
  onOpenSelectDialog: () => void;
}

export function ScanabilityNoSelection({
  qrs,
  onSelectQr,
  onOpenSelectDialog,
}: ScanabilityNoSelectionProps) {
  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col items-center justify-center p-10 text-center rounded-3xl border border-dashed border-border bg-card/40 backdrop-blur-xs">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 shadow-sm">
          <Scan className="h-7 w-7 text-primary" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
          Select a QR Code to Inspect
        </h3>

        <p className="text-sm text-muted-foreground max-w-lg mb-6 leading-relaxed">
          Select any active QR code from your organization to inspect its module geometry, optical contrast, quiet zone margins, finder patterns, and physical print readiness.
        </p>

        <Button
          onClick={onOpenSelectDialog}
          className="h-10 px-5 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Search className="h-4 w-4" />
          <span>Browse All QR Codes ({qrs.length})</span>
        </Button>
      </div>

      {qrs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              RECENT QR ASSETS READY FOR VALIDATION
            </h4>
            <span className="text-xs font-mono text-muted-foreground">
              {qrs.length} AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {qrs.slice(0, 6).map((qr) => (
              <button
                key={qr.id}
                onClick={() => onSelectQr(qr)}
                className="group relative flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-accent/5 transition-all text-left shadow-xs"
              >
                <div className="h-10 w-10 shrink-0 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                  <QrCode className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {qr.name}
                    </span>
                    {qr.isDynamic && (
                      <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                        DYN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    /{qr.slug}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
