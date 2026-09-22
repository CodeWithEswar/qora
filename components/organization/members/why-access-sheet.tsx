"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "../shared/role-badge";
import { ShieldCheck, ArrowRight, Layers, Lock, User, ExternalLink, HelpCircle } from "lucide-react";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";

export interface AccessExplanationTarget {
  type: "member" | "role" | "capability" | "team" | "organization";
  title: string;
  code?: string;
  member?: AdminMemberSummary | null;
  roleName?: string;
  capabilityName?: string;
  teamName?: string;
  teamId?: string;
  scope?: string;
  description?: string;
}

interface WhyAccessSheetProps {
  target: AccessExplanationTarget | null;
  organizationSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenMemberInDirectory?: (member: AdminMemberSummary) => void;
}

export function WhyAccessSheet({
  target,
  organizationSlug,
  isOpen,
  onClose,
  onOpenMemberInDirectory,
}: WhyAccessSheetProps) {
  if (!target) return null;

  const member = target.member;
  const roleName = target.roleName || member?.roleName || "Owner";
  const capability = target.capabilityName || target.code || target.title;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col p-0 gap-0 font-sans">
        <SheetHeader className="p-6 border-b border-border/80 bg-surface/50">
          <div className="flex items-center gap-2 text-primary font-mono text-[11px] uppercase tracking-wider font-bold">
            <HelpCircle className="h-4 w-4" />
            <span>AUTHORIZATION PROVENANCE</span>
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground font-sans">
            Why Access?
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Authoritative trace explaining where permissions, boundaries, and collaboration scopes originate.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Subject Capsule */}
          {member && (
            <div className="p-4 rounded-xl bg-surface border border-border/70 space-y-3">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                SUBJECT IDENTITY
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-9 h-9 border border-border shrink-0">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.displayName} />}
                    <AvatarFallback className="text-xs font-bold font-mono">
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {member.displayName}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono block truncate">
                      {member.email}
                    </span>
                  </div>
                </div>

                <RoleBadge role={member.roleCode || member.roleName} />
              </div>
            </div>
          )}

          {/* Authorization Origin Trace */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
              ACCESS RESOLUTION PATH
            </span>

            <div className="relative pl-6 space-y-4 border-l-2 border-border/80 ml-2 font-mono text-xs">
              {/* Step 1: Organization Membership */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">1. Workspace Ingress</div>
                  <div className="text-xs font-semibold text-foreground font-sans">
                    Authenticated Member of Organization
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                    Tenant boundary strictly enforced. Member cannot access cross-organization data.
                  </p>
                </div>
              </div>

              {/* Step 2: Role Grant */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-amber-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">2. Authority Grant</div>
                  <div className="text-xs font-semibold text-foreground font-sans">
                    {roleName} Role
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                    Primary capability source. Authorizes operational actions across the workspace.
                  </p>
                </div>
              </div>

              {/* Step 3: Team Contribution */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-indigo-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">3. Team Boundary Scope</div>
                  <div className="text-xs font-semibold text-foreground font-sans">
                    {target.teamName ? `${target.teamName} Team` : "Operational Collaboration Scope"}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                    {target.teamName
                      ? `Team membership establishes collaborative responsibility over connected resources. Teams do not invent elevated roles.`
                      : `Teams organize responsibility; RBAC roles grant execution authority.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Target Details Card */}
          <div className="p-4 rounded-xl bg-surface border border-border/70 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
              <span>TARGET OBJECT</span>
              <span className="text-primary">{target.type}</span>
            </div>

            <div className="space-y-1 font-sans">
              <div className="text-sm font-bold text-foreground">{target.title}</div>
              {target.description && (
                <p className="text-xs text-muted-foreground">{target.description}</p>
              )}
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Enforcement:</span>
              <span className="text-emerald-500 font-bold">STRICT RBAC + RLS</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/80 bg-surface/60 flex items-center justify-between gap-3">
          {member && onOpenMemberInDirectory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenMemberInDirectory(member);
                onClose();
              }}
              className="text-xs font-sans cursor-pointer"
            >
              Open in Directory
            </Button>
          )}

          {target.teamId && (
            <Button
              size="sm"
              asChild
              className="text-xs font-sans cursor-pointer gap-1.5 ml-auto"
            >
              <Link href={`/${organizationSlug}/teams/${target.teamId}`}>
                <span>Open Team Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
