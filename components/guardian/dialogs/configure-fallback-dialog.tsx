"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { GuardianMonitorSummaryV1, ConfigureFallbackRequestV1 } from "@nxtqr/contracts";

interface ConfigureFallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitor: GuardianMonitorSummaryV1 | null;
  onFallbackUpdated: () => void;
}

export function ConfigureFallbackDialog({
  open,
  onOpenChange,
  monitor,
  onFallbackUpdated,
}: ConfigureFallbackDialogProps) {
  const [backupUrl, setBackupUrl] = React.useState("");
  const [autoSwitch, setAutoSwitch] = React.useState(true);
  const [failureThreshold, setFailureThreshold] = React.useState(3);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (monitor) {
      setBackupUrl(monitor.fallbackConfig?.backupUrl || "");
      setAutoSwitch(monitor.fallbackConfig?.autoSwitch ?? true);
      setFailureThreshold(monitor.failureThreshold || 3);
    }
  }, [monitor]);

  if (!monitor) return null;

  const handleSubmit = async () => {
    if (!backupUrl.trim()) {
      toast.error("Please enter a valid fallback URL");
      return;
    }

    try {
      const p = new URL(monitor.destinationUrl.trim());
      const f = new URL(backupUrl.trim());
      if (p.href.toLowerCase() === f.href.toLowerCase()) {
        toast.error("Fallback URL cannot be identical to the primary destination");
        return;
      }
    } catch {
      toast.error("Invalid fallback URL format");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: ConfigureFallbackRequestV1 = {
        backupUrl: backupUrl.trim(),
        autoSwitch,
        failureThreshold,
        notifyEmails: [],
      };

      const res = await fetch(`/api/v1/guardian/${monitor.id}/fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Failed to configure fallback");
      }

      toast.success("Fallback policy updated successfully");
      onFallbackUpdated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update fallback policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6 bg-surface text-foreground border-border">
        <DialogHeader className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20 w-fit">
            RECOVERY POLICY
          </div>
          <DialogTitle className="text-lg font-bold font-serif">
            Configure Automated Fallback
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure the safe target destination applied by QR Brain when this endpoint experiences an outage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Visual Primary vs Fallback preview */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 font-mono">
            <div className="space-y-0.5">
              <div className="text-[10px] text-muted-foreground uppercase">Primary Target</div>
              <div className="text-xs font-semibold text-foreground truncate">
                {monitor.destinationUrl}
              </div>
            </div>

            <div className="flex items-center justify-center py-0.5">
              <Icon icon="solar:arrow-down-linear" className="w-4 h-4 text-[#FA520F]" />
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-muted-foreground uppercase">Fallback Target</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                {backupUrl.trim() || "Enter backup destination below..."}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono">Safe Backup URL</Label>
            <Input
              value={backupUrl}
              onChange={(e) => setBackupUrl(e.target.value)}
              placeholder="https://status.example.com or backup store"
              className="text-xs font-mono bg-background"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">Auto-Switch Traffic</div>
              <div className="text-[11px] text-muted-foreground">
                Instantly reroute scans when failure threshold is reached
              </div>
            </div>
            <Switch checked={autoSwitch} onCheckedChange={setAutoSwitch} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-xs h-9 px-4 bg-[#FA520F] hover:bg-[#E0480C] text-white cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Fallback Policy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
