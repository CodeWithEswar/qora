"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CANONICAL_COMMENT_CONTEXTS } from "@/lib/supabase/types/comments";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface CommentsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stateFilter: string;
  onStateFilterChange: (state: string) => void;
  domainFilter: string;
  onDomainFilterChange: (domain: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onClearAll: () => void;
  matchingCount: number;
}

export function CommentsFilterSheet({
  open,
  onOpenChange,
  stateFilter,
  onStateFilterChange,
  domainFilter,
  onDomainFilterChange,
  sort,
  onSortChange,
  onClearAll,
  matchingCount,
}: CommentsFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-background text-foreground font-mono text-xs">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-1 text-left">
            <div className="text-[10px] uppercase tracking-widest text-[#FA520F] flex items-center gap-1.5 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>DISCUSSIONS / FILTERS</span>
            </div>
            <SheetTitle className="text-base font-bold font-sans">
              Filter Discussions
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground font-sans">
              Filter conversations by lifecycle status, resource category, and activity.
            </SheetDescription>
          </SheetHeader>

          {/* Section 1: Lifecycle State */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              01 / Lifecycle State
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: "All States" },
                { id: "OPEN", label: "Open Only" },
                { id: "RESOLVED", label: "Resolved" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onStateFilterChange(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    stateFilter === item.id
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-semibold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Resource Scope */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              02 / Resource Scope
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onDomainFilterChange("all")}
                className={`p-2 rounded-lg border text-left text-xs font-mono transition-colors ${
                  domainFilter === "all"
                    ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-bold"
                    : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                All Resources
              </button>
              {CANONICAL_COMMENT_CONTEXTS.map((ctx) => (
                <button
                  key={ctx.type}
                  type="button"
                  onClick={() => onDomainFilterChange(ctx.type)}
                  className={`p-2 rounded-lg border text-left text-xs font-mono transition-colors ${
                    domainFilter === ctx.type
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-bold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {ctx.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Sorting */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              03 / Sort Order
            </Label>
            <div className="space-y-2">
              {[
                { id: "latest_activity", label: "Latest Activity (Default)" },
                { id: "oldest_activity", label: "Oldest Activity" },
                { id: "most_comments", label: "Most Replies" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSortChange(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    sort === item.id
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-semibold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs font-mono text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-mono bg-[#FA520F] text-white hover:bg-[#FA520F]/90 px-4"
          >
            Show {matchingCount} {matchingCount === 1 ? "Discussion" : "Discussions"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
