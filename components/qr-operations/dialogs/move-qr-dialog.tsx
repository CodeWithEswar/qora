"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Search, Check, FolderX } from "lucide-react";
import { CampaignOption } from "../qr-filter-sheet";
import { cn } from "@/lib/utils";

export interface MoveQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCount: number;
  campaigns: CampaignOption[];
  currentCampaignId?: string;
  onConfirm: (campaignId: string | null) => Promise<void>;
}

export function MoveQrDialog({
  open,
  onOpenChange,
  targetCount,
  campaigns,
  currentCampaignId,
  onConfirm,
}: MoveQrDialogProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(currentCampaignId || null);
  const [search, setSearch] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setSelectedId(currentCampaignId || null);
    setSearch("");
  }, [currentCampaignId, open]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return campaigns;
    return campaigns.filter((c) =>
      c.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [campaigns, search]);

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedId);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#161616] border border-border/80">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg tracking-tight">
            Move to Campaign
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign {targetCount === 1 ? "this QR identity" : `${targetCount} QR identities`} to a
            workspace campaign for structured reporting and tagging.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 border border-border/60 rounded-lg p-1">
            {/* Unassigned option */}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors text-left",
                selectedId === null
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <FolderX className="h-3.5 w-3.5" />
                <span>Unassigned (No Campaign)</span>
              </div>
              {selectedId === null && <Check className="h-3.5 w-3.5" />}
            </button>

            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No campaigns match your search.
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors text-left",
                    selectedId === c.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>
                  {selectedId === c.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAction}
            disabled={isSubmitting}
            className="bg-primary hover:bg-[#cc3a05] text-white text-xs h-8"
          >
            {isSubmitting ? "Moving..." : "Save Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
