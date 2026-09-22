"use client";

import * as React from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/date-format";

interface ResolutionMarkerProps {
  resolvedBy?: {
    id?: string;
    name: string;
    email?: string;
  } | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  canReopen?: boolean;
  onReopen?: () => void;
  className?: string;
}

export function ResolutionMarker({
  resolvedBy,
  resolvedAt,
  resolutionNote,
  canReopen = false,
  onReopen,
  className = "",
}: ResolutionMarkerProps) {
  const formattedDate = resolvedAt ? formatDateTime(resolvedAt) : null;

  return (
    <div className={`relative pl-8 py-4 ${className}`}>
      {/* Vertical rail node */}
      <div className="absolute left-[13px] top-4 w-3.5 h-3.5 -ml-[7px] rounded-full bg-[#5DB872] flex items-center justify-center text-white ring-4 ring-background">
        <CheckCircle2 className="w-2.5 h-2.5" />
      </div>

      <div className="p-3 rounded-lg border border-[#5DB872]/30 bg-[#5DB872]/5 text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#5DB872] uppercase tracking-wider flex items-center gap-1">
              ✓ RESOLVED
            </span>
            {resolvedBy?.name && (
              <span className="text-muted-foreground">
                by <strong className="text-foreground">{resolvedBy.name}</strong>
              </span>
            )}
          </div>

          {formattedDate && (
            <span className="text-[10px] text-muted-foreground">
              {formattedDate}
            </span>
          )}
        </div>

        {resolutionNote && (
          <p className="text-xs text-foreground/80 font-sans italic pt-1 border-t border-[#5DB872]/15">
            &ldquo;{resolutionNote}&rdquo;
          </p>
        )}

        {canReopen && onReopen && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReopen}
              className="h-6 px-2 text-[11px] font-mono border-border/70 hover:bg-background gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reopen discussion</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
