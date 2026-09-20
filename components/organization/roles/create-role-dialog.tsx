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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSION_GROUPS } from "@nxtqr/permissions";
import { PermissionCode } from "@nxtqr/contracts";
import { Shield } from "lucide-react";

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRole: (
    name: string,
    description?: string,
    permissions?: PermissionCode[]
  ) => Promise<void>;
}

export function CreateRoleDialog({
  isOpen,
  onClose,
  onCreateRole,
}: CreateRoleDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<PermissionCode[]>([]);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const togglePermission = (code: PermissionCode) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      await onCreateRole(
        name.trim(),
        description.trim() || undefined,
        selectedPermissions
      );
      setName("");
      setDescription("");
      setSelectedPermissions([]);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create role.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <form onSubmit={handleCreate} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogTitle>Create custom role</DialogTitle>
            <DialogDescription>
              Define an access boundary and assign tailored capabilities to this role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="custom-role-name">Role Name</Label>
              <Input
                id="custom-role-name"
                placeholder="e.g. Campaign Reviewer, External Designer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-role-desc">Description</Label>
              <Input
                id="custom-role-desc"
                placeholder="Specific operational purpose of this role"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Capabilities ({selectedPermissions.length} selected)</Label>
              <div className="space-y-3 divide-y divide-border/50 border border-border/70 rounded-xl p-3 bg-surface/40">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.id} className="pt-2.5 first:pt-0 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-primary" />
                      {group.category}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {group.permissions.map((p) => {
                        const isChecked = selectedPermissions.includes(p.code);
                        return (
                          <label
                            key={p.code}
                            className="flex items-start gap-2 p-2 rounded-lg hover:bg-surface-hover/70 cursor-pointer select-none border border-transparent hover:border-border/60"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => togglePermission(p.code)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground truncate">
                                {p.label}
                              </p>
                              <code className="text-[9px] font-mono text-muted-foreground block">
                                {p.code}
                              </code>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border mt-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !name.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isPending ? "Creating..." : "Create custom role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
