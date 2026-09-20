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
import { SYSTEM_ROLE_METADATA } from "@nxtqr/permissions";
import { SystemRoleName } from "@nxtqr/contracts";

interface RoleOption {
  id: string;
  name: string;
  isSystem: boolean;
  description?: string;
}

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    email: string;
    roleId: string;
    roleName: string;
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

  const targetRole = roles.find((r) => r.id === selectedRoleId);
  const targetDesc =
    targetRole?.description ||
    (SYSTEM_ROLE_METADATA[targetRole?.name as SystemRoleName]?.description ?? "");

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change workspace role</DialogTitle>
          <DialogDescription>
            Update access level and publishing authority for this member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg bg-surface-hover/60 border border-border flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-foreground">{member.name}</p>
              <p className="text-[11px] text-muted-foreground">{member.email}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Current Role
              </span>
              <span className="font-medium text-foreground">{member.roleName}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-select">New Role Assignment</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      ({r.isSystem ? "System" : "Custom"})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {targetDesc && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground block mb-0.5">
                Authority description:
              </span>
              {targetDesc}
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || selectedRoleId === member.roleId}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? "Updating..." : "Update role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
