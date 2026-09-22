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
import { RoleOverviewItem, RoleComparisonResult } from "@nxtqr/contracts";
import { toast } from "sonner";

interface RoleComparatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  roles: RoleOverviewItem[];
  defaultRoleAId?: string;
}

export function RoleComparatorDialog({
  isOpen,
  onClose,
  orgSlug,
  roles,
  defaultRoleAId,
}: RoleComparatorDialogProps) {
  const [roleAId, setRoleAId] = React.useState<string>(
    defaultRoleAId || roles[0]?.id || ""
  );
  const [roleBId, setRoleBId] = React.useState<string>(
    roles[1]?.id || roles[0]?.id || ""
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [comparison, setComparison] = React.useState<RoleComparisonResult | null>(null);
  const [showDifferencesOnly, setShowDifferencesOnly] = React.useState(true);

  React.useEffect(() => {
    if (defaultRoleAId) {
      setRoleAId(defaultRoleAId);
    }
  }, [defaultRoleAId]);

  const fetchComparison = React.useCallback(async () => {
    if (!roleAId || !roleBId) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/roles/compare?roleA=${roleAId}&roleB=${roleBId}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to compare roles");
      }
      setComparison(data.data.comparison);
    } catch (err: any) {
      toast.error(err.message || "Comparison error");
    } finally {
      setIsLoading(false);
    }
  }, [orgSlug, roleAId, roleBId]);

  React.useEffect(() => {
    if (isOpen && roleAId && roleBId) {
      fetchComparison();
    }
  }, [isOpen, roleAId, roleBId, fetchComparison]);

  const roleA = roles.find((r) => r.id === roleAId);
  const roleB = roles.find((r) => r.id === roleBId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-6">
        <DialogHeader className="space-y-1.5 text-left border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:transfer-horizontal-bold" className="w-5 h-5 text-[#FA520F]" />
            <DialogTitle className="text-lg font-bold text-[#F7F4EC]">
              Role Authority Comparator
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#B8B5AD]">
            Analyze authorization divergences between two roles across shared and unique capability sets.
          </DialogDescription>
        </DialogHeader>

        {/* Role Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              Primary Role (A)
            </label>
            <Select value={roleAId} onValueChange={setRoleAId}>
              <SelectTrigger className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select Role A..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.permissionCount} caps)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              Comparison Role (B)
            </label>
            <Select value={roleBId} onValueChange={setRoleBId}>
              <SelectTrigger className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select Role B..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.permissionCount} caps)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3-Lane Visualizer */}
        {isLoading ? (
          <div className="py-12 text-center space-y-2">
            <Icon icon="solar:restart-bold" className="w-6 h-6 animate-spin text-[#FA520F] mx-auto" />
            <p className="text-xs text-[#85827B]">Computing role differential...</p>
          </div>
        ) : comparison ? (
          <div className="space-y-4">
            {/* Lane Metrics Summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg border border-[#FA520F]/30 bg-[#FA520F]/5">
                <div className="text-[10px] font-mono text-[#FA520F] uppercase font-semibold truncate">
                  {roleA?.name} ONLY
                </div>
                <div className="text-lg font-bold font-mono text-[#FA520F] mt-0.5">
                  {comparison.roleAOnly.length}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-white/[0.08] bg-[#191919]">
                <div className="text-[10px] font-mono text-[#B8B5AD] uppercase font-semibold">
                  SHARED CAPABILITIES
                </div>
                <div className="text-lg font-bold font-mono text-[#F7F4EC] mt-0.5">
                  {comparison.shared.length}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold truncate">
                  {roleB?.name} ONLY
                </div>
                <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                  {comparison.roleBOnly.length}
                </div>
              </div>
            </div>

            {/* Lane Lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lane 1: Role A Only */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-[#FA520F] uppercase pb-1 border-b border-white/[0.08]">
                  Unique to {roleA?.name}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {comparison.roleAOnly.length > 0 ? (
                    comparison.roleAOnly.map((code) => (
                      <div
                        key={code}
                        className="p-2 rounded border border-[#FA520F]/20 bg-[#1E1713] text-xs font-mono text-[#F7F4EC]"
                      >
                        + {code}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#85827B] italic">No unique capabilities.</p>
                  )}
                </div>
              </div>

              {/* Lane 2: Shared */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-[#B8B5AD] uppercase pb-1 border-b border-white/[0.08]">
                  Shared Capabilities
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {comparison.shared.length > 0 ? (
                    comparison.shared.map((code) => (
                      <div
                        key={code}
                        className="p-2 rounded border border-white/[0.06] bg-[#191919] text-xs font-mono text-[#B8B5AD]"
                      >
                        = {code}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#85827B] italic">No shared capabilities.</p>
                  )}
                </div>
              </div>

              {/* Lane 3: Role B Only */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-amber-400 uppercase pb-1 border-b border-white/[0.08]">
                  Unique to {roleB?.name}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {comparison.roleBOnly.length > 0 ? (
                    comparison.roleBOnly.map((code) => (
                      <div
                        key={code}
                        className="p-2 rounded border border-amber-500/20 bg-amber-950/20 text-xs font-mono text-[#F7F4EC]"
                      >
                        + {code}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#85827B] italic">No unique capabilities.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-[#85827B] hover:text-[#F7F4EC]"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
