"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function AnalyticsErrorState({
  message = "Analytics could not be loaded from Supabase.",
  onRetry,
}: AnalyticsErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h3 className="font-serif text-xl font-normal text-foreground tracking-tight">
        Analytics could not be loaded
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-2 mb-6 leading-relaxed">
        {message} Please verify your connection or organization membership permissions.
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs border-border bg-card hover:bg-muted text-foreground gap-2 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </Button>
      )}
    </div>
  );
}
