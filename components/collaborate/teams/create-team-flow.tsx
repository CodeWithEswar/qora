"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANONICAL_OPERATIONAL_DOMAINS } from "@/lib/supabase/types/teams";
import type {
  TeamAccessDomain,
  AccessDomainLevel,
} from "@/lib/supabase/types/teams";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Check, AlertCircle, Users, CheckCircle2 } from "lucide-react";

interface CreateTeamFlowProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  orgMembers: AdminMemberSummary[];
  onCreate: (payload: {
    name: string;
    description?: string;
    memberIds: string[];
    accessDomains: TeamAccessDomain[];
  }) => Promise<{ id: string; name: string }>;
}

type CreateStep = "01_IDENTITY" | "02_MEMBERS" | "03_ACCESS" | "04_REVIEW" | "SUCCESS";

export function CreateTeamFlow({
  isOpen,
  onClose,
  organizationName,
  orgMembers,
  onCreate,
}: CreateTeamFlowProps) {
  const [currentStep, setCurrentStep] = React.useState<CreateStep>("01_IDENTITY");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [domains, setDomains] = React.useState<TeamAccessDomain[]>(
    CANONICAL_OPERATIONAL_DOMAINS.map((cd, idx) => ({
      domain: cd.domain,
      level: idx === 0 ? "MANAGE" : idx === 1 ? "VIEW" : "NONE",
    }))
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep("01_IDENTITY");
      setName("");
      setDescription("");
      setSelectedMemberIds([]);
      setDomains(
        CANONICAL_OPERATIONAL_DOMAINS.map((cd, idx) => ({
          domain: cd.domain,
          level: idx === 0 ? "MANAGE" : idx === 1 ? "VIEW" : "NONE",
        }))
      );
      setError(null);
    }
  }, [isOpen]);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const updateDomainLevel = (domain: string, level: AccessDomainLevel) => {
    setDomains((prev) =>
      prev.map((d) => (d.domain === domain ? { ...d, level } : d))
    );
  };

  const handleNextFromIdentity = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Team name must be at least 2 characters.");
      return;
    }
    setError(null);
    setCurrentStep("02_MEMBERS");
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        memberIds: selectedMemberIds,
        accessDomains: domains,
      });
      setCurrentStep("SUCCESS");
    } catch (err: any) {
      setError(err?.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] p-0 flex flex-col bg-background text-foreground border-l border-border/80 shadow-2xl"
      >
        {/* Step Indicator Header Rail */}
        <div className="px-6 py-4 border-b border-border/70 bg-surface/40 select-none">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <span>COLLABORATE</span>
              <span>/</span>
              <span className="text-foreground font-semibold">CREATE TEAM</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              4-STAGE WORKFLOW
            </span>
          </div>

          {/* Progress Rail */}
          <div className="flex items-center justify-between font-mono text-[10px]">
            <div className={cn("flex items-center gap-1.5", currentStep === "01_IDENTITY" ? "text-primary font-bold" : "text-muted-foreground")}>
              <span>●</span>
              <span>01 IDENTITY</span>
            </div>
            <span className="text-border/80">────</span>
            <div className={cn("flex items-center gap-1.5", currentStep === "02_MEMBERS" ? "text-primary font-bold" : "text-muted-foreground")}>
              <span>{currentStep === "02_MEMBERS" || currentStep === "03_ACCESS" || currentStep === "04_REVIEW" || currentStep === "SUCCESS" ? "●" : "○"}</span>
              <span>02 MEMBERS</span>
            </div>
            <span className="text-border/80">────</span>
            <div className={cn("flex items-center gap-1.5", currentStep === "03_ACCESS" ? "text-primary font-bold" : "text-muted-foreground")}>
              <span>{currentStep === "03_ACCESS" || currentStep === "04_REVIEW" || currentStep === "SUCCESS" ? "●" : "○"}</span>
              <span>03 ACCESS</span>
            </div>
            <span className="text-border/80">────</span>
            <div className={cn("flex items-center gap-1.5", currentStep === "04_REVIEW" ? "text-primary font-bold" : "text-muted-foreground")}>
              <span>{currentStep === "04_REVIEW" || currentStep === "SUCCESS" ? "●" : "○"}</span>
              <span>04 REVIEW</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STAGE 01: IDENTITY */}
          {currentStep === "01_IDENTITY" && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] tracking-widest text-primary uppercase font-bold">
                  STAGE 01
                </span>
                <h3 className="text-base font-bold text-foreground font-sans tracking-tight mt-0.5">
                  Team Identity & Purpose
                </h3>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Give this operational collaboration lane a clear name and responsibility scope.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-xs font-semibold uppercase">
                  Team Name *
                </Label>
                <Input
                  id="team-name"
                  placeholder="e.g. QR Operations, Support Escalation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs bg-surface font-mono"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-desc" className="text-xs font-semibold uppercase">
                  Operational Description
                </Label>
                <Textarea
                  id="team-desc"
                  placeholder="What operational scope or workflows does this team coordinate?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs bg-surface min-h-[90px] font-mono resize-none"
                />
              </div>
            </div>
          )}

          {/* STAGE 02: MEMBERS */}
          {currentStep === "02_MEMBERS" && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] tracking-widest text-primary uppercase font-bold">
                  STAGE 02
                </span>
                <h3 className="text-base font-bold text-foreground font-sans tracking-tight mt-0.5">
                  Assign Initial Members
                </h3>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Select organization members who belong to this operational lane ({selectedMemberIds.length} selected).
                </p>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-1 rounded-lg border border-border/70 p-2 bg-surface/50">
                {orgMembers.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground italic">No members available.</p>
                ) : (
                  orgMembers.map((m) => {
                    const isSelected = selectedMemberIds.includes(m.id);
                    const initials = m.displayName
                      ? m.displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                      : "MB";

                    return (
                      <label
                        key={m.id}
                        onClick={() => toggleMember(m.id)}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-surface-hover cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleMember(m.id)}
                          />
                          <Avatar className="h-7 w-7 border border-border shrink-0">
                            {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate font-sans">
                              {m.displayName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/5 border border-primary/20 px-1.5 py-0.2 rounded shrink-0 ml-2">
                          {m.roleName}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STAGE 03: ACCESS FOOTPRINT */}
          {currentStep === "03_ACCESS" && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] tracking-widest text-primary uppercase font-bold">
                  STAGE 03
                </span>
                <h3 className="text-base font-bold text-foreground font-sans tracking-tight mt-0.5">
                  Configure Access Footprint
                </h3>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Define the capability reach across operational domains for members of this team.
                </p>
              </div>

              <div className="space-y-2.5">
                {domains.map((ad) => (
                  <div
                    key={ad.domain}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/70 bg-surface/50"
                  >
                    <div>
                      <p className="font-semibold text-xs text-foreground uppercase">{ad.domain}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {CANONICAL_OPERATIONAL_DOMAINS.find((c) => c.domain === ad.domain)?.description}
                      </p>
                    </div>

                    <div className="w-28 shrink-0">
                      <Select
                        value={ad.level}
                        onValueChange={(val) => updateDomainLevel(ad.domain, val as AccessDomainLevel)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-surface font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL">FULL</SelectItem>
                          <SelectItem value="MANAGE">MANAGE</SelectItem>
                          <SelectItem value="VIEW">VIEW</SelectItem>
                          <SelectItem value="NONE">NONE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 04: REVIEW */}
          {currentStep === "04_REVIEW" && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] tracking-widest text-primary uppercase font-bold">
                  STAGE 04
                </span>
                <h3 className="text-base font-bold text-foreground font-sans tracking-tight mt-0.5">
                  Review & Commit Team
                </h3>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Confirm the operational lane parameters before committing to Supabase PostgreSQL.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface/60 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase">TEAM NAME</span>
                  <span className="text-foreground font-bold font-sans text-xs">{name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase">INITIAL MEMBERS</span>
                  <span className="text-foreground font-bold">
                    {selectedMemberIds.length.toString().padStart(2, "0")} IDENTITIES
                  </span>
                </div>

                {/* Signature Topology Representation */}
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase block mb-1.5 font-semibold">
                    RELATIONSHIP TOPOLOGY
                  </span>
                  <div className="p-3 bg-surface rounded-lg border border-border/70 space-y-1.5">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-primary">●</span>
                      <span className="uppercase font-bold">{organizationName}</span>
                      <span className="text-muted-foreground">───────</span>
                      {/* Hollow node before commit */}
                      <span className="text-teal-500 font-bold">○</span>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{name} (PROPOSED)</span>
                    </div>
                    <div className="pl-6 border-l border-border/70 ml-2 space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>├──</span>
                        <span>{selectedMemberIds.length} Members Linked</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>└──</span>
                        <span>
                          {domains.filter((d) => d.level !== "NONE").length} Active Access Domains
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 05: SUCCESS */}
          {currentStep === "SUCCESS" && (
            <div className="space-y-4 text-center py-6 font-mono text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground font-sans">
                  Team Created Successfully
                </h3>
                <p className="text-xs text-muted-foreground font-sans max-w-sm mx-auto">
                  <span className="font-semibold text-foreground">{name}</span> is now active in the workspace collaboration directory.
                </p>
              </div>

              <Button onClick={onClose} className="text-xs h-8 bg-primary text-white font-mono mt-2">
                View in Team Registry
              </Button>
            </div>
          )}
        </div>

        {/* Step Navigation Footer */}
        {currentStep !== "SUCCESS" && (
          <div className="p-4 border-t border-border/80 bg-surface/80 flex items-center justify-between gap-2 font-mono">
            {currentStep === "01_IDENTITY" ? (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
                Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentStep === "02_MEMBERS") setCurrentStep("01_IDENTITY");
                  if (currentStep === "03_ACCESS") setCurrentStep("02_MEMBERS");
                  if (currentStep === "04_REVIEW") setCurrentStep("03_ACCESS");
                }}
                className="text-xs h-8 gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </Button>
            )}

            {currentStep === "01_IDENTITY" && (
              <Button size="sm" onClick={handleNextFromIdentity} className="text-xs h-8 gap-1 bg-primary text-white">
                <span>Continue</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}

            {currentStep === "02_MEMBERS" && (
              <Button size="sm" onClick={() => setCurrentStep("03_ACCESS")} className="text-xs h-8 gap-1 bg-primary text-white">
                <span>Configure Access</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}

            {currentStep === "03_ACCESS" && (
              <Button size="sm" onClick={() => setCurrentStep("04_REVIEW")} className="text-xs h-8 gap-1 bg-primary text-white">
                <span>Review Team</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}

            {currentStep === "04_REVIEW" && (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleCreate}
                className="text-xs h-8 gap-1 bg-primary hover:bg-primary/90 text-white"
              >
                <Check className="h-3 w-3" />
                <span>{isSubmitting ? "Creating Team..." : "Create Team"}</span>
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
