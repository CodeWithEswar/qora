"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { BulkPipelineStep } from "@/lib/domains/bulk-qr/types";

export type BulkStudioStep =
  | "source"
  | "mapping"
  | "validation"
  | "design"
  | "organize"
  | "review"
  | "runway"
  | "result"
  | BulkPipelineStep;

interface BulkPipelineProps {
  currentStep: BulkPipelineStep | string;
  onStepClick?: (step: BulkPipelineStep) => void;
  onSelectStep?: (step: BulkPipelineStep) => void;
  canNavigateTo?: (step: BulkPipelineStep) => boolean;
  totalRows?: number;
  readyRows?: number;
  blockedRows?: number;
}

const STEPS: Array<{ id: BulkPipelineStep; label: string; number: string; icon: string }> = [
  { id: "SOURCE", label: "Source", number: "01", icon: "solar:upload-track-2-bold" },
  { id: "MAP", label: "Map Fields", number: "02", icon: "solar:tuning-square-2-bold" },
  { id: "VALIDATE", label: "Validate", number: "03", icon: "solar:shield-check-bold" },
  { id: "DESIGN", label: "Design", number: "04", icon: "solar:pallete-2-bold" },
  { id: "ORGANIZE", label: "Organize", number: "05", icon: "solar:folder-with-files-bold" },
  { id: "REVIEW", label: "Review", number: "06", icon: "solar:document-text-bold" },
  { id: "CREATE", label: "Execute", number: "07", icon: "solar:play-circle-bold" },
  { id: "RESULT", label: "Result", number: "08", icon: "solar:check-circle-bold" },
];

export function BulkPipeline({
  currentStep,
  onStepClick,
  onSelectStep,
  canNavigateTo,
  totalRows = 0,
  readyRows = 0,
  blockedRows = 0,
}: BulkPipelineProps) {
  // Normalize currentStep to uppercase
  const normalizedCurrent = (
    currentStep === "source"
      ? "SOURCE"
      : currentStep === "mapping"
      ? "MAP"
      : currentStep === "validation"
      ? "VALIDATE"
      : currentStep === "design"
      ? "DESIGN"
      : currentStep === "organize"
      ? "ORGANIZE"
      : currentStep === "review"
      ? "REVIEW"
      : currentStep === "runway"
      ? "CREATE"
      : currentStep === "result"
      ? "RESULT"
      : currentStep.toUpperCase()
  ) as BulkPipelineStep;

  const currentIndex = STEPS.findIndex((s) => s.id === normalizedCurrent);
  const handleSelect = onStepClick || onSelectStep;

  return (
    <div className="relative w-full bg-surface/80 border border-border/80 rounded-2xl p-2.5 sm:p-3.5 shadow-lg backdrop-blur-xl overflow-hidden">
      {/* Subtle radiant top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between overflow-x-auto scrollbar-none gap-2 sm:gap-3 py-1">
        {STEPS.map((step, idx) => {
          const isCurrent = step.id === normalizedCurrent;
          const isPassed = idx < currentIndex;
          const isInteractive = canNavigateTo ? canNavigateTo(step.id) : isPassed;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!isInteractive}
                onClick={() => isInteractive && handleSelect?.(step.id)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap group shrink-0",
                  isCurrent && "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_12px_rgba(250,82,15,0.15)] font-semibold",
                  isPassed && "text-foreground hover:bg-muted/60 cursor-pointer",
                  !isCurrent && !isPassed && "text-muted-foreground/50 cursor-not-allowed opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono transition-colors",
                    isCurrent && "bg-primary text-white font-bold shadow-xs",
                    isPassed && "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
                    !isCurrent && !isPassed && "bg-muted text-muted-foreground"
                  )}
                >
                  {isPassed ? (
                    <Icon icon="solar:check-read-bold" className="w-3 h-3" />
                  ) : (
                    step.number
                  )}
                </div>

                <span>{step.label}</span>

                {step.id === "VALIDATE" && totalRows > 0 && (
                  <span className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-muted text-muted-foreground">
                    {readyRows}/{totalRows}
                  </span>
                )}
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-3 sm:w-6 shrink-0 transition-colors",
                    idx < currentIndex ? "bg-emerald-500/40" : "bg-border/60"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
