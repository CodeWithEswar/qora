"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { CampaignIdentity } from "../campaign-identity";
import { CampaignResponseV1 } from "@nxtqr/contracts";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";

export interface CampaignInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignResponseV1;
  orgSlug: string;
  onEdit: () => void;
  onAddQrs: () => void;
  onViewActivity: () => void;
}

export function CampaignInspectorSheet({
  open,
  onOpenChange,
  campaign,
  orgSlug,
  onEdit,
  onAddQrs,
  onViewActivity,
}: CampaignInspectorSheetProps) {
  const formattedCreated = React.useMemo(() => {
    return formatDate(campaign.createdAt, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [campaign.createdAt]);

  const formattedUpdated = React.useMemo(() => {
    return formatDateTime(campaign.updatedAt, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [campaign.updatedAt]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col justify-between overflow-y-auto">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                  Campaign Core
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  {campaign.status}
                </Badge>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {campaign.qrCount} {campaign.qrCount === 1 ? "QR Asset" : "QR Assets"}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <CampaignIdentity name={campaign.name} emoji={campaign.emoji} size="md" />
              <div className="min-w-0">
                <SheetTitle className="text-xl font-bold text-foreground tracking-tight truncate">
                  {campaign.name}
                </SheetTitle>
                <div className="text-xs font-mono text-muted-foreground truncate">
                  ID: {campaign.id.slice(0, 8)}…
                </div>
              </div>
            </div>

            {campaign.description && (
              <SheetDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                {campaign.description}
              </SheetDescription>
            )}
          </SheetHeader>

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl border border-border/70 bg-surface/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Assigned QRs
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {campaign.qrCount}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                In this campaign
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-surface/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Aggregate Scans
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {formatNumber(campaign.totalScans)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Verified scan events
              </div>
            </div>
          </div>

          {/* Lifecycle & Audit metadata */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-surface/50 text-xs font-mono">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Created</span>
              <span className="text-foreground">{formattedCreated}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Last Modified</span>
              <span className="text-foreground">{formattedUpdated}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Organization</span>
              <span className="text-foreground truncate max-w-[140px]">{orgSlug}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-border/80 bg-surface/90 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              size="sm"
              className="text-xs h-9 font-semibold bg-primary hover:bg-[#CC3A05] text-white gap-1.5"
            >
              <NxtqrIcon icon="solar:pen-2-bold" size={13} />
              <span>Edit Campaign</span>
            </Button>

            <Button
              onClick={() => {
                onOpenChange(false);
                onAddQrs();
              }}
              variant="outline"
              size="sm"
              className="text-xs h-9 font-semibold bg-surface border-border hover:bg-muted gap-1.5"
            >
              <NxtqrIcon icon="solar:add-circle-bold" size={13} className="text-primary" />
              <span>Add QR Codes</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onViewActivity();
            }}
            className="w-full text-xs h-8 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <NxtqrIcon icon="solar:history-bold" size={13} />
            <span>View Activity History</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
