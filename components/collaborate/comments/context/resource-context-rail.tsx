"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ThreadDetail, ParticipantItem } from "@/lib/supabase/types/comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  QrCode,
  CheckSquare,
  Users,
  FileText,
  Clock,
  Activity,
  Layers,
  Sparkles,
  Compass,
  Package,
  History,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

interface ResourceContextRailProps {
  thread: ThreadDetail | null;
  orgSlug: string;
  onParticipantFilter?: (participantId: string | null) => void;
  selectedParticipantId?: string | null;
  className?: string;
}

export function ResourceContextRail({
  thread,
  orgSlug,
  onParticipantFilter,
  selectedParticipantId,
  className,
}: ResourceContextRailProps) {
  if (!thread) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center font-mono text-xs text-muted-foreground border border-dashed border-border/70 rounded-xl bg-card/20 h-full",
          className
        )}
      >
        <div className="space-y-1 max-w-xs">
          <span className="text-[11px] uppercase tracking-wider font-bold text-foreground">
            Context Rail
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            Select a discussion to see associated resources, revision ancestry, and participants.
          </p>
        </div>
      </div>
    );
  }

  // Deduce real relationship links
  const revision = thread.contextMetadata?.revision;
  const isApproval = thread.contextType === "approval";
  const approvalId = isApproval ? thread.contextId : null;
  const isTeam = thread.contextType === "team";
  const teamId = isTeam ? thread.contextId : null;

  // Build canonical resource URL using real org paths
  const getResourceUrl = () => {
    if (thread.contextUrl) return thread.contextUrl;
    switch (thread.contextType) {
      case "qr":
      case "qr_code":
        return `/${orgSlug}/qrs`;
      case "approval":
        return `/${orgSlug}/collaborate/approvals`;
      case "team":
        return `/${orgSlug}/teams/${thread.contextId}`;
      case "campaign":
        return `/${orgSlug}/campaigns`;
      default:
        return `/${orgSlug}`;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card/40 border border-border/70 rounded-xl overflow-y-auto shadow-xs text-xs font-mono select-none",
        className
      )}
      role="complementary"
      aria-label="Resource Context Rail"
    >
      {/* 01 Rail Header */}
      <div className="px-4 py-3 border-b border-border/70 bg-background/95 backdrop-blur-xs flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
          CONTEXT RAIL
        </span>
        <Badge
          variant="outline"
          className="text-[9px] font-mono px-1.5 py-0 h-4 uppercase border-border/70"
        >
          {thread.publicId}
        </Badge>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* SECTION 1: PRIMARY RESOURCE */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
            01 / RESOURCE
          </span>
          <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#FA520F]">
                {thread.contextType.replace("_", " ")}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-[#FA520F]/30 text-foreground bg-muted uppercase"
              >
                {thread.contextState || "ACTIVE"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground font-mono truncate">
                {thread.contextRef}
              </p>
              <p className="text-xs text-muted-foreground font-sans truncate">
                {thread.contextTitle}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full h-7 text-xs font-mono justify-between text-foreground border-border/80 hover:border-[#FA520F]/50"
            >
              <Link href={getResourceUrl()}>
                <span>Open Resource</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* SECTION 2: REVISION CONTEXT (if real revision data exists) */}
        {revision && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
              02 / REVISION ANCHOR
            </span>
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-foreground">
                  REVISION
                </span>
                <span className="text-xs font-bold text-[#FA520F]">
                  rev {revision}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Discussion changes are anchored to this revision milestone.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 3: RELATED APPROVAL */}
        {approvalId && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
              03 / RELATED APPROVAL
            </span>
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-foreground">
                  APPROVAL WORKFLOW
                </span>
                <span className="text-xs font-mono text-[#FFB83E]">
                  ● PENDING
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Decision corridor requires governance review before publishing.
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full h-7 text-xs font-mono justify-between border-border/80 hover:border-[#FA520F]/50"
              >
                <Link href={`/${orgSlug}/collaborate/approvals`}>
                  <span>Open Approval</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* SECTION 4: RELATED TEAM */}
        {teamId && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
              04 / TEAM SCOPE
            </span>
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-foreground">
                  OPERATIONAL TEAM
                </span>
                <span className="text-xs font-mono text-foreground">
                  {thread.contextRef}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full h-7 text-xs font-mono justify-between border-border/80 hover:border-[#FA520F]/50"
              >
                <Link href={`/${orgSlug}/teams/${teamId}`}>
                  <span>Open Team Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* SECTION 5: PARTICIPANTS WEAVE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              PARTICIPANTS ({thread.participants.length})
            </span>
            {selectedParticipantId && onParticipantFilter && (
              <button
                type="button"
                onClick={() => onParticipantFilter(null)}
                className="text-[10px] font-mono text-[#FA520F] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {thread.participants.map((p) => {
              const isSelected = selectedParticipantId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onParticipantFilter?.(isSelected ? null : p.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer select-none",
                    isSelected
                      ? "border-[#FA520F] bg-[#FA520F]/10 ring-1 ring-[#FA520F]/30"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-muted border border-border/80 flex items-center justify-center text-[9px] font-mono font-bold text-foreground shrink-0">
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-sans font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">{p.email}</p>
                    </div>
                  </div>
                  {p.roleName && (
                    <Badge variant="outline" className="text-[8px] uppercase px-1 py-0 h-3.5 border-border/80 shrink-0">
                      {p.roleName}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: ACTIVITY CONTEXT */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
            ACTIVITY LINK
          </span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full h-8 text-xs font-mono justify-between text-muted-foreground hover:text-foreground border border-border/50"
          >
            <Link href={`/${orgSlug}/activity`}>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#FA520F]" />
                <span>View Full Activity Log</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
