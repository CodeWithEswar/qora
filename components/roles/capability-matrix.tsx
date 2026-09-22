"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  RoleOverviewItem,
  PermissionMatrixDomainGroup,
  PermissionMatrixCell,
} from "@nxtqr/contracts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CapabilityMatrixProps {
  roles: RoleOverviewItem[];
  matrixGroups: PermissionMatrixDomainGroup[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  onSelectCell: (
    permissionCode: string,
    permissionLabel: string,
    description: string,
    domain: string,
    roleId: string,
    cell: PermissionMatrixCell
  ) => void;
  filterDomainKey?: string | null;
}

export function CapabilityMatrix({
  roles,
  matrixGroups,
  selectedRoleId,
  onSelectRole,
  onSelectCell,
  filterDomainKey,
}: CapabilityMatrixProps) {
  // Expanded domain groups state
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    matrixGroups.forEach((g) => {
      initial[g.domainKey] = true; // all open by default
    });
    return initial;
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const visibleGroups = React.useMemo(() => {
    if (!filterDomainKey) return matrixGroups;
    return matrixGroups.filter((g) => g.domainKey === filterDomainKey);
  }, [matrixGroups, filterDomainKey]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-xl border border-white/[0.08] bg-[#151515] overflow-hidden">
        {/* Matrix Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171717]">
          <div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-check-bold" className="w-4 h-4 text-[#FA520F]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
                Capability & Permission Matrix
              </h3>
            </div>
            <p className="text-xs text-[#85827B] mt-0.5">
              Domain-grouped authorization rules. Click any cell to open the real-time Permission Explainer.
            </p>
          </div>

          {/* Matrix Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#85827B]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Allowed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-white/30 inline-block" />
              Denied
            </span>
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:lock-keyhole-bold" className="w-3 h-3 text-amber-400" />
              Entitlement Restricted
            </span>
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:shield-warning-bold" className="w-3 h-3 text-[#FA520F]" />
              High Impact
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#191919]/60 text-[11px] font-mono text-[#85827B] uppercase">
                <th className="py-3 px-4 w-72 font-semibold">Capability / Permission</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Canonical Key</th>
                {roles.map((r) => {
                  const isSelected = r.id === selectedRoleId;
                  return (
                    <th
                      key={r.id}
                      onClick={() => onSelectRole(r.id)}
                      className={`py-3 px-3 text-center cursor-pointer transition-colors ${
                        isSelected ? "text-[#FA520F] bg-[#1F1713]" : "hover:text-[#F7F4EC]"
                      }`}
                    >
                      <div className="truncate font-semibold">{r.name}</div>
                      <div className="text-[9px] font-normal lowercase text-[#85827B]">
                        {r.isSystem ? "system" : "custom"}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {visibleGroups.map((group) => {
                const isExpanded = expandedGroups[group.domainKey] !== false;

                return (
                  <React.Fragment key={group.domainKey}>
                    {/* Domain Group Header */}
                    <tr
                      onClick={() => toggleGroup(group.domainKey)}
                      className="cursor-pointer border-y border-white/[0.08] bg-[#1A1A1A] hover:bg-[#202020] transition-colors"
                    >
                      <td colSpan={2 + roles.length} className="py-2.5 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={isExpanded ? "solar:alt-arrow-down-bold" : "solar:alt-arrow-right-bold"}
                              className="w-3.5 h-3.5 text-[#85827B]"
                            />
                            <span className="text-xs font-bold text-[#F7F4EC] uppercase tracking-wider">
                              {group.domainName}
                            </span>
                            <span className="text-[10px] text-[#85827B] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">
                              {group.permissions.length} actions
                            </span>
                          </div>

                          <p className="text-[11px] text-[#85827B] hidden sm:block">
                            {group.description}
                          </p>
                        </div>
                      </td>
                    </tr>

                    {/* Permissions in this group */}
                    {isExpanded &&
                      group.permissions.map((perm) => {
                        const isHighImpact =
                          perm.code.includes("delete") ||
                          perm.code.includes("remove") ||
                          perm.code.includes("transfer") ||
                          perm.code.includes("billing");

                        return (
                          <tr
                            key={perm.code}
                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                {isHighImpact && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Icon
                                          icon="solar:shield-warning-bold"
                                          className="w-3.5 h-3.5 text-[#FA520F] shrink-0"
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#202020] text-xs text-[#F7F4EC] border-white/10">
                                      High impact capability: modifies destructive workspace boundaries.
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <div>
                                  <div className="text-xs font-medium text-[#F7F4EC]">
                                    {perm.name}
                                  </div>
                                  <div className="text-[10px] text-[#85827B] line-clamp-1">
                                    {perm.description}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-4 hidden md:table-cell">
                              <span className="text-[10px] font-mono text-[#85827B]">
                                {perm.code}
                              </span>
                            </td>

                            {/* Cells for each role */}
                            {roles.map((r) => {
                              const cell = perm.roleStates[r.id] || {
                                roleId: r.id,
                                roleName: r.name,
                                state: "denied",
                                isAllowed: false,
                              };
                              const isSelectedRole = r.id === selectedRoleId;

                              return (
                                <td
                                  key={r.id}
                                  onClick={() =>
                                    onSelectCell(
                                      perm.code,
                                      perm.name,
                                      perm.description,
                                      group.domainName,
                                      r.id,
                                      cell
                                    )
                                  }
                                  className={`py-2 px-3 text-center cursor-pointer transition-colors ${
                                    isSelectedRole ? "bg-[#1F1713]" : "hover:bg-white/[0.04]"
                                  }`}
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="inline-flex items-center justify-center p-1 rounded hover:scale-110 transition-transform">
                                        {cell.state === "allowed" || cell.state === "system_required" ? (
                                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                                        ) : cell.state === "entitlement_restricted" ? (
                                          <Icon
                                            icon="solar:lock-keyhole-bold"
                                            className="w-3.5 h-3.5 text-amber-400"
                                          />
                                        ) : (
                                          <span className="w-2 h-2 rounded-full border border-white/20" />
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#202020] text-xs text-[#F7F4EC] border-white/10 p-2 space-y-1">
                                      <div className="font-semibold">{r.name}: {perm.name}</div>
                                      <div className="font-mono text-[10px] text-[#85827B]">
                                        Status: {cell.state.toUpperCase()}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
