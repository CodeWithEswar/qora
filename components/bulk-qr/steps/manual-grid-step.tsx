"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrType } from "@nxtqr/qr-core";
import { BulkRowPayload } from "@/lib/domains/bulk-qr";
import { EmptyState } from "@/components/empty-state";

interface ManualGridStepProps {
  initialRows?: Partial<BulkRowPayload>[];
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
  onBack: () => void;
  onProceed: (rows: BulkRowPayload[]) => void;
}

const SUPPORTED_TYPES: { value: QrType; label: string; icon: string }[] = [
  { value: "url", label: "Website / URL", icon: "lucide:globe" },
  { value: "text", label: "Plain Text", icon: "lucide:file-text" },
  { value: "wifi", label: "Wi-Fi Network", icon: "lucide:wifi" },
  { value: "vcard", label: "Contact (vCard)", icon: "lucide:contact" },
  { value: "email", label: "Email Message", icon: "lucide:mail" },
  { value: "phone", label: "Phone Number", icon: "lucide:phone" },
  { value: "sms", label: "SMS Message", icon: "lucide:message-square" },
];

export function ManualGridStep({
  initialRows = [],
  campaigns = [],
  folders = [],
  onBack,
  onProceed,
}: ManualGridStepProps) {
  const [rows, setRows] = useState<Partial<BulkRowPayload>[]>(() => {
    if (initialRows.length > 0) return initialRows;
    return [
      { name: "Website 1", qr_type: "url", destination_url: "https://" },
      { name: "Website 2", qr_type: "url", destination_url: "https://" },
      { name: "Website 3", qr_type: "url", destination_url: "https://" },
    ];
  });

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        name: `QR Asset ${prev.length + 1}`,
        qr_type: "url",
        destination_url: "https://",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDuplicateRow = (index: number) => {
    setRows((prev) => {
      const target = prev[index];
      const copy = { ...target, name: `${target.name || "QR"} (Copy)` };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleFieldChange = (
    index: number,
    field: keyof BulkRowPayload,
    value: any
  ) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleComplete = () => {
    const validRows: BulkRowPayload[] = rows
      .filter((r) => r.name?.trim() || r.destination_url?.trim() || r.content)
      .map((r) => ({
        name: r.name?.trim() || "Untitled QR",
        qr_type: (r.qr_type as QrType) || "url",
        destination_url: r.destination_url?.trim() || "",
        content: r.content || {},
        campaign_id: r.campaign_id,
        folder_id: r.folder_id,
        custom_slug: r.custom_slug?.trim() || undefined,
      }));

    if (validRows.length === 0) {
      return;
    }

    onProceed(validRows);
  };

  return (
    <div className="space-y-6">
      {/* Header ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <Icon icon="lucide:grid" className="w-5 h-5 text-orange-500" />
            Manual Batch Entry Grid
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Directly configure records in-app. Each row will be normalized and validated against QR Core.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            className="border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-neutral-200"
          >
            <Icon icon="lucide:plus" className="w-4 h-4 mr-1 text-orange-500" />
            Add Row
          </Button>
          <div className="text-xs font-mono text-neutral-400 px-2 py-1 rounded bg-neutral-800/80 border border-white/5">
            {rows.length} {rows.length === 1 ? "Row" : "Rows"}
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="rounded-xl border border-border/80 bg-surface/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider font-mono text-[10px] border-b border-border/80">
              <tr>
                <th className="px-3 py-3 w-12 text-center">#</th>
                <th className="px-3 py-3 min-w-[180px]">QR Name *</th>
                <th className="px-3 py-3 min-w-[150px]">Type</th>
                <th className="px-3 py-3 min-w-[260px]">Destination / Content *</th>
                <th className="px-3 py-3 min-w-[140px]">Campaign</th>
                <th className="px-3 py-3 min-w-[140px]">Folder</th>
                <th className="px-3 py-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <EmptyState
                      variant="table"
                      title="No manual rows entered"
                      description="Add your first record row to start building your bulk QR dataset."
                      letter="B"
                      action={{
                        label: "Add Row",
                        onClick: handleAddRow,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                  <td className="px-3 py-2 text-center font-mono text-neutral-500 text-[11px]">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.name || ""}
                      onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      placeholder="e.g. Summer Promo QR"
                      className="h-8 text-xs bg-neutral-900/80 border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={row.qr_type || "url"}
                      onValueChange={(val) => handleFieldChange(index, "qr_type", val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-neutral-900/80 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-white/10 text-neutral-200">
                        {SUPPORTED_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            <span className="flex items-center gap-1.5">
                              <Icon icon={t.icon} className="w-3.5 h-3.5 text-neutral-400" />
                              {t.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.destination_url || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "destination_url", e.target.value)
                      }
                      placeholder={
                        row.qr_type === "wifi"
                          ? "SSID:NetworkName;T:WPA;P:Password;;"
                          : row.qr_type === "phone"
                          ? "+1234567890"
                          : "https://example.com/target"
                      }
                      className="h-8 text-xs font-mono bg-neutral-900/80 border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={row.campaign_id || "none"}
                      onValueChange={(val) =>
                        handleFieldChange(
                          index,
                          "campaign_id",
                          val === "none" ? undefined : val
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-neutral-900/80 border-white/10">
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
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={row.folder_id || "none"}
                      onValueChange={(val) =>
                        handleFieldChange(
                          index,
                          "folder_id",
                          val === "none" ? undefined : val
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-neutral-900/80 border-white/10">
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
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(index)}
                        title="Duplicate row"
                        className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-white/5 rounded"
                      >
                        <Icon icon="lucide:copy" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        disabled={rows.length <= 1}
                        title="Delete row"
                        className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-white/10 hover:bg-neutral-800 text-neutral-300"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back to Source
        </Button>
        <Button
          type="button"
          onClick={handleComplete}
          disabled={rows.length === 0}
          className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 font-medium"
        >
          Proceed to Validation Gate
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
