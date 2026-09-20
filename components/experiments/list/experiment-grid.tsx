"use client";

import * as React from "react";
import { FlaskConical, Plus, Sparkles, Split } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperimentItem, ExperimentStatus } from "../types";
import { ExperimentSignalNode } from "./experiment-signal-node";

interface ExperimentGridProps {
  experiments: ExperimentItem[];
  onInspect: (exp: ExperimentItem) => void;
  onSimulate: (exp: ExperimentItem) => void;
  onStatusChange: (expId: string, status: ExperimentStatus) => void;
  onDelete: (expId: string) => void;
  onOpenCreate: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  orgSlug?: string;
}

export function ExperimentGrid({
  experiments,
  onInspect,
  onSimulate,
  onStatusChange,
  onDelete,
  onOpenCreate,
  onClearFilters,
  isFiltered = false,
  orgSlug = "",
}: ExperimentGridProps) {
  if (experiments.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card border border-border rounded-2xl border-dashed shadow-xs">
          <h3 className="text-base font-semibold text-foreground mb-1 tracking-tight">
            NO EXPERIMENTS MATCH THESE FILTERS
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mb-4 leading-relaxed">
            Try adjusting your search query, status filters, or selected QR asset.
          </p>
          {onClearFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs bg-background border-border text-foreground hover:bg-muted"
            >
              Clear filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card border border-border rounded-2xl border-dashed shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-lg mb-4 shadow-[0_0_20px_rgba(250,82,15,0.15)]">
          E
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1 tracking-tight">
          NO EXPERIMENTS YET
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
          Compare destinations using controlled Dynamic QR traffic.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={onOpenCreate}
            className="bg-primary hover:bg-[#cc3a05] text-white font-medium text-xs h-9 px-4 rounded-lg shadow-xs gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Experiment
          </Button>
          {orgSlug && (
            <Button
              variant="outline"
              asChild
              className="h-9 px-4 text-xs bg-background border-border text-foreground hover:bg-muted"
            >
              <a href={`/${orgSlug}/routes`}>View Dynamic QR Codes</a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {experiments.map((exp) => (
        <ExperimentSignalNode
          key={exp.id}
          experiment={exp}
          onInspect={onInspect}
          onSimulate={onSimulate}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
