"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CustomDomainSummaryV1,
  CustomDomainDetailV1,
  DomainDnsRecord,
  DomainImpactV1,
} from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface DomainInspectorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  domainSummary: CustomDomainSummaryV1 | null;
  orgSlug: string;
  onDomainUpdated: (updated: CustomDomainSummaryV1) => void;
  onSetPrimary: (domain: CustomDomainSummaryV1) => void;
  onArchiveDomain: (domain: CustomDomainSummaryV1) => void;
  onDisconnectDomain: (domain: CustomDomainSummaryV1) => void;
}

export function DomainInspectorSheet({
  isOpen,
  onOpenChange,
  domainSummary,
  orgSlug,
  onDomainUpdated,
  onSetPrimary,
  onArchiveDomain,
  onDisconnectDomain,
}: DomainInspectorSheetProps) {
  const [detail, setDetail] = React.useState<CustomDomainDetailV1 | null>(null);
  const [impact, setImpact] = React.useState<DomainImpactV1 | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Fetch full details & impact whenever domainSummary changes
  React.useEffect(() => {
    if (!isOpen || !domainSummary) {
      setDetail(null);
      setImpact(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);

    // Fetch detail & impact concurrently
    Promise.all([
      fetch(`/api/v1/domains/${domainSummary.id}?orgSlug=${encodeURIComponent(orgSlug)}`).then(
        (r) => (r.ok ? r.json() : null)
      ),
      fetch(`/api/v1/domains/${domainSummary.id}/impact?orgSlug=${encodeURIComponent(orgSlug)}`).then(
        (r) => (r.ok ? r.json() : null)
      ),
    ])
      .then(([detailData, impactData]) => {
        if (!isMounted) return;
        if (detailData?.domain) {
          setDetail(detailData.domain);
        }
        if (impactData?.impact) {
          setImpact(impactData.impact);
        }
      })
      .catch((err) => {
        console.error("Failed to load domain details:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, domainSummary, orgSlug]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleVerifyNow = async () => {
    if (!domainSummary) return;
    setIsVerifying(true);

    try {
      const res = await fetch(
        `/api/v1/domains/${domainSummary.id}/verify?orgSlug=${encodeURIComponent(orgSlug)}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Verification failed");
      }

      if (data.status === "VERIFIED" || data.status === "ACTIVE") {
        toast.success("DNS configuration verified successfully!");
        const updated = {
          ...domainSummary,
          status: "ACTIVE" as const,
          verificationStatus: "VERIFIED" as const,
          routingStatus: "READY" as const,
        };
        onDomainUpdated(updated);
        if (detail) {
          setDetail({
            ...detail,
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
            routingStatus: "READY",
          });
        }
      } else {
        toast.error(data.reason || "DNS records not detected yet");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!domainSummary) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] p-0 flex flex-col bg-surface border-border overflow-hidden"
      >
        {/* Header with identity & quick tags */}
        <div className="p-6 border-b border-border bg-surface/70 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                CUSTOM DOMAIN INFRASTRUCTURE
              </span>
              <SheetTitle className="text-xl font-bold text-foreground font-mono truncate max-w-[320px] sm:max-w-[420px]">
                {domainSummary.hostname}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Edge routing control center and DNS telemetry for this host.
              </SheetDescription>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0.5 text-xs font-mono font-medium",
                  domainSummary.status === "ACTIVE"
                    ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                    : domainSummary.status === "PENDING"
                    ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                    : "border-destructive/30 text-destructive bg-destructive/10"
                )}
              >
                {domainSummary.status}
              </Badge>

              {domainSummary.isPrimary && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] bg-[#FA520F]/15 text-[#FA520F] border-[#FA520F]/30 font-medium"
                >
                  PRIMARY
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Tabs View */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="space-y-5">
            <TabsList className="grid grid-cols-4 bg-surface/50 p-1 border border-border/80">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="dns" className="text-xs">DNS</TabsTrigger>
              <TabsTrigger value="routing" className="text-xs">Routing</TabsTrigger>
              <TabsTrigger value="impact" className="text-xs">Impact</TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-5 focus-visible:outline-none">
              {/* Domain Journey Timeline */}
              <div className="p-4 rounded-xl border border-border/70 bg-surface/30 space-y-3">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                  Domain Infrastructure Journey
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                      <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground">Added</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        domainSummary.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-amber-500/20 text-amber-500 animate-pulse"
                      )}
                    >
                      <Icon
                        icon={
                          domainSummary.verificationStatus === "VERIFIED"
                            ? "solar:check-circle-bold"
                            : "solar:clock-circle-bold"
                        }
                        className="w-4 h-4"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-foreground">DNS</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        domainSummary.certificateStatus === "READY"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-surface border border-border text-muted-foreground"
                      )}
                    >
                      <Icon icon="solar:shield-check-bold" className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground">TLS Edge</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        domainSummary.routingStatus === "READY"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-surface border border-border text-muted-foreground"
                      )}
                    >
                      <Icon icon="solar:routing-bold" className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground">Active</span>
                  </div>
                </div>
              </div>

              {/* Resource Usage Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface/30 text-center">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    QR CODES
                  </span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1 block">
                    {impact ? impact.connectedQrs : domainSummary.assignedQrsCount || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface/30 text-center">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    CAMPAIGNS
                  </span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1 block">
                    {impact ? impact.connectedCampaigns : domainSummary.assignedCampaignsCount || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface/30 text-center">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    PAGES
                  </span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1 block">
                    {impact ? impact.connectedLandingPages : domainSummary.assignedLandingPagesCount || 0}
                  </span>
                </div>
              </div>

              {/* Domain Signal Map */}
              <div className="p-4 rounded-xl border border-border/70 bg-surface/30 space-y-2.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                  Domain Signal Map
                </span>
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-surface border border-border font-mono">
                  <span className="text-foreground truncate max-w-[120px]">{domainSummary.hostname}</span>
                  <Icon icon="solar:arrow-right-linear" className="w-3.5 h-3.5 text-[#FA520F] shrink-0" />
                  <span className="text-emerald-500">Edge Resolver</span>
                  <Icon icon="solar:arrow-right-linear" className="w-3.5 h-3.5 text-[#FA520F] shrink-0" />
                  <span className="text-foreground">QR Destination</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: DNS Records */}
            <TabsContent value="dns" className="space-y-4 focus-visible:outline-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Required DNS Records
                </span>
                <Button
                  onClick={handleVerifyNow}
                  disabled={isVerifying}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-border"
                >
                  <Icon
                    icon="solar:refresh-square-linear"
                    className={cn("w-3.5 h-3.5 text-[#FA520F]", isVerifying && "animate-spin")}
                  />
                  {isVerifying ? "Verifying..." : "Verify DNS"}
                </Button>
              </div>

              {/* DNS record items */}
              <div className="space-y-3">
                {((detail?.verificationRecords || (detail as any)?.verificationRecordsJson || []) as DomainDnsRecord[]).map((record, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/70 bg-surface/40 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#FA520F] px-2 py-0.5 rounded bg-[#FA520F]/10 border border-[#FA520F]/20 text-[10px]">
                        {record.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {record.description || (record as any).purpose || "Verification Record"}
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">HOST / NAME</span>
                        <div className="flex items-center justify-between gap-1 bg-surface border border-border rounded px-2.5 py-1.5 mt-0.5">
                          <span className="truncate text-foreground font-mono text-[11px]">{record.name}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(record.name, "Record Name")}
                            className="text-muted-foreground hover:text-[#FA520F] transition-colors shrink-0"
                            title="Copy Name"
                          >
                            <Icon icon="solar:copy-linear" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block">TARGET / VALUE</span>
                        <div className="flex items-center justify-between gap-1 bg-surface border border-border rounded px-2.5 py-1.5 mt-0.5">
                          <span className="truncate text-foreground font-mono text-[11px]">{record.value}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(record.value, "Record Value")}
                            className="text-muted-foreground hover:text-[#FA520F] transition-colors shrink-0"
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
            </TabsContent>

            {/* Tab 3: Routing Architecture */}
            <TabsContent value="routing" className="space-y-4 focus-visible:outline-none">
              <div className="p-4 rounded-xl border border-border/70 bg-surface/30 space-y-3">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                  Edge Slug Namespace
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Traffic directed to <span className="text-foreground font-mono font-medium">{domainSummary.hostname}</span> enters NXTQR&apos;s Cloudflare edge redirect worker. It resolves using an isolated namespace key:
                </p>
                <div className="p-2.5 rounded-lg bg-surface border border-border font-mono text-xs text-[#FA520F] break-all">
                  resolver:v1:{domainSummary.hostname.toLowerCase()}:&lt;slug&gt;
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This guarantees your QR slugs never collide with other workspaces or NXTQR&apos;s root domain.
                </p>
              </div>
            </TabsContent>

            {/* Tab 4: Impact Analysis */}
            <TabsContent value="impact" className="space-y-4 focus-visible:outline-none">
              <div className="p-4 rounded-xl border border-border/70 bg-surface/30 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <Icon icon="solar:shield-warning-linear" className="w-4 h-4 text-amber-500" />
                  <span>Dependency Protection & Cascade Safety</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  NXTQR strictly protects existing QR codes and campaigns. Disconnecting or archiving this domain will safely set references to NULL without deleting any user resources or published designs.
                </p>
                <div className="pt-2 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Connected Dynamic QRs</span>
                    <span className="font-mono text-foreground font-semibold">
                      {impact?.connectedQrs ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Branded Campaigns</span>
                    <span className="font-mono text-foreground font-semibold">
                      {impact?.connectedCampaigns ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Landing Pages</span>
                    <span className="font-mono text-foreground font-semibold">
                      {impact?.connectedLandingPages ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with primary and destructive actions */}
        <div className="p-4 border-t border-border bg-surface/80 flex items-center justify-between gap-2">
          {!domainSummary.isPrimary && domainSummary.status === "ACTIVE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetPrimary(domainSummary)}
              className="text-xs h-9 border-border gap-1.5"
            >
              <Icon icon="solar:star-linear" className="w-3.5 h-3.5 text-amber-500" />
              Set as Primary
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {domainSummary.status !== "ARCHIVED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchiveDomain(domainSummary)}
                className="text-xs h-9 border-border"
              >
                Archive
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDisconnectDomain(domainSummary)}
              className="text-xs h-9"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
