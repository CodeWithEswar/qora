"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignResponseV1 } from "@nxtqr/contracts";

export interface ArchiveCampaignAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignResponseV1 | null;
  orgSlug: string;
  onArchived?: (campaign: CampaignResponseV1) => void;
}

export function ArchiveCampaignAlert({
  open,
  onOpenChange,
  campaign,
  orgSlug,
  onArchived,
}: ArchiveCampaignAlertProps) {
  const [isArchiving, setIsArchiving] = React.useState(false);

  const handleArchive = async () => {
    if (!campaign) return;
    setIsArchiving(true);

    try {
      const res = await fetch(`/api/v1/campaigns/${campaign.id}/archive`, {
        method: "POST",
        headers: { "x-organization-slug": orgSlug },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to archive campaign.");
      }

      toast.success("Campaign archived", {
        description: `${campaign.name} moved to archives. Its QR codes remain active.`,
      });

      onOpenChange(false);
      onArchived?.({ ...campaign, status: "archived" });
    } catch (err: unknown) {
      toast.error("Couldn't archive campaign", {
        description: err instanceof Error ? err.message : "Failed to archive campaign.",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  if (!campaign) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md border-border">
        <AlertDialogHeader>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
            <Icon icon="hugeicons:archive" className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Archive &ldquo;{campaign.name}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            The campaign will move out of active campaign views. Its associated QR codes and destination routing will <span className="font-semibold text-foreground">NOT be deleted</span> and will continue resolving normally.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isArchiving} className="text-xs h-9">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleArchive();
            }}
            disabled={isArchiving}
            className="text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            {isArchiving ? "Archiving…" : "Archive Campaign"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
