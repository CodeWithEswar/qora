"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ResourcePulseSegment } from "@/lib/supabase/types/activity";

interface ResourcePulseProps {
  segments: ResourcePulseSegment[];
  onSelectResource?: (resourceType: string) => void;
  className?: string;
}

export function ResourcePulse({
  segments,
  onSelectResource,
  className,
}: ResourcePulseProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Resource Pulse"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            03 / RESOURCE PULSE
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Operational activity volume by resource type
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          QR-Module Rails
        </span>
      </div>

      {segments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          No resource events found in this period.
        </div>
      ) : (
        <div className="space-y-2.5">
          {segments.map((seg) => {
            const blockCount = Math.max(1, Math.min(20, Math.round(seg.percentage / 5)));
            return (
              <div
                key={seg.resourceType}
                onClick={() => onSelectResource?.(seg.resourceType)}
                className={cn(
                  "p-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors",
                  onSelectResource && "cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground uppercase tracking-wider">
                      {seg.label}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      ({seg.distinctResourceCount} {seg.distinctResourceCount === 1 ? "asset" : "assets"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FA520F] font-bold">{pad(seg.eventCount)} events</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-muted-foreground">{seg.percentage}%</span>
                  </div>
                </div>

                {/* QR-Module Segmented Rail */}
                <div className="flex items-center gap-1 overflow-hidden" aria-hidden="true">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-full rounded-2xs transition-all duration-200",
                        i < blockCount
                          ? "bg-[#FA520F] shadow-2xs"
                          : "bg-muted/40"
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
