"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderEmojiPicker } from "../folder-emoji-picker";
import { FolderAccentPicker } from "../folder-accent-picker";
import { FolderResponseV1, FolderAccentKey } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export interface EditFolderSheetProps {
  folder: FolderResponseV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug?: string;
  onUpdated?: () => void;
}

export function EditFolderSheet({
  folder,
  open,
  onOpenChange,
  orgSlug,
  onUpdated,
}: EditFolderSheetProps) {
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState<string>("📁");
  const [accentKey, setAccentKey] = React.useState<FolderAccentKey>("Graphite");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [prevFolderId, setPrevFolderId] = React.useState<string | null>(null);

  if (folder && folder.id !== prevFolderId) {
    setPrevFolderId(folder.id);
    setName(folder.name);
    setEmoji(folder.emoji || "📁");
    setAccentKey((folder.accentKey as FolderAccentKey) || "Graphite");
    setDescription(folder.description || "");
    setError(null);
  }

  if (!folder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Folder name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/folders/${folder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
          emoji,
          accentKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to update folder.");
      }

      toast.success("Folder updated.");
      onOpenChange(false);
      onUpdated?.();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
      toast.error(errMsg || "Could not update folder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col justify-between">
        <div className="space-y-5">
          <SheetHeader className="text-left space-y-1 pb-4 border-b border-border/60">
            <SheetTitle className="text-lg font-bold font-serif">Edit Folder</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Modify folder metadata, visual accent, and description.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Folder Identity
              </label>
              <div className="flex items-center gap-2">
                <FolderEmojiPicker value={emoji} onChange={setEmoji} />
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Folder name"
                  maxLength={80}
                  className="h-9 text-xs flex-1"
                />
              </div>
              {error && <p className="text-[11px] text-destructive">{error}</p>}
            </div>

            {/* Accent */}
            <FolderAccentPicker value={accentKey} onChange={setAccentKey} />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Folder description"
                rows={3}
                maxLength={300}
                className="text-xs resize-none"
              />
            </div>
          </form>

          {/* Useful Metadata Panel */}
          <div className="rounded-lg p-3 bg-muted/30 dark:bg-white/[0.02] border border-border/60 space-y-2 text-xs font-mono">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Folder Metrics & Origin
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>QR Assets:</span>
              <span className="text-foreground font-medium">{folder.qrCount}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Created:</span>
              <span className="text-foreground" suppressHydrationWarning>{formatDate(folder.createdAt)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Last Modified:</span>
              <span className="text-foreground" suppressHydrationWarning>{formatRelativeTime(folder.updatedAt)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Status:</span>
              <span className="text-foreground uppercase">{folder.status}</span>
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-border/60 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            size="sm"
            disabled={isSubmitting || !name.trim()}
            className="text-xs h-8 font-medium cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <NxtqrIcon icon="solar:restart-linear" size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
