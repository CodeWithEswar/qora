"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignResponseV1 } from "@nxtqr/contracts";
import { CampaignIdentity } from "./campaign-identity";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface CampaignDetailHeaderProps {
  campaign: CampaignResponseV1;
  orgSlug: string;
  onEdit: () => void;
  onAddQrs: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onInspectCampaign?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
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

export function CampaignDetailHeader({
  campaign,
  orgSlug,
  onEdit,
  onAddQrs,
  onArchive,
  onDelete,
  onInspectCampaign,
  className,
}: CampaignDetailHeaderProps) {
  const statusMeta = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;

  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono overflow-x-auto no-scrollbar whitespace-nowrap py-0.5"
      >
        <Link href={`/${orgSlug}`} className="hover:text-foreground transition-colors shrink-0">
          Workspace
        </Link>
        <span className="text-muted-foreground/40 shrink-0">/</span>
        <Link href={`/${orgSlug}/campaigns`} className="hover:text-foreground transition-colors shrink-0">
          Campaigns
        </Link>
        <span className="text-muted-foreground/40 shrink-0">/</span>
        <span className="text-foreground font-medium truncate max-w-[160px] sm:max-w-none">
          {campaign.name}
        </span>
      </nav>

      {/* Main Identity & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onInspectCampaign}
            className="cursor-pointer hover:scale-105 transition-transform shrink-0"
            title="Inspect Campaign"
          >
            <CampaignIdentity name={campaign.name} emoji={campaign.emoji} size="responsive" />
          </button>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-primary uppercase">
                Campaign
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] sm:text-[10px] px-1.5 py-0 font-medium uppercase tracking-wider font-mono",
                  statusMeta.className
                )}
              >
                {statusMeta.label}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words sm:truncate max-w-2xl">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        {/* Primary Operational Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={onAddQrs}
            className="flex-1 sm:flex-initial bg-primary hover:bg-[#CC3A05] text-white text-xs h-9 px-3.5 sm:px-4 gap-1.5 font-semibold shadow-xs justify-center"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={14} />
            <span>Add QR Codes</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs h-9 px-3.5 gap-1.5 bg-surface border-border hover:bg-muted shrink-0 justify-center"
          >
            <NxtqrIcon icon="solar:pen-2-bold" size={13} className="text-muted-foreground" />
            <span>Edit</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 bg-surface border-border text-muted-foreground hover:text-foreground shrink-0"
                aria-label="More campaign actions"
              >
                <NxtqrIcon icon="solar:menu-dots-bold" size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs w-48">
              {onInspectCampaign && (
                <DropdownMenuItem onClick={onInspectCampaign} className="gap-2">
                  <NxtqrIcon icon="solar:info-circle-bold" size={13} />
                  <span>Campaign Details</span>
                </DropdownMenuItem>
              )}
              {campaign.status !== "archived" && (
                <DropdownMenuItem onClick={onArchive} className="gap-2 text-amber-600 dark:text-amber-400">
                  <NxtqrIcon icon="solar:archive-down-bold" size={13} />
                  <span>Archive Campaign</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-rose-600 dark:text-rose-400">
                <NxtqrIcon icon="solar:trash-bin-trash-bold" size={13} />
                <span>Delete Campaign</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
