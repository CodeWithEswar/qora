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
import { Input } from "@/components/ui/input";
import {
  RoleMemberSummary,
  AccessSimulatorResult,
} from "@nxtqr/contracts";
import { AccessCorridor } from "../access-corridor";
import { toast } from "sonner";

interface AccessSimulatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  members: RoleMemberSummary[];
}

export function AccessSimulatorDialog({
  isOpen,
  onClose,
  orgSlug,
  members,
}: AccessSimulatorDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = React.useState<string>(
    members[0]?.userId || ""
  );
  const [resourceType, setResourceType] = React.useState("qr_code");
  const [resourceId, setResourceId] = React.useState("vehicle-emergency-qr");
  const [action, setAction] = React.useState("publish");

  const [isSimulating, setIsSimulating] = React.useState(false);
  const [result, setResult] = React.useState<AccessSimulatorResult | null>(null);

  // Reset or run initial simulation
  React.useEffect(() => {
    if (isOpen && members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].userId);
    }
  }, [isOpen, members, selectedMemberId]);

  const handleSimulate = async () => {
    if (!selectedMemberId) {
      toast.error("Please select a member identity to evaluate.");
      return;
    }

    setIsSimulating(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/roles/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberUserId: selectedMemberId,
          resourceType,
          resourceId,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to evaluate access");
      }

      setResult(data.data.simulation);
    } catch (err: any) {
      toast.error(err.message || "Simulation error");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-6">
        <DialogHeader className="space-y-1.5 text-left border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:play-circle-bold" className="w-5 h-5 text-[#FFB83E]" />
            <DialogTitle className="text-lg font-bold text-[#F7F4EC]">
              Access Simulator & Evaluation Corridor
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#B8B5AD]">
            Execute authoritative server authorization against live identity, role, policy, and entitlement boundaries.
          </DialogDescription>
        </DialogHeader>

        {/* Simulator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              Member Identity
            </label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select member..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.name || m.email} ({m.roleName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              Action / Operation
            </label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectItem value="read">read (inspect resource)</SelectItem>
                <SelectItem value="create">create (new resource)</SelectItem>
                <SelectItem value="update">update (modify state)</SelectItem>
                <SelectItem value="publish">publish (release revision)</SelectItem>
                <SelectItem value="delete">delete (destroy resource)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resource Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              Resource Boundary
            </label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select resource type..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectItem value="qr_code">QR Code</SelectItem>
                <SelectItem value="domain">Custom Domain</SelectItem>
                <SelectItem value="team">Team / Membership</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="billing">Billing & Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Resource Identifier */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
              Resource Specifier
            </label>
            <Input
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="e.g. promo-qr-123"
              className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]"
            />
          </div>
        </div>

        {/* Evaluation Corridor Result */}
        {result ? (
          <AccessCorridor
            steps={result.corridor}
            decision={result.decision}
            reasons={result.reasons}
          />
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-white/[0.08] bg-[#191919] space-y-2">
            <Icon icon="solar:shield-check-bold" className="w-8 h-8 text-[#85827B] mx-auto" />
            <p className="text-xs text-[#F7F4EC] font-medium">Ready to Simulate</p>
            <p className="text-[11px] text-[#85827B] max-w-sm mx-auto">
              Select an active member and an action to trace the complete authority traversal through the 8-stage decision pipeline.
            </p>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-[#85827B] hover:text-[#F7F4EC]"
          >
            Close
          </Button>

          <Button
            size="sm"
            onClick={handleSimulate}
            disabled={isSimulating}
            className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
          >
            {isSimulating ? (
              <>
                <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:play-bold" className="w-3.5 h-3.5" />
                <span>Simulate Access</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
