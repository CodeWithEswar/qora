"use client";

import * as React from "react";
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
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { CampaignQrAssetV1 } from "@nxtqr/contracts";

export interface RemoveQrAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrAsset: CampaignQrAssetV1 | null;
  campaignId: string;
  campaignName: string;
  orgSlug: string;
  onRemoved?: (qrId: string) => void;
}

export function RemoveQrAlert({
  open,
  onOpenChange,
  qrAsset,
  campaignId,
  campaignName,
  orgSlug,
  onRemoved,
}: RemoveQrAlertProps) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = async () => {
    if (!qrAsset) return;
    setIsRemoving(true);

    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/qrs/${qrAsset.id}`, {
        method: "DELETE",
        headers: { "x-organization-slug": orgSlug },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to remove QR code from campaign.");
      }

      toast.success("QR code removed", {
        description: `"${qrAsset.name}" detached from ${campaignName}.`,
      });

      onOpenChange(false);
      onRemoved?.(qrAsset.id);
    } catch (err: unknown) {
      toast.error("Couldn't remove QR code", {
        description: err instanceof Error ? err.message : "Failed to remove QR code from campaign.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!qrAsset) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md border-border">
        <AlertDialogHeader>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
            <NxtqrIcon icon="solar:link-broken-minimalistic-bold" size={20} />
          </div>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Remove &ldquo;{qrAsset.name}&rdquo; from {campaignName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This operation will detach the QR asset from this campaign. The QR code itself, its destinations, and its scan analytics will <span className="font-semibold text-foreground">NOT be deleted</span> and will remain active in your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isRemoving} className="text-xs h-9">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
            disabled={isRemoving}
            className="text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            {isRemoving ? "Removing…" : "Remove from Campaign"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
