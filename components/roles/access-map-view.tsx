"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  RoleOverviewItem,
  RoleMemberSummary,
  PermissionMatrixDomainGroup,
} from "@nxtqr/contracts";

interface AccessMapViewProps {
  roles: RoleOverviewItem[];
  members: RoleMemberSummary[];
  matrixGroups: PermissionMatrixDomainGroup[];
  onSelectRole: (roleId: string) => void;
}

export function AccessMapView({
  roles,
  members,
  matrixGroups,
  onSelectRole,
}: AccessMapViewProps) {
  const [filterQuery, setFilterQuery] = React.useState("");

  // Map each member to their role and capability coverage
  const mappedMembers = React.useMemo(() => {
    return members.map((member) => {
      const role = roles.find((r) => r.id === member.roleId);
      const roleCode = role?.code || "MEMBER";

      // Aggregate domains granted
      const domainsGranted = matrixGroups.map((group) => {
        let count = 0;
        group.permissions.forEach((p) => {
          const cell = p.roleStates[member.roleId];
          if (cell && (cell.state === "allowed" || cell.state === "system_required")) {
            count++;
          }
        });
        return {
          domainName: group.domainName,
          count,
          total: group.permissions.length,
        };
      });

      return {
        ...member,
        role,
        roleCode,
        domainsGranted,
      };
    });
  }, [members, roles, matrixGroups]);

  const filteredMembers = React.useMemo(() => {
    if (!filterQuery.trim()) return mappedMembers;
    const q = filterQuery.toLowerCase();
    return mappedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.role && m.role.name.toLowerCase().includes(q))
    );
  }, [mappedMembers, filterQuery]);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-6 space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:map-point-wave-bold" className="w-4 h-4 text-[#FA520F]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
              Access Map — Authority Traversal
            </h3>
          </div>
          <p className="text-xs text-[#85827B] mt-0.5">
            Trace direct authority lines: Member Identity → Assigned Role → Enforced Resource Capabilities
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter identity or role..."
            className="h-8 text-xs bg-[#191919] border-white/[0.08] text-[#F7F4EC]"
          />
        </div>
      </div>

      {/* Member Access Flow Trees */}
      <div className="space-y-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((m) => (
            <div
              key={m.membershipId}
              className="p-4 rounded-lg border border-white/[0.08] bg-[#191919] space-y-3 hover:border-white/[0.14] transition-all"
            >
              {/* Member & Role Branch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#232323] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-[#FA520F]">
                    {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F7F4EC]">{m.name}</span>
                      <span className="text-[10px] text-[#85827B] font-mono">{m.email}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">STATUS: {m.status.toUpperCase()}</span>
                  </div>
                </div>

                {/* Assigned Role */}
                {m.role && (
                  <button
                    onClick={() => onSelectRole(m.role!.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] hover:border-[#FA520F]/50 hover:bg-[#1E1713] transition-all text-xs font-semibold text-[#F7F4EC]"
                  >
                    <Icon icon="solar:shield-star-bold" className="w-3.5 h-3.5 text-[#FA520F]" />
                    <span>{m.role.name}</span>
                    <span className="text-[9px] font-mono text-[#85827B] uppercase ml-1">
                      ({m.role.permissionCount} caps)
                    </span>
                  </button>
                )}
              </div>

              {/* Resource Capability Traversal */}
              <div className="pl-4 sm:pl-8 border-l border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {m.domainsGranted.map((d) => (
                  <div
                    key={d.domainName}
                    className="p-2 rounded border border-white/[0.04] bg-[#151515] flex items-center justify-between text-[10px]"
                  >
                    <span className="text-[#B8B5AD] truncate">{d.domainName}</span>
                    <span
                      className={`font-mono font-semibold ${
                        d.count > 0 ? "text-[#FA520F]" : "text-[#85827B]"
                      }`}
                    >
                      {d.count}/{d.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-white/[0.08] rounded-lg">
            <p className="text-xs text-[#85827B]">No members match the query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
