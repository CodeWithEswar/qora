"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface GuardianSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuardianSettingsSheet({
  open,
  onOpenChange,
}: GuardianSettingsSheetProps) {
  const [notifyOnDegradation, setNotifyOnDegradation] = React.useState(true);
  const [notifyOnRecovery, setNotifyOnRecovery] = React.useState(true);
  const [autoFallbackDefault, setAutoFallbackDefault] = React.useState(true);

  const handleSave = () => {
    toast.success("Guardian organization settings updated");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-surface text-foreground border-border p-6 overflow-y-auto space-y-6">
        <SheetHeader className="space-y-1 text-left border-b border-border pb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20 w-fit">
            GUARDIAN CONFIGURATION
          </div>
          <SheetTitle className="text-xl font-bold font-serif">
            Guardian Settings
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Configure global link reliability policies and automatic failover defaults for this workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 text-xs">
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
              Alert Notifications
            </h4>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground">Alert on Link Degradation</Label>
                <div className="text-[11px] text-muted-foreground">
                  Dispatch email notifications when failure threshold is reached
                </div>
              </div>
              <Switch checked={notifyOnDegradation} onCheckedChange={setNotifyOnDegradation} />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground">Alert on Recovery</Label>
                <div className="text-[11px] text-muted-foreground">
                  Notify workspace members when destination health returns to normal
                </div>
              </div>
              <Switch checked={notifyOnRecovery} onCheckedChange={setNotifyOnRecovery} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
              Default Failover Behavior
            </h4>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-foreground">Default Auto-Switch</Label>
                <div className="text-[11px] text-muted-foreground">
                  Automatically enable auto-switch on newly created destination monitors
                </div>
              </div>
              <Switch checked={autoFallbackDefault} onCheckedChange={setAutoFallbackDefault} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
              Telemetry Retention
            </h4>
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 font-mono text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Observation Window:</span>
                <span className="text-foreground">Latest 200 checks / 30 days</span>
              </div>
              <div className="flex justify-between">
                <span>Incident Records:</span>
                <span className="text-foreground">Permanent audit log</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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
            onClick={handleSave}
            className="text-xs h-9 px-4 bg-[#FA520F] hover:bg-[#E0480C] text-white cursor-pointer"
          >
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
