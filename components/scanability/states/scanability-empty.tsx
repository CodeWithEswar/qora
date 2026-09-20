"use client";

import * as React from "react";
import Link from "next/link";
import { Scan, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanabilityEmptyProps {
  orgSlug: string;
}

export function ScanabilityEmpty({ orgSlug }: ScanabilityEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center rounded-3xl border border-dashed border-border bg-card/60 backdrop-blur-xs font-sans">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
        <Scan className="h-8 w-8 text-primary" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span>ENGINEERING VALIDATION LAB</span>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        No QR Codes Found in Organization
      </h3>

      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        The Scanability Lab mathematically validates optical contrast, quiet zone margins, finder eye alignment, and physical print resolutions on active QR assets. Create your first QR code to begin validation.
      </p>

      <div className="flex items-center gap-3">
        <Link href={`/${orgSlug}/qr/new`}>
          <Button className="h-10 px-5 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create New QR Code</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
