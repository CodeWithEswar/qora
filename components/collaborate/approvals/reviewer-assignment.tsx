"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewerAssignmentProps {
  teamName?: string | null;
  policy: string;
  reviewers: Array<{
    id: string;
    name: string;
    roleName: string;
    avatarUrl?: string | null;
  }>;
  className?: string;
}

export function ReviewerAssignment({
  teamName,
  policy,
  reviewers,
  className,
}: ReviewerAssignmentProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn("space-y-2.5 text-xs font-mono", className)}>
      <div className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center justify-between">
        <span>REVIEW / ASSIGNMENT</span>
        <span className="text-[9px] text-muted-foreground">{policy}</span>
      </div>

      <div className="p-3.5 rounded-lg border border-border/70 bg-card/40 space-y-3">
        {/* Team Node Apex */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20" />
          <span className="text-xs font-semibold text-foreground uppercase">
            {teamName || "Direct Governance Reviewers"}
          </span>
        </div>

        {/* Member Branches */}
        {reviewers && reviewers.length > 0 ? (
          <div className="pl-3 border-l border-border/80 space-y-2 ml-1">
            {reviewers.map((rev, idx) => (
              <div key={rev.id || idx} className="flex items-center gap-2.5 relative">
                {/* Connector hairline */}
                <div className="w-2 border-t border-border/80 -ml-3 select-none" aria-hidden="true" />
                <Avatar className="w-5 h-5 text-[9px] border border-border/60">
                  {rev.avatarUrl && <AvatarImage src={rev.avatarUrl} alt={rev.name} />}
                  <AvatarFallback className="bg-muted text-foreground font-mono">
                    {getInitials(rev.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-foreground font-medium">{rev.name}</span>
                  <span className="text-[10px] text-muted-foreground">({rev.roleName})</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pl-3 text-[11px] text-muted-foreground italic">
            Any authorized organization administrator or manager can review.
          </div>
        )}
      </div>
    </div>
  );
}
