"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, AlertTriangle, ShieldAlert, QrCode } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceDeletionImpact } from "@nxtqr/contracts";

interface DeleteWorkspaceAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  orgSlug: string;
  stats: WorkspaceDeletionImpact;
}

export function DeleteWorkspaceAlertDialog({
  open,
  onOpenChange,
  workspaceName,
  orgSlug,
  stats,
}: DeleteWorkspaceAlertDialogProps) {
  const router = useRouter();
  const [confirmationInput, setConfirmationInput] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setConfirmationInput("");
      setIsDeleting(false);
    }
  }, [open]);

  const isConfirmed =
    confirmationInput.trim() === workspaceName.trim() ||
    confirmationInput.trim() === orgSlug.trim();

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationWorkspaceName: confirmationInput.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to delete workspace.");
      }

      toast.success("Workspace deleted permanently.");
      onOpenChange(false);
      // Redirect to root or onboarding
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete workspace.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg border-destructive/40 p-6 shadow-2xl">
        <AlertDialogHeader className="pb-2">
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <AlertDialogTitle className="text-base font-bold font-display text-destructive">
              Delete this workspace permanently?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-foreground/80 leading-relaxed">
            This action is <strong>irreversible</strong> and will immediately destroy <strong>{workspaceName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Critical QR Redirection Warning */}
          <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>DYNAMIC QR REDIRECT IMPLICATION:</span>
            </div>
            <p className="text-[11px]">
              All <strong>{stats.qrCodes} dynamic QR codes</strong> associated with this workspace will immediately stop resolving and return HTTP 404. Any physical signage, printed packaging, or product labels already in distribution will break permanently.
            </p>
          </div>

          {/* Real Resource Deletion Breakdown */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-surface/40 space-y-2 font-mono text-[11px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Resources That Will Be Purged:
            </span>
            <div className="grid grid-cols-2 gap-2 text-foreground">
              <div>• {stats.qrCodes} QR Codes & Drafts</div>
              <div>• {stats.campaigns} Active Campaigns</div>
              <div>• {stats.domains} Custom Domain Links</div>
              <div>• {stats.brandKits} Brand Identity Kits</div>
              <div>• {stats.files} Binary Files & Assets</div>
              <div>• {stats.members} Workspace Memberships</div>
            </div>
          </div>

          {/* High-Friction Typed Input */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="delete-confirm" className="text-xs font-medium text-foreground">
              Type <strong className="text-destructive font-mono font-bold select-all">{workspaceName}</strong> to proceed:
            </Label>
            <Input
              id="delete-confirm"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={workspaceName}
              className="h-9 text-xs font-mono border-destructive/40 focus-visible:ring-destructive"
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="text-xs h-8 font-semibold"
          >
            <span>{isDeleting ? "Deleting Permanently..." : "I understand, delete workspace"}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
