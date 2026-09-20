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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreateGuardianMonitorRequestV1 } from "@nxtqr/contracts";

interface AddMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onMonitorCreated: () => void;
}

export function AddMonitorDialog({
  open,
  onOpenChange,
  orgSlug,
  onMonitorCreated,
}: AddMonitorDialogProps) {
  const [step, setStep] = React.useState<"destination" | "policy" | "recovery" | "review">("destination");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [destinationUrl, setDestinationUrl] = React.useState("");
  const [name, setName] = React.useState("");
  const [checkIntervalSec, setCheckIntervalSec] = React.useState(300);
  const [timeoutMs, setTimeoutMs] = React.useState(5000);
  const [failureThreshold, setFailureThreshold] = React.useState(3);
  const [recoveryThreshold, setRecoveryThreshold] = React.useState(2);
  const [fallbackUrl, setFallbackUrl] = React.useState("");
  const [autoSwitch, setAutoSwitch] = React.useState(true);

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setStep("destination");
      setDestinationUrl("");
      setName("");
      setFallbackUrl("");
      setIsSubmitting(false);
    }
  }, [open]);

  // Validation
  const validateDestination = () => {
    if (!destinationUrl.trim()) {
      toast.error("Please enter a valid destination URL");
      return false;
    }
    try {
      const parsed = new URL(destinationUrl.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        toast.error("Destination must start with http:// or https://");
        return false;
      }
      if (parsed.hostname === "localhost" || parsed.hostname.startsWith("127.")) {
        toast.error("Localhost and loopback destinations are restricted");
        return false;
      }
    } catch {
      toast.error("Invalid URL format");
      return false;
    }

    if (!name.trim()) {
      setName(new URL(destinationUrl.trim()).hostname);
    }
    return true;
  };

  const handleNext = () => {
    if (step === "destination") {
      if (!validateDestination()) return;
      setStep("policy");
    } else if (step === "policy") {
      setStep("recovery");
    } else if (step === "recovery") {
      if (fallbackUrl.trim()) {
        try {
          const p = new URL(destinationUrl.trim());
          const f = new URL(fallbackUrl.trim());
          if (p.href.toLowerCase() === f.href.toLowerCase()) {
            toast.error("Fallback URL cannot be identical to the primary destination");
            return;
          }
        } catch {
          toast.error("Invalid fallback URL format");
          return;
        }
      }
      setStep("review");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload: CreateGuardianMonitorRequestV1 = {
        destinationUrl: destinationUrl.trim(),
        name: name.trim() || new URL(destinationUrl.trim()).hostname,
        checkIntervalSec,
        timeoutMs,
        failureThreshold,
        recoveryThreshold,
        fallbackUrl: fallbackUrl.trim() || undefined,
        autoSwitch,
      };

      const res = await fetch("/api/v1/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to create monitor");
      }

      toast.success("Destination monitor created successfully");
      onMonitorCreated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Could not create monitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-surface text-foreground border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20">
              NEW MONITOR
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Step {step === "destination" ? "1" : step === "policy" ? "2" : step === "recovery" ? "3" : "4"} of 4
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight font-serif">
            {step === "destination" && "Target Destination"}
            {step === "policy" && "Reliability Policy"}
            {step === "recovery" && "Automatic Fallback"}
            {step === "review" && "Review & Activate"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === "destination" && "Enter the primary destination endpoint to monitor for uptime and latency."}
            {step === "policy" && "Configure background check frequency and failure thresholds."}
            {step === "recovery" && "Configure a safe fallback URL for automated scan redirection."}
            {step === "review" && "Verify your reliability settings before activating background monitoring."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Destination */}
        {step === "destination" && (
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono">Destination URL</Label>
              <Input
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://example.com/pricing"
                className="text-xs font-mono bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                SSRF-protected. Public HTTP and HTTPS endpoints only.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono">Monitor Label</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pricing Page Monitor"
                className="text-xs bg-background"
              />
            </div>
          </div>
        )}

        {/* Step 2: Policy */}
        {step === "policy" && (
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono">Check Frequency</Label>
              <Select
                value={checkIntervalSec.toString()}
                onValueChange={(v) => setCheckIntervalSec(parseInt(v, 10))}
              >
                <SelectTrigger className="text-xs font-mono bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">Every 1 Minute (High Precision)</SelectItem>
                  <SelectItem value="300">Every 5 Minutes (Standard)</SelectItem>
                  <SelectItem value="900">Every 15 Minutes</SelectItem>
                  <SelectItem value="3600">Every 1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Failure Threshold</Label>
                <Select
                  value={failureThreshold.toString()}
                  onValueChange={(v) => setFailureThreshold(parseInt(v, 10))}
                >
                  <SelectTrigger className="text-xs font-mono bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Failure</SelectItem>
                    <SelectItem value="2">2 Failures</SelectItem>
                    <SelectItem value="3">3 Failures (Recommended)</SelectItem>
                    <SelectItem value="5">5 Failures</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Probe Timeout</Label>
                <Select
                  value={timeoutMs.toString()}
                  onValueChange={(v) => setTimeoutMs(parseInt(v, 10))}
                >
                  <SelectTrigger className="text-xs font-mono bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000">2,000ms (Strict)</SelectItem>
                    <SelectItem value="5000">5,000ms (Standard)</SelectItem>
                    <SelectItem value="10000">10,000ms (Relaxed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Recovery */}
        {step === "recovery" && (
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono">Safe Fallback Destination (Optional)</Label>
              <Input
                value={fallbackUrl}
                onChange={(e) => setFallbackUrl(e.target.value)}
                placeholder="https://status.example.com"
                className="text-xs font-mono bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                When Guardian declares the primary destination unavailable, QR Brain automatically reroutes subsequent scans here.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-foreground">Auto-Switch Traffic</div>
                <div className="text-[11px] text-muted-foreground">
                  Instantly update published edge signal upon incident open
                </div>
              </div>
              <Switch checked={autoSwitch} onCheckedChange={setAutoSwitch} />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div className="space-y-3 py-3 font-mono text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="text-foreground font-semibold truncate max-w-[240px]">
                  {destinationUrl}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Label:</span>
                <span className="text-foreground">{name || "Default"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="text-foreground">Every {Math.round(checkIntervalSec / 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Threshold:</span>
                <span className="text-foreground">{failureThreshold} fails before incident</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fallback:</span>
                <span className="text-foreground truncate max-w-[240px]">
                  {fallbackUrl || "None (Alert only)"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {step !== "destination" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (step === "policy") setStep("destination");
                else if (step === "recovery") setStep("policy");
                else if (step === "review") setStep("recovery");
              }}
              className="text-xs h-9 cursor-pointer"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step !== "review" ? (
            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs h-9 px-4 bg-[#FA520F] hover:bg-[#E0480C] text-white cursor-pointer"
            >
              Next Step
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-xs h-9 px-4 bg-[#FA520F] hover:bg-[#E0480C] text-white cursor-pointer"
            >
              {isSubmitting ? "Activating..." : "Activate Monitor"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
