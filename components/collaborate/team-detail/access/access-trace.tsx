"use client";

import * as React from "react";
import { ShieldCheck, UserCheck, Layers, ArrowDown, Lock } from "lucide-react";
import type { TeamDetail } from "@/lib/supabase/types/teams";

interface AccessTraceProps {
  team: TeamDetail;
  selectedMemberName?: string;
  selectedMemberRole?: string;
}

export function AccessTrace({
  team,
  selectedMemberName,
  selectedMemberRole = "organization_member",
}: AccessTraceProps) {
  const memberName = selectedMemberName || team.members?.[0]?.displayName || "Team Member";
  const roleName = selectedMemberRole.replace("_", " ").toUpperCase();

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-surface border border-border/70 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
            AUTHORIZATION ORIGIN GRAPH
          </span>
          <h4 className="text-sm font-bold text-foreground font-sans mt-0.5">
            Access Resolution Trace
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
          <Lock className="h-3 w-3 text-amber-500" />
          <span>RBAC ENFORCED</span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 border-l-2 border-border/80 ml-3">
        {/* Node 1: Principal */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              1. PRINCIPAL IDENTITY
            </div>
            <div className="text-xs font-semibold text-foreground flex items-center gap-2 mt-0.5">
              <span>{memberName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                AUTHENTICATED
              </span>
            </div>
          </div>
        </div>

        {/* Node 2: Workspace Membership & Role */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-amber-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              2. WORKSPACE ROLE (PRIMARY SOURCE)
            </div>
            <div className="text-xs font-semibold text-foreground flex items-center gap-2 mt-0.5">
              <span>{roleName}</span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">
                AUTHORITATIVE
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Provides workspace capabilities including QR generation, asset creation, and campaign management according to the organization role.
            </p>
          </div>
        </div>

        {/* Node 3: Team Context */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-indigo-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              3. TEAM OPERATIONAL SCOPE
            </div>
            <div className="text-xs font-semibold text-foreground flex items-center gap-2 mt-0.5">
              <span>{team.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                COLLABORATION UNIT
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Organizes responsibility over {team.connectedWork?.assignments?.length ?? team.connectedWork?.totalCount ?? 0} connected resources.
              Team membership defines collaboration scope; role-based policies determine execution permissions.
            </p>
          </div>
        </div>

        {/* Node 4: Effective Policy Resolution */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-emerald-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              4. TEAM PERMISSION DELTA
            </div>
            <div className="text-xs font-semibold text-emerald-500 font-mono mt-0.5">
              NO ADDITIONAL PERMISSIONS INVENTED
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Teams in NXTQR act as collaboration and governance boundaries, strictly honoring the organization’s authoritative permission registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
