"use client";

import * as React from "react";
import type { ThreadContextType } from "@/lib/supabase/types/comments";

interface ContextRelationshipRailProps {
  contextType: ThreadContextType;
  contextRef: string;
  peopleCount: number;
  commentCount: number;
  className?: string;
}

const CONTEXT_SHORT_LABELS: Record<string, string> = {
  qr: "QR IDENTITY",
  qr_code: "QR IDENTITY",
  approval: "APPROVAL",
  team: "TEAM",
  member: "MEMBER",
  vehicle: "QR ASSET",
  order: "BATCH ORDER",
  campaign: "CAMPAIGN",
  route: "ROUTE",
  incident: "STATUS",
  status_incident: "STATUS",
  journal: "JOURNAL",
  journal_article: "JOURNAL",
};

export function ContextRelationshipRail({
  contextType,
  contextRef,
  peopleCount,
  commentCount,
  className = "",
}: ContextRelationshipRailProps) {
  const contextLabel = CONTEXT_SHORT_LABELS[contextType] || contextType.toUpperCase();

  const srText = `This discussion is attached to ${contextLabel} ${contextRef} and contains ${commentCount} comment${
    commentCount === 1 ? "" : "s"
  } from ${peopleCount} participant${peopleCount === 1 ? "" : "s"}.`;

  return (
    <div
      className={`py-2 px-1 text-xs font-mono text-muted-foreground flex items-center gap-2 overflow-x-auto select-none no-scrollbar ${className}`}
      role="region"
      aria-label="Thread Relationship Topology"
    >
      <span className="sr-only">{srText}</span>

      {/* Node 1: Object Context */}
      <div className="flex items-center gap-1.5 shrink-0 text-foreground font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-[#CC785C]" aria-hidden="true" />
        <span className="text-[11px] tracking-wide uppercase">{contextLabel}</span>
      </div>

      {/* Rail */}
      <div className="w-5 h-[1px] bg-border/80 shrink-0" aria-hidden="true" />

      {/* Node 2: Thread */}
      <div className="flex items-center gap-1.5 shrink-0 text-foreground/90 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
        <span className="text-[11px] tracking-wide uppercase">THREAD</span>
      </div>

      {/* Rail */}
      <div className="w-5 h-[1px] bg-border/80 shrink-0" aria-hidden="true" />

      {/* Node 3: People */}
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
        <span className="text-[11px] tracking-wide">
          {peopleCount} {peopleCount === 1 ? "PERSON" : "PEOPLE"}
        </span>
      </div>

      {/* Rail */}
      <div className="w-5 h-[1px] bg-border/80 shrink-0" aria-hidden="true" />

      {/* Node 4: Comments */}
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
        <span className="text-[11px] tracking-wide">
          {commentCount} {commentCount === 1 ? "COMMENT" : "COMMENTS"}
        </span>
      </div>
    </div>
  );
}
