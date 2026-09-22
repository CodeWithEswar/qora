"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Users, Shield, Trash2, X } from "lucide-react";

interface BulkMemberCommandBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAssignTeam: () => void;
  onChangeRole: () => void;
  onRemove: () => void;
  canManage?: boolean;
}

/**
 * Bulk Member Command Bar — Contextual floating rail when members are selected.
 * Responsive: Floats above bottom edge on desktop, sticky command footer on mobile.
 */
export function BulkMemberCommandBar({
  selectedCount,
  onClearSelection,
  onAssignTeam,
  onChangeRole,
  onRemove,
  canManage = true,
}: BulkMemberCommandBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
      role="toolbar"
      aria-label="Bulk Member Actions"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-foreground text-background dark:bg-zinc-900 dark:text-zinc-100 border border-border shadow-2xl backdrop-blur-md font-mono text-xs select-none">
        {/* Selection Count Pill */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FA520F] animate-pulse" />
          <span className="font-bold text-xs">
            {selectedCount} {selectedCount === 1 ? "MEMBER" : "MEMBERS"} SELECTED
          </span>
        </div>

        {/* Action Commands */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAssignTeam}
                className="h-8 px-2.5 text-xs text-background dark:text-zinc-100 hover:bg-background/20 dark:hover:bg-zinc-800 gap-1.5 cursor-pointer font-mono"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Assign team</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onChangeRole}
                className="h-8 px-2.5 text-xs text-background dark:text-zinc-100 hover:bg-background/20 dark:hover:bg-zinc-800 gap-1.5 cursor-pointer font-mono"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change role</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 px-2.5 text-xs text-rose-400 hover:bg-rose-500/20 gap-1.5 cursor-pointer font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </>
          )}

          <div className="w-[1px] h-4 bg-border/40 mx-1" aria-hidden="true" />

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-7 w-7 text-muted-foreground hover:text-background dark:hover:text-zinc-100"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
