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
import { Badge } from "@/components/ui/badge";
import { PermissionMatrixDomainGroup } from "@nxtqr/contracts";
import { toast } from "sonner";

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  matrixGroups: PermissionMatrixDomainGroup[];
  onRoleCreated: (newRole: any) => void;
}

export function CreateRoleDialog({
  isOpen,
  onClose,
  orgSlug,
  matrixGroups,
  onRoleCreated,
}: CreateRoleDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-slugify code from name
  React.useEffect(() => {
    if (step === 1 && name) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 32);
      setCode(generated);
    }
  }, [name, step]);

  const handleTogglePermission = (pCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(pCode) ? prev.filter((p) => p !== pCode) : [...prev, pCode]
    );
  };

  const handleSelectAllDomain = (domainKey: string, allCodes: string[]) => {
    const areAllSelected = allCodes.every((c) => selectedPermissions.includes(c));
    if (areAllSelected) {
      setSelectedPermissions((prev) => prev.filter((c) => !allCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...allCodes])));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create custom role");
      }

      toast.success("Role created.");
      onRoleCreated(data.data.role);
      onClose();
      // Reset form
      setStep(1);
      setName("");
      setCode("");
      setDescription("");
      setSelectedPermissions([]);
    } catch (err: any) {
      toast.error(err.message || "Could not create role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-6">
        <DialogHeader className="space-y-1.5 text-left border-b border-white/[0.08] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-plus-bold" className="w-5 h-5 text-[#FA520F]" />
              <DialogTitle className="text-lg font-bold text-[#F7F4EC]">
                Create Custom Role
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#85827B]">
              <span className={step >= 1 ? "text-[#FA520F] font-bold" : ""}>01 IDENTITY</span>
              <span>→</span>
              <span className={step >= 2 ? "text-[#FA520F] font-bold" : ""}>02 CAPABILITIES</span>
              <span>→</span>
              <span className={step >= 3 ? "text-[#FA520F] font-bold" : ""}>03 REVIEW</span>
            </div>
          </div>
          <DialogDescription className="text-xs text-[#B8B5AD]">
            Define a tailor-made tenant authority level with precise capability boundaries.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
                Role Name <span className="text-[#FA520F]">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Campaign Publisher"
                className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
                Identifier Code
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. campaign_publisher"
                className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#85827B] uppercase font-semibold">
                Purpose & Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the scope and responsibilities of this custom role..."
                rows={3}
                className="bg-[#191919] border-white/[0.08] text-xs text-[#F7F4EC]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Capabilities */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-[#85827B] font-mono">
              <span>{selectedPermissions.length} permissions selected</span>
              <button
                onClick={() =>
                  setSelectedPermissions(
                    matrixGroups.flatMap((g) => g.permissions.map((p) => p.code))
                  )
                }
                className="text-[#FA520F] hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
              {matrixGroups.map((group) => {
                const groupCodes = group.permissions.map((p) => p.code);
                const selectedInGroup = groupCodes.filter((c) =>
                  selectedPermissions.includes(c)
                ).length;

                return (
                  <div
                    key={group.domainKey}
                    className="p-3.5 rounded-lg border border-white/[0.06] bg-[#191919] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EC]">
                          {group.domainName}
                        </span>
                        <span className="text-[10px] font-mono text-[#FA520F]">
                          ({selectedInGroup}/{groupCodes.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAllDomain(group.domainKey, groupCodes)}
                        className="text-[10px] font-mono text-[#85827B] hover:text-[#F7F4EC]"
                      >
                        {selectedInGroup === groupCodes.length ? "Deselect domain" : "Select domain"}
                      </button>
                    </div>

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
                              onCheckedChange={() => handleTogglePermission(perm.code)}
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
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/[0.08] bg-[#191919] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#F7F4EC]">{name}</span>
                <Badge
                  variant="outline"
                  className="border-[#FA520F]/30 bg-[#FA520F]/10 text-[#FA520F] text-[10px] font-mono uppercase"
                >
                  CUSTOM ROLE
                </Badge>
              </div>

              <p className="text-xs text-[#B8B5AD]">
                {description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06] text-xs">
                <div>
                  <span className="text-[#85827B] font-mono uppercase text-[10px]">Identifier:</span>
                  <div className="font-mono text-[#F7F4EC]">{code}</div>
                </div>
                <div>
                  <span className="text-[#85827B] font-mono uppercase text-[10px]">Capabilities:</span>
                  <div className="font-mono text-[#FA520F] font-bold">
                    {selectedPermissions.length} permissions granted
                  </div>
                </div>
              </div>
            </div>

            {/* High-impact permissions check */}
            {selectedPermissions.some((p) => p.includes("delete") || p.includes("billing")) && (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-start gap-2.5">
                <Icon icon="solar:shield-warning-bold" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-[#B8B5AD]">
                  <strong className="text-amber-300">Contains High-Impact Capabilities:</strong> This role includes destructive capabilities such as resource deletion or billing operations. Verify assigned identities carefully.
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="border-white/[0.08] text-xs text-[#F7F4EC]"
            >
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-[#85827B] hover:text-[#F7F4EC]"
            >
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  toast.error("Role name is required.");
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
              className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
            >
              <span>Next</span>
              <Icon icon="solar:alt-arrow-right-bold" className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Role...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:shield-plus-bold" className="w-3.5 h-3.5" />
                  <span>Create Role</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
