"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChangeTopologyItem, ChangeTopologyCategory } from "@/lib/supabase/types/approvals";

interface ChangeTopologyProps {
  targetRevisionNumber: number;
  topology: ChangeTopologyItem[];
  selectedCategory?: ChangeTopologyCategory | "ALL";
  onSelectCategory?: (cat: ChangeTopologyCategory | "ALL") => void;
  className?: string;
}

export function ChangeTopology({
  targetRevisionNumber,
  topology,
  selectedCategory = "ALL",
  onSelectCategory,
  className,
}: ChangeTopologyProps) {
  return (
    <div className={cn("p-4 rounded-xl border border-border/70 bg-card/40 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
          <span>CHANGE TOPOLOGY</span>
          <span className="text-border">/</span>
          <span className="text-foreground">REVISION {targetRevisionNumber}</span>
        </div>
        {selectedCategory !== "ALL" && onSelectCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory("ALL")}
            className="text-[10px] font-mono text-primary hover:underline"
          >
            Show all categories
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {topology.map((item) => {
          const isSelected = selectedCategory === item.category;
          const isModified = item.changeCount > 0;

          return (
            <button
              key={item.category}
              type="button"
              onClick={() => onSelectCategory?.(isSelected ? "ALL" : item.category)}
              className={cn(
                "p-2.5 rounded-lg border text-left transition-all font-mono flex flex-col justify-between gap-1 cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {item.category}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded",
                    isModified
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground/80"
                  )}
                >
                  {isModified ? `${item.changeCount}` : "0"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                <span className="text-foreground/80 truncate">{item.label}</span>
                <span className={cn("text-[9px] font-semibold", isModified ? "text-primary" : "text-muted-foreground/60")}>
                  {isModified ? `${item.changeCount} changes` : "unchanged"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
