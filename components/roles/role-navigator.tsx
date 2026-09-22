"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RoleOverviewItem } from "@nxtqr/contracts";

interface RoleNavigatorProps {
  roles: RoleOverviewItem[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  canManageRoles: boolean;
  onOpenCreateRole: () => void;
}

export function RoleNavigator({
  roles,
  selectedRoleId,
  onSelectRole,
  canManageRoles,
  onOpenCreateRole,
}: RoleNavigatorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "system" | "custom">("all");

  const filteredRoles = React.useMemo(() => {
    return roles.filter((role) => {
      // Type filter
      if (filterType === "system" && !role.isSystem) return false;
      if (filterType === "custom" && role.isSystem) return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        role.name.toLowerCase().includes(q) ||
        (role.description && role.description.toLowerCase().includes(q)) ||
        role.code.toLowerCase().includes(q)
      );
    });
  }, [roles, filterType, searchQuery]);

  const systemRoles = filteredRoles.filter((r) => r.isSystem);
  const customRoles = filteredRoles.filter((r) => !r.isSystem);

  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-white/[0.08] bg-[#151515] flex flex-col h-full">
      {/* Top Search & Filter Bar */}
      <div className="p-3.5 border-b border-white/[0.08] space-y-2.5">
        <div className="relative">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#85827B]"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter roles by authority..."
            className="h-8 pl-8 text-xs bg-[#191919] border-white/[0.08] text-[#F7F4EC] placeholder:text-[#85827B] focus-visible:ring-[#FA520F]/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85827B] hover:text-[#F7F4EC]"
            >
              <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <button
            onClick={() => setFilterType("all")}
            className={`px-2 py-0.5 rounded transition-all ${
              filterType === "all"
                ? "bg-white/[0.12] text-[#F7F4EC] font-semibold"
                : "text-[#85827B] hover:text-[#B8B5AD]"
            }`}
          >
            ALL ({roles.length})
          </button>
          <button
            onClick={() => setFilterType("system")}
            className={`px-2 py-0.5 rounded transition-all ${
              filterType === "system"
                ? "bg-white/[0.12] text-[#F7F4EC] font-semibold"
                : "text-[#85827B] hover:text-[#B8B5AD]"
            }`}
          >
            SYSTEM ({roles.filter((r) => r.isSystem).length})
          </button>
          <button
            onClick={() => setFilterType("custom")}
            className={`px-2 py-0.5 rounded transition-all ${
              filterType === "custom"
                ? "bg-white/[0.12] text-[#F7F4EC] font-semibold"
                : "text-[#85827B] hover:text-[#B8B5AD]"
            }`}
          >
            CUSTOM ({roles.filter((r) => !r.isSystem).length})
          </button>
        </div>
      </div>

      {/* Role list rail */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {/* System Roles */}
        {systemRoles.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#85827B]">
              <span>System Roles</span>
              <span className="text-[9px] bg-white/[0.04] px-1 rounded">IMMUTABLE</span>
            </div>

            <div className="space-y-1">
              {systemRoles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => onSelectRole(role.id)}
                    className={`w-full group text-left px-3 py-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "border-[#FA520F] bg-[#1F1713] ring-1 ring-[#FA520F]/50 shadow-sm"
                        : "border-transparent bg-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          icon={
                            role.code.toUpperCase() === "OWNER"
                              ? "solar:crown-bold"
                              : role.code.toUpperCase() === "ADMIN"
                              ? "solar:shield-star-bold"
                              : "solar:shield-check-bold"
                          }
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-[#FA520F]" : "text-[#B8B5AD]"
                          }`}
                        />
                        <span className="text-xs font-semibold text-[#F7F4EC] truncate">
                          {role.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#85827B] truncate mt-0.5 pl-5">
                        {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-[#85827B] shrink-0 pt-0.5">
                      {role.permissionCount} caps
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Roles */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#85827B]">
            <span>Custom Roles</span>
            <span className="text-[9px] bg-[#FA520F]/10 text-[#FA520F] px-1 rounded">TENANT</span>
          </div>

          {customRoles.length > 0 ? (
            <div className="space-y-1">
              {customRoles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => onSelectRole(role.id)}
                    className={`w-full group text-left px-3 py-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "border-[#FA520F] bg-[#1F1713] ring-1 ring-[#FA520F]/50 shadow-sm"
                        : "border-transparent bg-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          icon="solar:shield-user-bold"
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-[#FA520F]" : "text-[#FFB83E]"
                          }`}
                        />
                        <span className="text-xs font-semibold text-[#F7F4EC] truncate">
                          {role.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#85827B] truncate mt-0.5 pl-5">
                        {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-[#85827B] shrink-0 pt-0.5">
                      {role.permissionCount} caps
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-white/[0.08] text-center space-y-2">
              <p className="text-[11px] text-[#85827B]">No custom roles configured.</p>
              {canManageRoles && (
                <button
                  onClick={onOpenCreateRole}
                  className="text-xs text-[#FA520F] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Icon icon="solar:add-circle-bold" className="w-3.5 h-3.5" />
                  Create custom role
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
