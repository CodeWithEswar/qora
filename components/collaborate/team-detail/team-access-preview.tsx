"use client";

import * as React from "react";
import type { TeamAccessDomain } from "@/lib/supabase/types/teams";
import { ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamAccessPreviewProps {
  accessDomains: TeamAccessDomain[];
  teamName: string;
  onInspectAccessClick: () => void;
  className?: string;
}

export function TeamAccessPreview({
  accessDomains,
  teamName,
  onInspectAccessClick,
  className,
}: TeamAccessPreviewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-surface/60 p-4 sm:p-5 font-mono flex flex-col justify-between space-y-4 shadow-xs",
        className
      )}
    >
      <div className="space-y-3">
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              ACCESS PATH & DOMAINS
            </span>
          </div>
          <button
            type="button"
            onClick={onInspectAccessClick}
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-semibold"
          >
            <span>Inspect access trace</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Truthful Access Hierarchy */}
        <div className="p-3 rounded-md bg-surface/80 border border-border/60 space-y-2">
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            AUTHORIZATION ORIGIN TRACE
          </div>
          <div className="pl-2 border-l-2 border-primary/40 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span className="text-primary text-[10px]">●</span>
              <span>ORGANIZATION MEMBERSHIP</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground pl-3 text-[11px]">
              <span>├── Controls actual RBAC permissions (Admin, Member, Viewer)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span className="text-indigo-500 text-[10px]">●</span>
              <span>{teamName.toUpperCase()} MEMBERSHIP</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground pl-3 text-[11px]">
              <span>└── Boundaries, resource collaboration & notifications</span>
            </div>
          </div>
        </div>

        {/* Domain Levels Preview */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {accessDomains.slice(0, 4).map((dom) => (
            <div
              key={dom.domain}
              className="p-2 rounded-md bg-surface border border-border/50 flex items-center justify-between text-[11px]"
            >
              <span className="text-foreground truncate font-sans font-medium">
                {dom.domain}
              </span>
              <span
                className={cn(
                  "text-[9px] uppercase font-bold font-mono px-1.5 py-0.2 rounded shrink-0",
                  dom.level === "FULL"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : dom.level === "MANAGE"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : dom.level === "VIEW"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {dom.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Signal */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>SECURITY INVARIANT: ZERO ROLE MUTATION</span>
        <span className="text-emerald-500 font-bold">RBAC ENFORCED</span>
      </div>
    </div>
  );
}
