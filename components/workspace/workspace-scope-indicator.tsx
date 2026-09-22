"use client";

import * as React from "react";
import { Building2, ShieldCheck } from "lucide-react";

interface WorkspaceScopeIndicatorProps {
  workspaceName: string;
  slug: string;
  isOwner: boolean;
}

export function WorkspaceScopeIndicator({
  workspaceName,
  slug,
  isOwner,
}: WorkspaceScopeIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface/40 border border-border/60 text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80">
          Current Scope:
        </span>
        <span className="font-semibold text-foreground flex items-center gap-1.5 font-display">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span>{workspaceName}</span>
        </span>
        <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline-block">
          ({slug})
        </span>
      </div>

      <div className="flex items-center gap-2 font-mono text-[10px]">
        {isOwner ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="h-3 w-3" />
            OWNER AUTHORITY
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
            ACTIVE MEMBER
          </span>
        )}
      </div>
    </div>
  );
}
