"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AccessHeaderProps {
  orgSlug: string;
  activeView: "matrix" | "topology" | "map";
  onViewChange: (view: "matrix" | "topology" | "map") => void;
  onOpenSimulator: () => void;
  onOpenComparator: () => void;
  onOpenCreateRole: () => void;
  canManageRoles: boolean;
}

export function AccessHeader({
  orgSlug,
  activeView,
  onViewChange,
  onOpenSimulator,
  onOpenComparator,
  onOpenCreateRole,
  canManageRoles,
}: AccessHeaderProps) {
  return (
    <header className="relative border-b border-white/[0.08] bg-[#121212]/80 backdrop-blur-xl px-6 py-5 transition-all">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Breadcrumbs & Identity */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#85827B]">
            <span className="hover:text-[#B8B5AD] transition-colors">ORGANIZATION</span>
            <span>/</span>
            <span className="text-[#FA520F] font-semibold">ROLES & PERMISSIONS</span>
            <Badge
              variant="outline"
              className="ml-2 border-[#FA520F]/30 bg-[#FA520F]/10 text-[#FA520F] text-[10px] uppercase font-mono tracking-wider px-2 py-0.2"
            >
              CONTROL PLANE
            </Badge>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#F7F4EC] font-sans">
              Roles & Permissions
            </h1>
            <span className="text-xs text-[#85827B] font-mono hidden sm:inline-block">
              {orgSlug}
            </span>
          </div>

          <p className="text-xs text-[#B8B5AD] max-w-2xl leading-relaxed">
            Define who can act, what capabilities they hold, and how authority propagates across your NXTQR resources and tenant boundary.
          </p>
        </div>

        {/* Right: View Toggle & Primary Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#191919] p-0.5 text-xs">
            <button
              onClick={() => onViewChange("matrix")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                activeView === "matrix"
                  ? "bg-[#FA520F] text-white shadow-sm"
                  : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04]"
              }`}
              title="Roles Navigator and Permission Matrix"
            >
              <Icon icon="solar:grid-broken" className="w-3.5 h-3.5" />
              <span>Roles & Matrix</span>
            </button>

            <button
              onClick={() => onViewChange("topology")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                activeView === "topology"
                  ? "bg-[#FA520F] text-white shadow-sm"
                  : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04]"
              }`}
              title="Deterministic Access Topology"
            >
              <Icon icon="solar:diagram-up-bold" className="w-3.5 h-3.5" />
              <span>Topology</span>
            </button>

            <button
              onClick={() => onViewChange("map")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                activeView === "map"
                  ? "bg-[#FA520F] text-white shadow-sm"
                  : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04]"
              }`}
              title="Member to Resource Access Map"
            >
              <Icon icon="solar:map-point-wave-bold" className="w-3.5 h-3.5" />
              <span>Access Map</span>
            </button>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

          {/* Simulate access button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSimulator}
            className="border-white/[0.12] bg-[#191919] text-[#F7F4EC] hover:bg-[#232323] hover:border-[#FA520F]/40 transition-colors text-xs h-8 gap-1.5 font-medium"
          >
            <Icon icon="solar:play-circle-bold" className="w-3.5 h-3.5 text-[#FFB83E]" />
            <span>Simulate access</span>
          </Button>

          {/* Compare roles button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenComparator}
            className="border-white/[0.12] bg-[#191919] text-[#F7F4EC] hover:bg-[#232323] hover:border-white/[0.2] transition-colors text-xs h-8 gap-1.5 font-medium"
          >
            <Icon icon="solar:transfer-horizontal-bold" className="w-3.5 h-3.5 text-[#B8B5AD]" />
            <span>Compare</span>
          </Button>

          {/* Create custom role */}
          {canManageRoles && (
            <Button
              size="sm"
              onClick={onOpenCreateRole}
              className="bg-[#FA520F] text-white hover:bg-[#E04505] active:scale-[0.98] transition-all text-xs h-8 gap-1.5 font-medium shadow-md shadow-[#FA520F]/20"
            >
              <Icon icon="solar:shield-plus-bold" className="w-3.5 h-3.5" />
              <span>Create role</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
