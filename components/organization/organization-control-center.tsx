"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrganizationHeader } from "./organization-header";
import { OrganizationSummaryRail } from "./organization-summary-rail";
import { OrganizationAccessTopology } from "./organization-access-topology";
import { OrganizationNavTabs } from "./organization-nav-tabs";
import { MembersTable } from "./members/members-table";
import { MemberDetailSheet, MemberDetailItem } from "./members/member-detail-sheet";
import { ChangeRoleDialog } from "./members/change-role-dialog";
import { ManageTeamsDialog } from "./members/manage-teams-dialog";
import { RemoveMemberDialog } from "./members/remove-member-dialog";
import { InviteMemberDialog } from "./members/invite-member-dialog";
import { TeamsSplitView } from "./teams/teams-split-view";
import { RolesPolicyEditor } from "./roles/roles-policy-editor";
import { InvitationsView } from "./invitations/invitations-view";
import {
  OrganizationControlCenterOverview,
  OrganizationMemberRecord,
  OrganizationTeamRecord,
  OrganizationRoleRecord,
  OrganizationInvitationRecord,
} from "@nxtqr/db";
import { PermissionCode } from "@nxtqr/contracts";
import { toast } from "@/components/ui/sonner";

interface OrganizationControlCenterProps {
  initialOverview: OrganizationControlCenterOverview;
  initialMembers: OrganizationMemberRecord[];
  initialTeams: OrganizationTeamRecord[];
  initialRoles: OrganizationRoleRecord[];
  initialInvitations: OrganizationInvitationRecord[];
  activeView?: "overview" | "members" | "teams" | "roles" | "invitations" | "activity";
  canManageMembers?: boolean;
  canManageTeams?: boolean;
  canManageRoles?: boolean;
}

