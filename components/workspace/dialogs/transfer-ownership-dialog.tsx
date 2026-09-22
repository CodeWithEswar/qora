"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserCheck, AlertTriangle, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceEligibleMember } from "@nxtqr/contracts";

interface TransferOwnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  orgSlug: string;
  eligibleMembers: WorkspaceEligibleMember[];
  onSuccess: () => void;
}

export function TransferOwnershipDialog({
  open,
  onOpenChange,
  workspaceName,
  orgSlug,
  eligibleMembers,
  onSuccess,
}: TransferOwnershipDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = React.useState<string>("");
  const [confirmationInput, setConfirmationInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedMemberId(eligibleMembers[0]?.id || "");
      setConfirmationInput("");
      setIsSubmitting(false);
    }
  }, [open, eligibleMembers]);

  const isConfirmed = confirmationInput.trim() === workspaceName.trim();

  const handleTransfer = async () => {
    if (!selectedMemberId || !isConfirmed) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/transfer-ownership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newOwnerMemberId: selectedMemberId,
          confirmationWorkspaceName: confirmationInput.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to transfer workspace ownership.");
      }

      toast.success("Workspace ownership transferred successfully.");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer ownership.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMember = eligibleMembers.find((m) => m.id === selectedMemberId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <UserCheck className="h-4 w-4" />
            <DialogTitle className="text-base font-bold font-display text-foreground">
              Transfer Workspace Ownership
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Hand over primary authority and financial control of <strong>{workspaceName}</strong> to another active member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Member Select */}
          <div className="space-y-1.5">
            <Label htmlFor="transfer-member" className="text-xs font-medium text-foreground">
              Select Successor Member
            </Label>
            {eligibleMembers.length === 0 ? (
              <p className="p-3 rounded bg-muted/40 border border-border text-xs text-muted-foreground font-mono">
                No eligible active members available. Please invite team members before transferring ownership.
              </p>
            ) : (
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger id="transfer-member" className="h-9 text-xs">
                  <SelectValue placeholder="Select active member..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.displayName} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Impact Notice */}
          <div className="p-3 rounded-lg border border-border/70 bg-surface/50 space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground block">
              Governance Consequences:
            </span>
            <p>
              • <strong>{selectedMember?.displayName || "The selected member"}</strong> will assume full primary ownership and financial authority.
            </p>
            <p>
              • Your account role will automatically transition to <strong>Admin</strong>, retaining day-to-day asset editing rights.
            </p>
          </div>

          {/* High-Friction Typed Confirmation */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="transfer-confirm" className="text-xs font-medium text-foreground">
              Type <strong className="text-foreground font-mono font-bold select-all">{workspaceName}</strong> to confirm:
            </Label>
            <Input
              id="transfer-confirm"
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
            onClick={handleTransfer}
            disabled={!isConfirmed || !selectedMemberId || isSubmitting}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            <span>{isSubmitting ? "Transferring..." : "Confirm Transfer"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
