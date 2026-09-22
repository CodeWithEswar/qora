"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface BulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onOpenBulkCampaign: () => void;
  onOpenBulkFolder: () => void;
  onRevalidate: () => void;
  onOpenBulkDelete: () => void;
}

export function BulkSelectionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onOpenBulkCampaign,
  onOpenBulkFolder,
  onRevalidate,
  onOpenBulkDelete,
}: BulkSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto">
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl border border-white/20 bg-neutral-900/95 backdrop-blur-xl shadow-2xl shadow-black/80 text-white">
        {/* Counter */}
        <div className="flex items-center gap-2 pr-2 sm:border-r border-white/10">
          <div className="w-5 h-5 rounded bg-orange-500 text-white text-[11px] font-bold font-mono flex items-center justify-center">
            {selectedCount}
          </div>
          <span className="text-xs font-mono font-medium text-neutral-200">
            Selected
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-[11px] text-neutral-400 hover:text-white underline ml-1"
          >
            Clear
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onOpenBulkCampaign}
            className="h-8 text-xs text-neutral-300 hover:text-white hover:bg-white/10"
          >
            <Icon icon="lucide:flag" className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
            Campaign
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onOpenBulkFolder}
            className="h-8 text-xs text-neutral-300 hover:text-white hover:bg-white/10"
          >
            <Icon icon="lucide:folder" className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
            Folder
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onRevalidate}
            className="h-8 text-xs text-neutral-300 hover:text-white hover:bg-white/10"
          >
            <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
            Revalidate
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onOpenBulkDelete}
            className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5 mr-1.5" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
