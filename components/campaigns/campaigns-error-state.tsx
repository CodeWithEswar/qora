"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CampaignsErrorStateProps {
  onRetry?: () => void;
  message?: string;
  className?: string;
}

export function CampaignsErrorState({
  onRetry,
  message = "We couldn't retrieve campaigns for this workspace.",
  className,
}: CampaignsErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.03]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <Icon icon="hugeicons:alert-circle" className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">
        Couldn&apos;t load campaigns
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs gap-1.5 border-border bg-surface hover:bg-muted font-medium"
        >
          <Icon icon="hugeicons:reload" className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
}
