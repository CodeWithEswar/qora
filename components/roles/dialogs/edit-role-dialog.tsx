"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RoleOverviewItem,
  PermissionMatrixDomainGroup,
} from "@nxtqr/contracts";
import { toast } from "sonner";

interface EditRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  role: RoleOverviewItem;
  matrixGroups: PermissionMatrixDomainGroup[];
  onRoleUpdated: (updatedRole: any) => void;
}

export function EditRoleDialog({
  isOpen,
  onClose,
  orgSlug,
  role,
  matrixGroups,
  onRoleUpdated,
}: EditRoleDialogProps) {
  const [name, setName] = React.useState(role.name);
  const [description, setDescription] = React.useState(role.description || "");

  // Initialize selected permissions from matrix states
  const initialPermissions = React.useMemo(() => {
    const active: string[] = [];
    matrixGroups.forEach((g) => {
      g.permissions.forEach((p) => {
        const cell = p.roleStates[role.id];
        if (cell && (cell.state === "allowed" || cell.state === "system_required")) {
          active.push(p.code);
        }
      });
    });
    return active;
  }, [matrixGroups, role.id]);

  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(initialPermissions);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setName(role.name);
    setDescription(role.description || "");
    setSelectedPermissions(initialPermissions);
  }, [role, initialPermissions]);

  // Compute Permission Diff
  const diff = React.useMemo(() => {
    const added = selectedPermissions.filter((p) => !initialPermissions.includes(p));
    const removed = initialPermissions.filter((p) => !selectedPermissions.includes(p));
    const unchanged = selectedPermissions.filter((p) => initialPermissions.includes(p));
    return { added, removed, unchangedCount: unchanged.length };
  }, [selectedPermissions, initialPermissions]);

  const handleToggle = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to update role");
      }

      toast.success("Role updated.");
      onRoleUpdated(data.data.role);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Permission changes could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-6">
        <DialogHeader className="space-y-1.5 text-left border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:pen-bold" className="w-5 h-5 text-[#FA520F]" />
            <DialogTitle className="text-lg font-bold text-[#F7F4EC]">
              Edit Custom Role — {role.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#B8B5AD]">
            Adjust authorization grants with real-time diff and blast radius preview before persistence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
                Role Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]"
              />
            </div>
          </div>

          {/* Change Impact & Diff Surface */}
          <div className="p-4 rounded-lg border border-white/[0.08] bg-[#191919] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase">
              <span className="text-[#85827B]">CHANGE IMPACT & PERMISSION DIFF</span>
              <span className="text-[#FA520F]">
                {role.memberCount} {role.memberCount === 1 ? "member" : "members"} affected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <div className="text-[10px] uppercase">Capabilities Added</div>
                <div className="text-base font-bold mt-0.5">+{diff.added.length}</div>
              </div>

              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <div className="text-[10px] uppercase">Capabilities Removed</div>
                <div className="text-base font-bold mt-0.5">-{diff.removed.length}</div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.04] border border-white/[0.08] text-[#B8B5AD]">
                <div className="text-[10px] uppercase">Unchanged</div>
                <div className="text-base font-bold mt-0.5">{diff.unchangedCount}</div>
              </div>
            </div>

            {/* List of changes */}
            {(diff.added.length > 0 || diff.removed.length > 0) && (
              <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                {diff.added.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  >
                    + {p}
                  </span>
                ))}
                {diff.removed.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  >
                    - {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Capability Matrix Selector */}
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin">
            {matrixGroups.map((group) => (
              <div
                key={group.domainKey}
                className="p-3 rounded-lg border border-white/[0.06] bg-[#191919] space-y-2.5"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EC]">
                  {group.domainName}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.permissions.map((perm) => {
                    const checked = selectedPermissions.includes(perm.code);
                    return (
                      <label
                        key={perm.code}
                        className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-all ${
                          checked
                            ? "border-[#FA520F]/40 bg-[#1F1713]"
                            : "border-white/[0.04] bg-[#151515] hover:bg-white/[0.02]"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleToggle(perm.code)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-[#F7F4EC] truncate">
                            {perm.name}
                          </div>
                          <div className="text-[10px] text-[#85827B] font-mono truncate">
                            {perm.code}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-[#85827B] hover:text-[#F7F4EC]"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:diskette-bold" className="w-3.5 h-3.5" />
                <span>Save Role Permissions</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
