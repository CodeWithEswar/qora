"use client";

import * as React from "react";
import {
  FolderInput,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QrSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMove: () => void;
  onBulkPause: () => void;
  onBulkResume: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  className?: string;
}

export function QrSelectionBar({
  selectedCount,
  onClearSelection,
  onBulkMove,
  onBulkPause,
  onBulkResume,
  onBulkArchive,
  onBulkDelete,
  onBulkExport,
  className,
}: QrSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/[0.04] dark:bg-primary/[0.08] shadow-xs animate-in fade-in-50 slide-in-from-top-1 duration-150",
        className
      )}
    >
      {/* Accent left indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-[1px] bg-primary animate-pulse" />
          <span className="text-xs font-mono font-bold text-foreground">
            {selectedCount} {selectedCount === 1 ? "QR" : "QRs"} selected
          </span>
        </div>
        <span className="hidden sm:inline-block h-3.5 w-[1px] bg-border/80" />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkMove}
          className="h-7 text-xs gap-1.5 bg-white dark:bg-[#181818] border-border/80 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <FolderInput className="h-3 w-3 text-muted-foreground" />
          <span>Move</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkPause}
          className="h-7 text-xs gap-1.5 bg-white dark:bg-[#181818] border-border/80 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <PauseCircle className="h-3 w-3 text-amber-500" />
          <span>Pause</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkResume}
          className="h-7 text-xs gap-1.5 bg-white dark:bg-[#181818] border-border/80 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <PlayCircle className="h-3 w-3 text-emerald-600" />
          <span>Resume</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkExport}
          className="h-7 text-xs gap-1.5 bg-white dark:bg-[#181818] border-border/80 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <Download className="h-3 w-3 text-muted-foreground" />
          <span>Export</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkArchive}
          className="h-7 text-xs gap-1.5 bg-white dark:bg-[#181818] border-border/80 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <Archive className="h-3 w-3 text-neutral-500" />
          <span>Archive</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="h-7 text-xs gap-1.5 bg-white dark:bg-[#181818] border-border/80 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
          <span>Delete</span>
        </Button>

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
          title="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
