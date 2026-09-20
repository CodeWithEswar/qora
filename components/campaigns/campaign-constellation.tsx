"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { CampaignConstellationNodeV1 } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

export interface CampaignConstellationProps {
  campaignName: string;
  emoji?: string | null;
  totalQrCount: number;
  nodes: CampaignConstellationNodeV1[];
  orgSlug: string;
  className?: string;
}

/**
 * CampaignConstellation — Signature NXTQR visual representation of a campaign hub
 * with its connected QR asset nodes. Reflects real database records only.
 */
export function CampaignConstellation({
  campaignName,
  emoji,
  totalQrCount,
  nodes,
  orgSlug,
  className,
}: CampaignConstellationProps) {
  const visibleNodes = nodes.slice(0, 6);
  const remainingCount = Math.max(0, totalQrCount - visibleNodes.length);

  if (totalQrCount === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border/80 bg-surface/40 p-6 flex flex-col items-center justify-center text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center text-2xl mb-2">
          {emoji || "🚀"}
        </div>
        <div className="text-xs font-semibold text-foreground">Hub Unlinked</div>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
          No QR assets assigned to this campaign yet. Connect QR assets to activate the constellation.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/80 bg-surface/60 p-4 sm:p-6 shadow-2xs overflow-hidden",
        className
      )}
    >
      {/* Decorative Constellation Orbit Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25 dark:opacity-15 overflow-hidden">
        <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-primary/40 animate-[spin_120s_linear_infinite]" />
        <div className="w-[480px] h-[480px] sm:w-[640px] sm:h-[640px] rounded-full border border-dashed border-primary/20" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon="hugeicons:globe-02" className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
            Campaign Constellation
          </span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/60">
            {totalQrCount} {totalQrCount === 1 ? "node" : "nodes"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Topology</span>
        </div>
      </div>

      {/* Constellation Graphic Container */}
      <div className="relative z-10 py-2 sm:py-4 flex flex-col items-center justify-center">
        {/* Central Campaign Hub */}
        <div className="relative flex flex-col items-center group/hub">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF8E0] dark:bg-[#202020] border-2 border-primary/40 shadow-lg shadow-primary/5 flex items-center justify-center text-2xl sm:text-3xl transition-transform duration-200 group-hover/hub:scale-105">
            {emoji || "🚀"}
          </div>
          <div className="text-xs sm:text-sm font-bold text-foreground mt-2 text-center max-w-[200px] truncate">
            {campaignName}
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono text-primary font-semibold uppercase tracking-wider mt-0.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            Central Hub
          </div>
        </div>

        {/* Visual Connector Beam */}
        <div className="flex flex-col items-center my-2">
          <div className="w-px h-5 sm:h-7 bg-gradient-to-b from-primary/80 to-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />
          <div className="w-px h-3 sm:h-5 bg-gradient-to-b from-primary/30 to-border" />
        </div>

        {/* Adaptive Connected Node Spokes */}
        <div
          className={cn(
            "w-full flex flex-wrap items-stretch justify-center gap-2.5 sm:gap-3 transition-all",
            visibleNodes.length === 1 && "max-w-sm",
            visibleNodes.length === 2 && "max-w-xl",
            visibleNodes.length === 3 && "max-w-3xl",
            visibleNodes.length >= 4 && "max-w-5xl"
          )}
        >
          {visibleNodes.map((node) => (
            <Link
              key={node.id}
              href={`/${orgSlug}/qr/${node.id}`}
              className={cn(
                "group/node relative p-3 rounded-xl border border-border/80 bg-card/90 dark:bg-[#181818]/90 backdrop-blur-sm shadow-xs",
                "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between",
                visibleNodes.length === 1
                  ? "w-full max-w-sm"
                  : "flex-1 min-w-[140px] sm:min-w-[170px] max-w-[230px]"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="w-6 h-6 rounded-md bg-muted/80 flex items-center justify-center text-muted-foreground group-hover/node:text-primary group-hover/node:bg-primary/10 transition-colors">
                    <Icon icon="hugeicons:qr-code" className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-muted/70 rounded-md text-muted-foreground border border-border/50">
                    {node.type}
                  </span>
                </div>

                <div className="text-xs font-semibold text-foreground truncate group-hover/node:text-primary transition-colors">
                  {node.name}
                </div>

                {node.destinationUrl && (
                  <div className="text-[10px] font-mono text-muted-foreground truncate mt-0.5" title={node.destinationUrl}>
                    {node.destinationUrl.replace(/^https?:\/\//, "")}
                  </div>
                )}
              </div>

              <div className="text-[10px] font-mono text-muted-foreground mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {node.totalScans.toLocaleString()}{" "}
                  <span className="text-muted-foreground font-normal">scans</span>
                </span>
                <Icon
                  icon="hugeicons:arrow-up-right-01"
                  className="w-3.5 h-3.5 opacity-60 group-hover/node:opacity-100 group-hover/node:translate-x-0.5 group-hover/node:-translate-y-0.5 transition-all text-primary"
                />
              </div>
            </Link>
          ))}

          {/* Overflow Node Indicator */}
          {remainingCount > 0 && (
            <div className="p-3 rounded-xl border border-dashed border-border/80 bg-surface/40 flex flex-col items-center justify-center text-center flex-1 min-w-[130px] max-w-[180px]">
              <div className="font-mono text-sm font-bold text-primary">
                +{remainingCount}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                more QR assets
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
