"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import type { ActivityFilterState } from "@/lib/supabase/types/activity";

interface ExportActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  filters: ActivityFilterState;
  estimatedCount?: number;
}

export function ExportActivityDialog({
  open,
  onOpenChange,
  orgSlug,
  filters,
  estimatedCount = 0,
}: ExportActivityDialogProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Activity export started...", {
      description: "Generating structured CSV from authoritative backend records.",
    });

    try {
      const params = new URLSearchParams();
      if (filters.range) params.set("range", filters.range);
      if (filters.category) params.set("category", filters.category);
      if (filters.resourceType) params.set("resourceType", filters.resourceType);
      if (filters.actorId) params.set("actorId", filters.actorId);

      const response = await fetch(
        `/api/v1/organizations/${orgSlug}/activity/export?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const dateTag = new Date().toISOString().substring(0, 10);
      link.download = `nxtqr-activity-${orgSlug}-${dateTag}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Activity export ready.", {
        id: toastId,
        description: `Downloaded records matching current filters.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error("[ExportActivityDialog] Error exporting activity:", err);
      toast.error("Export could not be created.", {
        id: toastId,
        description: err?.message || "An unexpected error occurred during export.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const fields = [
    "Timestamp (UTC)",
    "Event ID",
    "Category",
    "Action Verb",
    "Actor Type",
    "Actor Name",
    "Actor Email",
    "Resource Type",
    "Resource ID",
    "Resource Name Snapshot",
    "Revision Identifier",
    "Team Scope",
    "Metadata Summary",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#111111] border-white/10 text-[#F7F4EC]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-md bg-[#FA520F]/10 border border-[#FA520F]/30 flex items-center justify-center text-[#FA520F]">
              <Icon icon="solar:export-bold-duotone" className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-semibold tracking-tight text-[#F7F4EC]">
              Export Activity
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#85827B]">
            Download a structured CSV export of operational events matching your active filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Active Scope Card */}
          <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02] space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#85827B]">
              Active Export Scope
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant="outline" className="text-[11px] font-mono border-white/10 text-[#B8B5AD] bg-white/[0.03]">
                Range: {filters.range?.toUpperCase() || "30D"}
              </Badge>
              {filters.category && (
                <Badge variant="outline" className="text-[11px] font-mono border-white/10 text-[#FA520F] bg-[#FA520F]/10">
                  Category: {filters.category}
                </Badge>
              )}
              {filters.resourceType && (
                <Badge variant="outline" className="text-[11px] font-mono border-white/10 text-[#FFB83E] bg-[#FFB83E]/10">
                  Resource: {filters.resourceType}
                </Badge>
              )}
              {filters.actorId && (
                <Badge variant="outline" className="text-[11px] font-mono border-white/10 text-emerald-400 bg-emerald-500/10">
                  Actor Filtered
                </Badge>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#85827B]">
              <span>Estimated qualifying events:</span>
              <span className="font-mono font-semibold text-[#F7F4EC]">{estimatedCount}</span>
            </div>
          </div>

          {/* Export Fields Preview */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#85827B]">
              Included Data Columns (CSV)
            </div>
            <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02] flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {fields.map((field) => (
                <span
                  key={field}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-[#B8B5AD] border border-white/5"
                >
                  {field}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[#85827B] italic">
              Security Note: Internal secrets, bearer tokens, IP addresses, and cross-tenant data are strictly excluded.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
            className="text-xs text-[#85827B] hover:text-[#F7F4EC] hover:bg-white/5 font-mono"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-xs font-mono bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-medium gap-1.5 shadow-lg shadow-[#FA520F]/20"
          >
            {isExporting ? (
              <>
                <Icon icon="solar:spinner-line-duotone" className="h-3.5 w-3.5 animate-spin" />
                <span>Generating CSV...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:download-minimalistic-bold" className="h-3.5 w-3.5" />
                <span>Create Export</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
