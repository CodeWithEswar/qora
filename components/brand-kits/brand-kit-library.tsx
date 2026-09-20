"use client";

import * as React from "react";
import { BrandKitSummaryV1 } from "@nxtqr/contracts";
import {
  Search,
  MoreVertical,
  Star,
  Copy,
  Archive,
  Trash2,
  Edit2,
  CheckCircle2,
  Palette,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrandKitLibraryProps {
  kits: BrandKitSummaryV1[];
  selectedKitId: string | null;
  onSelectKit: (kitId: string) => void;
  onSetDefault: (kitId: string) => void;
  onDuplicate: (kit: BrandKitSummaryV1) => void;
  onRename: (kit: BrandKitSummaryV1) => void;
  onArchive: (kit: BrandKitSummaryV1) => void;
  onDelete: (kit: BrandKitSummaryV1) => void;
  statusFilter: "all" | "active" | "archived";
  onChangeStatusFilter: (status: "all" | "active" | "archived") => void;
}

export function BrandKitLibrary({
  kits,
  selectedKitId,
  onSelectKit,
  onSetDefault,
  onDuplicate,
  onRename,
  onArchive,
  onDelete,
  statusFilter,
  onChangeStatusFilter,
}: BrandKitLibraryProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredKits = React.useMemo(() => {
    return kits.filter((k) => {
      // Status filter
      if (statusFilter === "active" && k.status !== "ACTIVE") return false;
      if (statusFilter === "archived" && k.status !== "ARCHIVED") return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        k.name.toLowerCase().includes(q) ||
        k.slug.toLowerCase().includes(q) ||
        (k.description && k.description.toLowerCase().includes(q))
      );
    });
  }, [kits, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/80 bg-surface/40 backdrop-blur-sm overflow-hidden">
      {/* Header & Search */}
      <div className="p-3.5 space-y-2.5 border-b border-border/70 bg-surface-elevated/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#FA520F]" />
            <span className="text-xs font-bold tracking-wider uppercase text-foreground">
              BRAND KITS
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-surface border border-border/60">
            {filteredKits.length} {filteredKits.length === 1 ? "kit" : "kits"}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kits..."
            className="pl-8 h-8 text-xs bg-surface border-border focus-visible:ring-1 focus-visible:ring-[#FA520F]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-surface border border-border/60 text-[11px]">
          {(["active", "all", "archived"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChangeStatusFilter(status)}
              className={cn(
                "py-1 px-2 text-center font-medium capitalize rounded-md transition-colors cursor-pointer",
                statusFilter === status
                  ? "bg-surface-elevated text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Kit Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-border/20">
        {filteredKits.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {searchQuery
              ? "No brand kits match your search."
              : statusFilter === "archived"
              ? "No archived brand kits."
              : "No brand kits found."}
          </div>
        ) : (
          filteredKits.map((kit) => {
            const isSelected = kit.id === selectedKitId;

            return (
              <div
                key={kit.id}
                onClick={() => onSelectKit(kit.id)}
                className={cn(
                  "group relative p-3 rounded-lg border transition-all cursor-pointer select-none",
                  isSelected
                    ? "border-[#FA520F]/60 bg-[#FA520F]/5 shadow-xs"
                    : "border-transparent hover:border-border hover:bg-surface-elevated/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Primary Color Swatch or Logo */}
                    <div
                      className="w-8 h-8 rounded-md shrink-0 border border-border flex items-center justify-center font-bold text-xs shadow-2xs overflow-hidden"
                      style={{ backgroundColor: kit.primaryColor }}
                    >
                      {kit.logoUrl ? (
                        <img
                          src={kit.logoUrl}
                          alt={kit.name}
                          className="w-full h-full object-contain p-0.5 bg-white/90"
                        />
                      ) : (
                        <span className="text-white drop-shadow-xs font-mono">
                          {kit.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground truncate block">
                          {kit.name}
                        </span>
                        {kit.isDefault && (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[9px] font-semibold bg-[#FA520F]/15 text-[#FA520F] border border-[#FA520F]/20"
                          >
                            Default
                          </Badge>
                        )}
                        {kit.status === "ARCHIVED" && (
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[9px] text-muted-foreground"
                          >
                            Archived
                          </Badge>
                        )}
                      </div>

                      {kit.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {kit.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono pt-0.5">
                        <span>Rev {kit.publishedRevision}</span>
                        <span>•</span>
                        <span>{kit.qrCount} QRs</span>
                      </div>
                    </div>
                  </div>

                  {/* Overflow Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuItem onClick={() => onSelectKit(kit.id)}>
                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                        <span>Open Workspace</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onRename(kit)}>
                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                        <span>Rename</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onDuplicate(kit)}>
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>

                      {!kit.isDefault && kit.status !== "ARCHIVED" && (
                        <DropdownMenuItem onClick={() => onSetDefault(kit.id)}>
                          <Star className="h-3.5 w-3.5 mr-2 text-[#FA520F]" />
                          <span>Set as Default</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {kit.status !== "ARCHIVED" ? (
                        <DropdownMenuItem
                          onClick={() => onArchive(kit)}
                          className="text-amber-500 focus:text-amber-500"
                        >
                          <Archive className="h-3.5 w-3.5 mr-2" />
                          <span>Archive Kit</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onDelete(kit)}
                          className="text-rose-500 focus:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Delete Permanently</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
