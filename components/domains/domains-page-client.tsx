"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CustomDomainSummaryV1,
  CustomDomainDetailV1,
  DomainPulseMetricsV1,
  DomainStatus,
  DomainVerificationStatus,
  DomainRoutingStatus,
} from "@nxtqr/contracts";
import { DomainsHeader } from "./domains-header";
import { DomainHero } from "./domain-hero";
import { DomainSummaryRail } from "./domain-summary-rail";
import {
  DomainFilters,
  DomainFilterCriteria,
  DomainSortOption,
} from "./domain-filters";
import { DomainRegistry } from "./domain-registry";
import { DomainsTrueEmptyState } from "./states/domains-empty";
import { DomainsFilteredEmptyState } from "./states/domains-filtered-empty";
import { DomainsErrorState } from "./states/domains-error";
import { ConnectDomainDialog } from "./connect/connect-domain-dialog";
import { DomainInspectorSheet } from "./inspector/domain-inspector-sheet";
import { SetPrimaryDialog } from "./dialogs/set-primary-dialog";
import { ArchiveDomainAlert } from "./dialogs/archive-domain-alert";
import { DisconnectDomainAlert } from "./dialogs/disconnect-domain-alert";
import { PlatformDefaultDomainCard } from "./platform-default-domain-card";

interface DomainsPageClientProps {
  orgSlug: string;
  initialDomains: CustomDomainSummaryV1[];
  initialPulse: DomainPulseMetricsV1;
}

