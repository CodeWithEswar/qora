"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface UnfiledTileProps {
  unfiledQrsCount: number;
  orgSlug: string;
  className?: string;
}

export function UnfiledTile({
  unfiledQrsCount,
  orgSlug,
  className,
}: UnfiledTileProps) {
  const href = `/${orgSlug}/folders/unfiled`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-200",
        "border-2 border-dashed border-border/80 dark:border-white/15",
        "bg-neutral-50/50 dark:bg-white/[0.02] hover:bg-neutral-100/60 dark:hover:bg-white/[0.04]",
        "hover:border-primary/50 dark:hover:border-primary/50",
        "hover:-translate-y-0.5",
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0 bg-muted/60 dark:bg-white/[0.06] text-muted-foreground transition-transform duration-150 group-hover:scale-105">
              <span aria-hidden="true">📂</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  Unfiled
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-muted/60 dark:bg-white/[0.08] text-muted-foreground">
                  Default Space
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground/80 mt-0.5">
                Zero folder assignment
              </p>
            </div>
          </div>

          <NxtqrIcon
            icon="solar:arrow-right-linear"
            size={16}
            className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
          />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground/80 mt-2 min-h-[32px]">
          QR assets not assigned to a focused space. Kept safe and fully functional without disruption.
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-dashed border-border/60 dark:border-white/10 flex items-center justify-between gap-2 mt-2">
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[11px] font-medium h-5 px-1.5 transition-colors border-dashed",
            unfiledQrsCount > 0
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-muted/40 text-muted-foreground border-border/60"
          )}
        >
          {unfiledQrsCount} {unfiledQrsCount === 1 ? "unfiled QR" : "unfiled QRs"}
        </Badge>

        <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1 group-hover:text-foreground transition-colors">
          Browse Unfiled →
        </span>
      </div>
    </Link>
  );
}
