"use client";

import * as React from "react";
import { TeamCircuit } from "./team-circuit";
import { TeamLens, TeamLensType } from "./team-lens";
import { TeamPulseStrip } from "./team-pulse-strip";
import { TeamPeoplePreview } from "./team-people-preview";
import { TeamWorkPreview } from "./team-work-preview";
import { TeamAccessPreview } from "./team-access-preview";
import { TeamGovernancePreview } from "./team-governance-preview";
import type { TeamDetail } from "@/lib/supabase/types/teams";

interface TeamOverviewProps {
  team: TeamDetail;
  canManage?: boolean;
  onNavigateTab: (tab: string) => void;
  onAddMemberClick: () => void;
  onConnectWorkClick: () => void;
}

export function TeamOverview({
  team,
  canManage = true,
  onNavigateTab,
  onAddMemberClick,
  onConnectWorkClick,
}: TeamOverviewProps) {
  const [activeLens, setActiveLens] = React.useState<TeamLensType>("all");

  return (
    <div className="space-y-6">
      {/* Circuit Header with Team Lens Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary font-mono">
              COLLABORATION CIRCUIT
            </span>
            <span className="text-border text-xs hidden sm:inline">│</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline font-sans">
              Interactive Relationship Topography
            </span>
          </div>

          <TeamLens activeLens={activeLens} onChangeLens={setActiveLens} />
        </div>

        {/* Signature Interactive Hero: Team Circuit */}
        <TeamCircuit
          teamName={team.name}
          teamId={team.id}
          memberCount={team.memberCount}
          workCount={team.connectedWork.totalCount}
          accessDomainsCount={team.accessDomains.length}
          pendingApprovalsCount={team.dependencies.pendingApprovalsCount || 0}
          activeLens={activeLens}
          onNavigateTab={onNavigateTab}
        />

        {/* Thin Factual Telemetry Rail */}
        <TeamPulseStrip
          memberCount={team.memberCount}
          connectedWorkCount={team.connectedWork.totalCount}
          pendingApprovalsCount={team.dependencies.pendingApprovalsCount || 0}
          isArchived={team.state === "archived"}
        />
      </div>

      {/* Connected Operating Canvas: 2x2 Continuous Surface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module 1: People */}
        <TeamPeoplePreview
          members={team.members}
          memberCount={team.memberCount}
          canManage={canManage}
          onManagePeopleClick={() => onNavigateTab("people")}
          onAddMemberClick={onAddMemberClick}
        />

        {/* Module 2: Connected Work */}
        <TeamWorkPreview
          connectedWork={team.connectedWork}
          teamName={team.name}
          canManage={canManage}
          onManageWorkClick={() => onNavigateTab("work")}
          onConnectWorkClick={onConnectWorkClick}
        />

        {/* Module 3: Access Path */}
        <TeamAccessPreview
          accessDomains={team.accessDomains}
          teamName={team.name}
          onInspectAccessClick={() => onNavigateTab("access")}
        />

        {/* Module 4: Governance & Activity */}
        <TeamGovernancePreview
          recentActivity={team.recentActivity}
          pendingApprovalsCount={team.dependencies.pendingApprovalsCount || 0}
          onViewActivityClick={() => onNavigateTab("activity")}
          onViewApprovalsClick={() => onNavigateTab("approvals")}
        />
      </div>
    </div>
  );
}