export function DomainsPageClient({
  orgSlug,
  initialDomains,
  initialPulse,
}: DomainsPageClientProps) {
  const [domains, setDomains] = React.useState<CustomDomainSummaryV1[]>(initialDomains);
  const [pulse, setPulse] = React.useState<DomainPulseMetricsV1>(initialPulse);
  const [hasError, setHasError] = React.useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<DomainFilterCriteria>({
    status: "all",
    dnsStatus: "all",
    routingStatus: "all",
    hasUsage: "all",
  });
  const [sortOption, setSortOption] = React.useState<DomainSortOption>("newest");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);

  // Modals & Sheets State
  const [isConnectOpen, setIsConnectOpen] = React.useState(false);
  const [selectedDomain, setSelectedDomain] = React.useState<CustomDomainSummaryV1 | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);
  const [primaryTarget, setPrimaryTarget] = React.useState<CustomDomainSummaryV1 | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<CustomDomainSummaryV1 | null>(null);
  const [disconnectTarget, setDisconnectTarget] = React.useState<CustomDomainSummaryV1 | null>(null);

  // Refresh domain list from real backend
  const refreshDomains = React.useCallback(async () => {
    try {
      setHasError(false);
      const res = await fetch(`/api/v1/domains?orgSlug=${encodeURIComponent(orgSlug)}`);
      if (!res.ok) throw new Error("Failed to fetch domains");
      const data = await res.json();
      setDomains(data.domains || []);
      setPulse(data.pulse || {
        totalDomains: (data.domains || []).length,
        activeDomains: (data.domains || []).filter((d: CustomDomainSummaryV1) => d.status === "ACTIVE").length,
        pendingDomains: (data.domains || []).filter((d: CustomDomainSummaryV1) => d.status === "PENDING").length,
        issuesDomains: (data.domains || []).filter((d: CustomDomainSummaryV1) => d.status === "FAILED").length,
        totalAssignedAssets: 0,
      });
    } catch (err) {
      console.error(err);
      setHasError(true);
    }
  }, [orgSlug]);

  // Handle new domain connected from Connect dialog
  const handleDomainConnected = (created: CustomDomainDetailV1) => {
    const summary: CustomDomainSummaryV1 = {
      id: created.id,
      organizationId: created.organizationId,
      hostname: created.hostname,
      status: created.status,
      verificationStatus: created.verificationStatus,
      verificationMethod: created.verificationMethod,
      certificateStatus: created.certificateStatus,
      routingStatus: created.routingStatus,
      isPrimary: created.isPrimary,
      assignedQrsCount: 0,
      assignedCampaignsCount: 0,
      assignedLandingPagesCount: 0,
      createdAt: created.createdAt,
      verifiedAt: created.verifiedAt,
      activatedAt: created.activatedAt,
      archivedAt: created.archivedAt,
    };

    setDomains((prev) => [summary, ...prev]);
    setPulse((prev) => ({
      ...prev,
      totalDomains: prev.totalDomains + 1,
      activeDomains: summary.status === "ACTIVE" ? prev.activeDomains + 1 : prev.activeDomains,
      pendingDomains: summary.status === "PENDING" ? prev.pendingDomains + 1 : prev.pendingDomains,
    }));
  };

  // Handle domain verification action
  const handleVerifyDomain = async (domain: CustomDomainSummaryV1) => {
    try {
      const res = await fetch(
        `/api/v1/domains/${domain.id}/verify?orgSlug=${encodeURIComponent(orgSlug)}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "DNS verification failed");
      }

      if (data.status === "VERIFIED" || data.status === "ACTIVE") {
        toast.success(`Verified DNS for ${domain.hostname}`);
        refreshDomains();
      } else {
        toast.error(data.reason || "DNS records not found yet. Please check propagation.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      toast.error(msg);
    }
  };

  // Handle set primary domain action
  const handleConfirmSetPrimary = async (domain: CustomDomainSummaryV1) => {
    try {
      const res = await fetch(
        `/api/v1/domains/${domain.id}/primary?orgSlug=${encodeURIComponent(orgSlug)}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to set primary domain");
      }

      toast.success(`${domain.hostname} is now the primary domain`);
      setDomains((prev) =>
        prev.map((d) => ({
          ...d,
          isPrimary: d.id === domain.id,
        }))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    }
  };

  // Handle archive domain action
  const handleConfirmArchive = async (domain: CustomDomainSummaryV1) => {
    try {
      const res = await fetch(
        `/api/v1/domains/${domain.id}?orgSlug=${encodeURIComponent(orgSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ARCHIVED" }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to archive domain");
      }

      toast.success(`Archived ${domain.hostname}`);
      refreshDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Archive failed";
      toast.error(msg);
    }
  };

  // Handle disconnect domain action
  const handleConfirmDisconnect = async (domain: CustomDomainSummaryV1) => {
    try {
      const res = await fetch(
        `/api/v1/domains/${domain.id}?orgSlug=${encodeURIComponent(orgSlug)}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to disconnect domain");
      }

      toast.success(`Disconnected ${domain.hostname}`);
      if (selectedDomain?.id === domain.id) {
        setIsInspectorOpen(false);
        setSelectedDomain(null);
      }
      refreshDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Disconnect failed";
      toast.error(msg);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      dnsStatus: "all",
      routingStatus: "all",
      hasUsage: "all",
    });
    setSortOption("newest");
  };

  // Filter and sort domains in-memory projection for responsive UI
  const filteredDomains = React.useMemo(() => {
    return domains
      .filter((d) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!d.hostname.toLowerCase().includes(q)) return false;
        }

        // Status filter
        if (filters.status === "issues") {
          if (
            d.status !== "FAILED" &&
            d.verificationStatus !== "FAILED" &&
            d.certificateStatus !== "ERROR" &&
            d.routingStatus !== "ERROR"
          ) {
            return false;
          }
        } else if (filters.status !== "all" && d.status !== filters.status) {
          return false;
        }

        // DNS status filter
        if (filters.dnsStatus !== "all" && d.verificationStatus !== filters.dnsStatus) {
          return false;
        }

        // Routing status filter
        if (filters.routingStatus !== "all" && d.routingStatus !== filters.routingStatus) {
          return false;
        }

        // Usage filter
        const assetsCount =
          (d.assignedQrsCount || 0) +
          (d.assignedLandingPagesCount || 0) +
          (d.assignedCampaignsCount || 0);

        if (filters.hasUsage === "assigned" && assetsCount === 0) {
          return false;
        }
        if (filters.hasUsage === "unassigned" && assetsCount > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOption === "hostname-asc") {
          return a.hostname.localeCompare(b.hostname);
        }
        if (sortOption === "hostname-desc") {
          return b.hostname.localeCompare(a.hostname);
        }
        return 0;
      });
  }, [domains, searchQuery, filters, sortOption]);

  const primaryDomain = React.useMemo(() => {
    const found = domains.find((d) => d.isPrimary);
    return found ? found.hostname : domains[0]?.hostname;
  }, [domains]);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Domains Header */}
      <DomainsHeader
        orgSlug={orgSlug}
        onConnectDomain={() => setIsConnectOpen(true)}
        onToggleFilters={() => setIsFilterSheetOpen((v) => !v)}
        isFiltersOpen={isFilterSheetOpen}
      />

      {/* Signature Hero & Constellation */}
      <DomainHero
        primaryDomain={primaryDomain}
        hasActiveDomains={pulse.activeDomains > 0}
        onConnectDomain={() => setIsConnectOpen(true)}
      />

      {/* Real Summary Rail with Click-to-filter */}
      <DomainSummaryRail
        metrics={pulse}
        activeStatusFilter={filters.status}
        onSelectFilter={(status) => setFilters((prev) => ({ ...prev, status }))}
      />

      {/* NXTQR Managed Platform Default Domain */}
      <PlatformDefaultDomainCard />

      {/* Section Header: Organization Custom Domains */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Custom Domains
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
              {domains.length} connected
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Organization-owned hostnames verified for branded, isolated QR routing.
          </p>
        </div>
      </div>

      {/* Error state if fetch failed */}
      {hasError ? (
        <DomainsErrorState onRetry={refreshDomains} />
      ) : domains.length === 0 ? (
        /* True Empty State */
        <DomainsTrueEmptyState onConnectDomain={() => setIsConnectOpen(true)} />
      ) : (
        /* Domain Registry Control Center */
        <div className="space-y-4 pt-2">
          <DomainFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
            sortOption={sortOption}
            onSortChange={setSortOption}
            isFilterSheetOpen={isFilterSheetOpen}
            onFilterSheetOpenChange={setIsFilterSheetOpen}
            onResetFilters={handleResetFilters}
          />

          {filteredDomains.length === 0 ? (
            <DomainsFilteredEmptyState
              searchQuery={searchQuery}
              onClearFilters={handleResetFilters}
            />
          ) : (
            <DomainRegistry
              domains={filteredDomains}
              selectedDomainId={selectedDomain?.id || null}
              onSelectDomain={(domain) => {
                setSelectedDomain(domain);
                setIsInspectorOpen(true);
              }}
              onVerifyDomain={handleVerifyDomain}
              onSetPrimary={(domain) => setPrimaryTarget(domain)}
              onArchiveDomain={(domain) => setArchiveTarget(domain)}
              onDisconnectDomain={(domain) => setDisconnectTarget(domain)}
            />
          )}
        </div>
      )}

      {/* Connect Domain Multi-Step Dialog */}
      <ConnectDomainDialog
        isOpen={isConnectOpen}
        onOpenChange={setIsConnectOpen}
        orgSlug={orgSlug}
        onDomainConnected={handleDomainConnected}
      />

      {/* Domain Inspector Sheet */}
      <DomainInspectorSheet
        isOpen={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        domainSummary={selectedDomain}
        orgSlug={orgSlug}
        onDomainUpdated={(updated) => {
          setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          setSelectedDomain(updated);
        }}
        onSetPrimary={(domain) => setPrimaryTarget(domain)}
        onArchiveDomain={(domain) => setArchiveTarget(domain)}
        onDisconnectDomain={(domain) => setDisconnectTarget(domain)}
      />

      {/* Set Primary Confirmation Dialog */}
      <SetPrimaryDialog
        isOpen={!!primaryTarget}
        onOpenChange={(open) => !open && setPrimaryTarget(null)}
        domain={primaryTarget}
        onConfirm={handleConfirmSetPrimary}
      />

      {/* Archive Domain Confirmation Alert */}
      <ArchiveDomainAlert
        isOpen={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        domain={archiveTarget}
        onConfirm={handleConfirmArchive}
      />

      {/* Disconnect Domain Confirmation Alert */}
      <DisconnectDomainAlert
        isOpen={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
        domain={disconnectTarget}
        orgSlug={orgSlug}
        onConfirm={handleConfirmDisconnect}
      />
    </div>
  );
}
