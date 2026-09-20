"use client";

import * as React from "react";
import Link from "next/link";
import {
  Scan,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanabilityQrRecord } from "./types";

interface ScanabilityPageHeaderProps {
  orgSlug: string;
  selectedQr: ScanabilityQrRecord | null;
  onOpenSelectDialog: () => void;
  onRecalculate: () => void;
  isEvaluating?: boolean;
}

export function ScanabilityPageHeader({
  orgSlug,
  selectedQr,
  onOpenSelectDialog,
  onRecalculate,
  isEvaluating,
}: ScanabilityPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border font-sans">
      <div className="space-y-1.5">
        {/* Breadcrumb / Tag */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <span>INTELLIGENCE</span>
          <span>/</span>
          <span className="text-foreground font-semibold">SCANABILITY LAB</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>ISO/IEC 18004</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <Scan className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              QR Engineering Validation Lab
            </h1>
            <p className="text-xs text-muted-foreground">
              Physical, optical, and mathematical validation for publication and print readiness.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* QR Switcher Button */}
        <Button
          variant="outline"
          onClick={onOpenSelectDialog}
          className="h-9 px-3 text-xs font-medium border-border bg-card hover:bg-accent/10 flex items-center gap-2 rounded-xl shadow-xs"
        >
          <span className="text-muted-foreground font-mono">QR:</span>
          <span className="font-semibold text-foreground max-w-[140px] truncate">
            {selectedQr ? selectedQr.name : "Select QR"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>

        {/* Re-calculate */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRecalculate}
          disabled={!selectedQr || isEvaluating}
          className="h-9 px-3 text-xs font-medium border-border bg-card hover:bg-accent/10 gap-1.5 rounded-xl shadow-xs"
          title="Re-run optical and geometry diagnostics"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isEvaluating ? "animate-spin text-primary" : "text-muted-foreground"}`} />
          <span className="hidden sm:inline">Recalculate</span>
        </Button>

        {/* Open in Studio */}
        {selectedQr && (
          <Link href={`/${orgSlug}/qr/${selectedQr.id}`} target="_blank">
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 rounded-xl shadow-xs"
            >
              <span>Open Studio</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
