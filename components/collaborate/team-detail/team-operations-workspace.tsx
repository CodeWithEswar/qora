"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { TeamIdentityBar } from "./team-identity-bar";
import { TeamNavigation, TeamViewTab } from "./team-navigation";
import { TeamOverview } from "./team-overview";
import { TeamPeopleView } from "./people/team-people-view";
import { TeamWorkView } from "./work/team-work-view";
import { TeamAccessView } from "./access/team-access-view";
import { TeamApprovalsView } from "./approvals/team-approvals-view";
import { TeamActivityView } from "./activity/team-activity-view";
import { TeamContextDock } from "./team-context-dock";
import { AddTeamMembersDialog } from "./people/add-team-members-dialog";
import { ConnectWorkSheet } from "./work/connect-work-sheet";
import { EditTeamDialog } from "./settings/edit-team-dialog";
import { DeleteTeamAlert } from "./settings/delete-team-alert";
import { TeamCommandPalette } from "./team-command-palette";
import type { TeamDetail, TeamMemberItem } from "@/lib/supabase/types/teams";
import { toast } from "sonner";

interface TeamOperationsWorkspaceProps {
  initialTeam: TeamDetail;
  orgSlug: string;
  canManage?: boolean;
}

export function TeamOperationsWorkspace({
  initialTeam,
  orgSlug,
  canManage = true,
}: TeamOperationsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [team, setTeam] = React.useState<TeamDetail>(initialTeam);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isConnectWorkOpen, setIsConnectWorkOpen] = React.useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = React.useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  // Sync active view with query parameter
  const rawTab = searchParams.get("view");
  const activeTab: TeamViewTab =
    rawTab === "people" ||
    rawTab === "work" ||
    rawTab === "access" ||
    rawTab === "approvals" ||
    rawTab === "activity"
      ? rawTab
      : "overview";

  const handleSelectTab = React.useCallback(
    (tabId: string) => {
      const validTab: TeamViewTab =
        tabId === "people" ||
        tabId === "work" ||
        tabId === "access" ||
        tabId === "approvals" ||
        tabId === "activity"
          ? tabId
          : "overview";

      const params = new URLSearchParams(searchParams.toString());
      if (validTab === "overview") {
        params.delete("view");
      } else {
        params.set("view", validTab);
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Authoritative refresh from backend
  const refreshTeam = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setTeam(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to refresh team:", err);
    }
  }, [orgSlug, team.id]);

  const handleArchiveToggle = async () => {
    try {
      const nextState = team.state === "active" ? "archived" : "active";
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: nextState }),
      });
      if (res.ok) {
        toast.success(`Team state marked as ${nextState}`);
        refreshTeam();
      } else {
        toast.error("Failed to change team status.");
      }
    } catch (err) {
      toast.error("Network error modifying team status.");
    }
  };

  const handleAddMembersToTeam = async (membershipIds: string[]) => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipIds }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || "Failed to add members");
      }
      toast.success(`${membershipIds.length} member(s) added to ${team.name}`);
      await refreshTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to add members");
      throw err;
    }
  };

  const handleRemoveMemberFromTeam = async (member: TeamMemberItem) => {
    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/teams/${team.id}/members?membershipId=${member.membershipId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || "Failed to remove member");
      }
      toast.success(`${member.displayName} removed from ${team.name}`);
      await refreshTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
      throw err;
    }
  };

  const identityBarData = React.useMemo(() => {
    return {
      id: team.id,
      publicId: team.publicId || `TM-${team.id.slice(0, 4).toUpperCase()}`,
      name: team.name,
      description: team.description,
      state: (team.state as "active" | "archived") || "active",
      createdAt: team.createdAt,
      memberCount: team.memberCount || team.members?.length || 0,
      connectedWorkCount: team.connectedWork?.totalCount ?? team.connectedWork?.assignments?.length ?? 0,
    };
  }, [team]);

  return (
    <div className="space-y-5 font-sans pb-12">
      {/* 1. Page Header: Team Identity Bar */}
      <TeamIdentityBar
        team={identityBarData}
        organizationSlug={orgSlug}
        canManage={canManage}
        onAddMemberClick={() => setIsAddMemberOpen(true)}
        onConnectWorkClick={() => setIsConnectWorkOpen(true)}
        onEditTeamClick={() => setIsEditTeamOpen(true)}
        onArchiveToggleClick={handleArchiveToggle}
        onDeleteTeamClick={() => setIsDeleteTeamOpen(true)}
      />

      {/* 2. Team Navigation Command Rail */}
      <TeamNavigation
        activeTab={activeTab}
        onChangeTab={handleSelectTab}
        memberCount={identityBarData.memberCount}
        connectedWorkCount={identityBarData.connectedWorkCount}
        pendingApprovalsCount={team.dependencies?.pendingApprovalsCount || 0}
        activityCount={team.recentActivity?.length || 0}
      />

      {/* 3. Main Operational Surface & Desktop Context Dock */}
      <div className="flex items-start gap-6 pt-1">
        <main className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <TeamOverview
              team={team}
              canManage={canManage}
              onNavigateTab={handleSelectTab}
              onAddMemberClick={() => setIsAddMemberOpen(true)}
              onConnectWorkClick={() => setIsConnectWorkOpen(true)}
            />
          )}

          {activeTab === "people" && (
            <TeamPeopleView
              teamName={team.name}
              teamId={team.id}
              organizationSlug={orgSlug}
              members={team.members || []}
              canManage={canManage}
              onAddMembers={handleAddMembersToTeam}
              onRemoveMember={handleRemoveMemberFromTeam}
            />
          )}

          {activeTab === "work" && (
            <TeamWorkView
              team={team}
              orgSlug={orgSlug}
              canManage={canManage}
              onRefresh={refreshTeam}
            />
          )}

          {activeTab === "access" && <TeamAccessView team={team} />}

          {activeTab === "approvals" && (
            <TeamApprovalsView team={team} orgSlug={orgSlug} />
          )}

          {activeTab === "activity" && <TeamActivityView team={team} />}
        </main>

        {/* Desktop Context Dock for ultra-wide displays (>=1440px) */}
        <TeamContextDock
          teamName={team.name}
          teamId={team.id}
          publicId={identityBarData.publicId}
          memberCount={identityBarData.memberCount}
          workCount={identityBarData.connectedWorkCount}
          activeTab={activeTab}
          canManage={canManage}
          onAddMember={() => setIsAddMemberOpen(true)}
          onConnectWork={() => setIsConnectWorkOpen(true)}
          className="hidden 2xl:block sticky top-24"
        />
      </div>

      {/* 4. Subtask Modals & Drawers */}
      <AddTeamMembersDialog
        isOpen={isAddMemberOpen}
        teamId={team.id}
        teamName={team.name}
        organizationSlug={orgSlug}
        existingMembers={team.members || []}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMembers={handleAddMembersToTeam}
      />

      <ConnectWorkSheet
        isOpen={isConnectWorkOpen}
        teamId={team.id}
        teamName={team.name}
        orgSlug={orgSlug}
        existingAssignments={team.connectedWork?.assignments || []}
        onClose={() => setIsConnectWorkOpen(false)}
        onConnected={refreshTeam}
      />

      <EditTeamDialog
        isOpen={isEditTeamOpen}
        team={team}
        orgSlug={orgSlug}
        onClose={() => setIsEditTeamOpen(false)}
        onUpdated={refreshTeam}
      />

      <DeleteTeamAlert
        isOpen={isDeleteTeamOpen}
        team={team}
        orgSlug={orgSlug}
        onClose={() => setIsDeleteTeamOpen(false)}
      />

      <TeamCommandPalette
        isOpen={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onSelectView={handleSelectTab}
        onAddMembers={() => setIsAddMemberOpen(true)}
        onConnectWork={() => setIsConnectWorkOpen(true)}
        onEditTeam={() => setIsEditTeamOpen(true)}
        onDeleteTeam={() => setIsDeleteTeamOpen(true)}
      />
    </div>
  );
}
