"use client";

import React, { useState } from "react";
import { AssetPicker } from "@/components/files/picker/asset-picker";
import type { FileSummaryV1 } from "@nxtqr/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

interface AssetPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAsset: (url: string, fileName?: string, fileSize?: string, mimeType?: string) => void;
  orgSlug: string;
}

export function AssetPickerDialog({
  open,
  onOpenChange,
  onSelectAsset,
  orgSlug,
}: AssetPickerDialogProps) {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [directUrl, setDirectUrl] = useState("");

  const handleSelectVaultAsset = (file: FileSummaryV1) => {
    onSelectAsset(
      file.publicUrl,
      file.name,
      `${(file.sizeBytes / 1024).toFixed(1)} KB`,
      file.mimeType
    );
    onOpenChange(false);
    toast.success(`Attached "${file.name}" from Asset Vault`);
  };

  const handleApplyDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    onSelectAsset(directUrl.trim());
    setIsUrlModalOpen(false);
    onOpenChange(false);
    setDirectUrl("");
    toast.success("External asset URL applied");
  };

  return (
    <>
      <AssetPicker
        open={open}
        onOpenChange={onOpenChange}
        orgSlug={orgSlug}
        title="Asset Vault — Destination Media"
        description="Select an image or document from your NXTQR Asset Vault, or upload a new asset."
        onSelect={handleSelectVaultAsset}
      />

      {/* Optional fallback for external CDN / Unsplash URLs */}
      <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <NxtqrIcon icon="solar:link-circle-bold" size={16} className="text-primary" />
              <span>Link External Media URL</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide an external image or CDN URL to display on your landing page.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyDirectUrl} className="space-y-3 pt-2">
            <Input
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="text-xs h-9"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsUrlModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs bg-[#FA520F] text-white">
                Apply URL
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
