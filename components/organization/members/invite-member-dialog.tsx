"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { AlertCircle, CheckCircle2, Copy, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RoleOption {
  id: string;
  code?: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
}

interface TeamOption {
  id: string;
  name: string;
}

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName?: string;
  roles: RoleOption[];
  teams: TeamOption[];
  onInvite: (data: {
    email: string;
    roleId: string;
    teamIds: string[];
  }) => Promise<{ inviteUrl?: string }>;
}

type InviteStep = "01_IDENTITY" | "02_ACCESS" | "03_TEAMS" | "04_REVIEW" | "SUCCESS";

export function InviteMemberDialog({
  isOpen,
  onClose,
  organizationName = "ORGANIZATION",
  roles,
  teams,
  onInvite,
}: InviteMemberDialogProps) {
  const [currentStep, setCurrentStep] = React.useState<InviteStep>("01_IDENTITY");
  const [email, setEmail] = React.useState("");
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedInviteUrl, setGeneratedInviteUrl] = React.useState<string | null>(null);

  // Set default role to Member or Viewer
  React.useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const defaultRole = roles.find((r) => r.name === "Member" || r.code === "MEMBER") || roles[0];
      setSelectedRoleId(defaultRole.id);
    }
  }, [roles, selectedRoleId]);

  // Reset on open/close
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep("01_IDENTITY");
      setEmail("");
      setSelectedTeamIds([]);
      setError(null);
      setGeneratedInviteUrl(null);
    }
  }, [isOpen]);

  const targetRole = roles.find((r) => r.id === selectedRoleId);

  const handleNextFromIdentity = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please provide an email address.");
      return;
    }
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setCurrentStep("02_ACCESS");
  };

  const handleNextFromAccess = () => {
    if (!selectedRoleId) {
      setError("Please select an authorization role.");
      return;
    }
    setError(null);
    setCurrentStep("03_TEAMS");
  };

  const handleNextFromTeams = () => {
    setError(null);
    setCurrentStep("04_REVIEW");
  };

  const handleSendInvitation = async () => {
    setIsPending(true);
    setError(null);
    try {
      const res = await onInvite({
        email: email.trim().toLowerCase(),
        roleId: selectedRoleId,
        teamIds: selectedTeamIds,
      });

      if (res?.inviteUrl) {
        setGeneratedInviteUrl(res.inviteUrl);
        setCurrentStep("SUCCESS");
      } else {
        toast.success("Invitation sent", {
          description: `Invitation successfully recorded for ${email}.`,
        });
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create invitation. Please check inputs and retry.");
    } finally {
      setIsPending(false);
    }
  };

  const copyLink = () => {
    if (!generatedInviteUrl) return;
    const fullUrl = `${window.location.origin}${generatedInviteUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Invitation link copied to clipboard");
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 flex flex-col bg-background text-foreground border-l border-border/80"
      >
        {/* Step Indicator Header */}
        <div className="px-6 py-4 border-b border-border/70 bg-surface/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span>COLLABORATE</span>
            <span>/</span>
            <span className="text-foreground font-semibold">INVITE MEMBER</span>
          </div>
          {currentStep !== "SUCCESS" && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <span className={cn(currentStep === "01_IDENTITY" ? "text-primary font-bold" : "")}>01</span>
              <span>→</span>
              <span className={cn(currentStep === "02_ACCESS" ? "text-primary font-bold" : "")}>02</span>
              <span>→</span>
              <span className={cn(currentStep === "03_TEAMS" ? "text-primary font-bold" : "")}>03</span>
              <span>→</span>
              <span className={cn(currentStep === "04_REVIEW" ? "text-primary font-bold" : "")}>04</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 01: IDENTITY */}
          {currentStep === "01_IDENTITY" && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                  STEP 01
                </span>
                <h3 className="text-base font-semibold text-foreground tracking-tight mt-0.5">
                  Member Identity & Contact
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Enter the email address of the person you want to invite to this workspace.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="invite-email" className="text-xs font-medium">
                  Authorized Email Address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="collaborator@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleNextFromIdentity();
                    }
                  }}
                  autoFocus
                  className="h-9 text-xs bg-surface"
                />
              </div>

              <div className="p-3 rounded-lg border border-border/70 bg-surface/50 text-[11px] text-muted-foreground font-mono space-y-1">
                <span className="font-semibold text-foreground block">SECURITY GUARANTEE</span>
                <p>
                  Invitations generate single-use, high-entropy cryptographic tokens. The invitee must authenticate before workspace access is granted.
                </p>
              </div>
            </div>
          )}

          {/* STEP 02: ACCESS */}
          {currentStep === "02_ACCESS" && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                  STEP 02
                </span>
                <h3 className="text-base font-semibold text-foreground tracking-tight mt-0.5">
                  Operational Access Role
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Select the level of operational authority to grant upon acceptance.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {roles.map((r) => {
                  const isSelected = r.id === selectedRoleId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoleId(r.id)}
                      className={cn(
                        "p-3.5 rounded-xl border cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border/70 bg-surface/50 hover:bg-surface-hover/70"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              isSelected ? "bg-primary" : "bg-muted-foreground/40"
                            )}
                          />
                          <span className="text-xs font-semibold text-foreground">{r.name}</span>
                        </div>
                        {r.isSystem && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground uppercase">
                            System Role
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed pl-4">
                        {r.description || "Operational access role."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 03: TEAMS */}
          {currentStep === "03_TEAMS" && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                  STEP 03
                </span>
                <h3 className="text-base font-semibold text-foreground tracking-tight mt-0.5">
                  Assign Team Memberships (Optional)
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Assign the new member to operational teams to grant scoped access to team resources.
                </p>
              </div>

              {teams.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border/80 rounded-xl space-y-1">
                  <p className="text-xs font-medium text-foreground">No teams configured yet</p>
                  <p className="text-[11px] text-muted-foreground">
                    You can configure teams later from Collaborate → Teams.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {teams.map((t) => {
                    const isSelected = selectedTeamIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTeam(t.id)}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border/70 bg-surface/50 hover:bg-surface-hover/70"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleTeam(t.id)}
                            id={`team-${t.id}`}
                          />
                          <Label
                            htmlFor={`team-${t.id}`}
                            className="text-xs font-medium text-foreground cursor-pointer"
                          >
                            {t.name}
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 04: REVIEW */}
          {currentStep === "04_REVIEW" && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                  STEP 04
                </span>
                <h3 className="text-base font-semibold text-foreground tracking-tight mt-0.5">
                  Review & Confirm Invitation
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Verify authorization details before issuing the cryptographic invitation.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface/60 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase">RECIPIENT EMAIL</span>
                  <span className="text-foreground font-semibold font-sans">{email}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase">ASSIGNED ROLE</span>
                  <span className="text-primary font-semibold font-sans">
                    {targetRole?.name || "Viewer"}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase">TEAMS ASSIGNED</span>
                  <div className="text-right">
                    {selectedTeamIds.length === 0 ? (
                      <span className="text-muted-foreground italic font-sans text-[11px]">
                        None (Direct authority only)
                      </span>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-1 font-sans">
                        {teams
                          .filter((t) => selectedTeamIds.includes(t.id))
                          .map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium"
                            >
                              {t.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature Interaction #4: Invitation Relationship */}
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase block mb-1.5 font-semibold">
                    RELATIONSHIP TOPOLOGY
                  </span>
                  <div className="p-3 bg-surface rounded-lg border border-border/70 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-primary">●</span>
                      <span className="uppercase font-bold">{organizationName || "ORGANIZATION"}</span>
                      <span className="text-muted-foreground">───────</span>
                      <span className="text-amber-500 font-bold">○</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">INVITED MEMBER</span>
                    </div>
                    <div className="pl-6 border-l border-border/70 ml-2 space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>└──</span>
                        <span className="text-primary font-semibold uppercase">{targetRole?.name || "Viewer"}</span>
                      </div>
                      {selectedTeamIds.length > 0 && (
                        <div className="flex items-center gap-1.5 pl-3">
                          <span>└──</span>
                          <span className="text-teal-600 dark:text-teal-400">
                            {teams.filter((t) => selectedTeamIds.includes(t.id)).map((t) => t.name).join(" · ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                By sending, a record will be committed to the workspace invitations registry with an expiration window of 7 days.
              </p>
            </div>
          )}

          {/* STEP 05: SUCCESS */}
          {currentStep === "SUCCESS" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Invitation Created Successfully
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  A high-entropy invitation has been created for <span className="text-foreground font-medium">{email}</span> with role <span className="text-foreground font-medium">{targetRole?.name}</span>.
                </p>
              </div>

              {generatedInviteUrl && (
                <div className="p-3 rounded-xl border border-border/70 bg-surface/60 space-y-2 text-left">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                    DIRECT INVITATION URL (SINGLE-USE)
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}${generatedInviteUrl}`}
                      className="h-8 text-xs font-mono bg-surface"
                    />
                    <Button size="sm" onClick={copyLink} className="h-8 text-xs shrink-0 gap-1">
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step Navigation Footer */}
        <div className="p-4 border-t border-border/80 bg-surface/80 backdrop-blur-xs flex items-center justify-between gap-2">
          {currentStep === "SUCCESS" ? (
            <div className="flex items-center justify-end w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentStep("01_IDENTITY");
                  setEmail("");
                  setError(null);
                }}
                className="h-8 text-xs font-medium"
              >
                Invite another member
              </Button>
              <Button size="sm" onClick={onClose} className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-white">
                Done
              </Button>
            </div>
          ) : (
            <>
              <div>
                {currentStep !== "01_IDENTITY" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currentStep === "02_ACCESS") setCurrentStep("01_IDENTITY");
                      else if (currentStep === "03_TEAMS") setCurrentStep("02_ACCESS");
                      else if (currentStep === "04_REVIEW") setCurrentStep("03_TEAMS");
                    }}
                    className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                  Cancel
                </Button>

                {currentStep === "01_IDENTITY" && (
                  <Button
                    size="sm"
                    onClick={handleNextFromIdentity}
                    className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                  >
                    <span>Role Access</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}

                {currentStep === "02_ACCESS" && (
                  <Button
                    size="sm"
                    onClick={handleNextFromAccess}
                    className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                  >
                    <span>Assign Teams</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}

                {currentStep === "03_TEAMS" && (
                  <Button
                    size="sm"
                    onClick={handleNextFromTeams}
                    className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                  >
                    <span>Review Invitation</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}

                {currentStep === "04_REVIEW" && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={handleSendInvitation}
                    className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                  >
                    <span>{isPending ? "Sending..." : "Send Invitation"}</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
