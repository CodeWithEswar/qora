"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamMark } from "./team-mark";
import type { TeamSummary, TeamResourceType } from "@/lib/supabase/types/teams";
import { Search, Link2, QrCode, Sparkles, Folder, Globe, Palette, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectWorkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamSummary | null;
  organizationSlug: string;
  onConnect: (
    teamId: string,
    resources: Array<{ resourceType: string; resourceId: string }>
  ) => Promise<void>;
}

interface AvailableResource {
  id: string;
  type: TeamResourceType;
  title: string;
  ref: string;
  subtitle?: string;
}

export function ConnectWorkDialog({
  isOpen,
  onClose,
  team,
  organizationSlug,
  onConnect,
}: ConnectWorkDialogProps) {
  const [activeTab, setActiveTab] = React.useState<TeamResourceType | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [availableResources, setAvailableResources] = React.useState<AvailableResource[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch real workspace resources (QR codes, campaigns, brand kits, domains)
  React.useEffect(() => {
    if (!isOpen || !team) return;

    let isMounted = true;
    setLoading(true);
    setSelectedIds([]);
    setSearchQuery("");

    // Query active workspace resources
    Promise.allSettled([
      fetch(`/api/v1/organizations/${organizationSlug}/qrs`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/organizations/${organizationSlug}/campaigns`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/organizations/${organizationSlug}/brand-kits`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([qrsResult, cmpResult, bkResult]) => {
      if (!isMounted) return;

      const items: AvailableResource[] = [];

      if (qrsResult.status === "fulfilled" && qrsResult.value?.data) {
        (qrsResult.value.data as any[]).forEach((qr) => {
          items.push({
            id: qr.id,
            type: "qr_code",
            title: qr.name || "Untitled QR",
            ref: `QR-${qr.slug?.slice(0, 6)?.toUpperCase() || "CODE"}`,
            subtitle: qr.qr_type?.toUpperCase() || "DYNAMIC",
          });
        });
      }

      if (cmpResult.status === "fulfilled" && cmpResult.value?.data) {
        (cmpResult.value.data as any[]).forEach((c) => {
          items.push({
            id: c.id,
            type: "campaign",
            title: c.name || "Untitled Campaign",
            ref: `CMP-${c.id.slice(0, 4).toUpperCase()}`,
            subtitle: "Campaign",
          });
        });
      }

      if (bkResult.status === "fulfilled" && bkResult.value?.data) {
        const bkData = bkResult.value.data;
        const brandKits = Array.isArray(bkData) ? bkData : (bkData as any)?.items || [];
        (brandKits as any[]).forEach((bk) => {
          items.push({
            id: bk.id,
            type: "brand_kit",
            title: bk.name || "Brand Kit",
            ref: `BK-${bk.id?.slice(0, 4)?.toUpperCase() || "KIT"}`,
            subtitle: "Brand Identity",
          });
        });
      }

      setAvailableResources(items);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, team, organizationSlug]);

  if (!team) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredResources = availableResources.filter((r) => {
    if (activeTab !== "all" && r.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.ref.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConnect = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = selectedIds.map((id) => {
        const item = availableResources.find((r) => r.id === id);
        return {
          resourceType: item?.type || "qr_code",
          resourceId: id,
        };
      });

      await onConnect(team.id, payload);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: TeamResourceType) => {
    switch (type) {
      case "qr_code":
        return <QrCode className="h-3.5 w-3.5 text-primary" />;
      case "campaign":
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case "brand_kit":
        return <Palette className="h-3.5 w-3.5 text-teal-500" />;
      case "domain":
        return <Globe className="h-3.5 w-3.5 text-blue-500" />;
      case "folder":
        return <Folder className="h-3.5 w-3.5 text-indigo-500" />;
      case "template":
        return <Layers className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <Link2 className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl font-mono text-xs bg-background border-border">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-semibold">
            <span>COLLABORATE</span>
            <span>/</span>
            <span className="text-foreground">CONNECT WORK</span>
          </div>

          <DialogTitle className="text-lg font-bold text-foreground font-sans">
            Connect Work to &quot;{team.name}&quot;
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Explicitly assign QR codes, campaigns, and brand assets to establish clear team ownership without altering resource access schemas.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Category Filter */}
        <div className="space-y-2 select-none">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search active resources by name, slug, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-8 text-xs bg-surface font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 h-4 w-4 rounded text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1 min-w-0 w-full">
            {(["all", "qr_code", "campaign", "brand_kit"] as const).map((cat) => {
              const count =
                cat === "all"
                  ? availableResources.length
                  : availableResources.filter((r) => r.type === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5",
                    activeTab === cat
                      ? "bg-primary text-white font-bold"
                      : "bg-surface border border-border/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{cat === "all" ? "All" : cat.replace("_", " ")}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1 rounded",
                      activeTab === cat
                        ? "bg-white/20 text-white font-bold"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Selection Roster */}
        <div className="border border-border/80 rounded-lg overflow-hidden bg-surface/50 max-h-60 overflow-y-auto divide-y divide-border/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading workspace resources...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <div className="text-foreground font-semibold text-xs">No resources found</div>
              <p className="text-[11px] text-muted-foreground font-sans">
                No active resources match your filter criteria.
              </p>
            </div>
          ) : (
            filteredResources.map((item) => {
              const isChecked = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className="p-2.5 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox checked={isChecked} />
                    <div className="p-1 rounded bg-muted/60 border border-border/60 shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-foreground font-bold text-xs truncate font-sans">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.ref} {item.subtitle && `· ${item.subtitle}`}
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0">
                    {item.type.replace("_", " ")}
                  </Badge>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-8 font-mono"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConnect}
            disabled={isSubmitting || selectedIds.length === 0}
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-white font-mono font-semibold"
          >
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            <span>
              {isSubmitting
                ? "Connecting..."
                : `Connect ${selectedIds.length} ${selectedIds.length === 1 ? "resource" : "resources"}`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
