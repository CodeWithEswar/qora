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
import type { TeamResourceAssignment } from "@/lib/supabase/types/teams";
import { Unlink } from "lucide-react";

interface DisconnectWorkAlertProps {
  isOpen: boolean;
  assignment: TeamResourceAssignment | null;
  teamName: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (assignment: TeamResourceAssignment) => Promise<void>;
}

export function DisconnectWorkAlert({
  isOpen,
  assignment,
  teamName,
  isSubmitting = false,
  onClose,
  onConfirm,
}: DisconnectWorkAlertProps) {
  if (!assignment) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="font-mono text-xs max-w-md bg-background border border-border/80">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-[10px]">
            <Unlink className="h-4 w-4" />
            <span>DISCONNECT RESOURCE ASSIGNMENT</span>
          </div>
          <AlertDialogTitle className="text-base font-bold font-sans text-foreground pt-1">
            Disconnect {assignment.title}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground font-sans leading-relaxed pt-1">
            This will remove the operational relationship between <strong className="text-foreground">{teamName}</strong> and{" "}
            <strong className="text-foreground">{assignment.title}</strong> ({assignment.ref}).
            The underlying QR code, campaign, or asset is preserved and remains fully functional in the workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Change Ripple Visual */}
        <div className="p-3 rounded-lg bg-surface border border-border/60 space-y-1.5 text-[11px]">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            RELATIONSHIP IMPACT:
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Team Work Assignment:</span>
            <span className="text-rose-500 font-bold">DISCONNECTED</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Underlying Asset & History:</span>
            <span className="text-emerald-500 font-bold">PRESERVED (INTACT)</span>
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
              await onConfirm(assignment);
            }}
            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer font-sans"
          >
            {isSubmitting ? "Disconnecting..." : "Disconnect resource"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
