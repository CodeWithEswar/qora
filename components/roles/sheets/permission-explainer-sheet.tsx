"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { PermissionMatrixCell } from "@nxtqr/contracts";

interface PermissionExplainerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  permissionCode: string | null;
  permissionLabel: string | null;
  description: string | null;
  domain: string | null;
  roleName: string | null;
  cell: PermissionMatrixCell | null;
  affectedMembersCount: number;
}

export function PermissionExplainerSheet({
  isOpen,
  onClose,
  permissionCode,
  permissionLabel,
  description,
  domain,
  roleName,
  cell,
  affectedMembersCount,
}: PermissionExplainerSheetProps) {
  if (!permissionCode) return null;

  const isAllowed = cell?.isAllowed ?? false;
  const isHighImpact =
    permissionCode.includes("delete") ||
    permissionCode.includes("remove") ||
    permissionCode.includes("transfer") ||
    permissionCode.includes("billing");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-[#151515] border-l border-white/[0.08] text-[#F7F4EC] p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="text-left space-y-2 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-[#FA520F]/30 bg-[#FA520F]/10 text-[#FA520F] text-[10px] font-mono uppercase"
            >
              {domain || "CAPABILITY"}
            </Badge>

            {isHighImpact && (
              <Badge
                variant="outline"
                className="border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-mono uppercase"
              >
                HIGH IMPACT
              </Badge>
            )}
          </div>

          <SheetTitle className="text-lg font-bold text-[#F7F4EC]">
            {permissionLabel || permissionCode}
          </SheetTitle>

          <SheetDescription className="text-xs text-[#B8B5AD] leading-relaxed">
            {description || "Authoritative platform permission governing resource boundaries."}
          </SheetDescription>
        </SheetHeader>

        {/* Evaluation Breakdown */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#191919] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#85827B]">Evaluated Role:</span>
              <span className="font-semibold text-[#F7F4EC]">{roleName || "Selected Role"}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#85827B]">Authorization State:</span>
              <span
                className={`font-mono font-bold uppercase text-[11px] ${
                  isAllowed ? "text-emerald-400" : "text-[#85827B]"
                }`}
              >
                {cell?.state.toUpperCase() || "DENIED"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#85827B]">Active Members Holding:</span>
              <span className="font-mono text-[#FA520F] font-bold">
                {affectedMembersCount} {affectedMembersCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          {/* Canonical Identifier */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#85827B]">CANONICAL IDENTIFIER</div>
            <div className="p-2.5 rounded-md border border-white/[0.06] bg-[#121212] font-mono text-xs text-[#F7F4EC] select-all">
              {permissionCode}
            </div>
          </div>

          {/* Entitlement & Governance Architecture Notice */}
          <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#191919] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FFB83E]">
              <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
              <span>Entitlement vs. Permission Separation</span>
            </div>
            <p className="text-[11px] text-[#B8B5AD] leading-relaxed">
              Having this permission grants the member capability to execute this operation. However, if the organization subscription plan disables this feature, the action remains gated at the tenant level.
            </p>
          </div>

          {/* Destructive Invariant Warning */}
          {isHighImpact && (
            <div className="p-3.5 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <Icon icon="solar:shield-warning-bold" className="w-4 h-4" />
                <span>Governance & Audit Guard</span>
              </div>
              <p className="text-[11px] text-[#B8B5AD] leading-relaxed">
                Changes to or invocations of this permission generate immutable audit log events with actor attribution.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
