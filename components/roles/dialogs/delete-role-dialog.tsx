"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleOverviewItem } from "@nxtqr/contracts";
import { toast } from "sonner";

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  role: RoleOverviewItem;
  availableRoles: RoleOverviewItem[];
  onRoleDeleted: (deletedRoleId: string) => void;
}

export function DeleteRoleDialog({
  isOpen,
  onClose,
  orgSlug,
  role,
  availableRoles,
  onRoleDeleted,
}: DeleteRoleDialogProps) {
  // Roles available for reassignment (exclude the one being deleted)
  const candidateRoles = availableRoles.filter((r) => r.id !== role.id);
  const [reassignToRoleId, setReassignToRoleId] = React.useState<string>(
    candidateRoles[0]?.id || ""
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (candidateRoles.length > 0 && (!reassignToRoleId || reassignToRoleId === role.id)) {
      setReassignToRoleId(candidateRoles[0].id);
    }
  }, [candidateRoles, reassignToRoleId, role.id]);

  const handleDelete = async () => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted.");
      return;
    }

    if (role.memberCount > 0 && !reassignToRoleId) {
      toast.error("Please select a target role to reassign existing members.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/roles/${role.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reassignToRoleId: role.memberCount > 0 ? reassignToRoleId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to delete role");
      }

      toast.success("Role deleted.");
      onRoleDeleted(role.id);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "This role could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-5">
        <AlertDialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4 text-rose-400" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-[#F7F4EC]">
              Delete Custom Role
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-[#B8B5AD] leading-relaxed">
            Are you sure you want to delete <strong className="text-[#F7F4EC]">{role.name}</strong>? This action destroys the role and revokes its capability mappings.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Member Reassignment Guard */}
        {role.memberCount > 0 ? (
          <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Icon icon="solar:shield-warning-bold" className="w-4 h-4" />
              <span>Mandatory Member Reassignment</span>
            </div>
            <p className="text-[11px] text-[#B8B5AD]">
              There {role.memberCount === 1 ? "is 1 active member" : `are ${role.memberCount} active members`} currently holding this role. Select the destination authority level they will safely inherit:
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#85827B]">
                Reassign Members To
              </label>
              <Select value={reassignToRoleId} onValueChange={setReassignToRoleId}>
                <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                  <SelectValue placeholder="Select destination role..." />
                </SelectTrigger>
                <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                  {candidateRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.isSystem ? "System" : "Custom"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-white/[0.06] bg-[#191919] text-xs text-[#85827B]">
            No members are currently assigned to this role. Deletion will take effect immediately.
          </div>
        )}

        <AlertDialogFooter className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <AlertDialogCancel className="border-white/[0.08] text-xs text-[#85827B] hover:text-[#F7F4EC]">
            Cancel
          </AlertDialogCancel>

          <Button
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || (role.memberCount > 0 && !reassignToRoleId)}
            className="bg-rose-600 text-white hover:bg-rose-700 text-xs gap-1.5"
          >
            {isDeleting ? (
              <>
                <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                <span>Confirm Deletion</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
