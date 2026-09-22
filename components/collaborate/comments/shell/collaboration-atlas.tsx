"use client";

import * as React from "react";
import type { CollaborationAtlasMetrics } from "@/lib/supabase/types/comments";
import { cn } from "@/lib/utils";

interface CollaborationAtlasProps {
  metrics?: CollaborationAtlasMetrics;
  atlas?: CollaborationAtlasMetrics;
  selectedDomain?: string | null;
  onSelectDomain: (domain: string | null) => void;
  className?: string;
}

export function CollaborationAtlas({
  metrics,
  atlas,
  selectedDomain,
  onSelectDomain,
  className,
}: CollaborationAtlasProps) {
  const pad = (n?: number | null) => (n ?? 0).toString().padStart(2, "0");
  const data = atlas || metrics;
  const domains = Array.isArray(data?.domainBreakdown) ? data.domainBreakdown : [];

  if (!data || domains.length === 0) {
    return null;
  }

  return (
    <div className={cn("p-4 rounded-xl border border-border/80 bg-card/40 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
          <span>COLLABORATION</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-semibold">ATLAS</span>
        </div>
        <button
          onClick={() => onSelectDomain("all")}
          className={cn(
            "text-[10px] font-mono tracking-wider transition-colors",
            selectedDomain === "all"
              ? "text-[#CC785C] font-semibold underline underline-offset-4"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          SHOW ALL CONTEXTS ({pad(data?.totalThreads ?? 0)})
        </button>
      </div>

      {/* Desktop Tree Representation */}
      <div className="hidden sm:flex flex-col items-center py-2">
        {/* Apex Node */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            DISCUSSIONS
          </div>
          <div className="h-2 w-2 rounded-full bg-foreground my-1 ring-4 ring-muted/50" />
          <div className="h-3 w-px bg-border" />
        </div>

        {/* Horizontal Rail */}
        <div className="relative w-full max-w-lg">
          <div className="absolute top-0 left-6 right-6 h-px bg-border" />

          {/* Child Branches */}
          <div className="flex items-start justify-between pt-3">
            {domains.map((item) => {
              const isSelected = selectedDomain === item.contextType;
              return (
                <button
                  key={item.contextType}
                  onClick={() => onSelectDomain(isSelected ? "all" : item.contextType)}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className="h-2.5 w-px bg-border group-hover:bg-foreground/40 transition-colors" />
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full my-1 transition-all",
                      isSelected
                        ? "bg-[#CC785C] ring-4 ring-[#CC785C]/20 scale-125"
                        : "bg-muted-foreground/60 group-hover:bg-foreground"
                    )}
                  />
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors pt-0.5">
                    {item.domain}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-mono font-semibold transition-colors",
                      isSelected ? "text-[#CC785C]" : "text-foreground"
                    )}
                  >
                    {pad(item.count)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Vertical Representation */}
      <div className="sm:hidden space-y-1.5 pt-1">
        <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-foreground" />
          <span>DISCUSSIONS ({pad(data?.totalThreads ?? 0)})</span>
        </div>
        <div className="border-l border-border pl-3 ml-1 space-y-1">
          {domains.map((item) => {
            const isSelected = selectedDomain === item.contextType;
            return (
              <button
                key={item.contextType}
                onClick={() => onSelectDomain(isSelected ? "all" : item.contextType)}
                className={cn(
                  "flex items-center justify-between w-full py-1 text-xs font-mono text-left transition-colors",
                  isSelected ? "text-[#CC785C] font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isSelected ? "bg-[#CC785C]" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className="uppercase">{item.domain}</span>
                </div>
                <span>{pad(item.count)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
