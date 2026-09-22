"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AuditFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actors: Array<{ id: string; name: string; email?: string }>;
  actions: Array<{ code: string; label: string }>;
  resourceTypes: Array<{ type: string; label: string }>;
  currentFilters: {
    range: string;
    lens: string;
    actorId?: string;
    action?: string;
    resourceType?: string;
    result: string;
    myActions?: boolean;
    hasChanges?: boolean;
  };
  onApplyFilters: (filters: any) => void;
  onResetFilters: () => void;
}

export function AuditFilterSheet({
  isOpen,
  onClose,
  actors,
  actions,
  resourceTypes,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}: AuditFilterSheetProps) {
  const [range, setRange] = React.useState(currentFilters.range || "30d");
  const [lens, setLens] = React.useState(currentFilters.lens || "all");
  const [actorId, setActorId] = React.useState(currentFilters.actorId || "all");
  const [action, setAction] = React.useState(currentFilters.action || "all");
  const [resourceType, setResourceType] = React.useState(currentFilters.resourceType || "all");
  const [result, setResult] = React.useState(currentFilters.result || "all");
  const [myActions, setMyActions] = React.useState(currentFilters.myActions || false);
  const [hasChanges, setHasChanges] = React.useState(currentFilters.hasChanges || false);

  React.useEffect(() => {
    setRange(currentFilters.range || "30d");
    setLens(currentFilters.lens || "all");
    setActorId(currentFilters.actorId || "all");
    setAction(currentFilters.action || "all");
    setResourceType(currentFilters.resourceType || "all");
    setResult(currentFilters.result || "all");
    setMyActions(currentFilters.myActions || false);
    setHasChanges(currentFilters.hasChanges || false);
  }, [currentFilters, isOpen]);

  const handleApply = () => {
    onApplyFilters({
      range,
      lens,
      actorId: actorId !== "all" ? actorId : undefined,
      action: action !== "all" ? action : undefined,
      resourceType: resourceType !== "all" ? resourceType : undefined,
      result,
      myActions,
      hasChanges,
    });
    onClose();
  };

  const handleReset = () => {
    setRange("30d");
    setLens("all");
    setActorId("all");
    setAction("all");
    setResourceType("all");
    setResult("all");
    setMyActions(false);
    setHasChanges(false);
    onResetFilters();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-[#141414] border-l border-white/[0.08] text-[#F7F4EC] p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="text-left space-y-1.5 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Icon icon="solar:filter-bold" className="w-4 h-4 text-[#FA520F]" />
            <SheetTitle className="text-lg font-bold text-[#F7F4EC]">
              Filter Audit Logs
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-[#B8B5AD]">
            Isolate specific actors, time ranges, outcomes, and resource boundaries.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 text-xs">
          {/* Time Window */}
          <div className="space-y-1.5">
            <label className="font-mono text-[#85827B] uppercase font-semibold text-[10px]">
              Time Window
            </label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="Select range..." />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="24h">Past 24 Hours</SelectItem>
                <SelectItem value="7d">Past 7 Days</SelectItem>
                <SelectItem value="30d">Past 30 Days</SelectItem>
                <SelectItem value="90d">Past 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actor */}
          <div className="space-y-1.5">
            <label className="font-mono text-[#85827B] uppercase font-semibold text-[10px]">
              Initiating Actor
            </label>
            <Select value={actorId} onValueChange={setActorId}>
              <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="All Actors" />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectItem value="all">All Actors</SelectItem>
                {actors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} {a.email ? `(${a.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Category */}
          <div className="space-y-1.5">
            <label className="font-mono text-[#85827B] uppercase font-semibold text-[10px]">
              Category Lens
            </label>
            <Select value={lens} onValueChange={setLens}>
              <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="access">Access & Roles</SelectItem>
                <SelectItem value="content">QR & Content</SelectItem>
                <SelectItem value="infrastructure">Domains & Infrastructure</SelectItem>
                <SelectItem value="billing">Billing & Plans</SelectItem>
                <SelectItem value="developer">Developer & API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Result */}
          <div className="space-y-1.5">
            <label className="font-mono text-[#85827B] uppercase font-semibold text-[10px]">
              Operation Result
            </label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resource Type */}
          {resourceTypes.length > 0 && (
            <div className="space-y-1.5">
              <label className="font-mono text-[#85827B] uppercase font-semibold text-[10px]">
                Resource Type
              </label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                  <SelectValue placeholder="All Resource Types" />
                </SelectTrigger>
                <SelectContent className="bg-[#191919] border-white/[0.1] text-xs text-[#F7F4EC]">
                  <SelectItem value="all">All Types</SelectItem>
                  {resourceTypes.map((rt) => (
                    <SelectItem key={rt.type} value={rt.type}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quick Checkboxes */}
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={myActions} onCheckedChange={(c) => setMyActions(Boolean(c))} />
              <span>Show only actions initiated by me</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={hasChanges} onCheckedChange={(c) => setHasChanges(Boolean(c))} />
              <span>Show only events with state changes (diffs)</span>
            </label>
          </div>
        </div>

        <SheetFooter className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[#85827B] hover:text-[#F7F4EC]"
          >
            Reset
          </Button>

          <Button
            size="sm"
            onClick={handleApply}
            className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
