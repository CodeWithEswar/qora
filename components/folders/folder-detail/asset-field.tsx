"use client";

import * as React from "react";
import Link from "next/link";
import { FolderQrAssetV1 } from "@nxtqr/contracts";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface AssetFieldProps {
  assets: FolderQrAssetV1[];
  orgSlug: string;
  folderName: string;
  onAddQr: () => void;
  className?: string;
}

export function AssetField({
  assets,
  orgSlug,
  folderName,
  onAddQr,
  className,
}: AssetFieldProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 dark:border-white/[0.08] p-8 text-center bg-white/40 dark:bg-white/[0.01]">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
          <NxtqrIcon icon="solar:widget-add-linear" size={20} />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          {folderName} is ready for QR assets
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Add existing QR codes from Unfiled or other folders to organize them inside this space.
        </p>
        <button
          onClick={onAddQr}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <NxtqrIcon icon="solar:add-circle-bold" size={14} />
          <span>Add QR Codes</span>
        </button>
      </div>
    );
  }

  // Display organized constellation nodes (capped at 24 to maintain crisp performance)
  const displayNodes = assets.slice(0, 24);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B] p-5 shadow-xs relative overflow-hidden",
        className
      )}
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header Strip */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-4 border-b border-border/40 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ASSET CONSTELLATION</span>
        </span>
        <span>
          Showing {displayNodes.length} of {assets.length} nodes
        </span>
      </div>

      {/* Constellation Field Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayNodes.map((qr, index) => {
          const href = `/${orgSlug}/qr/${qr.id}`;

          return (
            <Link
              key={qr.id}
              href={href}
              className={cn(
                "group relative flex flex-col justify-between p-3 rounded-lg border transition-all duration-150",
                "bg-neutral-50/80 dark:bg-white/[0.02] border-border/60 dark:border-white/[0.06]",
                "hover:border-primary/50 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-xs",
                "hover:-translate-y-0.5"
              )}
            >
              {/* Corner Coordinate */}
              <span className="absolute top-1.5 right-2 font-mono text-[9px] text-muted-foreground/40 group-hover:text-primary transition-colors">
                #{String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex items-start gap-2 min-w-0 pr-4">
                <span className="text-base shrink-0 font-mono text-primary/80 group-hover:text-primary">
                  ▦
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {qr.name}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/70 truncate">
                    /{qr.slug}
                  </div>
                </div>
              </div>

              {/* Destination preview */}
              {qr.destinationUrl ? (
                <div className="text-[11px] text-muted-foreground/80 truncate mt-2 font-mono">
                  → {qr.destinationUrl.replace(/^https?:\/\//, "")}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground/50 italic mt-2 font-mono">
                  No destination configured
                </div>
              )}

              {/* Status & Scan counter */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1 py-0 uppercase tracking-wider",
                    qr.status === "ACTIVE"
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {qr.status}
                </Badge>
                <span>{qr.totalScans} scans</span>
              </div>
            </Link>
          );
        })}
      </div>

      {assets.length > 24 && (
        <div className="relative z-10 text-center pt-4 text-xs text-muted-foreground font-mono">
          + {assets.length - 24} additional QR assets organized in this space. Switch to the QR Assets table for full directory.
        </div>
      )}
    </div>
  );
}
