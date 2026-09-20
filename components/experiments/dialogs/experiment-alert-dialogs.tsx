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
import { ExperimentStatus } from "../types";

interface ExperimentAlertDialogsProps {
  actionType: "PAUSE" | "RESUME" | "COMPLETE" | "DELETE" | null;
  experimentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (expId: string, action: "PAUSE" | "RESUME" | "COMPLETE" | "DELETE") => void;
}

export function ExperimentAlertDialogs({
  actionType,
  experimentId,
  isOpen,
  onClose,
  onConfirm,
}: ExperimentAlertDialogsProps) {
  if (!actionType || !experimentId) return null;

  const getTitle = () => {
    switch (actionType) {
      case "PAUSE":
        return "Pause A/B Routing Experiment?";
      case "RESUME":
        return "Resume A/B Routing Experiment?";
      case "COMPLETE":
        return "Declare Winner & Complete Experiment?";
      case "DELETE":
        return "Archive Routing Experiment?";
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case "PAUSE":
        return "New incoming scans will temporarily route strictly to Variant A (Control) until resumed.";
      case "RESUME":
        return "Edge workers will resume dividing scan traffic according to the configured percentage weights.";
      case "COMPLETE":
        return "The experiment will end. The winning variant's destination can become the permanent default URL.";
      case "DELETE":
        return "This will archive the experiment record from the active telemetry view. Existing scan counts are preserved.";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#111114] border border-white/10 text-white rounded-2xl p-5 sm:p-6 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-white">
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-400 leading-relaxed">
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex items-center gap-2">
          <AlertDialogCancel
            onClick={onClose}
            className="h-8 text-xs bg-transparent border-white/10 text-zinc-400 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm(experimentId, actionType);
              onClose();
            }}
            className={`h-8 text-xs font-medium ${
              actionType === "DELETE"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : actionType === "PAUSE"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
