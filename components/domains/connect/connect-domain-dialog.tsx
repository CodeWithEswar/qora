"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDomainDetailV1, DomainDnsRecord } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface ConnectDomainDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onDomainConnected: (domain: CustomDomainDetailV1) => void;
}

type Step = "input" | "dns" | "verifying" | "success";

export function ConnectDomainDialog({
  isOpen,
  onOpenChange,
  orgSlug,
  onDomainConnected,
}: ConnectDomainDialogProps) {
  const [step, setStep] = React.useState<Step>("input");
  const [hostnameInput, setHostnameInput] = React.useState("");
  const [createdDomain, setCreatedDomain] = React.useState<CustomDomainDetailV1 | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Reset state on dialog close
  React.useEffect(() => {
    if (!isOpen) {
      setStep("input");
      setHostnameInput("");
      setCreatedDomain(null);
      setIsLoading(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Step 1: Create domain in backend
  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostnameInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/domains?orgSlug=${encodeURIComponent(orgSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostnameInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to register custom domain");
      }

      const domain: CustomDomainDetailV1 = data.data || data.domain || data;
      if (!domain || !domain.id) {
        throw new Error("Invalid domain record returned by server.");
      }

      setCreatedDomain(domain);
      setStep("dns");
      toast.success("Domain registered. Complete DNS configuration to verify.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating domain";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Trigger real DNS verification check
  const handleVerifyDns = async () => {
    if (!createdDomain) return;

    setIsLoading(true);
    setErrorMessage(null);
    setStep("verifying");

    try {
      const res = await fetch(
        `/api/v1/domains/${createdDomain.id}/verify?orgSlug=${encodeURIComponent(orgSlug)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "DNS verification failed");
      }

      const verifyResult = data.data || data;
      const isVerified =
        verifyResult.status === "VERIFIED" ||
        verifyResult.status === "ACTIVE" ||
        verifyResult.verified === true;

      if (isVerified) {
        setStep("success");
        toast.success("DNS verified! Edge routing activated.");
        if (createdDomain) {
          onDomainConnected({
            ...createdDomain,
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
            routingStatus: "READY",
          });
        }
      } else {
        setStep("dns");
        setErrorMessage(
          verifyResult.reason ||
            verifyResult.message ||
            "DNS records not detected yet. Propagation can take a few minutes. Please check your registrar and retry."
        );
        toast.error("DNS records not found yet");
      }
    } catch (err: unknown) {
      setStep("dns");
      const message = err instanceof Error ? err.message : "Verification request failed";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  // Compute display records with resilient fallback
  const recordsToDisplay: DomainDnsRecord[] = React.useMemo(() => {
    if (!createdDomain) return [];
    const directRecords =
      createdDomain.verificationRecords || (createdDomain as any).verificationRecordsJson;
    if (Array.isArray(directRecords) && directRecords.length > 0) {
      return directRecords;
    }
    return [
      {
        type: "TXT",
        name: `_nxtqr-challenge.${createdDomain.hostname}`,
        value: createdDomain.verificationToken || `nxtqr-domain-verification=${createdDomain.id}`,
        status: "PENDING",
        ttl: 300,
        description: "TXT challenge to verify domain ownership and tenant authorization.",
      },
      {
        type: "CNAME",
        name: createdDomain.hostname,
        value: "cname.nxtqr.app",
        status: "PENDING",
        ttl: 300,
        description: "CNAME alias routing dynamic QR traffic to the NXTQR edge resolver.",
      },
    ];
  }, [createdDomain]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-xl p-0 overflow-hidden bg-surface text-foreground border-border shadow-2xl">
        {/* Visual Step Tracker Header */}
        <div className="bg-surface border-b border-border p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <DialogHeader className="text-left space-y-1 min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Connect Custom Domain
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Link your branded hostname to NXTQR&apos;s global edge resolver.
              </DialogDescription>
            </DialogHeader>

            {/* Stepper indicators */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium shrink-0 mr-7">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                  step === "input"
                    ? "bg-[#FA520F] text-white shadow-xs"
                    : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                )}
              >
                {step === "input" ? "1" : "✓"}
              </span>
              <span className="w-3 h-0.5 bg-border" />
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                  step === "dns" || step === "verifying"
                    ? "bg-[#FA520F] text-white shadow-xs"
                    : step === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted border border-border text-muted-foreground"
                )}
              >
                {step === "success" ? "✓" : "2"}
              </span>
              <span className="w-3 h-0.5 bg-border" />
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                  step === "success"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted border border-border text-muted-foreground"
                )}
              >
                3
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Based on Current Step */}
        <div className="p-5 sm:p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive flex items-start gap-2">
              <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "input" && (
            <form onSubmit={handleCreateDomain} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Domain or Subdomain
                </label>
                <div className="relative">
                  <Icon
                    icon="solar:global-bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    required
                    placeholder="e.g. qr.yourbrand.com or go.domain.com"
                    value={hostnameInput}
                    onChange={(e) => setHostnameInput(e.target.value)}
                    className="pl-9 text-xs font-mono bg-background text-foreground border-border focus-visible:ring-[#FA520F]"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Subdomains like <span className="font-mono text-foreground">qr.yourbrand.com</span> or <span className="font-mono text-foreground">go.company.com</span> are recommended for dedicated QR routing.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs h-9 border-border text-foreground hover:bg-surface"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !hostnameInput.trim()}
                  size="sm"
                  className="bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Icon icon="solar:restart-linear" className="w-3.5 h-3.5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <span>Continue to DNS</span>
                      <Icon icon="solar:arrow-right-linear" className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {(step === "dns" || step === "verifying") && (
            createdDomain ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Configure DNS Records
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Add the following DNS records in your domain registrar (Cloudflare, Route53, GoDaddy, Namecheap):
                  </p>
                </div>

                {/* Records table */}
                <div className="space-y-2.5">
                  {recordsToDisplay.map((record: DomainDnsRecord, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-3.5 rounded-lg border border-border/80 bg-surface/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#FA520F] px-2 py-0.5 rounded bg-[#FA520F]/10 border border-[#FA520F]/20 text-[10px]">
                          {record.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          {record.description || (record as any).purpose || "Verification Record"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">NAME / HOST</span>
                          <div className="flex items-center justify-between gap-1 bg-background border border-border rounded px-2.5 py-1.5 mt-0.5">
                            <span className="truncate text-[11px] text-foreground font-medium">{record.name}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(record.name, "Record Name")}
                              className="text-muted-foreground hover:text-[#FA520F] transition-colors shrink-0 p-0.5"
                              title="Copy Name"
                            >
                              <Icon icon="solar:copy-linear" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-muted-foreground block">TARGET / VALUE</span>
                          <div className="flex items-center justify-between gap-1 bg-background border border-border rounded px-2.5 py-1.5 mt-0.5">
                            <span className="truncate text-[11px] text-foreground font-medium">{record.value}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(record.value, "Record Value")}
                              className="text-muted-foreground hover:text-[#FA520F] transition-colors shrink-0 p-0.5"
                              title="Copy Value"
                            >
                              <Icon icon="solar:copy-linear" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/80">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("input")}
                    className="text-xs h-9 text-muted-foreground hover:text-foreground"
                  >
                    Change Hostname
                  </Button>

                  <Button
                    onClick={handleVerifyDns}
                    disabled={isLoading}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Icon icon="solar:restart-linear" className="w-3.5 h-3.5 animate-spin" />
                        Checking DNS Records...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:shield-check-bold" className="w-4 h-4" />
                        Verify Configuration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-muted-foreground">Domain configuration not found.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStep("input")}
                  className="text-xs h-9"
                >
                  Back to Domain Entry
                </Button>
              </div>
            )
          )}

          {step === "success" && createdDomain && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Icon icon="solar:check-circle-bold" className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Domain Verified & Active!
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  <span className="font-mono text-foreground font-semibold">{createdDomain.hostname}</span> has been verified and registered at the edge. You can now use it as the custom host for your dynamic QR links.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="bg-[#FA520F] hover:bg-[#E0480C] text-white text-xs h-9 px-6 cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
