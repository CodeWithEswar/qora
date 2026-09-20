"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignResponseV1 } from "@nxtqr/contracts";
import { CampaignListRow } from "./campaign-list-row";
import { cn } from "@/lib/utils";

export interface CampaignListProps {
  campaigns: CampaignResponseV1[];
  orgSlug: string;
  onEdit?: (campaign: CampaignResponseV1) => void;
  onArchive?: (campaign: CampaignResponseV1) => void;
  onDelete?: (campaign: CampaignResponseV1) => void;
  onAddQrs?: (campaign: CampaignResponseV1) => void;
  className?: string;
}

export function CampaignList({
  campaigns,
  orgSlug,
  onEdit,
  onArchive,
  onDelete,
  onAddQrs,
  className,
}: CampaignListProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface shadow-2xs overflow-hidden",
        className
      )}
    >
      <Table>
        <TableHeader className="bg-surface-elevated/50">
          <TableRow>
            <TableHead className="w-[38%] text-xs font-semibold uppercase tracking-wider">
              Campaign
            </TableHead>
            <TableHead className="w-[14%] text-xs font-semibold uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="w-[14%] text-xs font-semibold uppercase tracking-wider">
              QR Assets
            </TableHead>
            <TableHead className="w-[14%] text-xs font-semibold uppercase tracking-wider">
              Total Scans
            </TableHead>
            <TableHead className="w-[14%] text-xs font-semibold uppercase tracking-wider">
              Updated
            </TableHead>
            <TableHead className="w-[6%] text-right text-xs font-semibold uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <CampaignListRow
              key={campaign.id}
              campaign={campaign}
              orgSlug={orgSlug}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onAddQrs={onAddQrs}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
