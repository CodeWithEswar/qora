"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TeamSignalRail } from "./team-signal-rail";
import { TeamOverlapRail } from "./team-overlap-rail";
import { CollaborationTopology } from "./collaboration-topology";
import { TeamRegistry } from "./team-registry";
import { TeamInspectorSheet } from "./team-inspector-sheet";
import { CreateTeamDialog } from "./create-team-dialog";
import { EditTeamDialog } from "./edit-team-dialog";
import { ManageTeamMembersDialog } from "./manage-team-members-dialog";
import { ConnectWorkDialog } from "./connect-work-dialog";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { ArchiveTeamDialog } from "./archive-team-dialog";
import { BulkTeamCommandBar } from "./bulk-team-command-bar";
import type {
  TeamSummary,
  TeamDetail,
  TeamSignalMetrics,
  TeamOverlapItem,
} from "@/lib/supabase/types/teams";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserPlus, LayoutGrid, Network } from "lucide-react";

interface TeamsViewProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  initialTeams: TeamSummary[];
  initialSignalMetrics: TeamSignalMetrics;
  initialOverlaps?: TeamOverlapItem[];
  orgMembers: AdminMemberSummary[];
  canManageTeams?: boolean;
}

export function TeamsView({
  organization,
  initialTeams,
  initialSignalMetrics,
  initialOverlaps = [],
  orgMembers,
  canManageTeams = true,
}: TeamsViewProps) {
  const router = useRouter();
  const [teams, setTeams] = React.useState<TeamSummary[]>(initialTeams);
  const [signals, setSignals] = React.useState<TeamSignalMetrics>(initialSignalMetrics);
  const [overlaps, setOverlaps] = React.useState<TeamOverlapItem[]>(initialOverlaps);

  // View Mode: DIRECTORY vs TOPOLOGY
  const [viewMode, setViewMode] = React.useState<"directory" | "topology">("directory");

  // Selection state for bulk operations
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);

  // Dialog & Inspector States
  const [inspectingTeam, setInspectingTeam] = React.useState<TeamSummary | null>(null);
  const [inspectingTab, setInspectingTab] = React.useState<string>("overview");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<TeamSummary | null>(null);
  const [managingMembersTeam, setManagingMembersTeam] = React.useState<TeamDetail | null>(null);
  const [connectingWorkTeam, setConnectingWorkTeam] = React.useState<TeamSummary | null>(null);
  const [deletingTeam, setDeletingTeam] = React.useState<TeamSummary | null>(null);
  const [archivingTeam, setArchivingTeam] = React.useState<TeamSummary | null>(null);

  // Sync state if server revalidates
  React.useEffect(() => {
    setTeams(initialTeams);
    setSignals(initialSignalMetrics);
    setOverlaps(initialOverlaps);
  }, [initialTeams, initialSignalMetrics, initialOverlaps]);

  const orgSlug = organization.slug;

  const handleSelectToggle = (team: TeamSummary) => {
    setSelectedTeamIds((prev) =>
      prev.includes(team.id) ? prev.filter((id) => id !== team.id) : [...prev, team.id]
    );
  };

  // 1. Create Team Mutation
  const handleCreateTeam = async (payload: {
    name: string;
    description?: string;
    memberIds: string[];
  }) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to create team.");
    }

    toast.success("Team created", {
      description: `${payload.name} is now active in the collaboration directory.`,
    });

    router.refresh();
    return body.data;
  };

  // 2. Edit Team Mutation
  const handleUpdateTeam = async (
    teamId: string,
    payload: { name: string; description?: string }
  ) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update team.");
    }

    toast.success("Team updated", {
      description: `${payload.name} details have been saved.`,
    });

    router.refresh();
  };

  // 3. Delete Team Mutation (Safe hard delete)
  const handleDeleteTeam = async (teamId: string) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${teamId}`, {
      method: "DELETE",
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to delete team.");
    }

    toast.success("Team deleted", {
      description: "Team removed. Individual members and workspace resources were preserved.",
    });

    if (inspectingTeam && inspectingTeam.id === teamId) {
      setInspectingTeam(null);
    }

    setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));
    router.refresh();
  };

  // 4. Bulk Delete Teams
  const handleBulkDeleteTeams = async (teamIds: string[]) => {
    let successCount = 0;
    for (const id of teamIds) {
      try {
        const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${id}`, {
          method: "DELETE",
        });
        if (res.ok) successCount++;
      } catch {
        // Continue with rest
      }
    }

    toast.success(`${successCount} teams deleted`, {
      description: "All individual members and workspace resources were completely preserved.",
    });

    setSelectedTeamIds([]);
    router.refresh();
  };

  // 5. Update Team Members Mutation
  const handleUpdateMembers = async (teamId: string, membershipIds: string[]) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${teamId}/members`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipIds }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update team members.");
    }

    toast.success("Team members updated", {
      description: `Synchronized ${membershipIds.length} members for team lane.`,
    });

    if (inspectingTeam && inspectingTeam.id === teamId) {
      setInspectingTeam({
        ...inspectingTeam,
        memberCount: membershipIds.length,
      });
    }

    router.refresh();
  };

  // 6. Connect Work Mutation
  const handleConnectWork = async (
    teamId: string,
    resources: Array<{ resourceType: string; resourceId: string }>
  ) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${teamId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resources }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to connect work.");
    }

    toast.success("Work connected to team", {
      description: `Connected ${resources.length} workspace ${resources.length === 1 ? "resource" : "resources"} to team lane.`,
    });

    router.refresh();
  };

  // 7. Disconnect Resource Mutation
  const handleDisconnectResource = async (teamId: string, assignmentId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/teams/${teamId}/resources?assignmentId=${assignmentId}`,
      { method: "DELETE" }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to disconnect resource.");
    }

    toast.success("Resource disconnected", {
      description: "Resource removed from team scope. Original resource remains active in workspace.",
    });

    router.refresh();
  };

  // 8. Remove Single Member from Team
  const handleRemoveMemberFromTeam = async (teamId: string, membershipId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    // Fetch full member IDs for this team
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${teamId}`);
      const body = await res.json();
      if (body?.data?.members) {
        const currentIds: string[] = body.data.members.map((m: any) => m.membershipId);
        const updatedIds = currentIds.filter((id) => id !== membershipId);
        await handleUpdateMembers(teamId, updatedIds);
      }
    } catch {
      toast.error("Failed to remove member from team.");
    }
  };

  // 9. Archive Team Mutation
  const handleArchiveTeam = async (teamId: string) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${teamId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to archive team.");
    }

    toast.success("Team archived", {
      description: "Team lane archived and removed from active collaboration.",
    });

    if (inspectingTeam && inspectingTeam.id === teamId) {
      setInspectingTeam(null);
    }

    router.refresh();
  };

  // 10. Restore Team Mutation
  const handleRestoreTeam = async (team: TeamSummary) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });

    const body = await res.json();
    if (!res.ok) {
      toast.error("Failed to restore team", { description: body?.error?.message });
      return;
    }

    toast.success("Team restored", {
      description: `${team.name} restored to active collaboration.`,
    });

    router.refresh();
  };

  // Trigger member management dialog
  const triggerManageMembers = async (team: TeamSummary) => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}`);
      const body = await res.json();
      if (body?.data) {
        setManagingMembersTeam(body.data);
      }
    } catch {
      toast.error("Unable to load team member data.");
    }
  };

  const selectedTeamsList = teams.filter((t) => selectedTeamIds.includes(t.id));

  return (
    <div className="space-y-6">
      {/* 01 Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest font-semibold">
            <span>WORKSPACE</span>
            <span>/</span>
            <span>COLLABORATE</span>
            <span>/</span>
            <span className="text-foreground">TEAMS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
            Teams
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Organize people around shared responsibilities, access, and connected work.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {/* View Mode Switch */}
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "directory" | "topology")}
            className="w-auto"
          >
            <TabsList className="bg-surface border border-border/80 h-9 p-0.5 text-xs font-mono">
              <TabsTrigger
                value="directory"
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Directory</span>
              </TabsTrigger>
              <TabsTrigger
                value="topology"
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
              >
                <Network className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Topology</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {canManageTeams && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-white gap-2 shadow-xs cursor-pointer font-mono"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create team</span>
            </Button>
          )}
        </div>
      </div>

      {/* 02 Connected Team Signal Rail */}
      <TeamSignalRail
        totalTeams={signals.totalTeams}
        activeTeams={signals.activeTeams}
        archivedTeams={signals.archivedTeams}
        totalMemberships={signals.totalMemberships}
        totalMembersInTeams={signals.totalMembersInTeams}
        unassignedMembers={signals.unassignedMembers}
        totalConnectedWork={signals.totalConnectedWork}
        orgSlug={orgSlug}
      />

      {/* 03 Team Overlap Rail (Shared Cross-Team Bridges) */}
      <TeamOverlapRail overlaps={overlaps} />

      {/* 04 Main Content View Mode Switch */}
      {viewMode === "topology" ? (
        <CollaborationTopology
          organizationName={organization.name}
          teams={teams}
          onSelectTeam={(t, tab) => {
            const query = tab && tab !== "overview" ? `?view=${tab}` : "";
            router.push(`/${orgSlug}/teams/${t.id}${query}`);
          }}
        />
      ) : (
        <TeamRegistry
          teams={teams}
          selectedTeamIds={selectedTeamIds}
          onSelectTeamToggle={handleSelectToggle}
          onOpenTeam={(t) => {
            router.push(`/${orgSlug}/teams/${t.id}`);
          }}
          onManageMembers={triggerManageMembers}
          onConnectWork={(t) => setConnectingWorkTeam(t)}
          onEditTeam={(t) => setEditingTeam(t)}
          onArchiveTeam={(t) => setArchivingTeam(t)}
          onRestoreTeam={handleRestoreTeam}
          onDeleteTeam={(t) => setDeletingTeam(t)}
          onCreateTeamClick={() => setIsCreateOpen(true)}
          canManageTeams={canManageTeams}
        />
      )}

      {/* Floating Bulk Command Bar */}
      <BulkTeamCommandBar
        selectedTeams={selectedTeamsList}
        onClearSelection={() => setSelectedTeamIds([])}
        onBulkConnectWork={(teamsToConnect) => {
          if (teamsToConnect[0]) setConnectingWorkTeam(teamsToConnect[0]);
        }}
        onBulkDelete={handleBulkDeleteTeams}
        canManage={canManageTeams}
      />

      {/* Team Operations Inspector Sheet */}
      <TeamInspectorSheet
        teamSummary={inspectingTeam}
        organizationSlug={orgSlug}
        isOpen={Boolean(inspectingTeam)}
        initialTab={inspectingTab}
        onClose={() => setInspectingTeam(null)}
        onManageMembersClick={(td) => setManagingMembersTeam(td)}
        onConnectWorkClick={(t) => setConnectingWorkTeam(t)}
        onEditTeamClick={(t) => setEditingTeam(t)}
        onDeleteTeamClick={(t) => setDeletingTeam(t)}
        onDisconnectResource={handleDisconnectResource}
        onRemoveMemberFromTeam={handleRemoveMemberFromTeam}
        canManageTeams={canManageTeams}
      />

      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        organizationName={organization.name}
        orgMembers={orgMembers}
        onCreate={handleCreateTeam}
      />

      {/* Edit Team Dialog */}
      <EditTeamDialog
        isOpen={Boolean(editingTeam)}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
        onUpdate={handleUpdateTeam}
      />

      {/* Manage Members Dialog */}
      <ManageTeamMembersDialog
        isOpen={Boolean(managingMembersTeam)}
        onClose={() => setManagingMembersTeam(null)}
        team={managingMembersTeam}
        orgMembers={orgMembers}
        onSave={handleUpdateMembers}
      />

      {/* Connect Work Dialog */}
      <ConnectWorkDialog
        isOpen={Boolean(connectingWorkTeam)}
        onClose={() => setConnectingWorkTeam(null)}
        team={connectingWorkTeam}
        organizationSlug={orgSlug}
        onConnect={handleConnectWork}
      />

      {/* Delete Team AlertDialog with Impact Map */}
      <DeleteTeamDialog
        isOpen={Boolean(deletingTeam)}
        onClose={() => setDeletingTeam(null)}
        team={deletingTeam}
        onConfirmDelete={handleDeleteTeam}
      />

      {/* Archive Team Safeguard AlertDialog */}
      <ArchiveTeamDialog
        isOpen={Boolean(archivingTeam)}
        onClose={() => setArchivingTeam(null)}
        team={archivingTeam}
        onConfirmArchive={handleArchiveTeam}
      />
    </div>
  );
}
