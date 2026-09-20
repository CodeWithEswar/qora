"use client";

import * as React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Columns3,
  LayoutGrid,
  List,
  RotateCw,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QR_STATUS_ENUM } from "@nxtqr/contracts";
import { CampaignOption, MemberOption } from "./qr-filter-sheet";
import { cn } from "@/lib/utils";

export interface ColumnVisibility {
  destination: boolean;
  campaign: boolean;
  scans: boolean;
  status: boolean;
  owner: boolean;
  updated: boolean;
}

export interface QrCommandBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange: (status?: string) => void;
  typeFilter?: string;
  onTypeFilterChange: (type?: string) => void;
  campaignFilter?: string;
  onCampaignFilterChange: (campaignId?: string) => void;
  ownerFilter?: string;
  onOwnerFilterChange: (ownerId?: string) => void;
  onOpenAdvancedFilters: () => void;
  activeFilterCount: number;
  sortBy: "updatedAt" | "createdAt" | "name" | "totalScans";
  order: "asc" | "desc";
  onSortChange: (sortBy: "updatedAt" | "createdAt" | "name" | "totalScans", order: "asc" | "desc") => void;
  columns: ColumnVisibility;
  onToggleColumn: (key: keyof ColumnVisibility) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  campaigns?: CampaignOption[];
  members?: MemberOption[];
  className?: string;
}

