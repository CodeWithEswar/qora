"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RolesControlPlaneOverview,
  RoleOverviewItem,
  RoleMemberSummary,
  PermissionMatrixCell,
} from "@nxtqr/contracts";
import { AccessHeader } from "./access-header";
import { AccessSignalRail } from "./access-signal-rail";
import { AccessTopology } from "./access-topology";
import { AccessMapView } from "./access-map-view";
import { RoleNavigator } from "./role-navigator";
import { RoleControlSurface } from "./role-control-surface";
import { CapabilityMatrix } from "./capability-matrix";

// Dialogs & Sheets
import { PermissionExplainerSheet } from "./sheets/permission-explainer-sheet";
import { AccessSimulatorDialog } from "./dialogs/access-simulator-dialog";
import { RoleComparatorDialog } from "./dialogs/role-comparator-dialog";
import { CreateRoleDialog } from "./dialogs/create-role-dialog";
import { EditRoleDialog } from "./dialogs/edit-role-dialog";
import { DeleteRoleDialog } from "./dialogs/delete-role-dialog";
import { ChangeMemberRoleDialog } from "./dialogs/change-member-role-dialog";
import { toast } from "sonner";

interface RolesControlPlaneClientProps {
  initialOverview: RolesControlPlaneOverview;
  canManageRoles: boolean;
}

