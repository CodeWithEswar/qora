"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { RoleOverviewItem } from "@nxtqr/contracts";

interface AccessTopologyProps {
  roles: RoleOverviewItem[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
}

export function AccessTopology({
  roles,
  selectedRoleId,
  onSelectRole,
}: AccessTopologyProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);

  // Group roles
  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  // Resource domains mapped from permission counts
  const resourceDomains = [
    { key: "qr", label: "QR CODES", icon: "solar:qr-code-bold", count: 6 },
    { key: "brand", label: "BRAND & ASSETS", icon: "solar:pallete-2-bold", count: 4 },
    { key: "routing", label: "ROUTING BRAIN", icon: "solar:branching-paths-down-bold", count: 3 },
    { key: "teams", label: "TEAMS & ACCESS", icon: "solar:users-group-two-rounded-bold", count: 8 },
    { key: "analytics", label: "ANALYTICS", icon: "solar:chart-2-bold", count: 2 },
    { key: "domains", label: "DOMAINS", icon: "solar:link-circle-bold", count: 4 },
  ];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-6 space-y-6">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:diagram-up-bold" className="w-4 h-4 text-[#FA520F]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
              Access Architecture Topology
            </h3>
          </div>
          <p className="text-xs text-[#85827B] mt-0.5">
            Deterministic propagation: Organization Root → Role Authorities → Capability Clusters → Resource Boundaries
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#85827B] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FA520F]" />
            Active Role
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            Authority Flow
          </span>
        </div>
      </div>

      {/* Structured Deterministic Diagram */}
      <div className="relative py-4 flex flex-col items-center gap-8 min-w-[640px] overflow-x-auto">
        {/* Tier 1: Organization Root Tenant Boundary */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-[#FA520F]/40 bg-[#FA520F]/10 shadow-lg shadow-[#FA520F]/5">
            <Icon icon="solar:buildings-3-bold" className="w-4 h-4 text-[#FA520F]" />
            <span className="text-xs font-bold tracking-widest text-[#F7F4EC] uppercase font-mono">
              TENANT BOUNDARY
            </span>
            <span className="text-[10px] text-[#FA520F] bg-[#FA520F]/20 px-1.5 py-0.5 rounded font-mono">
              ROOT
            </span>
          </div>
          {/* Connector line down */}
          <div className="h-6 w-px bg-gradient-to-b from-[#FA520F]/50 to-white/10" />
        </div>

        {/* Tier 2: Roles Bus */}
        <div className="relative w-full max-w-4xl">
          {/* Horizontal trunk line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-white/10 -translate-y-px" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
            {roles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              const hasMembers = role.memberCount > 0;

              return (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  onMouseEnter={() => setHoveredNode(role.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`group relative text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-[#FA520F] bg-[#1F1713] ring-1 ring-[#FA520F]/60 shadow-md shadow-[#FA520F]/10"
                      : "border-white/[0.08] bg-[#191919] hover:bg-[#202020] hover:border-white/[0.16]"
                  }`}
                >
                  {/* Vertical branch connector from trunk */}
                  <div
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-px transition-colors ${
                      isSelected ? "bg-[#FA520F]" : "bg-white/10 group-hover:bg-white/20"
                    }`}
                  />

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[#F7F4EC] group-hover:text-white truncate">
                      {role.name}
                    </span>
                    {role.isSystem ? (
                      <span className="text-[9px] font-mono text-[#85827B] uppercase bg-white/[0.04] px-1 py-0.5 rounded border border-white/[0.06]">
                        SYS
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#FA520F] uppercase bg-[#FA520F]/10 px-1 py-0.5 rounded border border-[#FA520F]/20">
                        CUSTOM
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[#85827B] line-clamp-1 mb-2">
                    {role.description || "Custom tenant permissions"}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#B8B5AD] pt-1.5 border-t border-white/[0.06]">
                    <span>{role.memberCount} {role.memberCount === 1 ? "member" : "members"}</span>
                    <span className={isSelected ? "text-[#FA520F] font-bold" : "text-[#85827B]"}>
                      {role.permissionCount} caps
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 3: Capability Clusters / Resource Boundaries */}
        <div className="w-full max-w-4xl pt-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#85827B] text-center mb-3">
            Enforced Resource Boundaries
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {resourceDomains.map((domain) => (
              <div
                key={domain.key}
                className="p-2 rounded-md border border-white/[0.06] bg-[#191919] flex flex-col items-center text-center gap-1 hover:border-white/[0.12] transition-colors"
              >
                <Icon icon={domain.icon} className="w-4 h-4 text-[#B8B5AD]" />
                <span className="text-[10px] font-medium text-[#F7F4EC] tracking-tight">
                  {domain.label}
                </span>
                <span className="text-[9px] font-mono text-[#85827B]">
                  {domain.count} actions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
