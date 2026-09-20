"use client";

import * as React from "react";
import {
  Building2,
  Users,
  Plus,
  Search,
  MoreVertical,
  Layers,
  Edit2,
  Trash2,
  UserPlus,
  UserX,
  Shield,
  Activity,
  Calendar,
  X,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateTeamDialog } from "./create-team-dialog";
import { EditTeamDialog } from "./edit-team-dialog";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { AddTeamMembersDialog } from "./add-team-members-dialog";
import { OrganizationTeamRecord, OrganizationMemberRecord } from "@nxtqr/db";
import { cn, formatDate } from "@/lib/utils";

interface TeamsSplitViewProps {
  teams: OrganizationTeamRecord[];
  allMembers: OrganizationMemberRecord[];
  onCreateTeam: (name: string, description?: string) => Promise<void>;
  onEditTeam: (teamId: string, name: string, description?: string) => Promise<void>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onAddTeamMembers: (teamId: string, memberIds: string[]) => Promise<void>;
  onRemoveTeamMember: (teamId: string, memberId: string) => Promise<void>;
  canManageTeams?: boolean;
}

export function TeamsSplitView({
  teams,
  allMembers,
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
  onAddTeamMembers,
  onRemoveTeamMember,
  canManageTeams = true,
}: TeamsSplitViewProps) {
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>(
    teams.length > 0 ? teams[0].id : ""
  );
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"members" | "resources" | "activity">("members");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<OrganizationTeamRecord | null>(null);
  const [deletingTeam, setDeletingTeam] = React.useState<OrganizationTeamRecord | null>(null);
  const [isAddMembersOpen, setIsAddMembersOpen] = React.useState(false);

  // Maintain selected team
  React.useEffect(() => {
    if (teams.length > 0 && !teams.some((t) => t.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const filteredTeams = React.useMemo(() => {
    if (!search.trim()) return teams;
    const q = search.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [teams, search]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

  if (teams.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">Teams</h2>
            <p className="text-xs text-muted-foreground">
              Group members around campaigns, products, or regional responsibilities.
            </p>
          </div>
          {canManageTeams && (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create team</span>
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border/70 bg-surface/80 p-8 shadow-xs">
          <EmptyState
            preset="teams"
            variant="card"
            onAction={() => setIsCreateOpen(true)}
            className="border-none bg-transparent"
          />
        </div>

        <CreateTeamDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreateTeam={onCreateTeam}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Teams & Resource Groups
          </h2>
          <p className="text-xs text-muted-foreground">
            Structured collaborative units with scoped access boundaries.
          </p>
        </div>

        {canManageTeams && (
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create team</span>
          </Button>
        )}
      </div>

      {/* Split Control-Center Panes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Team List */}
        <div className="md:col-span-4 rounded-xl border border-border/70 bg-surface/80 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-border/70 bg-surface/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-surface"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-border/50 max-h-[560px] overflow-y-auto">
            {filteredTeams.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground italic">
                No teams found matching &quot;{search}&quot;
              </div>
            ) : (
              filteredTeams.map((team) => {
                const isSelected = team.id === selectedTeamId;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={cn(
                      "w-full p-3.5 flex items-start gap-3 text-left transition-all relative group select-none",
                      isSelected
                        ? "bg-primary/5 text-foreground font-medium"
                        : "hover:bg-surface-hover/70 text-foreground"
                    )}
                  >
                    {/* Active Route Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                    )}

                    {/* QR module style mark */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-md border flex items-center justify-center shrink-0 mt-0.5",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-surface border-border text-muted-foreground group-hover:border-primary/30"
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                          {team.name}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0 px-1.5 py-0.2 rounded bg-muted/60">
                          {team.membersCount}
                        </span>
                      </div>
                      {team.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Team Workspace */}
        <div className="md:col-span-8 rounded-xl border border-border/70 bg-surface/80 overflow-hidden shadow-xs">
          {selectedTeam ? (
            <div>
              {/* Selected Team Header */}
              <div className="p-4 md:p-5 border-b border-border/70 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {selectedTeam.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                        {selectedTeam.membersCount} members
                      </span>
                    </div>
                    {selectedTeam.description ? (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedTeam.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        No team description provided.
                      </p>
                    )}
                  </div>
                </div>

                {canManageTeams && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => setIsAddMembersOpen(true)}
                      className="gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90 text-white"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Add members</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTeam(selectedTeam)}
                      className="h-8 px-2.5 text-xs"
                    >
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingTeam(selectedTeam)}
                      className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Sub-tabs: Members / Resource access / Activity */}
              <div className="border-b border-border/70 px-4 bg-surface/20 flex gap-4 text-xs">
                <button
                  onClick={() => setActiveTab("members")}
                  className={cn(
                    "py-2.5 font-medium border-b-2 transition-all",
                    activeTab === "members"
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Members ({selectedTeam.members.length})
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={cn(
                    "py-2.5 font-medium border-b-2 transition-all",
                    activeTab === "resources"
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Resource Access
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={cn(
                    "py-2.5 font-medium border-b-2 transition-all",
                    activeTab === "activity"
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Activity
                </button>
              </div>

              {/* Tab Content 1: Members */}
              {activeTab === "members" && (
                <div className="p-4 space-y-3">
                  {selectedTeam.members.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="text-xs font-semibold text-foreground">No members in this team</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                        Add workspace collaborators to assign them to this team unit.
                      </p>
                      {canManageTeams && (
                        <Button
                          size="sm"
                          onClick={() => setIsAddMembersOpen(true)}
                          className="text-xs h-8 mt-2"
                        >
                          Add first member
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50 border border-border/60 rounded-xl overflow-hidden bg-surface">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.memberId}
                          className="p-3 flex items-center justify-between hover:bg-surface-hover/60 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 border border-border">
                              {member.avatarUrl && (
                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                              )}
                              <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{member.name}</p>
                              <p className="text-[11px] text-muted-foreground">{member.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/60">
                              {member.roleName}
                            </span>
                            {canManageTeams && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onRemoveTeamMember(selectedTeam.id, member.memberId)
                                }
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                                title="Remove from team"
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: Resource Access */}
              {activeTab === "resources" && (
                <div className="p-4 space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-300">
                    <h4 className="font-semibold text-sm mb-1">Team Scope Boundaries</h4>
                    <p className="text-[11px] leading-relaxed">
                      Members assigned to <span className="font-semibold">{selectedTeam.name}</span> receive collaborative permissions over QRs and campaigns tagged with this team unit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <FolderTree className="h-4 w-4 text-primary" />
                        <span>Campaigns & Folders</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Full read/write capability across folders matching this team.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Layers className="h-4 w-4 text-amber-500" />
                        <span>Asset Governance</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Team reviews and approval workflows require team membership.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Activity */}
              {activeTab === "activity" && (
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Created on {formatDate(selectedTeam.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">
                    Historical actions for this team will appear in the organization audit stream.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-muted-foreground italic">
              Select a team on the left to inspect its members and resource boundaries.
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateTeamDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTeam={onCreateTeam}
      />

      <EditTeamDialog
        isOpen={Boolean(editingTeam)}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
        onEditTeam={onEditTeam}
      />

      <DeleteTeamDialog
        isOpen={Boolean(deletingTeam)}
        onClose={() => setDeletingTeam(null)}
        team={deletingTeam}
        onConfirm={onDeleteTeam}
      />

      <AddTeamMembersDialog
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        team={selectedTeam}
        candidates={allMembers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          avatarUrl: m.avatarUrl,
          roleName: m.roleName,
        }))}
        alreadyMemberIds={selectedTeam?.members.map((m) => m.memberId) || []}
        onAddMembers={onAddTeamMembers}
      />
    </div>
  );
}
