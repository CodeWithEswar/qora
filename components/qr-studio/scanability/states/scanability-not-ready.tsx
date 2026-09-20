import * as React from "react";
import { Edit3 } from "lucide-react";

export function ScanabilityNotReady() {
  return (
    <div className="p-4 rounded-xl border border-dashed border-border bg-surface-elevated/40 text-center space-y-2 select-none">
      <div className="inline-flex items-center justify-center p-2 rounded-lg bg-surface border border-border text-muted-foreground">
        <Edit3 className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Waiting for Content
        </p>
        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
          Enter a destination URL or payload in the Content panel to run structural signal integrity analysis.
        </p>
      </div>
    </div>
  );
}
