"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface WorkspaceAccessRailProps {
  membersCount: number;
  teamsCount: number;
  rolesCount: number;
  pendingInvitesCount: number;
  activeTab?: "members" | "invitations";
  onTabChange?: (tab: "members" | "invitations") => void;
  className?: string;
}

/**
 * Workspace Access Rail — Connected operational metrics rail
 * Visual backbone leading into the Workspace Access Orbit and Identity Ledger.
 * Uses authoritative real data only.
 */
export function WorkspaceAccessRail({
  membersCount,
  teamsCount,
  rolesCount,
  pendingInvitesCount,
  activeTab = "members",
  onTabChange,
  className,
}: WorkspaceAccessRailProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface/70 backdrop-blur-xs p-3 sm:p-4 font-mono select-none shadow-xs transition-colors",
        className
      )}
      role="region"
      aria-label="Workspace Access Metrics Rail"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
        {/* Metric 1: Members */}
        <button
          type="button"
          onClick={() => onTabChange?.("members")}
          className={cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-left",
            activeTab === "members"
              ? "border-primary/40 bg-primary/5 text-foreground shadow-xs"
              : "border-transparent hover:border-border hover:bg-muted/30 text-muted-foreground"
          )}
        >
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <NxtqrIcon name="member" size={16} />
          </div>
          <div>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground block font-bold leading-tight">
              MEMBERS
            </span>
            <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground leading-none">
              {membersCount.toString().padStart(2, "0")}
            </span>
          </div>
        </button>

        {/* Rail Connector */}
        <div className="hidden md:flex items-center text-border/70 flex-1 max-w-[60px] justify-center" aria-hidden="true">
          <span className="w-full h-[1px] bg-border/80 relative">
            <span className="absolute left-1/2 -top-[2px] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border" />
          </span>
        </div>

        {/* Metric 2: Teams */}
        <div className="flex items-center gap-3 px-3 py-1.5">
          <div className="w-8 h-8 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <NxtqrIcon name="team" size={16} />
          </div>
          <div>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground block font-bold leading-tight">
              TEAMS
            </span>
            <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground leading-none">
              {teamsCount.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Rail Connector */}
        <div className="hidden md:flex items-center text-border/70 flex-1 max-w-[60px] justify-center" aria-hidden="true">
          <span className="w-full h-[1px] bg-border/80 relative">
            <span className="absolute left-1/2 -top-[2px] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border" />
          </span>
        </div>

        {/* Metric 3: Roles */}
        <div className="flex items-center gap-3 px-3 py-1.5">
          <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <NxtqrIcon name="permission" size={16} />
          </div>
          <div>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground block font-bold leading-tight">
              ROLES
            </span>
            <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground leading-none">
              {rolesCount.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Rail Connector */}
        <div className="hidden md:flex items-center text-border/70 flex-1 max-w-[60px] justify-center" aria-hidden="true">
          <span className="w-full h-[1px] bg-border/80 relative">
            <span className="absolute left-1/2 -top-[2px] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border" />
          </span>
        </div>

        {/* Metric 4: Invites */}
        <button
          type="button"
          onClick={() => onTabChange?.("invitations")}
          className={cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-left",
            activeTab === "invitations"
              ? "border-[#FA520F]/40 bg-[#FA520F]/5 text-foreground shadow-xs"
              : "border-transparent hover:border-border hover:bg-muted/30 text-muted-foreground"
          )}
        >
          <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <NxtqrIcon name="mail" size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground block font-bold leading-tight">
                INVITES
              </span>
              {pendingInvitesCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold leading-tight">
                  PENDING
                </span>
              )}
            </div>
            <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground leading-none">
              {pendingInvitesCount.toString().padStart(2, "0")}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
