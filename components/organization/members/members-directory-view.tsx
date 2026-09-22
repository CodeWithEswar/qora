"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MembersTable } from "./members-table";
import { MemberDetailSheet } from "./member-detail-sheet";
import { InviteMemberDialog } from "./invite-member-dialog";
import { ChangeRoleDialog } from "./change-role-dialog";
import { ManageTeamsDialog } from "./manage-teams-dialog";
import { SuspendMemberDialog } from "./suspend-member-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { WorkspaceAccessRail } from "./workspace-access-rail";
import { AccessOrbit } from "./access-orbit";
import { InvitationsLedger, InvitationItem } from "./invitations-ledger";
import { BulkMemberCommandBar } from "./bulk-member-command-bar";
import { PermissionExplorerDialog } from "./permission-explorer-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { toast } from "sonner";
import { UserPlus, Shield, Users, Network, ListFilter } from "lucide-react";

interface RoleOption {
  id: string;
  name: string;
  code?: string;
  description?: string | null;
  isSystem?: boolean;
}

interface TeamOption {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
}

interface MembersDirectoryViewProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  initialMembers: AdminMemberSummary[];
  initialRoles: RoleOption[];
  initialTeams: TeamOption[];
  initialInvitations?: any[];
  pendingInvitationsCount: number;
  canManageMembers?: boolean;
}

/**
 * Members Directory View — Workspace Access Command Center
 * Central governance surface for organization access, membership, invitations,
 * spatial access orbit, and permission inspection.
 */
