"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TeamMark } from "@/components/collaborate/teams/team-mark";
import { Button } from "@/components/ui/button";
import { UserPlus, Link2, Copy, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface TeamContextDockProps {
  teamName: string;
  teamId: string;
  publicId: string;
  memberCount: number;
  workCount: number;
  activeTab: string;
  canManage?: boolean;
  onAddMember: () => void;
  onConnectWork: () => void;
  className?: string;
}

export function TeamContextDock({
  teamName,
  teamId,
  publicId,
  memberCount,
  workCount,
  activeTab,
  canManage = true,
  onAddMember,
  onConnectWork,
  className,
}: TeamContextDockProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Team route copied");
    }
  };

  return (
    <aside
      aria-label="Team Context Dock"
      className={cn(
        "hidden xl:flex flex-col border border-border/80 bg-surface/70 rounded-lg p-3.5 font-mono text-xs transition-all duration-300 shadow-xs h-fit sticky top-20",
        isCollapsed ? "w-14 items-center" : "w-64",
        className
      )}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-border/60">
        {!isCollapsed && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            CONTEXT DOCK
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover cursor-pointer ml-auto"
          title={isCollapsed ? "Expand Dock" : "Collapse Dock"}
          aria-label={isCollapsed ? "Expand Dock" : "Collapse Dock"}
        >
          {isCollapsed ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isCollapsed ? (
        <div className="space-y-4 flex flex-col items-center">
          <TeamMark name={teamName} id={teamId} size={28} className="rounded-md" />
          <div className="text-[10px] font-bold text-foreground text-center">
            {memberCount}M
          </div>
          <div className="text-[10px] font-bold text-muted-foreground text-center">
            {workCount}W
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Identity Snapshot */}
          <div className="flex items-center gap-2.5">
            <TeamMark name={teamName} id={teamId} size={30} className="rounded-md shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-foreground truncate block text-xs font-sans">
                {teamName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {publicId}
              </span>
            </div>
          </div>

          {/* Real Metrics */}
          <div className="p-2.5 rounded-md bg-surface/90 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Members:</span>
              <span className="font-bold text-foreground">{memberCount}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Connected Work:</span>
              <span className="font-bold text-foreground">{workCount}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Active Lens:</span>
              <span className="font-bold text-primary uppercase text-[10px]">
                {activeTab}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          {canManage && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                QUICK COMMANDS
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMember}
                className="w-full justify-start h-7 text-[11px] gap-1.5 border-border/80 text-foreground cursor-pointer"
              >
                <UserPlus className="h-3 w-3 text-blue-500" />
                <span>+ Add member</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onConnectWork}
                className="w-full justify-start h-7 text-[11px] gap-1.5 border-border/80 text-foreground cursor-pointer"
              >
                <Link2 className="h-3 w-3 text-amber-500" />
                <span>+ Connect work</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="w-full justify-start h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>Copy team route</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