export function QrCommandBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  campaignFilter,
  onCampaignFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  onOpenAdvancedFilters,
  activeFilterCount,
  sortBy,
  order,
  onSortChange,
  columns,
  onToggleColumn,
  viewMode,
  onViewModeChange,
  isRefreshing,
  onRefresh,
  campaigns = [],
  members = [],
  className,
}: QrCommandBarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Global '/' keyboard shortcut to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const qrTypes = [
    { value: "url", label: "Website / URL" },
    { value: "vcard", label: "vCard Contact" },
    { value: "wifi", label: "Wi-Fi" },
    { value: "pdf", label: "PDF Document" },
    { value: "app", label: "App Link" },
    { value: "text", label: "Plain Text" },
    { value: "whatsapp", label: "WhatsApp" },
  ];

  const sortLabel = React.useMemo(() => {
    if (sortBy === "updatedAt") return order === "desc" ? "Updated ↓" : "Updated ↑";
    if (sortBy === "createdAt") return order === "desc" ? "Created ↓" : "Created ↑";
    if (sortBy === "name") return order === "asc" ? "Name A–Z" : "Name Z–A";
    if (sortBy === "totalScans") return "Most scanned";
    return "Sort";
  }, [sortBy, order]);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex flex-col gap-2.5 rounded-xl border border-border/80 bg-white dark:bg-[#141414] p-2.5 sm:p-3 shadow-xs",
          className
        )}
      >
        {/* Row 1: Search & Right View Tools */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Search Bar with leading icon & trailing clear */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, slug or destination..."
              className="pl-9 pr-12 h-9 text-xs bg-neutral-50/70 dark:bg-[#1c1c1c]/70 border-border/60 focus-visible:ring-primary/30 w-full"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-neutral-200/60 dark:bg-neutral-800 rounded border border-border/50 select-none">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Right: Columns Visibility, View Mode Toggle, Refresh Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Columns Visibility Dropdown (only relevant in table view) */}
            {viewMode === "table" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" title="Visible columns">
                    <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Visible Columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={columns.destination}
                    onCheckedChange={() => onToggleColumn("destination")}
                  >
                    Destination
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columns.campaign}
                    onCheckedChange={() => onToggleColumn("campaign")}
                  >
                    Campaign
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columns.scans}
                    onCheckedChange={() => onToggleColumn("scans")}
                  >
                    Scans
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columns.status}
                    onCheckedChange={() => onToggleColumn("status")}
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columns.owner}
                    onCheckedChange={() => onToggleColumn("owner")}
                  >
                    Owner
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columns.updated}
                    onCheckedChange={() => onToggleColumn("updated")}
                  >
                    Updated
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border/80 rounded-md overflow-hidden bg-neutral-50 dark:bg-neutral-800 h-9">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onViewModeChange("table")}
                    className={cn(
                      "h-full px-2.5 flex items-center justify-center transition-colors",
                      viewMode === "table"
                        ? "bg-white dark:bg-[#1f1f1f] text-foreground shadow-2xs font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Table view</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onViewModeChange("grid")}
                    className={cn(
                      "h-full px-2.5 flex items-center justify-center transition-colors",
                      viewMode === "grid"
                        ? "bg-white dark:bg-[#1f1f1f] text-foreground shadow-2xs font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Grid view</TooltipContent>
              </Tooltip>
            </div>

            {/* Refresh Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="h-9 w-9 p-0"
                >
                  <RotateCw
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground",
                      isRefreshing && "animate-spin text-primary"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Refresh QR codes</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Row 2: Sort & Filter Ribbon — compact, contiguous, seamlessly responsive */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none border-t border-border/50 pt-2 text-xs">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={sortBy !== "updatedAt" || order !== "desc" ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-8 text-xs gap-1.5 px-2.5 shrink-0 font-normal",
                  (sortBy !== "updatedAt" || order !== "desc") && "font-medium text-primary bg-primary/10 border-primary/20"
                )}
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{sortLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs">
              <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Sort Options
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange("updatedAt", "desc")}>
                Recently updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("createdAt", "desc")}>
                Recently created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("name", "asc")}>
                Name (A &rarr; Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("name", "desc")}>
                Name (Z &rarr; A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("totalScans", "desc")}>
                Most scanned
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="h-4 w-px bg-border/60 shrink-0 mx-0.5" aria-hidden="true" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0 mr-1 hidden sm:inline-block select-none">
            Filter:
          </span>

          {/* Status Quick Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={statusFilter ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-8 text-xs font-normal gap-1 px-2.5 shrink-0",
                  statusFilter && "font-medium text-primary bg-primary/10 border-primary/20"
                )}
              >
                <span>Status</span>
                {statusFilter && <span className="font-mono text-[10px]">: {statusFilter}</span>}
                <span className="text-[10px] text-muted-foreground ml-0.5">▾</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-44 p-1.5 text-xs">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                Lifecycle Status
              </div>
              <button
                type="button"
                onClick={() => onStatusFilterChange(undefined)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>All Statuses</span>
                {!statusFilter && <Check className="h-3 w-3 text-primary" />}
              </button>
              {QR_STATUS_ENUM.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusFilterChange(st)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <span>{st.charAt(0) + st.slice(1).toLowerCase()}</span>
                  {statusFilter === st && <Check className="h-3 w-3 text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Type Quick Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={typeFilter ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-8 text-xs font-normal gap-1 px-2.5 shrink-0",
                  typeFilter && "font-medium text-primary bg-primary/10 border-primary/20"
                )}
              >
                <span>Type</span>
                {typeFilter && <span className="font-mono text-[10px]">: {typeFilter.toUpperCase()}</span>}
                <span className="text-[10px] text-muted-foreground ml-0.5">▾</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1.5 text-xs">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                QR Type
              </div>
              <button
                type="button"
                onClick={() => onTypeFilterChange(undefined)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>All Types</span>
                {!typeFilter && <Check className="h-3 w-3 text-primary" />}
              </button>
              {qrTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onTypeFilterChange(t.value)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <span>{t.label}</span>
                  {typeFilter === t.value && <Check className="h-3 w-3 text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Campaign Quick Filter */}
          {campaigns.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={campaignFilter ? "secondary" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-normal gap-1 px-2.5 shrink-0",
                    campaignFilter && "font-medium text-primary bg-primary/10 border-primary/20"
                  )}
                >
                  <span>Campaign</span>
                  <span className="text-[10px] text-muted-foreground ml-0.5">▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-1.5 text-xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Campaigns
                </div>
                <button
                  type="button"
                  onClick={() => onCampaignFilterChange(undefined)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <span>All Campaigns</span>
                  {!campaignFilter && <Check className="h-3 w-3 text-primary" />}
                </button>
                {campaigns.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onCampaignFilterChange(c.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left truncate"
                  >
                    <span className="truncate">{c.name}</span>
                    {campaignFilter === c.id && <Check className="h-3 w-3 text-primary shrink-0" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Owner Quick Filter */}
          {members.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={ownerFilter ? "secondary" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-normal gap-1 px-2.5 shrink-0",
                    ownerFilter && "font-medium text-primary bg-primary/10 border-primary/20"
                  )}
                >
                  <span>Owner</span>
                  <span className="text-[10px] text-muted-foreground ml-0.5">▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-1.5 text-xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                  Team Members
                </div>
                <button
                  type="button"
                  onClick={() => onOwnerFilterChange(undefined)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <span>All Owners</span>
                  {!ownerFilter && <Check className="h-3 w-3 text-primary" />}
                </button>
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onOwnerFilterChange(m.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left truncate"
                  >
                    <span className="truncate">{m.name || m.email}</span>
                    {ownerFilter === m.id && <Check className="h-3 w-3 text-primary shrink-0" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* More Filters Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAdvancedFilters}
            className={cn(
              "h-8 text-xs gap-1.5 px-2.5 shrink-0",
              activeFilterCount > 0 && "border-primary/40 bg-primary/5 text-primary"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-primary text-white text-[10px] font-mono font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Reset Filters when any filter is active */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange(undefined);
                onTypeFilterChange(undefined);
                onCampaignFilterChange(undefined);
                onOwnerFilterChange(undefined);
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 shrink-0 underline decoration-muted-foreground/40 underline-offset-2 ml-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
