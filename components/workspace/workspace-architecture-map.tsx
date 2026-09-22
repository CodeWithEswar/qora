"use client";

import * as React from "react";
import {
  Building2,
  Palette,
  Globe,
  Shield,
  Users,
  QrCode,
  GitFork,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  CircleDashed,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface WorkspaceArchitectureMapProps {
  overview: WorkspaceControlPlaneOverview;
  onSelectSection: (sectionId: string) => void;
  activeSection?: string;
}

type NodeStatus = "configured" | "unconfigured" | "inherited" | "restricted";

interface ArchitectureNode {
  id: string;
  name: string;
  category: "IDENTITY" | "GOVERNANCE" | "DEFAULTS";
  status: NodeStatus;
  statusLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  sectionTarget: string;
  details: string;
}

export function WorkspaceArchitectureMap({
  overview,
  onSelectSection,
  activeSection,
}: WorkspaceArchitectureMapProps) {
  const [expanded, setExpanded] = React.useState(true);

  // Derive real node states from authoritative data
  const nodes: ArchitectureNode[] = React.useMemo(() => {
    const hasBrandDefault = Boolean(overview.brandDefaults.defaultBrandKitId);
    const hasCustomDomains = overview.domains.customDomainsCount > 0;
    const canUseDomains = overview.identity.billingPlan !== "FREE";
    const hasQrDefaults = Boolean(overview.qrDefaults);
    const hasTeams = overview.stats.teamCount > 0;

    return [
      // IDENTITY BRANCH
      {
        id: "brand",
        name: "Brand Kit",
        category: "IDENTITY",
        status: hasBrandDefault ? "configured" : "unconfigured",
        statusLabel: hasBrandDefault ? "Default Active" : "No Default Set",
        icon: Palette,
        sectionTarget: "brand",
        details: hasBrandDefault
          ? `${overview.brandDefaults.defaultBrandKitName}`
          : "Unset — fallback styling",
      },
      {
        id: "domain",
        name: "Domains",
        category: "IDENTITY",
        status: !canUseDomains
          ? "restricted"
          : hasCustomDomains
          ? "configured"
          : "unconfigured",
        statusLabel: !canUseDomains
          ? "Requires Pro"
          : hasCustomDomains
          ? `${overview.domains.customDomainsCount} Active`
          : "nxtqr.vercel.app only",
        icon: Globe,
        sectionTarget: "domains",
        details: hasCustomDomains
          ? `${overview.domains.customDomainsCount} vanity host(s)`
          : "Default platform routing",
      },

      // GOVERNANCE BRANCH
      {
        id: "roles",
        name: "Roles & RBAC",
        category: "GOVERNANCE",
        status: "configured",
        statusLabel: overview.collaborationPolicy.defaultRoleName || "Configured",
        icon: Shield,
        sectionTarget: "collaboration",
        details: `Default role: ${overview.collaborationPolicy.defaultRoleName || "Member"}`,
      },
      {
        id: "teams",
        name: "Team Constellation",
        category: "GOVERNANCE",
        status: hasTeams ? "configured" : "unconfigured",
        statusLabel: hasTeams ? `${overview.stats.teamCount} Team(s)` : "0 Teams",
        icon: Users,
        sectionTarget: "collaboration",
        details: hasTeams ? `${overview.stats.teamCount} collaborate groups` : "Single workspace pool",
      },

      // DEFAULTS BRANCH
      {
        id: "qr",
        name: "QR Defaults",
        category: "DEFAULTS",
        status: hasQrDefaults ? "configured" : "unconfigured",
        statusLabel: `EC-${overview.qrDefaults.errorCorrection} • QZ-${overview.qrDefaults.quietZone}`,
        icon: QrCode,
        sectionTarget: "qr",
        details: `${overview.qrDefaults.moduleStyle} modules`,
      },
      {
        id: "routing",
        name: "Routing Defaults",
        category: "DEFAULTS",
        status: overview.identity.billingPlan === "FREE" ? "restricted" : "configured",
        statusLabel: overview.identity.billingPlan === "FREE" ? "Free Tier" : "Adaptive Edge",
        icon: GitFork,
        sectionTarget: "domains",
        details: "Edge resolver propagation",
      },
    ];
  }, [overview]);

  return (
    <div className="rounded-xl border border-border/70 bg-surface/30 overflow-hidden">
      {/* Top Bar / Collapsible Toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-tight font-display">
            Workspace Configuration Architecture
          </span>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline-block">
            — Deterministic resource inheritance flow
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          {expanded ? "Collapse Map [−]" : "Expand Map [+]"}
        </button>
      </div>

      {expanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Layer: WORKSPACE ROOT */}
          <div className="flex justify-center">
            <div className="relative group px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 shadow-xs flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <span className="text-xs font-bold text-foreground font-mono block">
                  WORKSPACE ROOT
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Tenant Boundary • {overview.identity.name}
                </span>
              </div>
            </div>
          </div>

          {/* Connecting Trunk Line */}
          <div className="flex justify-center">
            <div className="h-4 w-px bg-border/80" />
          </div>

          {/* Middle Three Pillars: IDENTITY, GOVERNANCE, DEFAULTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Pillar 1: IDENTITY */}
            <div className="rounded-lg border border-border/60 bg-surface/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  01 — Identity
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Assets & Domain
                </span>
              </div>

              <div className="space-y-2">
                {nodes
                  .filter((n) => n.category === "IDENTITY")
                  .map((node) => {
                    const Icon = node.icon;
                    const isActive = activeSection === node.sectionTarget;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => onSelectSection(node.sectionTarget)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-md border transition-all flex items-start justify-between gap-2 group cursor-pointer",
                          isActive
                            ? "border-primary/50 bg-primary/5 shadow-xs"
                            : "border-border/50 bg-background/50 hover:bg-surface hover:border-border"
                        )}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-foreground block truncate">
                              {node.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block truncate font-mono">
                              {node.details}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={node.status} label={node.statusLabel} />
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Pillar 2: GOVERNANCE */}
            <div className="rounded-lg border border-border/60 bg-surface/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  02 — Governance
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Access & Boundary
                </span>
              </div>

              <div className="space-y-2">
                {nodes
                  .filter((n) => n.category === "GOVERNANCE")
                  .map((node) => {
                    const Icon = node.icon;
                    const isActive = activeSection === node.sectionTarget;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => onSelectSection(node.sectionTarget)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-md border transition-all flex items-start justify-between gap-2 group cursor-pointer",
                          isActive
                            ? "border-primary/50 bg-primary/5 shadow-xs"
                            : "border-border/50 bg-background/50 hover:bg-surface hover:border-border"
                        )}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-foreground block truncate">
                              {node.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block truncate font-mono">
                              {node.details}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={node.status} label={node.statusLabel} />
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Pillar 3: DEFAULTS */}
            <div className="rounded-lg border border-border/60 bg-surface/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  03 — Defaults
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Creation Templates
                </span>
              </div>

              <div className="space-y-2">
                {nodes
                  .filter((n) => n.category === "DEFAULTS")
                  .map((node) => {
                    const Icon = node.icon;
                    const isActive = activeSection === node.sectionTarget;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => onSelectSection(node.sectionTarget)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-md border transition-all flex items-start justify-between gap-2 group cursor-pointer",
                          isActive
                            ? "border-primary/50 bg-primary/5 shadow-xs"
                            : "border-border/50 bg-background/50 hover:bg-surface hover:border-border"
                        )}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-foreground block truncate">
                              {node.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block truncate font-mono">
                              {node.details}
                            </span>
                          </div>
                        </div>

                        <StatusBadge status={node.status} label={node.statusLabel} />
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Bottom Layer: RESOURCES SINK */}
          <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-3">
            <div className="flex items-center gap-1.5 font-mono">
              <span>INHERITED BY:</span>
              <span className="text-foreground font-semibold">
                {overview.stats.qrCount} QR Codes
              </span>
              <span>•</span>
              <span className="text-foreground font-semibold">
                {overview.stats.landingPageCount} Landing Pages
              </span>
              <span>•</span>
              <span className="text-foreground font-semibold">
                {overview.stats.templateCount} Templates
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70">
              <span>Click node to inspect & configure</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, label }: { status: NodeStatus; label: string }) {
  if (status === "configured") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span className="max-w-[70px] truncate">{label}</span>
      </span>
    );
  }

  if (status === "restricted") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
        <Lock className="h-2.5 w-2.5" />
        <span className="max-w-[70px] truncate">{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-muted text-muted-foreground border border-border/60 shrink-0">
      <CircleDashed className="h-2.5 w-2.5" />
      <span className="max-w-[70px] truncate">{label}</span>
    </span>
  );
}
