"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ArchiveWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  orgSlug: string;
  onSuccess: () => void;
}

export function ArchiveWorkspaceDialog({
  open,
  onOpenChange,
  workspaceName,
  orgSlug,
  onSuccess,
}: ArchiveWorkspaceDialogProps) {
  const [confirmationInput, setConfirmationInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setConfirmationInput("");
      setIsSubmitting(false);
    }
  }, [open]);

  const isConfirmed = confirmationInput.trim() === workspaceName.trim();

  const handleArchive = async () => {
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationWorkspaceName: confirmationInput.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to archive workspace.");
      }

      toast.success("Workspace archived successfully.");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to archive workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Archive className="h-4 w-4" />
            <DialogTitle className="text-base font-bold font-display text-foreground">
              Archive Workspace
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Transition <strong>{workspaceName}</strong> into a frozen, read-only operational state.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3.5 rounded-xl border border-border/70 bg-surface/50 space-y-2 text-[11px] text-muted-foreground leading-relaxed">
            <p>
              • <strong>QR Redirect Continuity:</strong> Active dynamic QR codes continue resolving without interruption.
            </p>
            <p>
              • <strong>Asset Inaccessibility:</strong> No new QR codes, templates, or destination pages can be published.
            </p>
            <p>
              • <strong>Team Invitations:</strong> All pending invitations are suspended immediately.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="archive-confirm" className="text-xs font-medium text-foreground">
              Type <strong className="text-foreground font-mono font-bold select-all">{workspaceName}</strong> to confirm:
            </Label>
            <Input
              id="archive-confirm"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={workspaceName}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/40">
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
            onClick={handleArchive}
            disabled={!isConfirmed || isSubmitting}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            <span>{isSubmitting ? "Archiving..." : "Confirm Archive"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
