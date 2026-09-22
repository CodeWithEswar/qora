"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, Users, Building2, UserCheck, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface WorkspaceIdentityStripProps {
  overview: WorkspaceControlPlaneOverview;
  onEditLogo: () => void;
}

export function WorkspaceIdentityStrip({
  overview,
  onEditLogo,
}: WorkspaceIdentityStripProps) {
  const { identity, owner, stats } = overview;

  const formattedCreatedDate = React.useMemo(() => {
    if (!identity.createdAt) return "—";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(identity.createdAt));
    } catch {
      return identity.createdAt.slice(0, 10);
    }
  }, [identity.createdAt]);

  const initials = React.useMemo(() => {
    return identity.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "WS";
  }, [identity.name]);

  const ownerInitials = React.useMemo(() => {
    return owner.displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OW";
  }, [owner.displayName]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-surface/50 backdrop-blur-sm p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Logo & Core Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onEditLogo}
            className="group relative h-14 w-14 rounded-xl border border-border/80 bg-muted/40 hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden shrink-0 shadow-xs"
            title="Click to edit workspace logo"
          >
            {identity.logoUrl ? (
              <img
                src={identity.logoUrl}
                alt={identity.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-mono text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {initials}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground/60 tracking-wider">
                  NXTQR
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-medium text-foreground">
              Edit
            </div>
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight text-foreground truncate max-w-sm font-display">
                {identity.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-muted/60 text-muted-foreground border border-border/50">
                nxtqr.vercel.app/{identity.slug}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {identity.description || "Operational workspace for digital identity & dynamic QR infrastructure."}
            </p>
          </div>
        </div>

        {/* Right: Real Metrics Strip (Owner, Members, Teams, Plan, Created) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/50 text-xs">
          {/* Owner */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Owner
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <Avatar className="h-5 w-5 border border-border shrink-0">
                {owner.avatarUrl && <AvatarImage src={owner.avatarUrl} alt={owner.displayName} />}
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-mono font-bold">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground truncate" title={owner.displayName}>
                {owner.displayName}
              </span>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Members
            </span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
              <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span>{String(stats.memberCount).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Teams */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Teams
            </span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span>{String(stats.teamCount).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Plan */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Plan
            </span>
            <Link
              href={`/${identity.slug}/billing`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              title="Click to view billing and subscription details"
            >
              <span>{identity.billingPlan}</span>
              <Sparkles className="h-3 w-3" />
            </Link>
          </div>

          {/* Created Date */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Created
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span>{formattedCreatedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
