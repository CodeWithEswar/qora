"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface GuardianErrorProps {
  onRetry: () => void;
  message?: string;
}

export function GuardianError({ onRetry, message }: GuardianErrorProps) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 text-foreground p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
        <Icon icon="solar:danger-triangle-bold" className="w-5 h-5" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wide">
          GUARDIAN COULD NOT BE LOADED
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message || "Destination health telemetry is temporarily unavailable. Please retry the request."}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="text-xs h-9 px-4 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
      >
        <Icon icon="solar:refresh-linear" className="w-3.5 h-3.5 mr-1.5" />
        <span>Retry</span>
      </Button>
    </div>
  );
}
