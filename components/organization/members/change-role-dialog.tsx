"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccessDiff } from "./access-diff";
import { AlertCircle } from "lucide-react";

interface RoleOption {
  id: string;
  code?: string;
  name: string;
  isSystem?: boolean;
  description?: string | null;
}

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    displayName: string;
    email: string;
    roleId: string;
    roleCode: string;
    roleName: string;
    roleDescription?: string | null;
    teams: Array<{ id: string; name: string }>;
    isCurrentUser: boolean;
  } | null;
  roles: RoleOption[];
  onConfirm: (memberId: string, newRoleId: string) => Promise<void>;
}

export function ChangeRoleDialog({
  isOpen,
  onClose,
  member,
  roles,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (member) {
      setSelectedRoleId(member.roleId);
      setError(null);
    }
  }, [member]);

  if (!member) return null;

  const currentRole = {
    name: member.roleName,
    code: member.roleCode || "MEMBER",
    description: member.roleDescription,
  };

  const targetRoleObj = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const proposedRole = {
    name: targetRoleObj?.name || "Viewer",
    code: targetRoleObj?.code || targetRoleObj?.name.toUpperCase() || "VIEWER",
    description: targetRoleObj?.description,
  };

  const isOwnerDemotion = currentRole.code.toUpperCase() === "OWNER" && proposedRole.code.toUpperCase() !== "OWNER";

  const handleSave = async () => {
    if (!selectedRoleId || selectedRoleId === member.roleId) {
      onClose();
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(member.id, selectedRoleId);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update member role.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-background text-foreground border border-border/80 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span>MEMBER ACCESS</span>
            <span>/</span>
            <span className="text-foreground font-semibold">ROLE MODIFICATION</span>
          </div>
          <DialogTitle className="text-base font-semibold text-foreground pt-1">
            Modify Operational Role
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Reassign the operational authorization tier for {member.displayName} ({member.email}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="role-select" className="text-xs font-medium">
              Select New Workspace Role
            </Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="role-select" className="h-9 text-xs bg-surface">
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.name}</span>
                      {r.isSystem && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          (System Role)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Signature Interaction #3: Access Diff */}
          <AccessDiff
            currentRole={currentRole}
            proposedRole={proposedRole}
            isLastOwnerWarning={isOwnerDemotion}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isPending || selectedRoleId === member.roleId}
            onClick={handleSave}
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? "Updating Access..." : "Confirm Role Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