export function MembersDirectoryView({
  organization,
  initialMembers,
  initialRoles,
  initialTeams,
  initialInvitations = [],
  pendingInvitationsCount,
  canManageMembers = true,
}: MembersDirectoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [members, setMembers] = React.useState<AdminMemberSummary[]>(initialMembers);
  const [invitations, setInvitations] = React.useState<InvitationItem[]>(initialInvitations);
  const [detailMember, setDetailMember] = React.useState<AdminMemberSummary | null>(null);

  // Top-level Navigation & View Modes
  const [activeTab, setActiveTab] = React.useState<"members" | "invitations">("members");
  const [viewMode, setViewMode] = React.useState<"directory" | "map">("directory");

  // Multi-Selection State
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);

  // Dialog / Sheet states
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [isRolesExplorerOpen, setIsRolesExplorerOpen] = React.useState(false);
  const [changingRoleMember, setChangingRoleMember] = React.useState<AdminMemberSummary | null>(null);
  const [managingTeamsMember, setManagingTeamsMember] = React.useState<AdminMemberSummary | null>(null);
  const [suspendingMember, setSuspendingMember] = React.useState<{
    member: AdminMemberSummary;
    mode: "suspend" | "restore";
  } | null>(null);
  const [removingMember, setRemovingMember] = React.useState<AdminMemberSummary | null>(null);

  // Bulk Dialog States
  const [isBulkAssignTeamOpen, setIsBulkAssignTeamOpen] = React.useState(false);
  const [bulkTeamId, setBulkTeamId] = React.useState<string>("");
  const [isBulkChangeRoleOpen, setIsBulkChangeRoleOpen] = React.useState(false);
  const [bulkRoleId, setBulkRoleId] = React.useState<string>("");
  const [isBulkRemoveOpen, setIsBulkRemoveOpen] = React.useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);

  const orgSlug = organization.slug;

  // Sync state if server revalidates
  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  React.useEffect(() => {
    setInvitations(initialInvitations);
  }, [initialInvitations]);

  // Deep-link to member inspector if ?member=id
  React.useEffect(() => {
    const memberParam = searchParams.get("member");
    if (memberParam) {
      const found = members.find((m) => m.id === memberParam || m.userId === memberParam);
      if (found) setDetailMember(found);
    }
  }, [searchParams, members]);

  // 1. Invite Member Mutation
  const handleInvite = async (data: { email: string; roleId: string; teamIds: string[] }) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to create invitation.");
    }

    toast.success("Invitation created", {
      description: `Single-use invitation generated for ${data.email}.`,
    });

    router.refresh();
    return { inviteUrl: body.data?.inviteUrl };
  };

  // 2. Change Member Role Mutation
  const handleChangeRole = async (memberId: string, newRoleId: string) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/members/${memberId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: newRoleId }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update role.");
    }

    const roleObj = initialRoles.find((r) => r.id === newRoleId);
    if (roleObj) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? {
                ...m,
                roleId: roleObj.id,
                roleName: roleObj.name,
                roleCode: roleObj.code || roleObj.name.toUpperCase(),
                roleDescription: roleObj.description,
              }
            : m
        )
      );
    }

    toast.success("Member access updated", {
      description: `Role updated to ${roleObj?.name || "new role"}.`,
    });
    router.refresh();
  };

  // 3. Manage Teams Mutation
  const handleManageTeams = async (memberId: string, teamIds: string[]) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/members/${memberId}/teams`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamIds }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update member teams.");
    }

    const updatedTeams = initialTeams
      .filter((t) => teamIds.includes(t.id))
      .map((t) => ({ id: t.id, name: t.name }));

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, teams: updatedTeams } : m))
    );

    toast.success("Team memberships updated");
    router.refresh();
  };

  // 4. Suspend / Restore Member Mutation
  const handleSuspendConfirm = async (memberId: string) => {
    const isSuspend = suspendingMember?.mode === "suspend";
    const newStatus = isSuspend ? "suspended" : "active";

    const res = await fetch(`/api/v1/organizations/${orgSlug}/members/${memberId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || `Failed to ${isSuspend ? "suspend" : "restore"} member.`);
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m))
    );

    if (detailMember?.id === memberId) {
      setDetailMember((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    toast.success(isSuspend ? "Member access suspended" : "Member access restored", {
      description: isSuspend
        ? "Administrative operations revoked until restored."
        : "Operational privileges reactivated.",
    });
    router.refresh();
  };

  // 5. Remove Member Mutation
  const handleRemoveConfirm = async (memberId: string) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/members/${memberId}`, {
      method: "DELETE",
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to remove member.");
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (detailMember?.id === memberId) setDetailMember(null);

    toast.success("Member removed from workspace", {
      description: "Access credentials removed. Historical audit records preserved.",
    });
    router.refresh();
  };

  // Bulk Operations
  const handleBulkAssignTeamConfirm = async () => {
    if (!bulkTeamId || selectedMemberIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const selectedTeam = initialTeams.find((t) => t.id === bulkTeamId);
      for (const mId of selectedMemberIds) {
        const mem = members.find((m) => m.id === mId);
        const currentTeamIds = mem?.teams?.map((t) => t.id) || [];
        if (!currentTeamIds.includes(bulkTeamId)) {
          await fetch(`/api/v1/organizations/${orgSlug}/members/${mId}/teams`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamIds: [...currentTeamIds, bulkTeamId] }),
          });
        }
      }
      toast.success("Team assigned", {
        description: `Added ${selectedMemberIds.length} members to ${selectedTeam?.name || "team"}.`,
      });
      setSelectedMemberIds([]);
      setIsBulkAssignTeamOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to bulk assign team.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkChangeRoleConfirm = async () => {
    if (!bulkRoleId || selectedMemberIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const targetRole = initialRoles.find((r) => r.id === bulkRoleId);
      for (const mId of selectedMemberIds) {
        await fetch(`/api/v1/organizations/${orgSlug}/members/${mId}/role`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleId: bulkRoleId }),
        });
      }
      toast.success("Roles updated", {
        description: `Updated ${selectedMemberIds.length} members to ${targetRole?.name || "new role"}.`,
      });
      setSelectedMemberIds([]);
      setIsBulkChangeRoleOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to bulk update roles.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkRemoveConfirm = async () => {
    if (selectedMemberIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      let removedCount = 0;
      for (const mId of selectedMemberIds) {
        const mem = members.find((m) => m.id === mId);
        if (mem?.roleCode === "OWNER") continue; // Protect owner
        await fetch(`/api/v1/organizations/${orgSlug}/members/${mId}`, {
          method: "DELETE",
        });
        removedCount++;
      }
      toast.success("Members removed", {
        description: `Removed ${removedCount} members. Workspace owner protected.`,
      });
      setSelectedMemberIds([]);
      setIsBulkRemoveOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to bulk remove members.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* 01 Command Header (Blueprint Section 6 & 116) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest font-semibold">
            <span>WORKSPACE</span>
            <span>/</span>
            <span>COLLABORATE</span>
            <span>/</span>
            <span className="text-foreground">MEMBERS</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FA520F] px-1.5 py-0.5 rounded bg-[#FA520F]/10">
              WORKSPACE ACCESS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Members
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Understand who belongs to this workspace, how access is granted, and where collaboration connects.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRolesExplorerOpen(true)}
            className="h-9 px-3 text-xs gap-1.5 cursor-pointer font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Manage roles</span>
          </Button>

          {canManageMembers && (
            <Button
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-white gap-2 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite members</span>
            </Button>
          )}
        </div>
      </div>

      {/* 02 Workspace Access Rail (Section 9) */}
      <WorkspaceAccessRail
        membersCount={members.length}
        teamsCount={initialTeams.length}
        rolesCount={initialRoles.length}
        pendingInvitesCount={pendingInvitationsCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 03 Mode & Tab Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-border/60 pb-3">
        {/* Primary Tabs */}
        <div className="flex items-center gap-2 font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "members"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            MEMBERS ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "invitations"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            INVITATIONS ({pendingInvitationsCount})
          </button>
        </div>

        {/* View Mode Switcher (When on Members Tab) */}
        {activeTab === "members" && (
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-surface/70 text-xs font-mono self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("directory")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === "directory"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>DIRECTORY</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === "map"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>ACCESS MAP</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* View Mode 1: DIRECTORY (Identity Ledger) */}
          {viewMode === "directory" && (
            <MembersTable
              organizationName={organization.name}
              members={members}
              roles={initialRoles}
              teams={initialTeams}
              pendingInvitationsCount={pendingInvitationsCount}
              onSelectMember={setDetailMember}
              onTraceAccess={(m) => {
                setDetailMember(m);
                setViewMode("map");
              }}
              onChangeRole={setChangingRoleMember}
              onManageTeams={setManagingTeamsMember}
              onSuspendMember={(m) => setSuspendingMember({ member: m, mode: "suspend" })}
              onRestoreMember={(m) => setSuspendingMember({ member: m, mode: "restore" })}
              onRemoveMember={setRemovingMember}
              onInviteClick={() => setIsInviteOpen(true)}
              canManageMembers={canManageMembers}
            />
          )}

          {/* View Mode 2: ACCESS MAP (Full-width relationship canvas) */}
          {viewMode === "map" && (
            <div className="space-y-4">
              <AccessOrbit
                organizationName={organization.name}
                organizationSlug={orgSlug}
                members={members}
                roles={initialRoles}
                teams={initialTeams}
                onSelectMember={setDetailMember}
                onOpenMemberInDirectory={(m) => {
                  setDetailMember(m);
                  setViewMode("directory");
                }}
                className="p-4 sm:p-6"
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: INVITATIONS */}
      {activeTab === "invitations" && (
        <InvitationsLedger
          invitations={invitations}
          organizationSlug={orgSlug}
          canManageMembers={canManageMembers}
          onInviteClick={() => setIsInviteOpen(true)}
          onRefresh={() => router.refresh()}
        />
      )}

      {/* Contextual Floating Bulk Command Bar */}
      <BulkMemberCommandBar
        selectedCount={selectedMemberIds.length}
        onClearSelection={() => setSelectedMemberIds([])}
        onAssignTeam={() => setIsBulkAssignTeamOpen(true)}
        onChangeRole={() => setIsBulkChangeRoleOpen(true)}
        onRemove={() => setIsBulkRemoveOpen(true)}
        canManage={canManageMembers}
      />

      {/* Signature Detail Sheet */}
      <MemberDetailSheet
        member={detailMember}
        organizationName={organization.name}
        isOpen={Boolean(detailMember)}
        onClose={() => setDetailMember(null)}
        onChangeRoleClick={(m) => {
          setDetailMember(null);
          setChangingRoleMember(m);
        }}
        onManageTeamsClick={(m) => {
          setDetailMember(null);
          setManagingTeamsMember(m);
        }}
        onSuspendClick={(m) => {
          setDetailMember(null);
          setSuspendingMember({ member: m, mode: "suspend" });
        }}
        onRestoreClick={(m) => {
          setDetailMember(null);
          setSuspendingMember({ member: m, mode: "restore" });
        }}
        onRemoveClick={(m) => {
          setDetailMember(null);
          setRemovingMember(m);
        }}
        canManageMembers={canManageMembers}
      />

      {/* Invite Member Progressive Sheet */}
      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roles={initialRoles}
        teams={initialTeams}
        onInvite={handleInvite}
      />

      {/* Change Role Dialog with Preview */}
      <ChangeRoleDialog
        isOpen={Boolean(changingRoleMember)}
        onClose={() => setChangingRoleMember(null)}
        member={changingRoleMember}
        roles={initialRoles}
        onConfirm={handleChangeRole}
      />

      {/* Manage Teams Dialog */}
      <ManageTeamsDialog
        isOpen={Boolean(managingTeamsMember)}
        onClose={() => setManagingTeamsMember(null)}
        member={managingTeamsMember}
        teams={initialTeams}
        onConfirm={handleManageTeams}
      />

      {/* Suspend / Restore AlertDialog */}
      <SuspendMemberDialog
        isOpen={Boolean(suspendingMember)}
        onClose={() => setSuspendingMember(null)}
        member={suspendingMember?.member || null}
        mode={suspendingMember?.mode || "suspend"}
        onConfirm={handleSuspendConfirm}
      />

      {/* Remove Member AlertDialog */}
      <RemoveMemberDialog
        isOpen={Boolean(removingMember)}
        onClose={() => setRemovingMember(null)}
        member={removingMember}
        onConfirm={handleRemoveConfirm}
      />

      {/* Workspace Roles Explorer Dialog */}
      <PermissionExplorerDialog
        isOpen={isRolesExplorerOpen}
        onClose={() => setIsRolesExplorerOpen(false)}
        roleName="Workspace Operational Permissions"
        capabilities={[
          "Live Edge QR Publishing",
          "Dynamic Destination Routing",
          "Batch Print & Export Dispatch",
          "Brand Kit & Custom Templates",
          "Scan Telemetry & Diagnostics",
          "Member Access & Governance",
          "Team Boundary Configuration",
        ]}
      />

      {/* Bulk Assign Team Dialog */}
      <AlertDialog
        open={isBulkAssignTeamOpen}
        onOpenChange={(open) => !open && setIsBulkAssignTeamOpen(false)}
      >
        <AlertDialogContent className="font-mono text-xs max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-sans font-bold text-foreground">
              Assign Team to {selectedMemberIds.length} Members
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Select an operational collaboration team to grant to all selected members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">
              Target Team
            </Label>
            <Select value={bulkTeamId} onValueChange={setBulkTeamId}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue placeholder="Select team..." />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {initialTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAssignTeamConfirm}
              disabled={isBulkProcessing || !bulkTeamId}
              className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              {isBulkProcessing ? "Assigning..." : "Assign team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Change Role Dialog */}
      <AlertDialog
        open={isBulkChangeRoleOpen}
        onOpenChange={(open) => !open && setIsBulkChangeRoleOpen(false)}
      >
        <AlertDialogContent className="font-mono text-xs max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-sans font-bold text-foreground">
              Change Role for {selectedMemberIds.length} Members
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Update organization operational authority tier for all selected members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">
              Target Role
            </Label>
            <Select value={bulkRoleId} onValueChange={setBulkRoleId}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {initialRoles
                  .filter((r) => r.name.toLowerCase() !== "owner")
                  .map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkChangeRoleConfirm}
              disabled={isBulkProcessing || !bulkRoleId}
              className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              {isBulkProcessing ? "Updating..." : "Update roles"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Remove AlertDialog */}
      <AlertDialog
        open={isBulkRemoveOpen}
        onOpenChange={(open) => !open && setIsBulkRemoveOpen(false)}
      >
        <AlertDialogContent className="font-mono text-xs max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-sans font-bold text-rose-600 dark:text-rose-400">
              Remove {selectedMemberIds.length} Members?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Their workspace memberships will be revoked. Their historical operations and QR assets
              will remain preserved. The sole workspace owner will never be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing} className="text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRemoveConfirm}
              disabled={isBulkProcessing}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isBulkProcessing ? "Removing..." : "Remove members"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
