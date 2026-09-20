"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onExportCreated?: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  orgSlug,
  onExportCreated,
}: ExportDialogProps) {
  const [format, setFormat] = React.useState<"csv" | "json">("csv");
  const [range, setRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleGenerate = async () => {
    setIsSubmitting(true);
    toast.info("Report generation started...");

    try {
      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      const rangeTo = new Date().toISOString();
      const rangeFrom = new Date(Date.now() - days * 86400000).toISOString();

      const res = await fetch(`/api/v1/organizations/${orgSlug}/analytics/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `NXTQR Telemetry Export (${range.toUpperCase()})`,
          format,
          rangeFrom,
          rangeTo,
        }),
      });

      if (!res.ok) throw new Error("Failed to create export job");

      toast.success("Analytics export ready!");
      onExportCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Export generation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              DATA EXPORT
            </span>
          </div>
          <DialogTitle className="font-serif text-xl font-normal text-foreground">
            Export Analytics & Telemetry
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure and export real scan telemetry records bounded by your retention tier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Range Selection */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] text-muted-foreground uppercase font-semibold">
              Time Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`p-2 rounded-lg border text-center font-mono font-medium transition-colors ${
                    range === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Last {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] text-muted-foreground uppercase font-semibold">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["csv", "json"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`p-2 rounded-lg border text-center font-mono font-medium transition-colors ${
                    format === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {f.toUpperCase()} Archive
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30 text-[11px] text-muted-foreground">
            Export includes coarse geography, device taxonomy, routing destinations, and UTC timestamps.
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="text-xs bg-primary hover:bg-[#cc3a05] text-white gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isSubmitting ? "Generating..." : "Generate Export"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
