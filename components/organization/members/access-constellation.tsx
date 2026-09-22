"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown,
  ShieldCheck,
  Users,
  Eye,
  Search,
  HelpCircle,
  ArrowRight,
  Sparkles,
  QrCode,
  Palette,
  Folder,
  Globe,
  Filter,
  Layers,
  Lock,
} from "lucide-react";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { TeamMark } from "@/components/collaborate/teams/team-mark";
import { RoleBadge } from "../shared/role-badge";
import { WhyAccessSheet, AccessExplanationTarget } from "./why-access-sheet";

interface RoleOption {
  id: string;
  code?: string;
  name: string;
  description?: string | null;
}

interface TeamOption {
  id: string;
  name: string;
  description?: string;
}

export type AccessLens = "all" | "identity" | "roles" | "teams" | "resources";

interface WorkspaceAccessConstellationProps {
  organizationName: string;
  organizationSlug?: string;
  members: AdminMemberSummary[];
  roles: RoleOption[];
  teams: TeamOption[];
  onSelectMember?: (member: AdminMemberSummary) => void;
  onOpenMemberInDirectory?: (member: AdminMemberSummary) => void;
  onFilterByRole?: (roleId: string) => void;
  onFilterByTeam?: (teamId: string) => void;
  className?: string;
}

const CANONICAL_CAPABILITY_CLUSTERS = [
  {
    namespace: "QR Lifecycle",
    icon: QrCode,
    permissions: ["qr.read", "qr.create", "qr.update", "qr.publish"],
    requiredRoles: ["owner", "admin", "member"],
  },
  {
    namespace: "Routing Brain",
    icon: Sparkles,
    permissions: ["routing.read", "routing.update", "campaigns.read"],
    requiredRoles: ["owner", "admin", "member"],
  },
  {
    namespace: "Brand & Assets",
    icon: Palette,
    permissions: ["brand.read", "brand.manage", "folders.read"],
    requiredRoles: ["owner", "admin"],
  },
  {
    namespace: "Governance & Access",
    icon: ShieldCheck,
    permissions: ["members.invite", "teams.create", "roles.assign"],
    requiredRoles: ["owner"],
  },
];

