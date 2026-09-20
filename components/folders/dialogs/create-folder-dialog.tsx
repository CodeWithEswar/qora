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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderEmojiPicker } from "../folder-emoji-picker";
import { FolderAccentPicker } from "../folder-accent-picker";
import { FolderAccentKey } from "@nxtqr/contracts";
import { getFolderAccent } from "../folder-accents";
import { FolderFieldCornerModules } from "../folder-field-corner-modules";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug?: string;
  onCreated?: (folderId: string) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  orgSlug,
  onCreated,
}: CreateFolderDialogProps) {
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState<string>("📁");
  const [accentKey, setAccentKey] = React.useState<FolderAccentKey>("Graphite");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (open) {
      setName("");
      setEmoji("📁");
      setAccentKey("Graphite");
      setDescription("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const activeAccent = getFolderAccent(accentKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Folder name is required.");
      return;
    }
    if (trimmedName.length > 80) {
      setError("Folder name cannot exceed 80 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/folders", {
        method: "POST",
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
        throw new Error(data.error?.message || "Failed to create folder.");
      }

      toast.success(`Folder "${trimmedName}" created.`);
      onOpenChange(false);
      onCreated?.(data.data.id);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "Could not create folder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
          <NxtqrIcon icon="solar:danger-triangle-linear" size={14} className="shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Folder Identity: Emoji + Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">
          Folder Identity <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <FolderEmojiPicker
            value={emoji}
            onChange={setEmoji}
            size="default"
          />
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Marketing, Product Line, Retail Events"
            maxLength={80}
            className={cn(
              "h-9 text-xs flex-1",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            autoFocus
          />
        </div>
        {error && (
          <p className="text-[11px] text-destructive font-medium">{error}</p>
        )}
      </div>

      {/* Visual Accent Picker */}
      <FolderAccentPicker
        value={accentKey}
        onChange={setAccentKey}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Description <span className="text-[10px] text-muted-foreground/60">(optional)</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What assets belong in this folder space?"
          rows={2}
          maxLength={300}
          className="text-xs resize-none"
        />
      </div>

      <DialogFooter className="pt-3 border-t border-border/60 gap-2 sm:space-x-0">
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
          type="submit"
          size="sm"
          disabled={isSubmitting || !name.trim()}
          className="text-xs h-8 font-medium cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <NxtqrIcon icon="solar:restart-linear" size={13} className="animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <span>Create Folder</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  // Desktop Dialog with Split Live Preview
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#18181B] border-border/80 p-0 overflow-hidden shadow-xl">
          <div className="grid grid-cols-5 divide-x divide-border/60">
            {/* Left: Input Composer */}
            <div className="col-span-3 p-6 space-y-4">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="text-lg font-bold font-serif text-foreground">
                  Create Folder
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Create a focused workspace for related QR assets.
                </DialogDescription>
              </DialogHeader>

              {formBody}
            </div>

            {/* Right: Real-time Live Folder Field Preview */}
            <div className="col-span-2 bg-neutral-50/70 dark:bg-[#121214] p-5 flex flex-col justify-center items-center">
              <div className="w-full space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 text-center">
                  Live Field Preview
                </div>

                <div
                  className={cn(
                    "group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-200 w-full h-[160px]",
                    "bg-white dark:bg-[#1C1C1F] border border-border/80 dark:border-white/[0.08] shadow-xs"
                  )}
                >
                  <FolderFieldCornerModules accentDotColor={activeAccent.dotColor} />

                  <div className="relative z-10 flex items-start gap-2.5">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0",
                        activeAccent.badgeBg
                      )}
                    >
                      <span aria-hidden="true">{emoji || "📁"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {name.trim() || "Untitled Space"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: activeAccent.dotColor }}
                        />
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {activeAccent.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="relative z-10 text-[11px] text-muted-foreground/80 line-clamp-2">
                    {description.trim() || "Assets organized inside this space."}
                  </p>

                  <div className="relative z-10 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="text-primary font-medium">0 QR assets</span>
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-4 rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-3 mb-2 border-b border-border/60">
          <SheetTitle className="text-base font-bold font-serif">Create Folder</SheetTitle>
        </SheetHeader>
        {formBody}
      </SheetContent>
    </Sheet>
  );
}
