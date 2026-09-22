"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TeamAccessDomain, AccessDomainLevel } from "@/lib/supabase/types/teams";
import { Button } from "@/components/ui/button";

interface TeamAccessFootprintProps {
  accessDomains: TeamAccessDomain[];
  onManageAccessClick?: () => void;
  canManage?: boolean;
  className?: string;
}

const LEVEL_CONFIG: Record<
  AccessDomainLevel,
  { label: string; width: string; dot: string; textColor: string; barColor: string }
> = {
  FULL: {
    label: "FULL",
    width: "100%",
    dot: "●",
    textColor: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-500",
  },
  MANAGE: {
    label: "MANAGE",
    width: "70%",
    dot: "●",
    textColor: "text-primary",
    barColor: "bg-primary",
  },
  VIEW: {
    label: "VIEW",
    width: "40%",
    dot: "◐",
    textColor: "text-teal-600 dark:text-teal-400",
    barColor: "bg-teal-500",
  },
  NONE: {
    label: "NONE",
    width: "0%",
    dot: "○",
    textColor: "text-muted-foreground",
    barColor: "bg-muted",
  },
};

/**
 * NXTQR Team Access Footprint — Signature Concept #3
 * Visual reaching rails demonstrating the factual operational capabilities
 * granted or derived through team collaboration.
 */
export function TeamAccessFootprint({
  accessDomains,
  onManageAccessClick,
  canManage = true,
  className,
}: TeamAccessFootprintProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface/70 p-4 font-mono text-xs select-none shadow-xs space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
          ACCESS / FOOTPRINT
        </span>
        {canManage && onManageAccessClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageAccessClick}
            className="h-6 text-[11px] font-mono text-primary hover:text-primary/90 px-2 cursor-pointer"
          >
            Manage access →
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {accessDomains.map((ad) => {
          const cfg = LEVEL_CONFIG[ad.level] || LEVEL_CONFIG.NONE;

          return (
            <div key={ad.domain} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground uppercase">{ad.domain}</span>
                <span className={cn("font-bold text-[10px]", cfg.textColor)}>
                  {cfg.dot} {cfg.label}
                </span>
              </div>

              {/* Progress Reach Rail */}
              <div className="w-full h-1.5 bg-border/60 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", cfg.barColor)}
                  style={{ width: cfg.width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
