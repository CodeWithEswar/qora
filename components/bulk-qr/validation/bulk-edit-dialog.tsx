"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkEditDialogProps {
  mode: "campaign" | "folder" | "delete" | null;
  selectedCount: number;
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
  onClose: () => void;
  onApplyCampaign: (campaignId: string | undefined) => void;
  onApplyFolder: (folderId: string | undefined) => void;
  onConfirmDelete: () => void;
}

export function BulkEditDialog({
  mode,
  selectedCount,
  campaigns = [],
  folders = [],
  onClose,
  onApplyCampaign,
  onApplyFolder,
  onConfirmDelete,
}: BulkEditDialogProps) {
  const [selectedId, setSelectedId] = useState<string>("none");

  if (!mode) return null;

  if (mode === "delete") {
    return (
      <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent className="bg-surface border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-2">
              <Icon icon="lucide:trash-2" className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground font-serif">
              Remove {selectedCount} {selectedCount === 1 ? "Row" : "Rows"} from Batch?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This removes the selected rows from the current bulk creation draft.
              It does not delete any existing QR codes in your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={onClose}
              className="border-border hover:bg-muted text-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onConfirmDelete();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              Remove Rows
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const isCampaign = mode === "campaign";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface border-border text-foreground max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2">
            <Icon icon={isCampaign ? "lucide:flag" : "lucide:folder"} className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground font-serif">
            Assign {isCampaign ? "Campaign" : "Folder"}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Apply {isCampaign ? "campaign" : "folder"} grouping to {selectedCount} selected {selectedCount === 1 ? "record" : "records"}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Target {isCampaign ? "Campaign" : "Folder"}
          </label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="bg-neutral-900 border-white/10 text-xs text-neutral-200">
              <SelectValue placeholder={`Select ${isCampaign ? "Campaign" : "Folder"}...`} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-white/10 text-neutral-200">
              <SelectItem value="none">
                <span className="text-neutral-500 italic">None (Unassigned)</span>
              </SelectItem>
              {isCampaign
                ? campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                : folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/10 text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const finalId = selectedId === "none" ? undefined : selectedId;
              if (isCampaign) {
                onApplyCampaign(finalId);
              } else {
                onApplyFolder(finalId);
              }
              onClose();
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium"
          >
            Apply to {selectedCount} Rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
