import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanabilityErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ScanabilityError({ message, onRetry }: ScanabilityErrorProps) {
  return (
    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-2 select-none">
      <div className="inline-flex items-center justify-center p-2 rounded-lg bg-surface border border-destructive/20 text-destructive">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground">Scanability Analysis Unavailable</p>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
          {message || "We couldn't analyze the current configuration. Please check your payload and design settings."}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-7 text-xs gap-1.5 cursor-pointer mt-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Retry Analysis</span>
        </Button>
      )}
    </div>
  );
}
