"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface FilesErrorProps {
  error?: string | null;
  onRetry: () => void;
}

export function FilesError({ error, onRetry }: FilesErrorProps) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center select-none">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-3 shadow-xs">
        <NxtqrIcon icon="solar:danger-triangle-linear" size={24} />
      </div>

      <h4 className="text-base font-semibold text-foreground">Files couldn&apos;t be loaded</h4>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
        {error || "An error occurred while communicating with Supabase database or storage. Please check your connection and retry."}
      </p>

      <Button
        variant="default"
        size="sm"
        onClick={onRetry}
        className="gap-1.5 text-xs font-medium bg-[#FA520F] hover:bg-[#FA520F]/90 text-white"
      >
        <NxtqrIcon icon="solar:restart-linear" size={14} />
        <span>Retry</span>
      </Button>
    </div>
  );
}
