"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BulkRowValidationResult, BulkRowPayload } from "@/lib/domains/bulk-qr";
import { QrType } from "@nxtqr/qr-core";

interface RowInspectorSheetProps {
  isOpen: boolean;
  rowResult: BulkRowValidationResult | null;
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSaveRow: (rowNumber: number, updatedPayload: BulkRowPayload) => void;
}

export function RowInspectorSheet({
  isOpen,
  rowResult,
  campaigns = [],
  folders = [],
  onClose,
  onSaveRow,
}: RowInspectorSheetProps) {
  const [formData, setFormData] = useState<BulkRowPayload>({
    name: "",
    qr_type: "url",
    destination_url: "",
  });

  useEffect(() => {
    if (rowResult) {
      setFormData({ ...rowResult.row });
    }
  }, [rowResult]);

  if (!rowResult) return null;

  const handleSave = () => {
    onSaveRow(rowResult.rowNumber, formData);
  };

  const isBlocked = rowResult.validationStatus === "BLOCKED";
  const isWarning = rowResult.validationStatus === "WARNING";
  const isReady = rowResult.validationStatus === "READY";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-surface border-border text-foreground p-0 flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-surface-elevated/40">
          <SheetHeader>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                Row #{String(rowResult.rowNumber).padStart(2, "0")} Inspector
              </span>
              <Badge
                variant="outline"
                className={`text-xs font-mono px-2 py-0.5 ${
                  isReady
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : isWarning
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    : "border-red-500/40 bg-red-500/10 text-red-400"
                }`}
              >
                {rowResult.validationStatus}
              </Badge>
            </div>
            <SheetTitle className="text-lg font-bold text-neutral-100 font-serif">
              {rowResult.row.name || "Untitled Asset"}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400">
              Audit validation diagnostics or make inline corrections before batch creation.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Validation Diagnostics */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Icon icon="lucide:stethoscope" className="w-3.5 h-3.5 text-orange-500" />
              Preflight Diagnostics
            </h4>
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                isReady
                  ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                  : isWarning
                  ? "border-amber-500/30 bg-amber-950/20 text-amber-300"
                  : "border-red-500/30 bg-red-950/20 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <Icon
                  icon={
                    isReady
                      ? "lucide:check-circle"
                      : isWarning
                      ? "lucide:alert-triangle"
                      : "lucide:x-circle"
                  }
                  className="w-4 h-4 flex-shrink-0"
                />
                <span>
                  {isReady
                    ? "Passed all QR Core validation criteria."
                    : isWarning
                    ? "Scanability alert: QR may have reduced legibility."
                    : "Creation blocked: Missing or invalid payload."}
                </span>
              </div>

              {rowResult.errors.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-300">
                  {rowResult.errors.map((err, i) => (
                    <li key={i}>{err.message}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Scanability score if available */}
            {rowResult.scanabilityScore !== undefined && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-neutral-900/60 text-xs">
                <span className="text-neutral-400">Scanability Index</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        rowResult.scanabilityScore >= 80
                          ? "bg-emerald-500"
                          : rowResult.scanabilityScore >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${rowResult.scanabilityScore}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-neutral-200">
                    {rowResult.scanabilityScore}/100
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Inline Correction Form */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Icon icon="lucide:pencil" className="w-3.5 h-3.5 text-orange-500" />
              Inline Correction
            </h4>

            {/* Field: Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                QR Asset Name *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Asset title"
                className="bg-neutral-900 border-white/10 text-xs h-9"
              />
            </div>

            {/* Field: Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                QR Type
              </label>
              <Select
                value={formData.qr_type}
                onValueChange={(val: QrType) =>
                  setFormData((prev) => ({ ...prev, qr_type: val }))
                }
              >
                <SelectTrigger className="bg-neutral-900 border-white/10 text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-neutral-200">
                  <SelectItem value="url">Website / URL</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                  <SelectItem value="wifi">Wi-Fi</SelectItem>
                  <SelectItem value="vcard">Contact vCard</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field: Destination URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Destination URL / Payload *
              </label>
              <Input
                value={formData.destination_url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, destination_url: e.target.value }))
                }
                placeholder="https://example.com"
                className="bg-neutral-900 border-white/10 font-mono text-xs h-9"
              />
            </div>

            {/* Field: Campaign */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Assigned Campaign
              </label>
              <Select
                value={formData.campaign_id || "none"}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    campaign_id: val === "none" ? undefined : val,
                  }))
                }
              >
                <SelectTrigger className="bg-neutral-900 border-white/10 text-xs h-9">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-neutral-200">
                  <SelectItem value="none">None</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field: Folder */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Assigned Folder
              </label>
              <Select
                value={formData.folder_id || "none"}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    folder_id: val === "none" ? undefined : val,
                  }))
                }
              >
                <SelectTrigger className="bg-neutral-900 border-white/10 text-xs h-9">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-neutral-200">
                  <SelectItem value="none">None</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-900/50 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/10 text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium"
          >
            <Icon icon="lucide:check" className="w-3.5 h-3.5 mr-1.5" />
            Save & Revalidate
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
