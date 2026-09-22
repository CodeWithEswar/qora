"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Link2,
  QrCode,
  Sparkles,
  Palette,
  Search,
  Check,
  X,
  AlertCircle,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamResourceAssignment } from "@/lib/supabase/types/teams";

interface ConnectWorkSheetProps {
  isOpen: boolean;
  teamId: string;
  teamName: string;
  orgSlug: string;
  existingAssignments: TeamResourceAssignment[];
  onClose: () => void;
  onConnected: () => void;
}

interface CandidateResource {
  id: string;
  type: "qr_code" | "campaign" | "brand_kit" | "folder";
  title: string;
  ref: string;
}

const RELATIONSHIP_OPTIONS = {
  responsible: {
    label: "Responsible",
    description: "Primary owner with direct operational scope",
  },
  collaborator: {
    label: "Collaborator",
    description: "Shared access to contribute & edit",
  },
  governance: {
    label: "Governance",
    description: "Reviews, approval decisions & policy enforcement",
  },
} as const;

type RelationshipKey = keyof typeof RELATIONSHIP_OPTIONS;

export function ConnectWorkSheet({
  isOpen,
  teamId,
  teamName,
  orgSlug,
  existingAssignments,
  onClose,
  onConnected,
}: ConnectWorkSheetProps) {
  const [candidates, setCandidates] = React.useState<CandidateResource[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filters and selection state
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "qr_code" | "campaign" | "brand_kit">("all");
  const [relationshipType, setRelationshipType] = React.useState<RelationshipKey>("responsible");
  const [selectedIds, setSelectedIds] = React.useState<Map<string, CandidateResource>>(new Map());

  // Existing assignments map for quick lookup
  const existingIds = React.useMemo(() => {
    return new Set(existingAssignments.map((a) => a.resourceId));
  }, [existingAssignments]);

  // Load available resources across the organization
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Map());
      setSearch("");
      setActiveTab("all");
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    // Fetch real candidates from workspace endpoints
    Promise.allSettled([
      fetch(`/api/v1/qrs?limit=50`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/campaigns?limit=50`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/brand-kits?limit=50`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([qrRes, campRes, brandRes]) => {
        if (!isMounted) return;

        const results: CandidateResource[] = [];

        if (qrRes.status === "fulfilled" && qrRes.value?.data) {
          const qrs = Array.isArray(qrRes.value.data) ? qrRes.value.data : [];
          qrs.forEach((q: any) => {
            results.push({
              id: q.id,
              type: "qr_code",
              title: q.name || "Untitled QR",
              ref: q.shortCode ? `/${q.shortCode}` : q.id.slice(0, 8),
            });
          });
        }

        if (campRes.status === "fulfilled" && campRes.value?.data) {
          const camps = Array.isArray(campRes.value.data) ? campRes.value.data : [];
          camps.forEach((c: any) => {
            results.push({
              id: c.id,
              type: "campaign",
              title: c.name || "Untitled Campaign",
              ref: `CAMP-${c.id.slice(0, 6).toUpperCase()}`,
            });
          });
        }

        if (brandRes.status === "fulfilled" && brandRes.value?.data) {
          const brands = Array.isArray(brandRes.value.data) ? brandRes.value.data : [];
          brands.forEach((b: any) => {
            results.push({
              id: b.id,
              type: "brand_kit",
              title: b.name || "Brand Kit",
              ref: `BRAND-${b.id.slice(0, 6).toUpperCase()}`,
            });
          });
        }

        setCandidates(results);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load workspace resources.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Compute category counts for tabs
  const categoryCounts = React.useMemo(() => {
    const counts = {
      all: candidates.length,
      qr_code: 0,
      campaign: 0,
      brand_kit: 0,
    };
    candidates.forEach((c) => {
      if (c.type === "qr_code") counts.qr_code++;
      else if (c.type === "campaign") counts.campaign++;
      else if (c.type === "brand_kit") counts.brand_kit++;
    });
    return counts;
  }, [candidates]);

  // Filter candidates according to category tab and text search
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((item) => {
      if (activeTab !== "all" && item.type !== activeTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.ref.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [candidates, activeTab, search]);

  // Selectable in view (excludes already connected)
  const selectableInView = React.useMemo(() => {
    return filteredCandidates.filter((c) => !existingIds.has(c.id));
  }, [filteredCandidates, existingIds]);

  const allInViewSelected =
    selectableInView.length > 0 &&
    selectableInView.every((c) => selectedIds.has(c.id));

  const handleToggleAllInView = () => {
    setSelectedIds((prev) => {
      const next = new Map(prev);
      if (allInViewSelected) {
        selectableInView.forEach((c) => next.delete(c.id));
      } else {
        selectableInView.forEach((c) => next.set(c.id, c));
      }
      return next;
    });
  };

  const handleToggleSelect = (item: CandidateResource) => {
    setSelectedIds((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const handleConnect = async () => {
    if (selectedIds.size === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const resourcesPayload = Array.from(selectedIds.values()).map((item) => ({
        resourceType: item.type,
        resourceId: item.id,
        relationshipType,
      }));

      const res = await fetch(
        `/api/v1/organizations/${orgSlug}/teams/${teamId}/resources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resources: resourcesPayload }),
        }
      );

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || "Failed to connect resources.");
      }

      onConnected();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to connect resources.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0 font-sans">
        <SheetHeader className="p-6 border-b border-border/80 bg-surface/50 select-none">
          <div className="flex items-center gap-2 text-primary font-mono text-[11px] uppercase tracking-wider font-bold">
            <Link2 className="h-4 w-4" />
            <span>Operational Connection</span>
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
            Connect Work to {teamName}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Associate campaigns, QR codes, or brand assets with this team to establish responsibility and access scope.
          </SheetDescription>
        </SheetHeader>

        {/* Filters & Controls Bar: Responsive layout where chips and select never collide */}
        <div className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/15 space-y-3 select-none">
          {/* Search Box with Clear Button */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by title or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 pr-8 text-xs h-8 bg-surface rounded-md font-mono"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2 h-4 w-4 rounded text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Filter Chips: Given full width, horizontal scrolling if needed, never truncated */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 text-[11px] font-mono min-w-0 w-full">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border/70 hover:bg-surface-hover"
              )}
            >
              <span>ALL</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1 rounded",
                  activeTab === "all"
                    ? "bg-white/20 text-white font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {categoryCounts.all}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qr_code")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer",
                activeTab === "qr_code"
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border/70 hover:bg-surface-hover"
              )}
            >
              <QrCode className="h-3 w-3" />
              <span>QR</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1 rounded",
                  activeTab === "qr_code"
                    ? "bg-white/20 text-white font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {categoryCounts.qr_code}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("campaign")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer",
                activeTab === "campaign"
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border/70 hover:bg-surface-hover"
              )}
            >
              <Sparkles className="h-3 w-3" />
              <span>CAMPAIGNS</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1 rounded",
                  activeTab === "campaign"
                    ? "bg-white/20 text-white font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {categoryCounts.campaign}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brand_kit")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer",
                activeTab === "brand_kit"
                  ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "bg-surface text-muted-foreground hover:text-foreground border border-border/70 hover:bg-surface-hover"
              )}
            >
              <Palette className="h-3 w-3" />
              <span>BRANDS</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1 rounded",
                  activeTab === "brand_kit"
                    ? "bg-white/20 text-white font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {categoryCounts.brand_kit}
              </span>
            </button>
          </div>

          {/* Dedicated Assignment Relation Control Row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-2 border-t border-border/50 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider shrink-0">
                RELATION:
              </span>
              <span className="text-[10px] text-muted-foreground/70 hidden sm:inline font-sans truncate">
                Role & scope for team
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={relationshipType}
                onValueChange={(val: RelationshipKey) => setRelationshipType(val)}
              >
                <SelectTrigger className="h-8 text-xs font-mono uppercase w-auto min-w-[130px] sm:min-w-[145px] bg-surface rounded-md border-border/70 hover:border-border transition-colors cursor-pointer focus:ring-1 focus:ring-primary gap-2">
                  <SelectValue placeholder="Select role">
                    {RELATIONSHIP_OPTIONS[relationshipType]?.label ?? "Responsible"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end" className="w-[calc(100vw-2.5rem)] sm:w-72 max-w-sm font-sans p-1">
                  {(Object.keys(RELATIONSHIP_OPTIONS) as RelationshipKey[]).map((key) => {
                    const opt = RELATIONSHIP_OPTIONS[key];
                    return (
                      <SelectItem
                        key={key}
                        value={key}
                        textValue={opt.label}
                        className="text-xs font-mono cursor-pointer py-2 px-2.5 rounded-lg focus:bg-accent/80 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-bold text-foreground uppercase tracking-wide text-xs">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-sans leading-tight normal-case">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Candidate List Subhead with Bulk Select */}
        <div className="px-4 py-1.5 bg-muted/20 border-b border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground select-none">
          <span>
            {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? "" : "s"}
            {selectedIds.size > 0 && (
              <span className="text-primary font-semibold ml-1.5">
                ({selectedIds.size} selected)
              </span>
            )}
          </span>
          {selectableInView.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAllInView}
              className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
            >
              {allInViewSelected ? "Deselect visible" : "Select all visible"}
            </button>
          )}
        </div>

        {/* Resources Candidate List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-border/40">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-mono">
              Loading workspace resources...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-mono">
              No matching resources found in workspace.
            </div>
          ) : (
            filteredCandidates.map((item) => {
              const isAlreadyConnected = existingIds.has(item.id);
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => !isAlreadyConnected && handleToggleSelect(item)}
                  className={cn(
                    "py-2.5 px-2 flex items-center justify-between rounded-md transition-colors select-none",
                    isAlreadyConnected
                      ? "opacity-50 cursor-not-allowed bg-muted/10"
                      : isSelected
                      ? "bg-primary/10 cursor-pointer"
                      : "hover:bg-surface-hover cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isAlreadyConnected ? (
                      <div className="w-4 h-4 rounded border border-border/60 bg-muted/40 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-muted-foreground/70" />
                      </div>
                    ) : (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(item)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer shrink-0"
                      />
                    )}
                    <div className="w-7 h-7 rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
                      {item.type === "qr_code" && <QrCode className="h-3.5 w-3.5 text-primary" />}
                      {item.type === "campaign" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                      {item.type === "brand_kit" && <Palette className="h-3.5 w-3.5 text-indigo-500" />}
                      {item.type === "folder" && <Folder className="h-3.5 w-3.5 text-blue-500" />}
                    </div>
                    <div className="truncate min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {item.ref}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono shrink-0 ml-2">
                    {isAlreadyConnected ? (
                      <span className="text-muted-foreground italic tracking-wider font-semibold">
                        CONNECTED
                      </span>
                    ) : (
                      <span className="uppercase text-muted-foreground/80">{item.type.replace("_", " ")}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="px-6 py-2 bg-rose-500/10 border-t border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Preview & Footer */}
        <SheetFooter className="p-4 border-t border-border/80 bg-surface/60 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
          <div className="text-xs font-mono text-muted-foreground">
            {selectedIds.size > 0 ? (
              <span className="text-foreground font-semibold">
                {selectedIds.size} resource{selectedIds.size > 1 ? "s" : ""} selected for connection
              </span>
            ) : (
              <span>Select resources above to connect</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-mono flex-1 sm:flex-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={selectedIds.size === 0 || isSubmitting}
              className="text-xs font-mono font-semibold flex-1 sm:flex-none cursor-pointer bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? "Connecting..." : `Connect ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
