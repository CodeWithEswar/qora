"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, RotateCcw } from "lucide-react";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCountries: string[];
  availableDevices: string[];
  availableQrs: Array<{ id: string; name: string }>;
  currentFilters: {
    country?: string;
    device?: string;
    qrId?: string;
    trafficQuality?: string;
  };
  onApplyFilters: (filters: { country?: string; device?: string; qrId?: string; trafficQuality?: string }) => void;
  onResetFilters: () => void;
}

export function AnalyticsFilterDrawer({
  open,
  onOpenChange,
  availableCountries = [],
  availableDevices = [],
  availableQrs = [],
  currentFilters,
  onApplyFilters,
  onResetFilters,
}: FilterDrawerProps) {
  const [country, setCountry] = React.useState(currentFilters.country || "ALL");
  const [device, setDevice] = React.useState(currentFilters.device || "ALL");
  const [qrId, setQrId] = React.useState(currentFilters.qrId || "ALL");
  const [trafficQuality, setTrafficQuality] = React.useState(currentFilters.trafficQuality || "ALL");

  React.useEffect(() => {
    setCountry(currentFilters.country || "ALL");
    setDevice(currentFilters.device || "ALL");
    setQrId(currentFilters.qrId || "ALL");
    setTrafficQuality(currentFilters.trafficQuality || "ALL");
  }, [currentFilters, open]);

  const handleApply = () => {
    onApplyFilters({
      country: country && country !== "ALL" ? country : undefined,
      device: device && device !== "ALL" ? device : undefined,
      qrId: qrId && qrId !== "ALL" ? qrId : undefined,
      trafficQuality: trafficQuality && trafficQuality !== "ALL" ? trafficQuality : undefined,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setCountry("ALL");
    setDevice("ALL");
    setQrId("ALL");
    setTrafficQuality("ALL");
    onResetFilters();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card border-border text-card-foreground p-6 flex flex-col justify-between shadow-2xl"
      >
        <div className="space-y-6">
          <SheetHeader className="text-left border-b border-border pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                TELEMETRY FILTERS
              </span>
            </div>
            <SheetTitle className="font-serif text-2xl font-normal text-foreground">
              Filter Analytics
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Refine workspace telemetry across geographic, device, and asset dimensions.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 text-xs font-mono">
            {/* Country Selector */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                Origin Country (ISO)
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground shadow-2xl font-mono text-xs z-[100]">
                  <SelectItem value="ALL" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    All Regions
                  </SelectItem>
                  {availableCountries.map((c) => (
                    <SelectItem key={c} value={c} className="focus:bg-muted focus:text-foreground cursor-pointer">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Class Selector */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                Device Form Factor
              </label>
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono">
                  <SelectValue placeholder="All Device Classes" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground shadow-2xl font-mono text-xs z-[100]">
                  <SelectItem value="ALL" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    All Device Classes
                  </SelectItem>
                  <SelectItem value="mobile" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Mobile
                  </SelectItem>
                  <SelectItem value="desktop" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Desktop
                  </SelectItem>
                  <SelectItem value="tablet" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Tablet
                  </SelectItem>
                  <SelectItem value="other" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* QR Asset Selector */}
            {availableQrs.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  Specific QR Code
                </label>
                <Select value={qrId} onValueChange={setQrId}>
                  <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono">
                    <SelectValue placeholder="All QR Assets" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover text-popover-foreground shadow-2xl font-mono text-xs z-[100] max-h-60">
                    <SelectItem value="ALL" className="focus:bg-muted focus:text-foreground cursor-pointer">
                      All QR Assets
                    </SelectItem>
                    {availableQrs.map((q) => (
                      <SelectItem key={q.id} value={q.id} className="focus:bg-muted focus:text-foreground cursor-pointer">
                        {q.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Traffic Quality Filter */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                Traffic Quality Tier
              </label>
              <Select value={trafficQuality} onValueChange={setTrafficQuality}>
                <SelectTrigger className="w-full h-10 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono">
                  <SelectValue placeholder="All Quality Classes" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground shadow-2xl font-mono text-xs z-[100]">
                  <SelectItem value="ALL" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    All Quality Classes
                  </SelectItem>
                  <SelectItem value="NORMAL" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Normal Traffic
                  </SelectItem>
                  <SelectItem value="SUSPECTED_AUTOMATION" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Suspected Automation
                  </SelectItem>
                  <SelectItem value="BLOCKED" className="focus:bg-muted focus:text-foreground cursor-pointer">
                    Blocked Requests
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="pt-4 border-t border-border flex items-center justify-between gap-3 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            onClick={handleApply}
            className="text-xs bg-primary hover:bg-[#cc3a05] text-white gap-1.5 shadow-xs px-5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Apply Filters</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
