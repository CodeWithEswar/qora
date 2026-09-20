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

export interface DeleteCampaignAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignResponseV1 | null;
  orgSlug: string;
  onDeleted?: (campaignId: string) => void;
}

export function DeleteCampaignAlert({
  open,
  onOpenChange,
  campaign,
  orgSlug,
  onDeleted,
}: DeleteCampaignAlertProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!campaign) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/campaigns/${campaign.id}`, {
        method: "DELETE",
        headers: { "x-organization-slug": orgSlug },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to delete campaign.");
      }

      toast.success("Campaign deleted", {
        description: `${campaign.name} removed. Its QR assets were safely unlinked.`,
      });

      onOpenChange(false);
      onDeleted?.(campaign.id);
    } catch (err: unknown) {
      toast.error("Couldn't delete campaign", {
        description: err instanceof Error ? err.message : "Failed to delete campaign.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!campaign) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md border-border">
        <AlertDialogHeader>
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
            <Icon icon="hugeicons:delete-02" className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Delete &ldquo;{campaign.name}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This operational initiative will be permanently removed from your workspace. All{" "}
            <span className="font-semibold text-foreground font-mono">{campaign.qrCount} QR codes</span> in this campaign will be safely detached (<code className="text-primary font-mono text-[11px]">campaign_id = null</code>) and <span className="font-semibold text-foreground">will NOT be deleted</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting} className="text-xs h-9">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {isDeleting ? "Deleting…" : "Delete Campaign"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
