"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export interface InspectorDatum {
  type: "country" | "device" | "rule" | "destination" | "qr";
  id: string;
  name: string;
  scans?: number;
  share?: number;
  devices?: Array<{ name: string; percentage: number }>;
  topQr?: string;
  topRoute?: string;
  destinationUrl?: string;
}

interface SignalInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datum: InspectorDatum | null;
  rangeLabel?: string;
  onFilterDashboard: (type: string, id: string) => void;
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function SignalInspector({
  open,
  onOpenChange,
  datum,
  rangeLabel = "Active Window",
  onFilterDashboard,
  isFiltered = false,
  onClearFilter,
}: SignalInspectorProps) {
  if (!datum) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card border-border text-card-foreground p-6 flex flex-col justify-between shadow-2xl"
      >
        <div className="space-y-6">
          <SheetHeader className="text-left border-b border-border pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                SIGNAL INSPECTOR · {datum.type.toUpperCase()}
              </span>
            </div>
            <SheetTitle className="font-serif text-2xl font-normal text-foreground">
              {datum.name}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Analytical breakdown in {rangeLabel}
            </SheetDescription>
          </SheetHeader>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-xl border border-border bg-muted/40">
              <span className="text-[10px] text-muted-foreground uppercase block font-semibold">TOTAL SCANS</span>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {datum.scans !== undefined ? datum.scans.toLocaleString() : "—"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-muted/40">
              <span className="text-[10px] text-muted-foreground uppercase block font-semibold">TRAFFIC SHARE</span>
              <span className="text-2xl font-bold text-amber-500 tabular-nums">
                {datum.share !== undefined ? `${datum.share}%` : "—"}
              </span>
            </div>
          </div>

          {/* Context Details */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/40 text-xs">
            <h5 className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Telemetry Context
            </h5>

            {datum.topQr && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Top QR Asset:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">{datum.topQr}</span>
              </div>
            )}

            {datum.topRoute && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Route:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">{datum.topRoute}</span>
              </div>
            )}

            {datum.destinationUrl && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-mono text-[10px] text-primary truncate max-w-[200px]">
                  {datum.destinationUrl}
                </span>
              </div>
            )}

            {datum.devices && datum.devices.length > 0 && (
              <div className="pt-2 border-t border-border space-y-1.5">
                <span className="text-[10px] font-mono text-muted-foreground block font-semibold">
                  DEVICE BREAKDOWN
                </span>
                {datum.devices.map((d) => (
                  <div key={d.name} className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground capitalize">{d.name}</span>
                    <span className="text-foreground font-semibold">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border flex items-center gap-3">
          {isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClearFilter?.();
                onOpenChange(false);
              }}
              className="flex-1 text-xs border-border bg-card hover:bg-muted text-foreground gap-1.5 shadow-xs"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filter</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                onFilterDashboard(datum.type, datum.id);
                onOpenChange(false);
              }}
              className="flex-1 text-xs bg-primary hover:bg-[#cc3a05] text-white gap-1.5 shadow-xs"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Dashboard by {datum.name}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
