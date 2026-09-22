"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TeamMemberItem } from "@/lib/supabase/types/teams";
import { UserMinus } from "lucide-react";

interface RemoveTeamMemberAlertProps {
  isOpen: boolean;
  member: TeamMemberItem | null;
  teamName: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (member: TeamMemberItem) => Promise<void>;
}

export function RemoveTeamMemberAlert({
  isOpen,
  member,
  teamName,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RemoveTeamMemberAlertProps) {
  if (!member) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="font-mono text-xs max-w-md bg-background border border-border/80">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-[10px]">
            <UserMinus className="h-4 w-4" />
            <span>REMOVE FROM TEAM MEMBERSHIP</span>
          </div>
          <AlertDialogTitle className="text-base font-bold font-sans text-foreground pt-1">
            Remove {member.displayName} from {teamName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground font-sans leading-relaxed pt-1">
            <strong className="text-foreground">{member.displayName}</strong> will no longer belong
            to <strong className="text-foreground">{teamName}</strong>. Their NXTQR workspace
            membership, administrative roles, and underlying resource access remain active.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Change Ripple Visual */}
        <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1.5 text-[11px]">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            RELATIONSHIP IMPACT:
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Team Membership:</span>
            <span className="text-rose-500 font-bold">REMOVED</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Workspace Membership:</span>
            <span className="text-emerald-500 font-bold">PRESERVED (ACTIVE)</span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel disabled={isSubmitting} className="h-8 text-xs cursor-pointer font-sans">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm(member);
            }}
            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer font-sans"
          >
            {isSubmitting ? "Removing..." : "Remove from team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
