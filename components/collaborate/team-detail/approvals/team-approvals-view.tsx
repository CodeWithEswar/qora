"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckSquare, ExternalLink, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import type { TeamDetail } from "@/lib/supabase/types/teams";

interface TeamApprovalsViewProps {
  team: TeamDetail;
  orgSlug: string;
}

export function TeamApprovalsView({ team, orgSlug }: TeamApprovalsViewProps) {
  // Scoped approvals for this team's connected resources
  const pendingApprovalsCount = team.dependencies?.pendingApprovalsCount || 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            <span>TEAM</span>
            <span>/</span>
            <span>{team.name}</span>
            <span>/</span>
            <span className="text-primary font-bold">APPROVALS</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Team Governance & Approvals
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Review and govern mission-critical updates to resources connected to {team.name},
            including QR destination switches, campaign launches, and version publishes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="cursor-pointer text-xs font-semibold gap-1.5 h-9 shrink-0 self-start sm:self-auto"
        >
          <Link href={`/${orgSlug}/collaborate/approvals`}>
            <span>Open in Approvals</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Truthful Status Card or List */}
      {pendingApprovalsCount === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-lg bg-surface/50 border border-dashed border-border/80 space-y-4">
          <div className="w-12 h-12 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-foreground">
              NO PENDING TEAM APPROVALS
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All resources connected to {team.name} are currently in a healthy, approved state.
              Any future version publish or destination change requiring dual-custody review will surface here.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer text-xs font-semibold h-8 mt-2"
          >
            <Link href={`/${orgSlug}/collaborate/approvals`}>
              <span>View Workspace Approval Queue</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="p-5 sm:p-6 rounded-lg bg-surface border border-border/80 space-y-4">
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            <span>{pendingApprovalsCount} Action Required</span>
          </div>
          <p className="text-xs text-muted-foreground">
            There are {pendingApprovalsCount} pending approval requests awaiting review for resources connected to {team.name}.
          </p>
          <Button
            size="sm"
            asChild
            className="cursor-pointer text-xs font-semibold"
          >
            <Link href={`/${orgSlug}/collaborate/approvals`}>
              <span>Review in Approvals Hub</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
