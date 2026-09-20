"use client";

import * as React from "react";
import { CampaignResponseV1 } from "@nxtqr/contracts";
import { CampaignTile } from "./campaign-tile";
import { cn } from "@/lib/utils";

export interface CampaignGridProps {
  campaigns: CampaignResponseV1[];
  orgSlug: string;
  onEdit?: (campaign: CampaignResponseV1) => void;
  onArchive?: (campaign: CampaignResponseV1) => void;
  onDelete?: (campaign: CampaignResponseV1) => void;
  onAddQrs?: (campaign: CampaignResponseV1) => void;
  className?: string;
}

export function CampaignGrid({
  campaigns,
  orgSlug,
  onEdit,
  onArchive,
  onDelete,
  onAddQrs,
  className,
}: CampaignGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4",
        className
      )}
    >
      {campaigns.map((campaign) => (
        <CampaignTile
          key={campaign.id}
          campaign={campaign}
          orgSlug={orgSlug}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
          onAddQrs={onAddQrs}
        />
      ))}
    </div>
  );
}
