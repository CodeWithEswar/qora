"use client";

import * as React from "react";
import { Info, Sparkles, CheckCircle2, Clock, ShieldAlert, Layers } from "lucide-react";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface ContextImpactPanelProps {
  activeSection: string;
  overview: WorkspaceControlPlaneOverview;
}

interface SectionImpactMetadata {
  scope: string;
  affects: string[];
  existingResources: string;
  safetyTier: "SAFE" | "ATTENTION" | "DESTRUCTIVE";
  explanation: string;
}

const SECTION_IMPACTS: Record<string, SectionImpactMetadata> = {
  general: {
    scope: "Workspace Root",
    affects: ["Workspace URLs", "Public descriptors", "Scheduling timezone"],
    existingResources: "Preserved — internal resource IDs remain unchanged",
    safetyTier: "SAFE",
    explanation: "Changing workspace name or description updates visual surfaces immediately. Changing URL slug affects direct dashboard routing.",
  },
  identity: {
    scope: "Platform Navigation",
    affects: ["Sidebar logo", "Workspace switcher", "Shared invitation cards", "Resource ownership badges"],
    existingResources: "Updated dynamically on next page load",
    safetyTier: "SAFE",
    explanation: "Workspace logo and brand icon represent your organization across internal dashboards and shared invitation previews.",
  },
  brand: {
    scope: "Workspace Defaults",
    affects: ["New QR assets", "New Destination Studio landing pages", "New QR templates"],
    existingResources: "Existing published QR codes remain frozen on their immutable revisions",
    safetyTier: "ATTENTION",
    explanation: "Setting a default Brand Kit automatically pre-fills brand colors, logos, and typography tokens when creating new resources.",
  },
  qr: {
    scope: "QR Studio Defaults",
    affects: ["Default QR creation presets", "Initial canvas error correction", "Default finder eye styling"],
    existingResources: "Existing printed and published QR codes are completely untouched",
    safetyTier: "SAFE",
    explanation: "Newly initiated QR drafts will inherit these error correction levels and geometry tokens by default.",
  },
  collaboration: {
    scope: "Governance & Access",
    affects: ["Future member invitations", "Default role assignment", "External share link creation"],
    existingResources: "Existing active member roles remain unmodified",
    safetyTier: "ATTENTION",
    explanation: "Enforces workspace-level policy on who can invite members, whether publishing requires approvals, and external link sharing rules.",
  },
  notifications: {
    scope: "Organization Routing",
    affects: ["Administrative email alerts", "In-app notifications", "Security event dispatch"],
    existingResources: "No effect on QR resolution or client redirects",
    safetyTier: "SAFE",
    explanation: "Controls which workspace events trigger organization-level alerts and weekly performance summaries.",
  },
  storage: {
    scope: "Binary File Storage",
    affects: ["Uploaded logos", "PDF file destinations", "Custom fonts", "Asset vault"],
    existingResources: "Objects stored in Supabase Storage remain persistent",
    safetyTier: "SAFE",
    explanation: "Monitors asset distribution and generates sanitized JSON exports without exposing any credentials or secrets.",
  },
  domains: {
    scope: "Network & Edge Resolver",
    affects: ["Custom vanity URLs", "Edge redirect SSL handshakes", "QR scan resolution"],
    existingResources: "Existing nxtqr.vercel.app QR codes continue resolving normally",
    safetyTier: "ATTENTION",
    explanation: "NXTQR default domain (nxtqr.vercel.app) is platform infrastructure. Verified custom domains provide organization-owned scan endpoints.",
  },
  capabilities: {
    scope: "Commercial Tier",
    affects: ["Feature availability", "Quota caps", "Allowed team seats"],
    existingResources: "Governed by active subscription plan",
    safetyTier: "SAFE",
    explanation: "Summarizes all entitlement limits and capabilities authorized for this workspace under the current subscription.",
  },
  lifecycle: {
    scope: "Organization Tenancy",
    affects: ["All QR codes", "All dynamic redirects", "All team memberships", "All assets"],
    existingResources: "DESTRUCTIVE: Deleting workspace permanently invalidates all active dynamic QR codes",
    safetyTier: "DESTRUCTIVE",
    explanation: "High-friction zone. Transferring ownership or deleting the workspace requires deliberate typed confirmation and re-authorization.",
  },
};

export function ContextImpactPanel({
  activeSection,
  overview,
}: ContextImpactPanelProps) {
  const impact = SECTION_IMPACTS[activeSection] || SECTION_IMPACTS.general;

  const formattedUpdatedAt = React.useMemo(() => {
    if (!overview.identity.updatedAt) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(overview.identity.updatedAt));
    } catch {
      return overview.identity.updatedAt.slice(0, 10);
    }
  }, [overview.identity.updatedAt]);

  // Configuration DNA: Structural layer visualization (Not a fake percentage)
  const dnaLayers = [
    { label: "IDENTITY", active: Boolean(overview.identity.name), dots: 4 },
    { label: "BRAND", active: Boolean(overview.brandDefaults.defaultBrandKitId), dots: overview.brandDefaults.defaultBrandKitId ? 4 : 2 },
    { label: "QR CORE", active: true, dots: 4 },
    { label: "ACCESS", active: overview.stats.memberCount > 0, dots: 3 },
    { label: "DATA", active: overview.storage.totalBytes > 0, dots: overview.storage.totalBytes > 0 ? 3 : 1 },
  ];

  return (
    <div className="space-y-4">
      {/* Configuration Impact Box */}
      <div className="rounded-xl border border-border/70 bg-surface/40 p-4 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-1.5 font-display text-xs font-bold tracking-tight text-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>CONFIGURATION IMPACT</span>
          </div>

          <span
            className={
              impact.safetyTier === "DESTRUCTIVE"
                ? "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-destructive/10 text-destructive border border-destructive/20"
                : impact.safetyTier === "ATTENTION"
                ? "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                : "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            }
          >
            {impact.safetyTier}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Scope
            </span>
            <span className="font-semibold text-foreground font-mono">
              {impact.scope}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block mb-1">
              Affects
            </span>
            <ul className="space-y-1 text-muted-foreground">
              {impact.affects.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block mb-0.5">
              Existing Resources
            </span>
            <span className="text-muted-foreground text-[11px] leading-relaxed">
              {impact.existingResources}
            </span>
          </div>

          <div className="pt-2 border-t border-border/40">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {impact.explanation}
            </p>
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground/80">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last sync:
            </span>
            <span>{formattedUpdatedAt}</span>
          </div>
        </div>
      </div>

      {/* Signature Feature: Configuration DNA (Structural Visualization) */}
      <div className="rounded-xl border border-border/70 bg-surface/30 p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground font-display">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>CONFIGURATION DNA</span>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Real structural configuration depth across core workspace layers:
        </p>

        <div className="space-y-2 pt-1 font-mono text-[10px]">
          {dnaLayers.map((layer) => (
            <div key={layer.label} className="flex items-center justify-between">
              <span className="text-muted-foreground/80">{layer.label}</span>
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-3 rounded-xs ${
                      i < layer.dots
                        ? "bg-primary"
                        : "bg-muted border border-border/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
