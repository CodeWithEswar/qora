"use client";

import * as React from "react";
import { ArrowRight, FileCheck2, Activity, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TeamGovernancePreviewProps {
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata: any;
    createdAt: string;
  }>;
  pendingApprovalsCount?: number;
  onViewActivityClick: () => void;
  onViewApprovalsClick: () => void;
  className?: string;
}

export function TeamGovernancePreview({
  recentActivity,
  pendingApprovalsCount = 0,
  onViewActivityClick,
  onViewApprovalsClick,
  className,
}: TeamGovernancePreviewProps) {
  const displayActivity = recentActivity.slice(0, 3);

  const formatAction = (action: string) => {
    switch (action) {
      case "team.created":
        return "Team created in workspace";
      case "team.members_updated":
        return "Team membership updated";
      case "team.resource_connected":
        return "Resource connected to team";
      case "team.resource_disconnected":
        return "Resource disconnected";
      case "team.updated":
        return "Team metadata updated";
      default:
        return action.replace("team.", "").replace(/_/g, " ");
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-surface/60 p-4 sm:p-5 font-mono flex flex-col justify-between space-y-4 shadow-xs",
        className
      )}
    >
      <div className="space-y-3">
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              GOVERNANCE & ACTIVITY
            </span>
          </div>
          <button
            type="button"
            onClick={onViewActivityClick}
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-semibold"
          >
            <span>Activity ledger</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Governance Approvals Snapshot */}
        <div className="p-3 rounded-md bg-surface/80 border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground font-sans block">
                {pendingApprovalsCount > 0
                  ? `${pendingApprovalsCount} Pending Approval`
                  : "No Pending Governance Actions"}
              </span>
              <span className="text-[10px] text-muted-foreground block font-mono">
                {pendingApprovalsCount > 0
                  ? "Requires team or supervisor signoff"
                  : "All operational changes are synchronized"}
              </span>
            </div>
          </div>
          {pendingApprovalsCount > 0 && (
            <button
              type="button"
              onClick={onViewApprovalsClick}
              className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
            >
              Review →
            </button>
          )}
        </div>

        {/* Real Audit History Trail */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">
            RECENT TEAM EVENTS
          </span>
          {displayActivity.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground text-xs font-sans">
              No recent activity recorded for this team.
            </div>
          ) : (
            displayActivity.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-2 rounded-md bg-surface/80 border border-border/40 text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                  <span className="text-foreground font-medium truncate font-sans">
                    {formatAction(event.action)}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                  {formatDate(event.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Signal */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>AUDIT EVIDENCE: IMMUTABLE</span>
        <span className="text-foreground font-bold">TAMPER RESISTANT</span>
      </div>
    </div>
  );
}
