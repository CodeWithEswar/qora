"use client";

import * as React from "react";
import {
  Building2,
  Users,
  Shield,
  Layers,
  Key,
  Check,
  ChevronRight,
  Zap,
  Globe,
  Server,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopologyTeam {
  id: string;
  name: string;
  membersCount: number;
}

interface TopologyRole {
  id: string;
  name: string;
  isSystem: boolean;
  memberCount: number;
}

interface OrganizationAccessTopologyProps {
  organization: {
    name: string;
    slug: string;
  };
  teams: TopologyTeam[];
  roles: TopologyRole[];
  membersCount: number;
  onSelectTeam?: (teamId: string) => void;
  onSelectRole?: (roleId: string) => void;
}

export function OrganizationAccessTopology({
  organization,
  teams,
  roles,
  membersCount,
  onSelectTeam,
  onSelectRole,
}: OrganizationAccessTopologyProps) {
  const [activeStage, setActiveStage] = React.useState<number>(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const stageRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const stages = [
    { id: 0, label: "01 Root", title: "Identity", icon: Building2 },
    { id: 1, label: "02 Groups", title: `Teams (${teams.length})`, icon: Layers },
    { id: 2, label: "03 Roles", title: `Roles (${roles.length})`, icon: Shield },
    { id: 3, label: "04 Edge", title: "Edge Authority", icon: Zap },
  ];

  const scrollToStage = (index: number) => {
    setActiveStage(index);
    const target = stageRefs.current[index];
    if (target && scrollContainerRef.current) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // Synchronize active dot/pill on mobile scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85;
    const newStage = Math.min(
      stages.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    if (newStage !== activeStage) {
      setActiveStage(newStage);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5 md:p-6 shadow-xs space-y-4 sm:space-y-5">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          {/* Finder pattern mark */}
          <div className="w-7 h-7 rounded-md border-2 border-primary p-1 flex items-center justify-center shrink-0 bg-primary/5">
            <div className="w-3 h-3 bg-primary rounded-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground tracking-wider font-mono uppercase">
                Access Topology Matrix
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Policy Matrix
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deterministic routing pipeline: Identity &rarr; Teams &rarr; Roles &rarr; Edge Authority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground self-start sm:self-auto">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/40 border border-border/60">
            <Server className="h-3 w-3 text-primary" />
            Tenant Isolated
          </span>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (Phone only) */}
      <div className="flex md:hidden items-center justify-between gap-1 p-1 bg-muted/40 border border-border/60 rounded-xl overflow-x-auto scrollbar-none">
        {stages.map((st) => {
          const Icon = st.icon;
          const isSelected = activeStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => scrollToStage(st.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                isSelected
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-3 w-3",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="text-[11px] font-mono">{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Responsive Pipeline: Horizontal Snap on Mobile, 4-Column Grid on Desktop */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-3.5 md:gap-5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid-cols-2 xl:grid-cols-4 items-stretch scrollbar-none"
      >
        {/* ============================================================ */}
        {/* STAGE 1: IDENTITY ROOT */}
        {/* ============================================================ */}
        <div
          ref={(el) => {
            stageRefs.current[0] = el;
          }}
          className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink flex flex-col rounded-xl border border-primary/30 bg-primary/[0.03] dark:bg-primary/[0.06] p-4 relative group transition-all hover:border-primary/50 shadow-xs"
        >
          {/* Stage Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-primary/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10">
                01 ROOT
              </span>
              <span className="text-xs font-semibold text-foreground">Workspace Identity</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Root Authority Verified" />
          </div>

          {/* Card Body */}
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-foreground truncate" title={organization.name}>
                    {organization.name}
                  </h4>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">
                    /{organization.slug}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface/80 border border-border/70 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Active Seats:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {membersCount} {membersCount === 1 ? "member" : "members"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Control Boundary:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono text-[10px]">
                    Authoritative Database
                  </span>
                </div>
              </div>
            </div>

            {/* Step Pipeline Footer */}
            <div className="pt-2 text-[10px] font-mono text-muted-foreground flex items-center justify-between border-t border-primary/15">
              <span>Trust Anchor</span>
              <span className="flex items-center text-primary font-medium gap-0.5">
                Routes To <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STAGE 2: TEAMS & GROUPS */}
        {/* ============================================================ */}
        <div
          ref={(el) => {
            stageRefs.current[1] = el;
          }}
          className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink flex flex-col rounded-xl border border-border/80 bg-surface p-4 relative group transition-all hover:border-blue-500/40 shadow-xs"
        >
          {/* Stage Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10">
                02 GROUPS
              </span>
              <span className="text-xs font-semibold text-foreground">
                Teams ({teams.length})
              </span>
            </div>
            <Layers className="h-3.5 w-3.5 text-blue-500" />
          </div>

          {/* Card Body */}
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            {teams.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed border-border/80 bg-surface-hover/30 my-1">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-2">
                  <Users className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-foreground">Direct Assignment</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed max-w-[200px]">
                  No team partitions. Workspace members inherit role capabilities directly.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTeam?.(t.id)}
                    className="w-full flex items-center justify-between gap-2 p-2 rounded-lg border border-border/60 bg-surface-hover/40 hover:bg-blue-500/5 hover:border-blue-500/40 text-left transition-all text-xs group/item"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-xs bg-blue-500 shrink-0" />
                      <span className="font-medium text-foreground truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400">
                        {t.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      {t.membersCount}p
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Step Pipeline Footer */}
            <div className="pt-2 text-[10px] font-mono text-muted-foreground flex items-center justify-between border-t border-border/60">
              <span>Partition Scope</span>
              <span className="flex items-center text-blue-600 dark:text-blue-400 font-medium gap-0.5">
                Evaluates <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STAGE 3: ROLES & POLICY MATRIX */}
        {/* ============================================================ */}
        <div
          ref={(el) => {
            stageRefs.current[2] = el;
          }}
          className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink flex flex-col rounded-xl border border-border/80 bg-surface p-4 relative group transition-all hover:border-amber-500/40 shadow-xs"
        >
          {/* Stage Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/70">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                03 ROLES
              </span>
              <span className="text-xs font-semibold text-foreground">
                Policies ({roles.length})
              </span>
            </div>
            <Shield className="h-3.5 w-3.5 text-amber-500" />
          </div>

          {/* Card Body: Expanded Role Grid */}
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            <div className="flex-1 space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
              {roles.map((r) => {
                const hasMembers = r.memberCount > 0;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectRole?.(r.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all text-xs group/role",
                      hasMembers
                        ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                        : "border-border/60 bg-surface-hover/30 hover:border-amber-500/30 hover:bg-amber-500/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-xs shrink-0",
                          r.isSystem ? "bg-amber-500" : "bg-primary"
                        )}
                      />
                      <span
                        className={cn(
                          "truncate font-medium",
                          hasMembers ? "text-foreground font-semibold" : "text-foreground/80"
                        )}
                      >
                        {r.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted/70 text-muted-foreground uppercase">
                        {r.isSystem ? "SYS" : "CUST"}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded",
                          hasMembers
                            ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold"
                            : "text-muted-foreground bg-muted/40"
                        )}
                      >
                        {r.memberCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Pipeline Footer */}
            <div className="pt-2 text-[10px] font-mono text-muted-foreground flex items-center justify-between border-t border-border/60">
              <span>Capability Matrix</span>
              <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium gap-0.5">
                Enforces <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STAGE 4: EDGE AUTHORITY & ENFORCEMENT */}
        {/* ============================================================ */}
        <div
          ref={(el) => {
            stageRefs.current[3] = el;
          }}
          className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05] p-4 relative group transition-all hover:border-emerald-500/50 shadow-xs"
        >
          {/* Stage Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                04 EDGE
              </span>
              <span className="text-xs font-semibold text-foreground">Authority Enforced</span>
            </div>
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          {/* Card Body: Live Enforced Domains */}
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface/80 border border-border/70">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-medium truncate text-[11px]">QR Brain & Routing</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                  Global KV
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface/80 border border-border/70">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium truncate text-[11px]">Guardian Sentinel</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                  Zero Fallback
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface/80 border border-border/70">
                <div className="flex items-center gap-2 truncate">
                  <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium truncate text-[11px]">Developer APIs</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                  Scoped HMAC
                </span>
              </div>
            </div>

            {/* Step Pipeline Footer */}
            <div className="pt-2 text-[10px] font-mono text-muted-foreground flex items-center justify-between border-t border-emerald-500/20">
              <span>Global Anycast Edge Network</span>
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-1 text-[10px]">
                <Check className="h-3 w-3" /> Live Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Pagination Dots & Helper (Phone only) */}
      <div className="flex md:hidden items-center justify-between pt-1 px-1 text-[11px] font-mono text-muted-foreground border-t border-border/50">
        <div className="flex items-center gap-1.5">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => scrollToStage(st.id)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeStage === st.id
                  ? "w-5 bg-primary rounded-full"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Jump to stage ${st.label}`}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          Swipe stages <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
