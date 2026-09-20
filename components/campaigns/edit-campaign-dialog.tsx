"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignEmojiPicker } from "./campaign-emoji-picker";
import { CampaignResponseV1, CampaignStatus } from "@nxtqr/contracts";

export interface EditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignResponseV1 | null;
  orgSlug: string;
  onUpdated?: (updated: CampaignResponseV1) => void;
}

interface EditCampaignFormContentProps {
  campaign: CampaignResponseV1;
  orgSlug: string;
  onClose: () => void;
  onUpdated?: (updated: CampaignResponseV1) => void;
}

function EditCampaignFormContent({
  campaign,
  orgSlug,
  onClose,
  onUpdated,
}: EditCampaignFormContentProps) {
  const [name, setName] = React.useState(campaign.name);
  const [description, setDescription] = React.useState(campaign.description || "");
  const [emoji, setEmoji] = React.useState<string | null>(campaign.emoji || null);
  const [status, setStatus] = React.useState<CampaignStatus>(campaign.status);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Campaign name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        emoji: emoji || null,
        status,
      };

      const res = await fetch(`/api/v1/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-slug": orgSlug,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update campaign.");
      }

      const updated: CampaignResponseV1 = json.data;
      toast.success("Campaign updated", {
        description: `${updated.name} changes saved successfully.`,
      });

      onClose();
      onUpdated?.(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not update campaign.";
      setErrorMessage(msg);
      toast.error("Couldn't update campaign", {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="p-6 pb-4 border-b border-border">
        <div className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1">
          OPERATIONAL INITIATIVE
        </div>
        <DialogTitle className="text-xl font-bold text-foreground">
          Edit Campaign
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Update the identity, routing status, and initiative metadata. Changes sync immediately.
        </DialogDescription>
      </DialogHeader>

      <div className="p-6 space-y-4">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <NxtqrIcon icon="solar:danger-circle-bold" size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Identity Row: Emoji + Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span>Identity & Name</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <CampaignEmojiPicker
              value={emoji}
              onChange={setEmoji}
              campaignName={name || "Campaign"}
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Launch, Fall Menu..."
              className="h-11 text-sm bg-surface border-border flex-1"
              maxLength={100}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Description
            </label>
            <span className="text-[10px] text-muted-foreground">Optional</span>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is the objective or target audience of this campaign?"
            className="text-xs bg-surface border-border resize-none h-20"
            maxLength={500}
          />
        </div>

        {/* Lifecycle Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Lifecycle Status
          </label>
          <Select
            value={status}
            onValueChange={(val: string) => setStatus(val as CampaignStatus)}
          >
            <SelectTrigger className="h-9 text-xs bg-surface border-border">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft" className="text-xs">
                Draft — Pre-launch planning
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Active — Receiving live traffic
              </SelectItem>
              <SelectItem value="paused" className="text-xs">
                Paused — Temporarily halted
              </SelectItem>
              <SelectItem value="completed" className="text-xs">
                Completed — Initiative finished
              </SelectItem>
              <SelectItem value="archived" className="text-xs">
                Archived — Inactive
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="p-4 px-6 bg-surface-elevated/40 border-t border-border flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs h-9"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !name.trim()}
          className="text-xs h-9 px-4 bg-primary hover:bg-[#CC3A05] text-white font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <NxtqrIcon icon="solar:restart-linear" size={14} className="animate-spin" />
              <span>Saving…</span>
            </span>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditCampaignDialog({
  open,
  onOpenChange,
  campaign,
  orgSlug,
  onUpdated,
}: EditCampaignDialogProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden bg-surface border-border shadow-xl">
        <EditCampaignFormContent
          key={`${campaign.id}-${open}`}
          campaign={campaign}
          orgSlug={orgSlug}
          onClose={() => onOpenChange(false)}
          onUpdated={onUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
