"use client";

import * as React from "react";
import { Shield, ShieldAlert, Key, CheckCircle, Info, Lock, Layers } from "lucide-react";
import type { TeamDetail } from "@/lib/supabase/types/teams";
import { AccessTrace } from "./access-trace";

interface TeamAccessViewProps {
  team: TeamDetail;
}

export function TeamAccessView({ team }: TeamAccessViewProps) {
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | undefined>(
    team.members?.[0]?.membershipId
  );

  const selectedMember = team.members?.find((m) => m.membershipId === selectedMemberId) || team.members?.[0];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="pb-5 border-b border-border/70">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
          <span>TEAM</span>
          <span>/</span>
          <span>{team.name}</span>
          <span>/</span>
          <span className="text-primary font-bold">ACCESS</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Access & Permissions Topology
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
          NXTQR enforces strict tenant and role boundaries. Teams represent operational collaboration scopes,
          while capabilities and permissions originate directly from organization memberships and RBAC policies.
        </p>
      </div>

      {/* Member Selector Strip */}
      {team.members && team.members.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0">
            TRACE FOR:
          </span>
          {team.members.map((member) => {
            const isSelected = (selectedMember?.membershipId || "") === member.membershipId;
            const name = member.displayName || member.email || "Member";
            return (
              <button
                key={member.membershipId}
                type="button"
                onClick={() => setSelectedMemberId(member.membershipId)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "bg-surface border border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span>{name}</span>
                <span className="text-[10px] opacity-75">
                  ({(member.roleName || "member").toUpperCase()})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid: Access Trace & Scoping Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Origin Trace */}
        <AccessTrace
          team={team}
          selectedMemberName={selectedMember?.displayName || selectedMember?.email}
          selectedMemberRole={selectedMember?.roleName}
        />

        {/* Right: Policy & Scope Rules */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-lg bg-surface border border-border/70 space-y-4 font-sans">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
              <Shield className="h-4 w-4" />
              <span>NXTQR Access Invariants</span>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="p-3 rounded-md bg-background/60 border border-border/50 space-y-1">
                <div className="text-foreground font-semibold flex items-center gap-1.5 font-sans">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Tenant Boundary Integrity</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans">
                  Team members cannot access resources outside of this organization, regardless of invitation or team assignment.
                </p>
              </div>

              <div className="p-3 rounded-md bg-background/60 border border-border/50 space-y-1">
                <div className="text-foreground font-semibold flex items-center gap-1.5 font-sans">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Role Primacy (Team != Role)</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans">
                  Adding a user to {team.name} does not elevate their permissions. A viewer in the organization remains a viewer, even if assigned to a core team.
                </p>
              </div>

              <div className="p-3 rounded-md bg-background/60 border border-border/50 space-y-1">
                <div className="text-foreground font-semibold flex items-center gap-1.5 font-sans">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Operational Assignment</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans">
                  Connecting work items ({team.connectedWork?.assignments?.length ?? team.connectedWork?.totalCount ?? 0} active) enables team-scoped filtering, notification routing, and approval pipelines.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/50 flex items-start gap-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-foreground font-sans block">
                Enterprise Policy Integration
              </span>
              <p className="text-[11px] leading-relaxed font-sans">
                Fine-grained permissions and custom RBAC policies are managed globally under Workspace Settings → Roles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
