"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface TemplateErrorStateProps {
  error?: string;
  onRetry: () => void;
}

export function TemplateErrorState({
  error = "Your template library is temporarily unavailable.",
  onRetry,
}: TemplateErrorStateProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 sm:p-12 text-center max-w-md mx-auto my-8 space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon icon="tabler:alert-triangle" className="h-6 w-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-lg font-medium text-foreground">
          Templates Could Not Be Loaded
        </h3>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={onRetry}
        className="gap-1.5 text-xs font-mono"
      >
        <Icon icon="tabler:rotate-clockwise" className="h-3.5 w-3.5" />
        Retry Loading Library
      </Button>
    </div>
  );
}
