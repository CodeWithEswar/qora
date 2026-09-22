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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleMemberSummary, RoleOverviewItem } from "@nxtqr/contracts";
import { toast } from "sonner";

interface ChangeMemberRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  member: RoleMemberSummary | null;
  roles: RoleOverviewItem[];
  onRoleAssigned: () => void;
}

export function ChangeMemberRoleDialog({
  isOpen,
  onClose,
  orgSlug,
  member,
  roles,
  onRoleAssigned,
}: ChangeMemberRoleDialogProps) {
  const [targetRoleId, setTargetRoleId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (member) {
      setTargetRoleId(member.roleId);
    }
  }, [member]);

  if (!member) return null;

  const currentRole = roles.find((r) => r.id === member.roleId);
  const targetRole = roles.find((r) => r.id === targetRoleId);

  // Check if member is sole owner
  const isOwner = currentRole?.code.toUpperCase() === "OWNER";
  const ownerRole = roles.find((r) => r.code.toUpperCase() === "OWNER");
  const isSoleOwner = isOwner && (ownerRole?.memberCount ?? 1) <= 1;
  const isDemotingSoleOwner = isSoleOwner && targetRole?.code.toUpperCase() !== "OWNER";

  const handleAssign = async () => {
    if (isDemotingSoleOwner) {
      toast.error("Cannot demote the sole organization owner. Transfer ownership first.");
      return;
    }

    if (!targetRoleId || targetRoleId === member.roleId) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/roles/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipId: member.membershipId,
          newRoleId: targetRoleId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to change role");
      }

      toast.success("Member role changed.");
      onRoleAssigned();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Member role could not be changed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-5">
        <DialogHeader className="space-y-1.5 text-left border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:user-bold" className="w-5 h-5 text-[#FA520F]" />
            <DialogTitle className="text-lg font-bold text-[#F7F4EC]">
              Change Member Role
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#B8B5AD]">
            Reassign the authoritative authority tier for this organization identity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Identity Preview */}
          <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#191919] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#232323] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-[#FA520F]">
              {member.name ? member.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#F7F4EC] truncate">
                {member.name || "Workspace Member"}
              </div>
              <div className="text-[11px] text-[#85827B] font-mono truncate">
                {member.email}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#85827B] uppercase block">CURRENT</span>
              <span className="text-xs font-semibold text-[#FA520F]">{member.roleName}</span>
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              New Authority Role
            </label>
            <Select value={targetRoleId} onValueChange={setTargetRoleId}>
              <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.permissionCount} caps) — {r.isSystem ? "System" : "Custom"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sole Owner Protection Warning */}
          {isDemotingSoleOwner && (
            <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <Icon icon="solar:shield-warning-bold" className="w-4 h-4" />
                <span>Sole Owner Invariant Protected</span>
              </div>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                This member is the sole active Owner of this workspace. Demoting or changing their role is blocked to prevent tenant lockout. Assign another Owner first.
              </p>
            </div>
          )}

          {/* Authority Delta Preview */}
          {targetRole && targetRole.id !== member.roleId && !isDemotingSoleOwner && (
            <div className="p-3 rounded-lg border border-white/[0.06] bg-[#191919] text-xs space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#85827B]">Authority Delta</div>
              <div className="flex items-center justify-between text-[#B8B5AD]">
                <span>{currentRole?.name} ({currentRole?.permissionCount} caps)</span>
                <span>→</span>
                <span className="text-[#FA520F] font-semibold">
                  {targetRole.name} ({targetRole.permissionCount} caps)
                </span>
              </div>
            </div>
          )}
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
            onClick={handleAssign}
            disabled={isSubmitting || isDemotingSoleOwner || targetRoleId === member.roleId}
            className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
