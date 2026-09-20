"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { CampaignQrAssetV1 } from "@nxtqr/contracts";
import { QrThumbnail } from "@/components/qr-operations/qr-thumbnail";
import { cn, formatNumber } from "@/lib/utils";

export interface CampaignQrListProps {
  items: CampaignQrAssetV1[];
  orgSlug: string;
  onAddQrs: () => void;
  onRemoveQr: (qr: CampaignQrAssetV1) => void;
  onInspectQr?: (qr: CampaignQrAssetV1) => void;
  className?: string;
}

type SortKey = "scans" | "name" | "newest" | "updated";

export function CampaignQrList({
  items,
  orgSlug,
  onAddQrs,
  onRemoveQr,
  onInspectQr,
  className,
}: CampaignQrListProps) {
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<SortKey>("scans");
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table");

  // Extract unique QR types from existing items
  const availableTypes = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const t = item.qrType;
      if (t) set.add(t.toLowerCase());
    });
    return Array.from(set);
  }, [items]);

  // Filter & sort
  const filteredItems = React.useMemo(() => {
    return items
      .filter((item) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesSlug = item.slug.toLowerCase().includes(q);
          const matchesDest = item.destinationUrl?.toLowerCase().includes(q);
          if (!matchesName && !matchesSlug && !matchesDest) return false;
        }

        // Type filter
        if (selectedType !== "all") {
          const itemType = (item.qrType || "").toLowerCase();
          if (itemType !== selectedType) return false;
        }

        // Status filter
        if (selectedStatus !== "all") {
          const itemStatus = (item.status || "active").toLowerCase();
          if (itemStatus !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "scans") {
          return (b.totalScans || 0) - (a.totalScans || 0);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "newest" || sortBy === "updated") {
          const dateA = new Date(a.updatedAt || 0).getTime();
          const dateB = new Date(b.updatedAt || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });
  }, [items, search, selectedType, selectedStatus, sortBy]);

  const hasActiveFilters =
    Boolean(search.trim()) || selectedType !== "all" || selectedStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedType("all");
    setSelectedStatus("all");
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface p-4 sm:p-5 shadow-2xs space-y-4",
        className
      )}
    >
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
            <NxtqrIcon icon="solar:qr-code-bold" size={12} />
            <span>Asset Management</span>
          </div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mt-0.5">
            <span>Campaign QR Codes</span>
            <span className="text-xs font-mono text-muted-foreground font-normal">
              ({items.length})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-lg p-0.5 bg-surface-elevated/50 text-muted-foreground">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "table" ? "bg-surface text-foreground shadow-2xs" : "hover:text-foreground"
              )}
              title="Table view"
              aria-label="Table view"
            >
              <NxtqrIcon icon="solar:list-bold" size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "cards" ? "bg-surface text-foreground shadow-2xs" : "hover:text-foreground"
              )}
              title="Grid view"
              aria-label="Grid view"
            >
              <NxtqrIcon icon="solar:widget-4-bold" size={14} />
            </button>
          </div>

          <Button
            size="sm"
            onClick={onAddQrs}
            className="text-xs h-8 px-3 gap-1.5 bg-primary hover:bg-[#CC3A05] text-white font-semibold shadow-xs"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={13} />
            <span>Add QR Codes</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <NxtqrIcon
            icon="solar:magnifer-linear"
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search QR codes, slugs, destinations…"
            className="text-xs h-8 pl-8 pr-7 bg-surface-elevated/40 border-border w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <NxtqrIcon icon="solar:close-circle-bold" size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs h-8 px-2.5 gap-1.5 bg-surface border-border flex-1 sm:flex-initial",
                  (selectedType !== "all" || selectedStatus !== "all") &&
                    "border-primary text-primary"
                )}
              >
              <NxtqrIcon icon="solar:filter-bold" size={12} />
              <span>Filters</span>
              {(selectedType !== "all" || selectedStatus !== "all") && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-3 text-xs space-y-3">
            <div>
              <div className="font-semibold text-foreground mb-1.5 text-[11px] uppercase font-mono tracking-wider">
                Type
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-mono",
                    selectedType === "all"
                      ? "bg-primary text-white font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  All
                </button>
                {availableTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-mono uppercase",
                      selectedType === t
                        ? "bg-primary text-white font-semibold"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-foreground mb-1.5 text-[11px] uppercase font-mono tracking-wider">
                Status
              </div>
              <div className="flex flex-wrap gap-1">
                {["all", "active", "draft", "paused"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-mono capitalize",
                      selectedStatus === s
                        ? "bg-primary text-white font-semibold"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="pt-2 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] text-primary hover:underline font-mono"
                >
                  Reset filters
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2.5 gap-1.5 bg-surface border-border"
            >
              <NxtqrIcon icon="solar:sort-vertical-bold" size={12} />
              <span className="hidden sm:inline">Sort:</span>
              <span className="font-semibold capitalize">
                {sortBy === "scans"
                  ? "Most scans"
                  : sortBy === "name"
                  ? "Name A–Z"
                  : sortBy === "newest"
                  ? "Newest"
                  : "Updated"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs w-40">
            <DropdownMenuItem onClick={() => setSortBy("scans")}>
              Most scans
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("newest")}>
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("updated")}>
              Recently updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              Name (A–Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-mono uppercase text-muted-foreground mr-1">
            Active:
          </span>
          {search && (
            <Badge
              variant="secondary"
              className="text-[11px] gap-1 px-2 py-0.5 font-normal bg-muted/80"
            >
              <span>&ldquo;{search}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-foreground"
              >
                <NxtqrIcon icon="solar:close-circle-bold" size={11} />
              </button>
            </Badge>
          )}
          {selectedType !== "all" && (
            <Badge
              variant="secondary"
              className="text-[11px] gap-1 px-2 py-0.5 font-normal bg-muted/80 uppercase font-mono"
            >
              <span>Type: {selectedType}</span>
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className="hover:text-foreground"
              >
                <NxtqrIcon icon="solar:close-circle-bold" size={11} />
              </button>
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge
              variant="secondary"
              className="text-[11px] gap-1 px-2 py-0.5 font-normal bg-muted/80 capitalize"
            >
              <span>Status: {selectedStatus}</span>
              <button
                type="button"
                onClick={() => setSelectedStatus("all")}
                className="hover:text-foreground"
              >
                <NxtqrIcon icon="solar:close-circle-bold" size={11} />
              </button>
            </Badge>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] text-primary hover:underline font-mono ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Body: No QRs vs Filtered Empty vs Content */}
      {items.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-border/60 p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
            <NxtqrIcon icon="solar:qr-code-bold" size={20} />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">
              No QR codes assigned yet
            </div>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Add QR codes to this campaign to centralize destination routing and scan tracking.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onAddQrs}
            variant="outline"
            className="text-xs h-8 px-4 gap-1.5 bg-surface border-border text-foreground hover:bg-muted"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={13} className="text-primary" />
            <span>Add First QR Code</span>
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-10 text-center rounded-xl border border-dashed border-border/60 p-4 space-y-2">
          <div className="text-xs font-semibold text-foreground">
            No QR codes match these filters
          </div>
          <p className="text-[11px] text-muted-foreground">
            Try adjusting your search term or clearing active filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="text-xs h-7 px-3 mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* 1. Desktop High-Density Table View */}
          <div className={cn("hidden md:block overflow-x-auto", viewMode === "cards" && "md:hidden")}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-[10px] font-mono uppercase text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">QR Asset</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Destination Endpoint</th>
                  <th className="py-2.5 px-3 font-semibold">Routing</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Scans</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredItems.map((qr) => (
                  <tr
                    key={qr.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Identity */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 shrink-0 bg-white p-0.5 rounded-lg border border-border/60 shadow-2xs">
                          <QrThumbnail
                            name={qr.name}
                            slug={qr.slug}
                            qrType={qr.qrType}
                            design={qr.design}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onInspectQr?.(qr)}
                            className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate text-left block cursor-pointer"
                          >
                            {qr.name}
                          </button>
                          <div className="text-[10px] font-mono text-muted-foreground truncate">
                            /{qr.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                        {qr.qrType || "URL"}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-3 max-w-[200px]">
                      {qr.destinationUrl ? (
                        <div
                          className="font-mono text-[11px] text-foreground truncate"
                          title={qr.destinationUrl}
                        >
                          {qr.destinationUrl.replace(/^https?:\/\//, "")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic font-mono text-[11px]">
                          Direct resolver
                        </span>
                      )}
                    </td>

                    {/* Routing */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Direct Default</span>
                      </span>
                    </td>

                    {/* Scans */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="font-bold text-foreground">
                        {formatNumber(qr.totalScans)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      >
                        Active
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onInspectQr?.(qr)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="Inspect QR"
                        >
                          <NxtqrIcon icon="solar:eye-bold" size={13} />
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="QR Brain"
                        >
                          <Link href={`/${orgSlug}/qr/${qr.id}/brain`}>
                            <NxtqrIcon icon="solar:route-bold" size={13} />
                          </Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <NxtqrIcon icon="solar:menu-dots-bold" size={13} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/${orgSlug}/qr/${qr.id}`} className="gap-2">
                                <NxtqrIcon icon="solar:eye-bold" size={13} />
                                <span>View QR Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/${orgSlug}/qr/${qr.id}/brain`} className="gap-2">
                                <NxtqrIcon icon="solar:route-bold" size={13} />
                                <span>Configure Brain</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onRemoveQr(qr)}
                              className="gap-2 text-rose-600 dark:text-rose-400"
                            >
                              <NxtqrIcon icon="solar:link-broken-minimalistic-bold" size={13} />
                              <span>Remove from Campaign</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Responsive Mobile / Card Grid View */}
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 gap-3",
              viewMode === "table" ? "md:hidden" : ""
            )}
          >
            {filteredItems.map((qr) => (
              <div
                key={qr.id}
                className="p-3.5 rounded-xl border border-border/70 bg-surface-elevated/40 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 shrink-0 bg-white p-0.5 rounded-lg border border-border/60">
                      <QrThumbnail
                        name={qr.name}
                        slug={qr.slug}
                        qrType={qr.qrType}
                        design={qr.design}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onInspectQr?.(qr)}
                        className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate block text-left"
                      >
                        {qr.name}
                      </button>
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-muted rounded text-muted-foreground mt-0.5 inline-block">
                        {qr.qrType || "URL"}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0"
                  >
                    Active
                  </Badge>
                </div>

                <div className="text-[11px] font-mono text-muted-foreground truncate bg-muted/30 p-1.5 rounded-md">
                  → {qr.destinationUrl ? qr.destinationUrl.replace(/^https?:\/\//, "") : `/${qr.slug}`}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs font-mono">
                  <div className="text-foreground font-semibold">
                    {formatNumber(qr.totalScans)}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">scans</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInspectQr?.(qr)}
                      className="h-7 px-2 text-[11px] font-mono"
                    >
                      Inspect
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <NxtqrIcon icon="solar:menu-dots-bold" size={13} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/${orgSlug}/qr/${qr.id}`} className="gap-2">
                            <NxtqrIcon icon="solar:eye-bold" size={13} />
                            <span>View QR Details</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${orgSlug}/qr/${qr.id}/brain`} className="gap-2">
                            <NxtqrIcon icon="solar:route-bold" size={13} />
                            <span>QR Brain</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onRemoveQr(qr)}
                          className="gap-2 text-rose-600 dark:text-rose-400"
                        >
                          <NxtqrIcon icon="solar:link-broken-minimalistic-bold" size={13} />
                          <span>Remove from Campaign</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
