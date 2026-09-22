"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ReviewPolicy } from "@/lib/supabase/types/approvals";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Users, ArrowRight, ShieldCheck } from "lucide-react";

interface ReviewerPathProps {
  requesterName: string;
  requesterAvatarUrl?: string | null;
  policy: ReviewPolicy;
  assignedTeamName?: string | null;
  reviewers?: Array<{
    id: string;
    name: string;
    roleName: string;
    avatarUrl?: string | null;
    hasDecided?: boolean;
    decision?: string;
  }>;
  status: string;
  className?: string;
}

export function ReviewerPath({
  requesterName,
  requesterAvatarUrl,
  policy,
  assignedTeamName,
  reviewers = [],
  status,
  className,
}: ReviewerPathProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const completedDecisions = reviewers.filter((r) => r.hasDecided).length;
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";

  return (
    <div className={cn("p-5 rounded-xl border border-border/70 bg-card/40 font-mono space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="text-[10px] text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          GOVERNANCE & REVIEWER TOPOLOGY
        </div>
        <Badge variant="outline" className="text-[10px] font-mono uppercase">
          Policy: {policy.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Path Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative pt-2">
        {/* Step 1: Requester */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-muted-foreground font-bold">1. REQUESTER</span>
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage src={requesterAvatarUrl || undefined} />
              <AvatarFallback className="text-[10px]">{getInitials(requesterName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{requesterName}</div>
              <div className="text-[10px] text-muted-foreground">Original Author</div>
            </div>
          </div>
        </div>

        {/* Step 2: Policy */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-muted-foreground font-bold">2. REVIEW POLICY</span>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">
              {assignedTeamName ? `Team: ${assignedTeamName}` : "Any Authorized Operator"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {policy === "TWO_OF_THREE" ? "Requires 2 unanimous decisions" : "Requires 1 authorized approval"}
            </div>
          </div>
        </div>

        {/* Step 3: Reviewers */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">3. REVIEWERS</span>
            <span className="text-[10px] text-primary font-bold">
              {completedDecisions}/{Math.max(reviewers.length, 1)} Completed
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {reviewers.length === 0 ? (
              <span className="text-xs text-muted-foreground">All org reviewers eligible</span>
            ) : (
              reviewers.map((rev) => (
                <div key={rev.id} className="relative group" title={`${rev.name} (${rev.decision || "Pending"})`}>
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage src={rev.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px]">{getInitials(rev.name)}</AvatarFallback>
                  </Avatar>
                  {rev.hasDecided && (
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-background flex items-center justify-center">
                      <CheckCircle2 className="w-2 h-2 text-white" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Step 4: Decision Gate */}
        <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-muted-foreground font-bold">4. OUTCOME GATE</span>
          <div className="space-y-1">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {isApproved ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : isRejected ? (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              )}
              <span>{isApproved ? "Approved & Applied" : isRejected ? "Rejected" : "Pending Review"}</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {isApproved ? "Edge snapshot compiled" : "Awaiting authoritative signature"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
