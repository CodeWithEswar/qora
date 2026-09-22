"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { TeamResourceAssignment, TeamConnectedWorkSummary } from "@/lib/supabase/types/teams";
import { ArrowRight, Link2, QrCode, Sparkles, Folder, Palette, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamWorkPreviewProps {
  connectedWork: TeamConnectedWorkSummary & {
    assignments?: TeamResourceAssignment[];
  };
  teamName: string;
  canManage?: boolean;
  onManageWorkClick: () => void;
  onConnectWorkClick: () => void;
  className?: string;
}

export function TeamWorkPreview({
  connectedWork,
  teamName,
  canManage = true,
  onManageWorkClick,
  onConnectWorkClick,
  className,
}: TeamWorkPreviewProps) {
  const totalCount = connectedWork.totalCount || 0;
  const recent = (connectedWork.assignments || []).slice(0, 4);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "qr_code":
        return <QrCode className="h-3.5 w-3.5 text-primary" />;
      case "campaign":
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case "brand_kit":
        return <Palette className="h-3.5 w-3.5 text-indigo-500" />;
      case "folder":
        return <Folder className="h-3.5 w-3.5 text-blue-500" />;
      case "domain":
        return <Globe className="h-3.5 w-3.5 text-teal-500" />;
      default:
        return <Link2 className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

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
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              CONNECTED WORK · {totalCount}
            </span>
          </div>
          <button
            type="button"
            onClick={onManageWorkClick}
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-semibold"
          >
            <span>View all work</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Connection Port Topology Visual */}
        {totalCount === 0 ? (
          <div className="py-4 px-3 rounded-md border border-dashed border-border/80 bg-surface/40 space-y-3">
            <div className="text-left space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <span className="text-amber-500">●</span>
                <span className="uppercase">{teamName} PORTS</span>
              </div>
              <div className="pl-3 border-l border-border/70 space-y-1 text-muted-foreground text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-border">├──</span>
                  <span className="w-1.5 h-1.5 rounded-xs bg-muted shrink-0" />
                  <span>QR CODES (0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-border">├──</span>
                  <span className="w-1.5 h-1.5 rounded-xs bg-muted shrink-0" />
                  <span>CAMPAIGNS (0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-border">├──</span>
                  <span className="w-1.5 h-1.5 rounded-xs bg-muted shrink-0" />
                  <span>BRAND KITS (0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-border">└──</span>
                  <span className="w-1.5 h-1.5 rounded-xs bg-muted shrink-0" />
                  <span>FOLDERS & TEMPLATES (0)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-sans">
                No active resource assignments.
              </span>
              {canManage && (
                <Button
                  size="sm"
                  onClick={onConnectWorkClick}
                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-white gap-1 cursor-pointer font-mono"
                >
                  <Link2 className="h-3 w-3" />
                  <span>Connect work</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {recent.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-2 rounded-md bg-surface/80 border border-border/50 hover:border-border transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                    {getResourceIcon(assignment.resourceType)}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-foreground font-sans block truncate text-xs">
                      {assignment.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {assignment.ref}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono shrink-0">
                  {assignment.relationshipType}
                </span>
              </div>
            ))}

            {totalCount > recent.length && (
              <div className="text-[10px] text-muted-foreground text-center pt-1 font-sans">
                +{totalCount - recent.length} more connected resources
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Signal */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>WORK SCOPE: JOINED RELATIONSHIPS</span>
        <span className="text-foreground font-bold">ZERO DELETION CASCADE</span>
      </div>
    </div>
  );
}
