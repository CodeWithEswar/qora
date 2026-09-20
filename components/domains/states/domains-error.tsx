"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface DomainsErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function DomainsErrorState({
  message,
  onRetry,
}: DomainsErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 rounded-2xl bg-destructive/5 my-8">
      <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 mb-4">
        <Icon icon="solar:danger-triangle-bold" className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        DOMAINS COULD NOT BE LOADED
      </h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-md">
        {message || "We couldn't retrieve this workspace's domain configuration. Check your network or reload."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={onRetry}
          className="h-8 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white cursor-pointer"
        >
          <Icon icon="solar:restart-square-linear" className="w-4 h-4" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
}
