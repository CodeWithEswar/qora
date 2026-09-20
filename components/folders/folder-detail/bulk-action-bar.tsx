"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface BulkActionBarProps {
  selectedCount: number;
  onMove: () => void;
  onRemove: () => void;
  onClear: () => void;
  isUnfiled: boolean;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onMove,
  onRemove,
  onClear,
  isUnfiled,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50",
        "flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-2xl shadow-xl",
        "bg-neutral-900/95 text-white dark:bg-[#18181B]/95 backdrop-blur-md border border-white/15",
        "animate-in fade-in slide-in-from-bottom-4 duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2 pl-2 pr-1 text-xs font-mono">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>
          <strong className="font-semibold text-white">{selectedCount}</strong>{" "}
          {selectedCount === 1 ? "asset" : "assets"} selected
        </span>
      </div>

      <div className="h-4 w-px bg-white/20" />

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          onClick={onMove}
          className="h-8 text-xs gap-1.5 bg-white/10 hover:bg-white/20 text-white border-0 cursor-pointer"
        >
          <NxtqrIcon icon="solar:folder-linear" size={14} />
          <span>Move to Folder...</span>
        </Button>

        {!isUnfiled && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onRemove}
            className="h-8 text-xs gap-1.5 bg-white/10 hover:bg-white/20 text-white border-0 cursor-pointer"
          >
            <NxtqrIcon icon="solar:folder-error-linear" size={14} />
            <span>Move to Unfiled</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
          aria-label="Clear selection"
        >
          <NxtqrIcon icon="solar:close-circle-bold" size={16} />
        </Button>
      </div>
    </div>
  );
}