export function OrganizationControlCenter({
  initialOverview,
  initialMembers,
  initialTeams,
  initialRoles,
  initialInvitations,
  activeView = "members",
  canManageMembers = true,
  canManageTeams = true,
  canManageRoles = true,
}: OrganizationControlCenterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeTab = tabParam || activeView;

  // Local reactive state
  const [overview, setOverview] = React.useState(initialOverview);
  const [members, setMembers] = React.useState(initialMembers);
  const [teams, setTeams] = React.useState(initialTeams);
  const [roles, setRoles] = React.useState(initialRoles);
  const [invitations, setInvitations] = React.useState(initialInvitations);

  // Selected member sheet
  const [detailMember, setDetailMember] = React.useState<MemberDetailItem | null>(null);

  // Active dialog states
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [changingRoleMember, setChangingRoleMember] = React.useState<MemberDetailItem | null>(null);
  const [managingTeamsMember, setManagingTeamsMember] = React.useState<MemberDetailItem | null>(null);
  const [removingMember, setRemovingMember] = React.useState<MemberDetailItem | null>(null);

  const orgSlug = overview.organization.slug;

  // 1. Invite Member Mutation
  const handleInvite = async (data: {
    emails: string[];
    roleId: string;
    teamIds: string[];
  }) => {
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
      description: `Invitation generated for ${data.emails.join(", ")}.`,
    });

    // Refresh data
    router.refresh();
    return { inviteUrl: body.data?.inviteUrl };
  };

  // 2. Change Member Role Mutation
  const handleChangeRole = async (memberId: string, newRoleId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/members/${memberId}/role`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId }),
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to change role.");
    }

    // Optimistically update local list
    const roleObj = roles.find((r) => r.id === newRoleId);
    if (roleObj) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? { ...m, roleId: roleObj.id, roleName: roleObj.name, isSystemRole: roleObj.isSystem }
            : m
        )
      );
    }

    toast.success("Member role updated");
    router.refresh();
  };

  // 3. Manage Teams Mutation
  const handleManageTeams = async (memberId: string, teamIds: string[]) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/members/${memberId}/teams`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamIds }),
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update member teams.");
    }

    toast.success("Team assignments updated");
    router.refresh();
  };

  // 4. Remove Member Mutation
  const handleRemoveMember = async (memberId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/members/${memberId}`,
      {
        method: "DELETE",
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to remove member.");
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (detailMember?.id === memberId) setDetailMember(null);

    toast.success("Member removed from workspace");
    router.refresh();
  };

  // 5. Create Team Mutation
  const handleCreateTeam = async (name: string, description?: string) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to create team.");
    }

    toast.success("Team created", {
      description: `Team "${name}" was successfully configured.`,
    });
    router.refresh();
  };

  // 6. Edit Team Mutation
  const handleEditTeam = async (teamId: string, name: string, description?: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/teams/${teamId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update team.");
    }

    toast.success("Team updated");
    router.refresh();
  };

  // 7. Delete Team Mutation
  const handleDeleteTeam = async (teamId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/teams/${teamId}`,
      {
        method: "DELETE",
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to delete team.");
    }

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    toast.success("Team deleted");
    router.refresh();
  };

  // 8. Add Team Members Mutation
  const handleAddTeamMembers = async (teamId: string, memberIds: string[]) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/teams/${teamId}/members`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds }),
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to add members to team.");
    }

    toast.success("Members added to team");
    router.refresh();
  };

  // 9. Remove Team Member Mutation
  const handleRemoveTeamMember = async (teamId: string, memberId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/teams/${teamId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to remove member from team.");
    }

    toast.success("Member removed from team");
    router.refresh();
  };

  // 10. Create Custom Role Mutation
  const handleCreateRole = async (
    name: string,
    description?: string,
    permissions?: PermissionCode[]
  ) => {
    const res = await fetch(`/api/v1/organizations/${orgSlug}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, permissions }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to create custom role.");
    }

    toast.success("Custom role created", {
      description: `Role "${name}" with ${permissions?.length || 0} permissions ready.`,
    });
    router.refresh();
  };

  // 11. Update Role Permissions Mutation
  const handleUpdateRolePermissions = async (
    roleId: string,
    permissions: PermissionCode[]
  ) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/roles/${roleId}/permissions`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to update role permissions.");
    }

    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions } : r))
    );

    toast.success("Role permissions updated");
    router.refresh();
  };

  // 12. Delete Role Mutation
  const handleDeleteRole = async (roleId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/roles/${roleId}`,
      {
        method: "DELETE",
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to delete role.");
    }

    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    toast.success("Role deleted");
    router.refresh();
  };

  // 13. Revoke Invitation Mutation
  const handleRevokeInvitation = async (invitationId: string) => {
    const res = await fetch(
      `/api/v1/organizations/${orgSlug}/invitations/${invitationId}`,
      {
        method: "DELETE",
      }
    );

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || "Failed to revoke invitation.");
    }

    setInvitations((prev) =>
      prev.map((i) => (i.id === invitationId ? { ...i, status: "revoked" } : i))
    );

    toast.success("Invitation revoked");
    router.refresh();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header */}
      <OrganizationHeader
        orgSlug={orgSlug}
        onInviteClick={() => setIsInviteOpen(true)}
        onManageRolesClick={() => router.push(`/${orgSlug}/settings/permissions`)}
        canInvite={canManageMembers}
        canManageRoles={canManageRoles}
      />

      {/* 2. Connected Horizontal Summary Rail */}
      <OrganizationSummaryRail
        membersCount={overview.metrics.membersCount}
        teamsCount={overview.metrics.teamsCount}
        customRolesCount={overview.metrics.customRolesCount}
        pendingInvitationsCount={overview.metrics.pendingInvitationsCount}
        seatLimit={overview.metrics.seatLimit}
        seatsAssigned={overview.metrics.seatsAssigned}
        seatsPercentage={overview.metrics.seatsPercentage}
        onSeatLimitClick={() => router.push(`/${orgSlug}/billing`)}
      />

      {/* 3. Distinctive QR Access Topology Matrix */}
      <OrganizationAccessTopology
        organization={overview.topology.organization}
        teams={overview.topology.teams}
        roles={overview.topology.roles}
        membersCount={overview.metrics.membersCount}
        onSelectTeam={(teamId) => router.push(`/${orgSlug}/teams?team=${teamId}`)}
        onSelectRole={(roleId) => router.push(`/${orgSlug}/settings/permissions?role=${roleId}`)}
      />

      {/* 4. Sub-Navigation Tabs */}
      <OrganizationNavTabs
        orgSlug={orgSlug}
        activeTab={activeTab}
        pendingInvitesCount={overview.metrics.pendingInvitationsCount}
      />

      {/* 5. Active Section View */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <MembersTable
              members={members}
              roles={roles}
              teams={teams}
              onSelectMember={setDetailMember}
              onChangeRole={setChangingRoleMember}
              onManageTeams={setManagingTeamsMember}
              onRemoveMember={setRemovingMember}
              onInviteClick={() => setIsInviteOpen(true)}
              canManageMembers={canManageMembers}
            />
          </div>
        )}

        {activeTab === "members" && (
          <MembersTable
            members={members}
            roles={roles}
            teams={teams}
            onSelectMember={setDetailMember}
            onChangeRole={setChangingRoleMember}
            onManageTeams={setManagingTeamsMember}
            onRemoveMember={setRemovingMember}
            onInviteClick={() => setIsInviteOpen(true)}
            canManageMembers={canManageMembers}
          />
        )}

        {activeTab === "teams" && (
          <TeamsSplitView
            teams={teams}
            allMembers={members}
            onCreateTeam={handleCreateTeam}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            onAddTeamMembers={handleAddTeamMembers}
            onRemoveTeamMember={handleRemoveTeamMember}
            canManageTeams={canManageTeams}
          />
        )}

        {activeTab === "roles" && (
          <RolesPolicyEditor
            roles={roles}
            onCreateRole={handleCreateRole}
            onUpdateRolePermissions={handleUpdateRolePermissions}
            onDeleteRole={handleDeleteRole}
            canManageRoles={canManageRoles}
          />
        )}

        {activeTab === "invitations" && (
          <InvitationsView
            invitations={invitations}
            onRevokeInvitation={handleRevokeInvitation}
            onInviteClick={() => setIsInviteOpen(true)}
            canManageMembers={canManageMembers}
          />
        )}
      </div>

      {/* 6. Contextual Sheets and Dialogs */}
      <MemberDetailSheet
        member={detailMember}
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
        onRemoveClick={(m) => {
          setDetailMember(null);
          setRemovingMember(m);
        }}
        canManageMembers={canManageMembers}
      />

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roles={roles}
        teams={teams}
        seatLimit={overview.metrics.seatLimit}
        seatsAssigned={overview.metrics.seatsAssigned}
        onInvite={handleInvite}
        onUpgradeClick={() => {
          setIsInviteOpen(false);
          router.push(`/${orgSlug}/billing`);
        }}
      />

      <ChangeRoleDialog
        isOpen={Boolean(changingRoleMember)}
        onClose={() => setChangingRoleMember(null)}
        member={changingRoleMember}
        roles={roles}
        onConfirm={handleChangeRole}
      />

      <ManageTeamsDialog
        isOpen={Boolean(managingTeamsMember)}
        onClose={() => setManagingTeamsMember(null)}
        member={managingTeamsMember}
        teams={teams}
        onConfirm={handleManageTeams}
      />

      <RemoveMemberDialog
        isOpen={Boolean(removingMember)}
        onClose={() => setRemovingMember(null)}
        member={removingMember}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}
