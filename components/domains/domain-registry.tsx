"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { CustomDomainSummaryV1 } from "@nxtqr/contracts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DomainRegistryProps {
  domains: CustomDomainSummaryV1[];
  selectedDomainId: string | null;
  onSelectDomain: (domain: CustomDomainSummaryV1) => void;
  onVerifyDomain: (domain: CustomDomainSummaryV1) => void;
  onSetPrimary: (domain: CustomDomainSummaryV1) => void;
  onArchiveDomain: (domain: CustomDomainSummaryV1) => void;
  onDisconnectDomain: (domain: CustomDomainSummaryV1) => void;
}

const emptySubscribe = () => () => {};

export function DomainRegistry({
  domains,
  selectedDomainId,
  onSelectDomain,
  onVerifyDomain,
  onSetPrimary,
  onArchiveDomain,
  onDisconnectDomain,
}: DomainRegistryProps) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const handleCopyHostname = (hostname: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hostname);
    toast.success(`Copied ${hostname} to clipboard`);
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "Just now";
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      {/* Desktop / Tablet List View */}
      <div className="rounded-xl border border-border/70 overflow-hidden bg-surface/20 divide-y divide-border/40 shadow-xs">
        {domains.map((domain) => {
          const isSelected = selectedDomainId === domain.id;
          const totalAssets =
            (domain.assignedQrsCount || 0) +
            (domain.assignedLandingPagesCount || 0) +
            (domain.assignedCampaignsCount || 0);

          return (
            <div
              key={domain.id}
              onClick={() => onSelectDomain(domain)}
              className={cn(
                "p-4 sm:p-4.5 transition-all duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group",
                isSelected
                  ? "bg-surface/90 ring-1 ring-inset ring-[#FA520F]/50"
                  : "hover:bg-surface/50"
              )}
            >
              {/* Domain Identity Column */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors",
                    domain.status === "ACTIVE"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : domain.status === "PENDING"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  )}
                >
                  <Icon icon="solar:global-bold" className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground font-mono truncate max-w-[220px] sm:max-w-[320px]">
                      {domain.hostname}
                    </span>

                    {domain.isPrimary && (
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[10px] bg-[#FA520F]/15 text-[#FA520F] border-[#FA520F]/30 font-medium"
                      >
                        PRIMARY
                      </Badge>
                    )}

                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-[10px] uppercase font-mono tracking-wider",
                        domain.status === "ACTIVE"
                          ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                          : domain.status === "PENDING"
                          ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                          : "border-destructive/30 text-destructive bg-destructive/5"
                      )}
                    >
                      {domain.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {domain.verificationStatus === "VERIFIED"
                      ? "Ready for edge traffic resolution"
                      : "DNS configuration required to activate routing"}
                  </p>
                </div>
              </div>

              {/* Infrastructure Indicators Column */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs shrink-0 pl-12 md:pl-0">
                {/* DNS badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border/70">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">DNS</span>
                  <span
                    className={cn(
                      "text-[11px] font-medium font-mono flex items-center gap-1",
                      domain.verificationStatus === "VERIFIED"
                        ? "text-emerald-500"
                        : domain.verificationStatus === "PENDING"
                        ? "text-amber-500"
                        : "text-destructive"
                    )}
                  >
                    <Icon
                      icon={
                        domain.verificationStatus === "VERIFIED"
                          ? "solar:check-circle-bold"
                          : "solar:clock-circle-bold"
                      }
                      className="w-3.5 h-3.5"
                    />
                    {domain.verificationStatus}
                  </span>
                </div>

                {/* TLS badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border/70">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">TLS</span>
                  <span
                    className={cn(
                      "text-[11px] font-medium font-mono flex items-center gap-1",
                      domain.certificateStatus === "READY"
                        ? "text-emerald-500"
                        : "text-amber-500"
                    )}
                  >
                    <Icon
                      icon={
                        domain.certificateStatus === "READY"
                          ? "solar:shield-check-bold"
                          : "solar:shield-warning-bold"
                      }
                      className="w-3.5 h-3.5"
                    />
                    {domain.certificateStatus}
                  </span>
                </div>

                {/* Resource usage */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border/70 text-muted-foreground">
                  <Icon icon="solar:qr-code-bold" className="w-3.5 h-3.5 text-[#FA520F]" />
                  <span className="text-[11px] font-mono font-medium text-foreground">
                    {totalAssets}
                  </span>
                  <span className="text-[10px] uppercase">assets</span>
                </div>

                {/* Relative timestamp */}
                <span
                  className="text-[11px] font-mono text-muted-foreground hidden lg:inline"
                  suppressHydrationWarning
                >
                  {isClient ? formatRelativeTime(domain.createdAt) : ""}
                </span>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDomain(domain);
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon icon="solar:tuning-square-linear" className="w-4 h-4 text-[#FA520F]" />
                      Open Details & DNS
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => handleCopyHostname(domain.hostname, e)}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon icon="solar:copy-linear" className="w-4 h-4" />
                      Copy Hostname
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerifyDomain(domain);
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon icon="solar:refresh-square-linear" className="w-4 h-4 text-emerald-500" />
                      Verify DNS Records
                    </DropdownMenuItem>

                    {!domain.isPrimary && domain.status === "ACTIVE" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPrimary(domain);
                        }}
                        className="gap-2 cursor-pointer"
                      >
                        <Icon icon="solar:star-linear" className="w-4 h-4 text-amber-500" />
                        Set as Primary Domain
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {domain.status !== "ARCHIVED" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveDomain(domain);
                        }}
                        className="gap-2 cursor-pointer text-muted-foreground"
                      >
                        <Icon icon="solar:archive-linear" className="w-4 h-4" />
                        Archive Domain
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDisconnectDomain(domain);
                      }}
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                      Disconnect Domain
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