export function WorkspaceAccessConstellation({
  organizationName,
  organizationSlug = "laddahdev",
  members,
  roles,
  teams,
  onSelectMember,
  onOpenMemberInDirectory,
  onFilterByRole,
  onFilterByTeam,
  className,
}: WorkspaceAccessConstellationProps) {
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(
    members[0]?.id || null
  );
  const [activeLens, setActiveLens] = React.useState<AccessLens>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [whyAccessTarget, setWhyAccessTarget] = React.useState<AccessExplanationTarget | null>(null);

  const selectedMember = React.useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0] || null;
  }, [members, selectedMemberId]);

  const ownerMember = React.useMemo(() => {
    return (
      members.find((m) => m.roleCode === "OWNER" || m.roleName.toLowerCase() === "owner") ||
      members[0] ||
      null
    );
  }, [members]);

  // Group members by role
  const membersByRole = React.useMemo(() => {
    const map = new Map<string, AdminMemberSummary[]>();
    for (const r of roles) {
      map.set(r.id, []);
    }
    for (const m of members) {
      const list = map.get(m.roleId);
      if (list) {
        list.push(m);
      } else {
        map.set(m.roleId, [m]);
      }
    }
    return map;
  }, [members, roles]);

  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.roleName.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const handleOpenWhyAccess = (target: AccessExplanationTarget) => {
    setWhyAccessTarget(target);
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/80 bg-surface/70 font-mono select-none shadow-xs overflow-hidden",
        className
      )}
      role="region"
      aria-label="Workspace Access Constellation"
    >
      {/* 1. Constellation Command & Filter Rail */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              ACCESS CONSTELLATION
            </span>
            <span className="text-border text-xs hidden sm:inline">│</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline font-sans">
              Precision Authorization Fabric
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
            <span className="uppercase">CURRENT ACCESS GRAPH</span>
          </div>
        </div>

        {/* Search, Lenses, & Focus Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph..."
              className="h-7 pl-8 pr-2 text-xs font-mono w-44 bg-surface border-border/60"
            />
          </div>

          {/* Access Lens Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface border border-border/70 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveLens("all")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeLens === "all" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setActiveLens("identity")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeLens === "identity" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              IDENTITY
            </button>
            <button
              type="button"
              onClick={() => setActiveLens("roles")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeLens === "roles" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ROLES
            </button>
            <button
              type="button"
              onClick={() => setActiveLens("teams")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeLens === "teams" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              TEAMS
            </button>
          </div>

          <Button
            variant={isFocused ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFocused(!isFocused)}
            className="h-7 px-2.5 text-[10px] font-mono cursor-pointer"
          >
            {isFocused ? "FOCUSED" : "FOCUS"}
          </Button>
        </div>
      </div>

      {/* 2. Desktop & Tablet Four-Plane Architecture Canvas */}
      <div className="hidden md:block p-6 lg:p-8 space-y-8 relative">
        {/* Plane A: IDENTITY INGRESS */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <span>IDENTITY INGRESS</span>
            <span className="text-border">·</span>
            <span>{members.length} AUTHENTICATED</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {filteredMembers.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              const isOwner = member.roleCode === "OWNER" || member.roleName.toLowerCase() === "owner";

              return (
                <div
                  key={member.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedMemberId(member.id);
                      onSelectMember?.(member);
                    }
                  }}
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    onSelectMember?.(member);
                  }}
                  className={cn(
                    "group px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative shadow-xs select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/50 scale-102"
                      : isFocused
                      ? "opacity-30 border-border bg-surface/50"
                      : "border-border/80 bg-surface hover:border-border hover:bg-surface-hover"
                  )}
                >
                  <Avatar className="w-8 h-8 border border-border text-xs font-bold shrink-0">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.displayName} />}
                    <AvatarFallback className="bg-muted text-foreground">
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-sans text-foreground truncate max-w-[130px]">
                        {member.displayName}
                      </span>
                      {isOwner && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {member.email}
                    </span>
                  </div>

                  <RoleBadge role={member.roleCode || member.roleName} className="ml-1 text-[9px]" />

                  {/* Why Access Action */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWhyAccess({
                        type: "member",
                        title: member.displayName,
                        member,
                        description: `Member authenticated through organization workspace membership.`,
                      });
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary cursor-pointer ml-1"
                    title="Why does this member have access?"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Central Stem from Ingress to Trust Core with Boundary Gate */}
          <div className="flex flex-col items-center my-1" aria-hidden="true">
            <div className="w-[2px] h-6 bg-gradient-to-b from-primary to-amber-500/80" />
            <div className="w-5 h-5 rounded-md bg-surface border border-primary flex items-center justify-center text-[9px] font-mono font-bold text-primary shadow-xs">
              ORG
            </div>
            <div className="w-[2px] h-6 bg-gradient-to-b from-amber-500/80 to-border" />
          </div>
        </div>

        {/* Plane B, C, D: Tri-Plane Field (Authority ── Trust Core ── Team Boundaries) */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left 4 Cols: AUTHORITY & CAPABILITY CONSTELLATION */}
          <div
            className={cn(
              "col-span-4 space-y-3 transition-opacity duration-200",
              activeLens !== "all" && activeLens !== "roles" ? "opacity-35" : "opacity-100"
            )}
          >
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                AUTHORITY PLANE
              </span>
              <span className="text-[10px] text-primary font-bold">ROLES</span>
            </div>

            {/* Configured Roles */}
            <div className="space-y-2">
              {roles.map((role) => {
                const assigned = membersByRole.get(role.id) || [];
                const isSelectedRole = selectedMember?.roleId === role.id;
                const isOwner = role.name.toLowerCase() === "owner";

                return (
                  <div
                    key={role.id}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      isSelectedRole
                        ? "border-amber-500/80 bg-amber-500/10 shadow-xs"
                        : assigned.length === 0
                        ? "border-border/50 bg-surface/30 opacity-60"
                        : "border-border/80 bg-surface"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center",
                            isOwner
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-indigo-500/15 text-indigo-500"
                          )}
                        >
                          {isOwner ? <Crown className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-xs font-bold text-foreground font-sans">
                          {role.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {assigned.length} ASSIGNED
                      </span>
                    </div>

                    {/* Expandable Capabilities preview when role is selected */}
                    {isSelectedRole && (
                      <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2">
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block font-semibold">
                          EFFECTIVE CAPABILITIES:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {CANONICAL_CAPABILITY_CLUSTERS.map((cluster) => {
                            const Icon = cluster.icon;
                            return (
                              <button
                                key={cluster.namespace}
                                type="button"
                                onClick={() =>
                                  handleOpenWhyAccess({
                                    type: "capability",
                                    title: cluster.namespace,
                                    roleName: role.name,
                                    member: selectedMember,
                                    description: `Granted via ${role.name} role: ${cluster.permissions.join(", ")}`,
                                  })
                                }
                                className="p-1.5 rounded bg-surface/80 border border-border/70 hover:border-primary text-left cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-1.5 text-[10px] text-foreground font-sans font-semibold">
                                  <Icon className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate">{cluster.namespace}</span>
                                </div>
                                <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
                                  {cluster.permissions.length} perms
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center 4 Cols: TRUST CORE (ORGANIZATION ANCHOR) */}
          <div className="col-span-4 flex flex-col items-center">
            <div className="w-full p-5 rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-surface via-surface to-surface/90 text-center relative shadow-lg space-y-4">
              {/* Decorative QR-module corners */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-primary" />

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-wider uppercase">
                <Lock className="h-3 w-3" />
                <span>TRUST CORE</span>
              </div>

              {/* Organization Mark & Name */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                  <NxtqrMark variant="white" size={26} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans text-foreground">
                    {organizationName}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    {members.length} Total Workspace Account
                  </span>
                </div>
              </div>

              {/* Trust Rings Invariant */}
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 text-[10px] text-muted-foreground font-mono text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span>TENANT BOUNDARY:</span>
                  <span className="text-emerald-500 font-bold">ISOLATED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ROLE PRIMACY:</span>
                  <span className="text-foreground font-semibold">ENFORCED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: TEAM BOUNDARY & RESOURCE SCOPE */}
          <div
            className={cn(
              "col-span-4 space-y-3 transition-opacity duration-200",
              activeLens !== "all" && activeLens !== "teams" && activeLens !== "resources" ? "opacity-35" : "opacity-100"
            )}
          >
            <div className="flex items-center justify-between pb-1 border-b border-border/60">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                TEAM BOUNDARY PLANE
              </span>
              <span className="text-[10px] text-indigo-500 font-bold">COLLABORATION</span>
            </div>

            {/* Teams Roster */}
            <div className="space-y-3">
              {teams.length === 0 ? (
                <div className="p-4 rounded-lg bg-surface/40 border border-dashed border-border text-center text-xs text-muted-foreground font-mono">
                  No teams configured.
                </div>
              ) : (
                teams.map((team) => {
                  return (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-xl border border-border/80 bg-surface space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TeamMark name={team.name} id={team.id} size={28} />
                          <div className="truncate">
                            <span className="text-xs font-bold text-foreground block truncate font-sans">
                              {team.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono block">
                              1 member
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-7 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/10 font-mono gap-1 cursor-pointer"
                        >
                          <Link href={`/${organizationSlug}/teams/${team.id}`}>
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>

                      {/* Resource Scope Port Visual */}
                      <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60 space-y-1.5 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-muted-foreground uppercase font-bold">
                          <span>CONNECTED WORK:</span>
                          <span className="text-foreground">0 ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground/80">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
                            <span>QR</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
                            <span>CAMP</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
                            <span>BRAND</span>
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 italic block">
                          Ready for resource assignment
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Legend Rail */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-4">
            <span className="font-bold uppercase text-foreground">RELATIONSHIPS:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-[2px] bg-primary" />
              <span>Permission Grant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-[1px] bg-amber-500 border-b border-dashed border-amber-500" />
              <span>Org Membership</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-[1px] bg-indigo-500 border-b border-dotted border-indigo-500" />
              <span>Team Responsibility</span>
            </span>
          </div>

          <div className="text-[11px] font-sans">
            Click any member or role to illuminate their authorization trace.
          </div>
        </div>
      </div>

      {/* 3. Mobile Recomposition: ACCESS TRACE STACK (<768px) */}
      <div className="block md:hidden p-4 space-y-4">
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          WORKSPACE ACCESS TRACE
        </div>

        {/* Step 1: Member Ingress */}
        {selectedMember && (
          <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8">
                {selectedMember.avatarUrl && <AvatarImage src={selectedMember.avatarUrl} />}
                <AvatarFallback>{selectedMember.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xs font-bold text-foreground block">{selectedMember.displayName}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{selectedMember.email}</span>
              </div>
            </div>
            <RoleBadge role={selectedMember.roleCode || selectedMember.roleName} />
          </div>
        )}

        {/* Step 2: Trust Core */}
        <div className="p-3 rounded-lg bg-surface border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white">
              <NxtqrMark variant="white" size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">{organizationName}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Workspace Trust Core</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px]">ISOLATED</Badge>
        </div>

        {/* Step 3: Role & Capability */}
        <div className="p-3 rounded-lg bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">{selectedMember?.roleName || "Owner"} Role</span>
            <span className="text-[10px] text-primary font-mono">ALL CAPABILITIES</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Authorizes operational access to QR generation, campaign routing, and asset controls.
          </p>
        </div>

        {/* Step 4: Teams & Connected Work */}
        {teams[0] && (
          <div className="p-3 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{teams[0].name} Team</span>
              <Button size="sm" variant="ghost" asChild className="h-6 text-xs text-primary p-0">
                <Link href={`/${organizationSlug}/teams/${teams[0].id}`}>
                  Open team →
                </Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              0 connected resources. Defines operational responsibility.
            </p>
          </div>
        )}
      </div>

      {/* 4. Why Access Explanation Sheet */}
      <WhyAccessSheet
        target={whyAccessTarget}
        organizationSlug={organizationSlug}
        isOpen={Boolean(whyAccessTarget)}
        onClose={() => setWhyAccessTarget(null)}
        onOpenMemberInDirectory={onOpenMemberInDirectory}
      />
    </div>
  );
}
