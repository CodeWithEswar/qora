"use client";

import * as React from "react";
import type { ParticipantItem, ThreadState } from "@/lib/supabase/types/comments";

interface DiscussionTopologyProps {
  participants: ParticipantItem[];
  referenceCount: number;
  state: ThreadState;
  className?: string;
}

export function DiscussionTopology({
  participants,
  referenceCount,
  state,
  className = "",
}: DiscussionTopologyProps) {
  const isResolved = state === "RESOLVED";

  return (
    <div
      className={`p-3 bg-card/60 border border-border/50 rounded-lg flex flex-col gap-2 font-mono text-xs ${className}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
        <span>TOPOLOGY</span>
        <span className={isResolved ? "text-[#5DB872]" : "text-[#CC785C]"}>
          ● {state}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-muted-foreground uppercase">People</span>
          <span className="text-sm font-bold text-foreground">
            {String(participants.length).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase">References</span>
          <span className="text-sm font-bold text-foreground">
            {String(referenceCount).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-muted-foreground uppercase">Lifecycle</span>
          <span
            className={`text-[11px] font-bold mt-0.5 uppercase ${
              isResolved ? "text-[#5DB872]" : "text-foreground"
            }`}
          >
            {state}
          </span>
        </div>
      </div>
    </div>
  );
}
