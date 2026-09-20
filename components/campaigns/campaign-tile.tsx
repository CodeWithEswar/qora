"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignResponseV1 } from "@nxtqr/contracts";
import { CampaignIdentity } from "./campaign-identity";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export interface CampaignTileProps {
  campaign: CampaignResponseV1;
  orgSlug: string;
  onEdit?: (campaign: CampaignResponseV1) => void;
  onArchive?: (campaign: CampaignResponseV1) => void;
  onDelete?: (campaign: CampaignResponseV1) => void;
  onAddQrs?: (campaign: CampaignResponseV1) => void;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  paused: {
    label: "Paused",
    className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  archived: {
    label: "Archived",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

export function CampaignTile({
  campaign,
  orgSlug,
  onEdit,
  onArchive,
  onDelete,
  onAddQrs,
}: CampaignTileProps) {
  const statusMeta = STATUS_BADGES[campaign.status] || STATUS_BADGES.draft;
  const detailUrl = `/${orgSlug}/campaigns/${campaign.id}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-surface p-5 shadow-2xs transition-all duration-200",
        "hover:border-border hover:shadow-xs hover:bg-[#FFFDF7] dark:hover:bg-[#1E1E1E]"
      )}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <CampaignIdentity name={campaign.name} emoji={campaign.emoji} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 font-medium tracking-wide uppercase", statusMeta.className)}
                >
                  {statusMeta.label}
                </Badge>
              </div>
              <Link
                href={detailUrl}
                className="font-semibold text-sm text-foreground hover:text-primary transition-colors block truncate"
                title={campaign.name}
              >
                {campaign.name}
              </Link>
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                aria-label="Campaign actions"
              >
                <Icon icon="hugeicons:more-horizontal" className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs w-44">
              <DropdownMenuItem asChild>
                <Link href={detailUrl} className="flex items-center gap-2">
                  <Icon icon="hugeicons:arrow-up-right-01" className="w-3.5 h-3.5" />
                  <span>Open Campaign</span>
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(campaign)} className="gap-2">
                  <Icon icon="hugeicons:edit-02" className="w-3.5 h-3.5" />
                  <span>Edit Campaign</span>
                </DropdownMenuItem>
              )}
              {onAddQrs && (
                <DropdownMenuItem onClick={() => onAddQrs(campaign)} className="gap-2">
                  <Icon icon="hugeicons:plus-sign" className="w-3.5 h-3.5" />
                  <span>Add QR Codes</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`${detailUrl}?tab=analytics`} className="flex items-center gap-2">
                  <Icon icon="hugeicons:analytics-01" className="w-3.5 h-3.5" />
                  <span>View Analytics</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {campaign.status !== "archived" && onArchive && (
                <DropdownMenuItem onClick={() => onArchive(campaign)} className="gap-2 text-amber-600 dark:text-amber-400">
                  <Icon icon="hugeicons:archive" className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(campaign)} className="gap-2 text-rose-600 dark:text-rose-400">
                  <Icon icon="hugeicons:delete-02" className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description Row (clamped) */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-4">
          {campaign.description || "No description provided for this campaign."}
        </p>

        {/* Operational Metrics Strip */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-elevated/60 border border-border/40 font-mono mb-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">QR Assets</div>
            <div className="text-base font-bold text-foreground">{formatNumber(campaign.qrCount)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Scans</div>
            <div className="text-base font-bold text-foreground">{formatNumber(campaign.totalScans)}</div>
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-[11px]">
          Updated {formatDate(campaign.updatedAt)}
        </span>
        <Link
          href={detailUrl}
          className="inline-flex items-center gap-1 font-medium text-foreground group-hover:text-primary transition-colors"
        >
          <span>Open</span>
          <Icon
            icon="hugeicons:arrow-right-01"
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
