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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SYSTEM_ROLE_METADATA } from "@nxtqr/permissions";
import { SystemRoleName } from "@nxtqr/contracts";
import { AlertTriangle, Mail, Building2, Shield, ArrowRight } from "lucide-react";

interface RoleOption {
  id: string;
  name: string;
  isSystem: boolean;
  description?: string;
}

interface TeamOption {
  id: string;
  name: string;
}

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roles: RoleOption[];
  teams: TeamOption[];
  seatLimit: number | null;
  seatsAssigned: number;
  onInvite: (data: {
    emails: string[];
    roleId: string;
    teamIds: string[];
  }) => Promise<{ inviteUrl?: string }>;
  onUpgradeClick?: () => void;
}

export function InviteMemberDialog({
  isOpen,
  onClose,
  roles,
  teams,
  seatLimit,
  seatsAssigned,
  onInvite,
  onUpgradeClick,
}: InviteMemberDialogProps) {
  const [emailsInput, setEmailsInput] = React.useState("");
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = React.useState<string | null>(null);

  // Set default role to Editor or Member
  React.useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const editorRole = roles.find((r) => r.name === "Editor") || roles[0];
      setSelectedRoleId(editorRole.id);
    }
  }, [roles, selectedRoleId]);

  const isAtLimit = seatLimit !== null && seatsAssigned >= seatLimit;

  const targetRole = roles.find((r) => r.id === selectedRoleId);
  const targetDesc =
    targetRole?.description ||
    (SYSTEM_ROLE_METADATA[targetRole?.name as SystemRoleName]?.description ?? "");

  const handleSend = async () => {
    const rawEmails = emailsInput
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (rawEmails.length === 0) {
      setError("Please provide at least one email address.");
      return;
    }

    const invalidEmail = rawEmails.find((e) => !e.includes("@") || !e.includes("."));
    if (invalidEmail) {
      setError(`'${invalidEmail}' is not a valid email address.`);
      return;
    }

    if (!selectedRoleId) {
      setError("Please select a workspace role.");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const res = await onInvite({
        emails: rawEmails,
        roleId: selectedRoleId,
        teamIds: selectedTeamIds,
      });

      if (res?.inviteUrl) {
        setCreatedInviteUrl(res.inviteUrl);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create invitation.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCopyLink = () => {
    if (createdInviteUrl) {
      navigator.clipboard.writeText(
        typeof window !== "undefined"
          ? `${window.location.origin}${createdInviteUrl}`
          : createdInviteUrl
      );
    }
  };

  const resetState = () => {
    setEmailsInput("");
    setSelectedTeamIds([]);
    setError(null);
    setCreatedInviteUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetState}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Give teammates access to this NXTQR workspace and specify their publishing authority.
          </DialogDescription>
        </DialogHeader>

        {isAtLimit ? (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-xs">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  Seat limit reached
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  This workspace currently uses all {seatsAssigned} of {seatLimit} available seats on your current plan.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={resetState}>
                Close
              </Button>
              {onUpgradeClick && (
                <Button
                  size="sm"
                  onClick={onUpgradeClick}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  View plans & upgrade
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : createdInviteUrl ? (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
              <h4 className="font-semibold text-foreground text-sm mb-1">
                Invitation created
              </h4>
              <p className="text-muted-foreground mb-3">
                The invitation has been securely created with a single-use hashed token.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}${createdInviteUrl}`
                      : createdInviteUrl
                  }
                  className="font-mono text-xs bg-surface"
                />
                <Button size="sm" onClick={handleCopyLink} className="shrink-0 text-xs">
                  Copy link
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={resetState}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Email addresses */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-emails">Email addresses</Label>
              <Input
                id="invite-emails"
                placeholder="colleague@example.com, developer@company.com"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                disabled={isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Comma-separate multiple emails for batch invitation.
              </p>
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Workspace Role</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                disabled={isPending}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {r.isSystem ? "• System" : "• Custom"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role description display */}
            {targetDesc && (
              <div className="p-2.5 rounded-lg bg-surface-hover/80 border border-border/80 text-xs text-muted-foreground flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground block mb-0.5">
                    {targetRole?.name} authority:
                  </span>
                  <span>{targetDesc}</span>
                </div>
              </div>
            )}

            {/* Optional Teams assignment */}
            {teams.length > 0 && (
              <div className="space-y-2">
                <Label>Add to Teams (Optional)</Label>
                <div className="max-h-32 overflow-y-auto space-y-1 border border-border/60 rounded-lg p-2 bg-surface/50">
                  {teams.map((t) => {
                    const isChecked = selectedTeamIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-surface-hover/50 text-xs cursor-pointer select-none"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() =>
                            setSelectedTeamIds((prev) =>
                              prev.includes(t.id)
                                ? prev.filter((id) => id !== t.id)
                                : [...prev, t.id]
                            )
                          }
                        />
                        <Building2 className="h-3 w-3 text-blue-500" />
                        <span className="text-foreground">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={resetState} disabled={isPending}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={isPending || !emailsInput.trim()}
                className="bg-primary hover:bg-primary/90 text-white gap-1.5"
              >
                <span>{isPending ? "Sending..." : "Send invitation"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
