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
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AddQrSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignName: string;
  orgSlug: string;
  onAdded?: (addedCount: number) => void;
}

interface WorkspaceQr {
  id: string;
  name: string;
  slug: string;
  qrType: string;
  destinationUrl: string;
  campaignId?: string;
  campaignName?: string;
}

interface AddQrSheetContentProps {
  campaignId: string;
  campaignName: string;
  orgSlug: string;
  onClose: () => void;
  onAdded?: (addedCount: number) => void;
}

function AddQrSheetContent({
  campaignId,
  campaignName,
  orgSlug,
  onClose,
  onAdded,
}: AddQrSheetContentProps) {
  const [qrs, setQrs] = React.useState<WorkspaceQr[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch organization QRs on mount
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/qrs?limit=100", {
      headers: { "x-organization-slug": orgSlug },
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.data && Array.isArray(json.data)) {
          // Filter out QRs already in this campaign
          const filtered = (json.data as Array<{
            id: string;
            name?: string;
            slug?: string;
            qrType?: string;
            destinationUrl?: string;
            campaignId?: string;
            campaignName?: string;
          }>)
            .filter((q) => q.campaignId !== campaignId)
            .map((q) => ({
              id: q.id,
              name: q.name || "Untitled QR",
              slug: q.slug || "",
              qrType: q.qrType || "url",
              destinationUrl: q.destinationUrl || "",
              campaignId: q.campaignId,
              campaignName: q.campaignName,
            }));
          setQrs(filtered);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, orgSlug]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredQrs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQrs.map((q) => q.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/qrs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-slug": orgSlug,
        },
        body: JSON.stringify({ qrIds: Array.from(selectedIds) }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to add QR codes to campaign.");
      }

      toast.success("QR codes added", {
        description: `Added ${selectedIds.size} QR code${selectedIds.size === 1 ? "" : "s"} to ${campaignName}.`,
      });

      onClose();
      onAdded?.(selectedIds.size);
    } catch (err: unknown) {
      toast.error("Couldn't add QR codes", {
        description: err instanceof Error ? err.message : "Failed to add QR codes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQrs = qrs.filter(
    (q) =>
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.destinationUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <SheetHeader className="p-5 border-b border-border/60 text-left bg-surface">
          <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
            Campaign Asset Assignment
          </div>
          <SheetTitle className="text-base font-bold text-foreground">
            Add QR Codes to {campaignName}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Select existing workspace QR codes to group under this initiative.
          </SheetDescription>
        </SheetHeader>

        {/* Search and Select-All Bar */}
        <div className="p-4 border-b border-border/50 bg-surface-elevated/40 flex items-center gap-3">
          <div className="relative flex-1">
            <Icon
              icon="hugeicons:search-01"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by QR name or destination..."
              className="pl-8 h-8 text-xs bg-surface"
            />
          </div>
          {filteredQrs.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-8 px-2.5 shrink-0"
            >
              {selectedIds.size === filteredQrs.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>

        {/* QR List */}
        <ScrollArea className="h-[calc(100vh-250px)] p-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Icon icon="hugeicons:loading-03" className="w-5 h-5 animate-spin text-primary" />
              <span>Loading workspace QR codes…</span>
            </div>
          ) : filteredQrs.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No eligible QR codes available to add.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQrs.map((qr) => {
                const isChecked = selectedIds.has(qr.id);
                const isAssignedElsewhere = Boolean(qr.campaignId);

                return (
                  <label
                    key={qr.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/70 bg-surface hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleSelect(qr.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-xs text-foreground truncate">
                          {qr.name}
                        </div>
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-muted rounded-xs text-muted-foreground shrink-0">
                          {qr.qrType}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                        {qr.destinationUrl || qr.slug}
                      </div>

                      {/* Conflict Warning */}
                      {isAssignedElsewhere && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                          <Icon icon="hugeicons:alert-circle" className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            Currently in &ldquo;{qr.campaignName}&rdquo;. Moving will reassign it.
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Sticky Footer */}
      <SheetFooter className="p-4 border-t border-border/60 bg-surface flex flex-row items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs h-9 text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleAssign}
          disabled={isSubmitting || selectedIds.size === 0}
          className="bg-primary hover:bg-[#CC3A05] text-white text-xs h-9 px-5 gap-2 font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Icon icon="hugeicons:loading-03" className="w-3.5 h-3.5 animate-spin" />
              <span>Adding…</span>
            </>
          ) : (
            <span>Add {selectedIds.size} QR Code{selectedIds.size === 1 ? "" : "s"}</span>
          )}
        </Button>
      </SheetFooter>
    </div>
  );
}

export function AddQrSheet({
  open,
  onOpenChange,
  campaignId,
  campaignName,
  orgSlug,
  onAdded,
}: AddQrSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col justify-between">
        {open && (
          <AddQrSheetContent
            campaignId={campaignId}
            campaignName={campaignName}
            orgSlug={orgSlug}
            onClose={() => onOpenChange(false)}
            onAdded={onAdded}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
