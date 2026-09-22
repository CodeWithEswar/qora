"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, Check, ShieldAlert } from "lucide-react";

interface AccessChangePreviewProps {
  currentRole: {
    name: string;
    code: string;
    description?: string | null;
  };
  proposedRole: {
    name: string;
    code: string;
    description?: string | null;
  };
  teams: Array<{ id: string; name: string }>;
  isLastOwnerWarning?: boolean;
  className?: string;
}

const ROLE_PERM_HIGHLIGHTS: Record<string, string[]> = {
  OWNER: [
    "Full organization control",
    "Billing & plan governance",
    "Member & team administration",
    "Security & developer API keys",
    "Live QR edge publishing",
  ],
  ADMIN: [
    "Workspace operational management",
    "Member invitations & teams",
    "Asset & QR publishing",
    "Brand kit & domains management",
  ],
  MEMBER: [
    "Standard QR & campaign creation",
    "Template editing & asset drafts",
    "Read-only access to billing",
  ],
  VIEWER: [
    "Read-only access to published QRs",
    "View analytics telemetry",
    "Cannot modify assets or access",
  ],
};

export function AccessChangePreview({
  currentRole,
  proposedRole,
  teams,
  isLastOwnerWarning = false,
  className,
}: AccessChangePreviewProps) {
  const currentPerms = ROLE_PERM_HIGHLIGHTS[currentRole.code.toUpperCase()] || [];
  const proposedPerms = ROLE_PERM_HIGHLIGHTS[proposedRole.code.toUpperCase()] || [];

  const gaining = proposedPerms.filter((p) => !currentPerms.includes(p));
  const losing = currentPerms.filter((p) => !proposedPerms.includes(p));
  const unchanged = currentPerms.filter((p) => proposedPerms.includes(p));

  return (
    <div className={cn("space-y-4 rounded-xl border border-border/80 bg-surface/50 p-4 text-xs", className)}>
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
          ACCESS CHANGE PREVIEW
        </span>
        {isLastOwnerWarning && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <ShieldAlert className="h-3 w-3" />
            Owner demotion safeguard active
          </span>
        )}
      </div>

      {/* Side-by-side or Top-down Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CURRENT */}
        <div className="p-3 rounded-lg border border-border/70 bg-surface/70 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>CURRENT ROLE</span>
            <span className="text-muted-foreground/80">Active</span>
          </div>
          <p className="font-semibold text-sm text-foreground">{currentRole.name}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {currentRole.description || "Active assigned authority."}
          </p>
        </div>

        {/* PROPOSED */}
        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-primary font-medium">
            <span>PROPOSED ROLE</span>
            <span className="text-primary/80">Preview</span>
          </div>
          <p className="font-semibold text-sm text-primary">{proposedRole.name}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {proposedRole.description || "Updated assigned authority."}
          </p>
        </div>
      </div>

      {/* Permissions Diff */}
      <div className="space-y-2 pt-1 font-mono text-[11px]">
        {gaining.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
              GAINING ACCESS (+):
            </span>
            <ul className="space-y-0.5 pl-2 text-foreground">
              {gaining.map((g) => (
                <li key={g} className="text-emerald-600 dark:text-emerald-400">
                  + {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {losing.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 tracking-wider">
              LOSING ACCESS (-):
            </span>
            <ul className="space-y-0.5 pl-2 text-muted-foreground">
              {losing.map((l) => (
                <li key={l} className="text-rose-600 dark:text-rose-400">
                  - {l}
                </li>
              ))}
            </ul>
          </div>
        )}

        {unchanged.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
              UNCHANGED:
            </span>
            <ul className="space-y-0.5 pl-2 text-muted-foreground">
              {unchanged.map((u) => (
                <li key={u}>• {u}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {teams.length > 0 && (
        <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">Retained Team Memberships: </span>
          {teams.map((t) => t.name).join(", ")}
        </div>
      )}
    </div>
  );
}
