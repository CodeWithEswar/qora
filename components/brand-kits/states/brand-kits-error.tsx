"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandKitsErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function BrandKitsError({
  message = "We couldn't retrieve this workspace's Brand Kits.",
  onRetry,
}: BrandKitsErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-lg mx-auto my-12 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h2 className="text-lg font-bold text-foreground tracking-tight">
        BRAND KITS COULD NOT BE LOADED
      </h2>

      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-xs">
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-5 gap-1.5 text-xs cursor-pointer border-border hover:bg-surface-elevated"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}
