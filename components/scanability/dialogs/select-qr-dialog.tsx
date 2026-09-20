"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Check, QrCode, Sparkles, X } from "lucide-react";
import { ScanabilityQrRecord } from "../types";

interface SelectQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrs: ScanabilityQrRecord[];
  selectedQrId?: string;
  onSelectQr: (qr: ScanabilityQrRecord) => void;
}

export function SelectQrDialog({
  open,
  onOpenChange,
  qrs,
  selectedQrId,
  onSelectQr,
}: SelectQrDialogProps) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "dynamic" | "static">("all");

  const filteredQrs = React.useMemo(() => {
    return qrs.filter((qr) => {
      const matchesSearch =
        qr.name.toLowerCase().includes(search.toLowerCase()) ||
        qr.slug.toLowerCase().includes(search.toLowerCase()) ||
        (qr.defaultUrl && qr.defaultUrl.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (filter === "dynamic") return qr.isDynamic;
      if (filter === "static") return !qr.isDynamic;
      return true;
    });
  }, [qrs, search, filter]);

  const handleSelect = (qr: ScanabilityQrRecord) => {
    onSelectQr(qr);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="p-5 border-b border-border">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span>Select QR Code for Engineering Validation</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Choose an active QR asset to inspect its geometry, contrast, and print conditions.
          </DialogDescription>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by QR name, slug, or destination..."
              className="pl-9 pr-8 h-9 text-xs bg-muted/50 border-border rounded-xl"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/50">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ALL ({qrs.length})
            </button>
            <button
              onClick={() => setFilter("dynamic")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                filter === "dynamic"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              DYNAMIC ({qrs.filter((q) => q.isDynamic).length})
            </button>
            <button
              onClick={() => setFilter("static")}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                filter === "static"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              STATIC ({qrs.filter((q) => !q.isDynamic).length})
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredQrs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-mono">
              NO QR CODES MATCHING &quot;{search}&quot;
            </div>
          ) : (
            filteredQrs.map((qr) => {
              const isSelected = qr.id === selectedQrId;
              return (
                <button
                  key={qr.id}
                  onClick={() => handleSelect(qr)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-accent/10 border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {qr.name}
                      </span>
                      {qr.isDynamic ? (
                        <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 font-bold">
                          DYNAMIC
                        </span>
                      ) : (
                        <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          STATIC
                        </span>
                      )}
                      <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        EC-{qr.design?.errorCorrection || "Q"}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      /{qr.slug} &bull; {qr.defaultUrl}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        SELECT
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
