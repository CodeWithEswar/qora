"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { TableRow, TableCell } from "@/components/ui/table";
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

export interface CampaignListRowProps {
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

export function CampaignListRow({
  campaign,
  orgSlug,
  onEdit,
  onArchive,
  onDelete,
  onAddQrs,
}: CampaignListRowProps) {
  const statusMeta = STATUS_BADGES[campaign.status] || STATUS_BADGES.draft;
  const detailUrl = `/${orgSlug}/campaigns/${campaign.id}`;

  return (
    <TableRow className="group hover:bg-muted/40 transition-colors">
      {/* Campaign Cell */}
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <CampaignIdentity name={campaign.name} emoji={campaign.emoji} size="sm" />
          <div className="min-w-0 max-w-xs">
            <Link
              href={detailUrl}
              className="font-semibold text-xs text-foreground hover:text-primary transition-colors block truncate"
            >
              {campaign.name}
            </Link>
            {campaign.description && (
              <span className="text-[11px] text-muted-foreground block truncate">
                {campaign.description}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Status Cell */}
      <TableCell className="py-3">
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 font-medium uppercase tracking-wider", statusMeta.className)}
        >
          {statusMeta.label}
        </Badge>
      </TableCell>

      {/* QR Assets Cell */}
      <TableCell className="py-3 font-mono text-xs text-foreground">
        {formatNumber(campaign.qrCount)}
      </TableCell>

      {/* Scans Cell */}
      <TableCell className="py-3 font-mono text-xs text-foreground">
        {formatNumber(campaign.totalScans)}
      </TableCell>

      {/* Updated Date */}
      <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(campaign.updatedAt, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </TableCell>

      {/* Action Menu */}
      <TableCell className="py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
      </TableCell>
    </TableRow>
  );
}
