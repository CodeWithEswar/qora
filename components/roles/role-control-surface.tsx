"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RoleOverviewItem,
  RoleMemberSummary,
  PermissionMatrixDomainGroup,
} from "@nxtqr/contracts";
import { PermissionDna } from "./permission-dna";

interface RoleControlSurfaceProps {
  role: RoleOverviewItem;
  members: RoleMemberSummary[];
  matrixGroups: PermissionMatrixDomainGroup[];
  canManageRoles: boolean;
  onOpenEditRole: () => void;
  onOpenDuplicateRole: () => void;
  onOpenDeleteRole: () => void;
  onOpenCompare: () => void;
  onChangeMemberRole: (member: RoleMemberSummary) => void;
  onFilterDomain?: (domainKey: string) => void;
}

export function RoleControlSurface({
  role,
  members,
  matrixGroups,
  canManageRoles,
  onOpenEditRole,
  onOpenDuplicateRole,
  onOpenDeleteRole,
  onOpenCompare,
  onChangeMemberRole,
  onFilterDomain,
}: RoleControlSurfaceProps) {
  return (
    <div className="space-y-6">
      {/* Role Identity & Primary Controls */}
      <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[#F7F4EC]">
                {role.name}
              </h2>
              {role.isSystem ? (
                <Badge
                  variant="outline"
                  className="border-white/[0.12] bg-white/[0.04] text-[#B8B5AD] text-[10px] uppercase font-mono tracking-wider"
                >
                  SYSTEM MANAGED
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-[#FA520F]/30 bg-[#FA520F]/10 text-[#FA520F] text-[10px] uppercase font-mono tracking-wider"
                >
                  CUSTOM TENANT ROLE
                </Badge>
              )}
            </div>

            <p className="text-xs text-[#B8B5AD] max-w-2xl leading-relaxed">
              {role.description || "Custom tenant permissions configured for this workspace."}
            </p>

            {role.isSystem && (
              <p className="text-[11px] text-[#85827B] flex items-center gap-1.5 pt-0.5">
                <Icon icon="solar:lock-keyhole-bold" className="w-3.5 h-3.5 text-[#85827B]" />
                <span>Base platform role — authorization boundaries cannot be mutated.</span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCompare}
              className="border-white/[0.1] bg-[#191919] text-[#F7F4EC] hover:bg-[#202020] text-xs h-8 gap-1.5"
            >
              <Icon icon="solar:transfer-horizontal-bold" className="w-3.5 h-3.5 text-[#B8B5AD]" />
              <span>Compare</span>
            </Button>

            {!role.isSystem && canManageRoles && (
              <Button
                size="sm"
                onClick={onOpenEditRole}
                className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs h-8 gap-1.5"
              >
                <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" />
                <span>Edit permissions</span>
              </Button>
            )}

            {canManageRoles && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/[0.1] bg-[#191919] text-[#F7F4EC] hover:bg-[#202020] text-xs h-8 px-2"
                  >
                    <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-[#191919] border-white/[0.1] text-[#F7F4EC] text-xs"
                >
                  <DropdownMenuItem
                    onClick={onOpenDuplicateRole}
                    className="gap-2 cursor-pointer focus:bg-white/[0.08]"
                  >
                    <Icon icon="solar:copy-bold" className="w-3.5 h-3.5 text-[#B8B5AD]" />
                    <span>Duplicate role</span>
                  </DropdownMenuItem>

                  {!role.isSystem && (
                    <>
                      <DropdownMenuSeparator className="bg-white/[0.08]" />
                      <DropdownMenuItem
                        onClick={onOpenDeleteRole}
                        className="gap-2 text-rose-400 focus:text-rose-300 focus:bg-rose-950/40 cursor-pointer"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                        <span>Delete role</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Compact Semantic Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/[0.08]">
          <div className="p-2.5 rounded-lg border border-white/[0.06] bg-[#191919]">
            <div className="text-[10px] font-mono uppercase text-[#85827B]">ASSIGNED IDENTITIES</div>
            <div className="text-lg font-bold font-mono text-[#F7F4EC] mt-0.5">
              {String(role.memberCount).padStart(2, "0")}
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-white/[0.06] bg-[#191919]">
            <div className="text-[10px] font-mono uppercase text-[#85827B]">GRANTED PERMISSIONS</div>
            <div className="text-lg font-bold font-mono text-[#FA520F] mt-0.5">
              {String(role.permissionCount).padStart(2, "0")}
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-white/[0.06] bg-[#191919]">
            <div className="text-[10px] font-mono uppercase text-[#85827B]">DOMAIN BOUNDARIES</div>
            <div className="text-lg font-bold font-mono text-[#FFB83E] mt-0.5">
              09
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-white/[0.06] bg-[#191919]">
            <div className="text-[10px] font-mono uppercase text-[#85827B]">MUTABILITY STATUS</div>
            <div className="text-xs font-mono font-semibold text-[#F7F4EC] mt-1 truncate">
              {role.isSystem ? "SYSTEM PROTECTED" : "TENANT MUTABLE"}
            </div>
          </div>
        </div>

        {/* Permission DNA Distribution */}
        <PermissionDna
          matrixGroups={matrixGroups}
          selectedRoleId={role.id}
          onFilterDomain={onFilterDomain}
        />
      </div>

      {/* Assigned Members Section */}
      <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="solar:users-group-two-rounded-bold" className="w-4 h-4 text-[#FA520F]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
              Assigned Identities ({members.length})
            </h3>
          </div>
          <span className="text-xs text-[#85827B] font-mono">
            {role.isSystem && role.code.toUpperCase() === "OWNER"
              ? "SOLE OWNER INVARIANT ENFORCED"
              : "Active tenant memberships"}
          </span>
        </div>

        {members.length > 0 ? (
          <div className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden bg-[#191919]">
            {members.map((member) => (
              <div
                key={member.membershipId}
                className="p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#232323] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-[#FA520F] shrink-0">
                    {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F7F4EC] truncate">
                        {member.name || "Member"}
                      </span>
                      {member.status === "active" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active" />
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono">PENDING</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#85827B] font-mono truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {canManageRoles && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChangeMemberRole(member)}
                    className="text-xs text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.06] h-7 px-2"
                  >
                    Change role
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-white/[0.08] rounded-lg space-y-1">
            <p className="text-xs text-[#F7F4EC] font-medium">No members assigned</p>
            <p className="text-[11px] text-[#85827B]">
              No active identities in this organization currently hold this role.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