export function RolesControlPlaneClient({
  initialOverview,
  canManageRoles,
}: RolesControlPlaneClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [overview, setOverview] = React.useState<RolesControlPlaneOverview>(initialOverview);

  // View state: 'matrix' | 'topology' | 'map'
  const initialView = (searchParams?.get("view") as any) || "matrix";
  const [activeView, setActiveView] = React.useState<"matrix" | "topology" | "map">(
    ["matrix", "topology", "map"].includes(initialView) ? initialView : "matrix"
  );

  // Active role state
  const roleQueryParam = searchParams?.get("role");
  const defaultRoleId = React.useMemo(() => {
    if (roleQueryParam) {
      const match = overview.roles.find(
        (r) => r.id === roleQueryParam || r.code.toLowerCase() === roleQueryParam.toLowerCase()
      );
      if (match) return match.id;
    }
    return overview.roles[0]?.id || "";
  }, [overview.roles, roleQueryParam]);

  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(defaultRoleId);
  const [filterDomainKey, setFilterDomainKey] = React.useState<string | null>(null);

  // Sync selected role when roles change
  React.useEffect(() => {
    if (!overview.roles.some((r) => r.id === selectedRoleId) && overview.roles.length > 0) {
      setSelectedRoleId(overview.roles[0].id);
    }
  }, [overview.roles, selectedRoleId]);

  // Dialog & Sheet States
  const [isSimulatorOpen, setIsSimulatorOpen] = React.useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = React.useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = React.useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = React.useState(false);
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = React.useState(false);
  const [memberToChange, setMemberToChange] = React.useState<RoleMemberSummary | null>(null);

  // Explainer Sheet State
  const [explainerData, setExplainerData] = React.useState<{
    isOpen: boolean;
    permissionCode: string | null;
    permissionLabel: string | null;
    description: string | null;
    domain: string | null;
    roleName: string | null;
    cell: PermissionMatrixCell | null;
    affectedCount: number;
  }>({
    isOpen: false,
    permissionCode: null,
    permissionLabel: null,
    description: null,
    domain: null,
    roleName: null,
    cell: null,
    affectedCount: 0,
  });

  const selectedRole = React.useMemo(() => {
    return overview.roles.find((r) => r.id === selectedRoleId) || overview.roles[0];
  }, [overview.roles, selectedRoleId]);

  const assignedMembers = React.useMemo(() => {
    return overview.members.filter((m) => m.roleId === selectedRoleId);
  }, [overview.members, selectedRoleId]);

  // Refresh entire overview from authoritative API
  const refreshOverview = async () => {
    try {
      const res = await fetch(`/api/v1/organizations/${overview.organization.slug}/roles`);
      const data = await res.json();
      if (res.ok && data.data) {
        setOverview(data.data);
      }
    } catch {
      // Background revalidation notice
    }
  };

  const handleDuplicateRole = async (role: RoleOverviewItem) => {
    const cloneName = prompt("Enter a name for the duplicated role:", `Copy of ${role.name}`);
    if (!cloneName || !cloneName.trim()) return;

    try {
      const res = await fetch(
        `/api/v1/organizations/${overview.organization.slug}/roles/${role.id}/duplicate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cloneName.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to duplicate role");
      }
      toast.success("Role duplicated.");
      await refreshOverview();
      if (data.data?.role?.id) {
        setSelectedRoleId(data.data.role.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate role");
    }
  };

  const handleSelectCell = (
    permissionCode: string,
    permissionLabel: string,
    description: string,
    domain: string,
    roleId: string,
    cell: PermissionMatrixCell
  ) => {
    const r = overview.roles.find((x) => x.id === roleId);
    const count = overview.members.filter((m) => m.roleId === roleId).length;
    setExplainerData({
      isOpen: true,
      permissionCode,
      permissionLabel,
      description,
      domain,
      roleName: r ? r.name : "Role",
      cell,
      affectedCount: count,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-[#F7F4EC]">
      {/* 01. Access Architecture Header */}
      <AccessHeader
        orgSlug={overview.organization.slug}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          setFilterDomainKey(null);
        }}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenComparator={() => setIsComparatorOpen(true)}
        onOpenCreateRole={() => setIsCreateRoleOpen(true)}
        canManageRoles={canManageRoles}
      />

      {/* 02. Architectural Access Signal Rail */}
      <AccessSignalRail
        metrics={overview.metrics}
        activeFilter={null}
        onSelectFilter={() => {}}
      />

      {/* Main Surface */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeView === "topology" && (
          <div className="p-6 max-w-7xl w-full mx-auto">
            <AccessTopology
              roles={overview.roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={(id) => {
                setSelectedRoleId(id);
                setActiveView("matrix");
              }}
            />
          </div>
        )}

        {activeView === "map" && (
          <div className="p-6 max-w-7xl w-full mx-auto">
            <AccessMapView
              roles={overview.roles}
              members={overview.members}
              matrixGroups={overview.matrix}
              onSelectRole={(id) => {
                setSelectedRoleId(id);
                setActiveView("matrix");
              }}
            />
          </div>
        )}

        {activeView === "matrix" && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
            {/* Left Rail: Role Navigator */}
            <RoleNavigator
              roles={overview.roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={(id) => setSelectedRoleId(id)}
              canManageRoles={canManageRoles}
              onOpenCreateRole={() => setIsCreateRoleOpen(true)}
            />

            {/* Right Workspace: Selected Role Control Surface & Matrix */}
            <div className="flex-1 p-5 sm:p-7 space-y-7 overflow-y-auto max-w-6xl">
              {selectedRole ? (
                <>
                  {/* Selected Role Inspector / Surface */}
                  <RoleControlSurface
                    role={selectedRole}
                    members={assignedMembers}
                    matrixGroups={overview.matrix}
                    canManageRoles={canManageRoles}
                    onOpenEditRole={() => setIsEditRoleOpen(true)}
                    onOpenDuplicateRole={() => handleDuplicateRole(selectedRole)}
                    onOpenDeleteRole={() => setIsDeleteRoleOpen(true)}
                    onOpenCompare={() => setIsComparatorOpen(true)}
                    onChangeMemberRole={(mem) => setMemberToChange(mem)}
                    onFilterDomain={(dKey) =>
                      setFilterDomainKey((prev) => (prev === dKey ? null : dKey))
                    }
                  />

                  {/* Domain-Grouped Capability Matrix */}
                  <div className="space-y-3">
                    {filterDomainKey && (
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#FA520F]/30 bg-[#FA520F]/5 text-xs text-[#FA520F]">
                        <span>Filtering matrix to <strong>{filterDomainKey.toUpperCase()}</strong> domain</span>
                        <button
                          onClick={() => setFilterDomainKey(null)}
                          className="font-mono underline text-[11px]"
                        >
                          Clear domain filter
                        </button>
                      </div>
                    )}

                    <CapabilityMatrix
                      roles={overview.roles}
                      matrixGroups={overview.matrix}
                      selectedRoleId={selectedRoleId}
                      onSelectRole={(id) => setSelectedRoleId(id)}
                      onSelectCell={handleSelectCell}
                      filterDomainKey={filterDomainKey}
                    />
                  </div>
                </>
              ) : (
                <div className="p-12 text-center border border-dashed border-white/[0.08] rounded-xl">
                  <p className="text-sm text-[#85827B]">No role selected.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sheets & Dialogs */}
      <PermissionExplainerSheet
        isOpen={explainerData.isOpen}
        onClose={() => setExplainerData((prev) => ({ ...prev, isOpen: false }))}
        permissionCode={explainerData.permissionCode}
        permissionLabel={explainerData.permissionLabel}
        description={explainerData.description}
        domain={explainerData.domain}
        roleName={explainerData.roleName}
        cell={explainerData.cell}
        affectedMembersCount={explainerData.affectedCount}
      />

      <AccessSimulatorDialog
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        orgSlug={overview.organization.slug}
        members={overview.members}
      />

      <RoleComparatorDialog
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        orgSlug={overview.organization.slug}
        roles={overview.roles}
        defaultRoleAId={selectedRoleId}
      />

      <CreateRoleDialog
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        orgSlug={overview.organization.slug}
        matrixGroups={overview.matrix}
        onRoleCreated={async (newRole) => {
          await refreshOverview();
          if (newRole?.id) setSelectedRoleId(newRole.id);
        }}
      />

      {selectedRole && !selectedRole.isSystem && (
        <>
          <EditRoleDialog
            isOpen={isEditRoleOpen}
            onClose={() => setIsEditRoleOpen(false)}
            orgSlug={overview.organization.slug}
            role={selectedRole}
            matrixGroups={overview.matrix}
            onRoleUpdated={async () => {
              await refreshOverview();
            }}
          />

          <DeleteRoleDialog
            isOpen={isDeleteRoleOpen}
            onClose={() => setIsDeleteRoleOpen(false)}
            orgSlug={overview.organization.slug}
            role={selectedRole}
            availableRoles={overview.roles}
            onRoleDeleted={async () => {
              await refreshOverview();
              setSelectedRoleId(overview.roles[0]?.id || "");
            }}
          />
        </>
      )}

      {memberToChange && (
        <ChangeMemberRoleDialog
          isOpen={Boolean(memberToChange)}
          onClose={() => setMemberToChange(null)}
          orgSlug={overview.organization.slug}
          member={memberToChange}
          roles={overview.roles}
          onRoleAssigned={async () => {
            await refreshOverview();
          }}
        />
      )}
    </div>
  );
}
