"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnMapping, BulkRowPayload, normalizeParsedRows } from "@/lib/domains/bulk-qr";

interface MappingStepProps {
  headers: string[];
  rawRows: Record<string, string>[];
  initialMapping: ColumnMapping;
  campaigns?: Array<{ id: string; name: string }>;
  folders?: Array<{ id: string; name: string }>;
  onBack: () => void;
  onProceed: (mapping: ColumnMapping, normalizedRows: BulkRowPayload[]) => void;
}

interface TargetFieldConfig {
  key: keyof ColumnMapping;
  label: string;
  description: string;
  required: boolean;
  aliases: string[];
}

const TARGET_FIELDS: TargetFieldConfig[] = [
  {
    key: "name",
    label: "QR Name / Title",
    description: "Descriptive title for the QR asset in NXTQR",
    required: true,
    aliases: ["name", "qr_name", "title", "label", "asset_name", "qr title"],
  },
  {
    key: "destination_url",
    label: "Destination URL / Content",
    description: "Target web address or formatted QR payload",
    required: true,
    aliases: ["destination", "url", "target", "link", "website", "content", "destination_url"],
  },
  {
    key: "qr_type",
    label: "QR Type",
    description: "Classification: url, text, wifi, vcard, email, phone",
    required: false,
    aliases: ["type", "qr_type", "format", "category"],
  },
  {
    key: "campaign",
    label: "Campaign",
    description: "Campaign name or ID for grouping and analytics",
    required: false,
    aliases: ["campaign", "campaign_name", "campaign_id"],
  },
  {
    key: "folder",
    label: "Folder",
    description: "Folder name or ID for workspace organization",
    required: false,
    aliases: ["folder", "folder_name", "folder_id", "directory"],
  },
  {
    key: "custom_slug",
    label: "Custom Slug (Optional)",
    description: "Custom resolver route path segment (e.g. /s/custom-slug)",
    required: false,
    aliases: ["slug", "custom_slug", "shortcode", "alias"],
  },
];

export function MappingStep({
  headers,
  rawRows,
  initialMapping,
  campaigns = [],
  folders = [],
  onBack,
  onProceed,
}: MappingStepProps) {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  const handleSelectMapping = (targetKey: keyof ColumnMapping, sourceCol: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (sourceCol === "__ignore__") {
        delete next[targetKey];
      } else {
        next[targetKey] = sourceCol;
      }
      return next;
    });
  };

  // Determine status for each target field
  const fieldStatuses = useMemo(() => {
    return TARGET_FIELDS.map((tf) => {
      const mappedCol = mapping[tf.key];
      if (!mappedCol) {
        return {
          ...tf,
          mappedCol: undefined,
          status: tf.required ? "missing" : "unmapped",
          statusLabel: tf.required ? "Required" : "Unmapped",
        };
      }

      const exact = tf.aliases.includes(mappedCol.toLowerCase().trim());
      return {
        ...tf,
        mappedCol,
        status: exact ? "exact" : "custom",
        statusLabel: exact ? "Exact Match" : "Mapped",
      };
    });
  }, [mapping]);

  // Validation: are all required fields mapped?
  const hasMissingRequired = fieldStatuses.some(
    (f) => f.required && f.status === "missing"
  );

  // Live preview of first 3 rows under current mapping
  const previewRows = useMemo(() => {
    const sample = rawRows.slice(0, 3);
    return normalizeParsedRows(sample, mapping, { campaigns, folders });
  }, [rawRows, mapping, campaigns, folders]);

  const handleProceed = () => {
    if (hasMissingRequired) return;
    const normalized = normalizeParsedRows(rawRows, mapping, { campaigns, folders });
    onProceed(mapping, normalized);
  };

  return (
    <div className="space-y-8">
      {/* Header ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <Icon icon="lucide:columns" className="w-5 h-5 text-orange-500" />
            Field Mapping Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Map detected CSV columns to NXTQR asset schema attributes. Required fields must be mapped to proceed to the Validation Gate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              hasMissingRequired
                ? "border-red-500/40 bg-red-500/10 text-red-400 font-mono text-xs"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs"
            }
          >
            {hasMissingRequired ? "Required Fields Missing" : "Mapping Ready"}
          </Badge>
        </div>
      </div>

      {/* Mapping Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldStatuses.map((field) => (
          <div
            key={field.key}
            className={`p-4 rounded-xl border transition-all ${
              field.required && field.status === "missing"
                ? "border-red-500/30 bg-red-500/10"
                : "border-border/80 bg-surface/60 hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {field.label}
                </span>
                {field.required && (
                  <span className="text-xs text-primary font-bold">*</span>
                )}
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                  field.status === "exact"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : field.status === "missing"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-border text-muted-foreground"
                }`}
              >
                {field.statusLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{field.description}</p>

            <Select
              value={field.mappedCol || "__ignore__"}
              onValueChange={(val) => handleSelectMapping(field.key, val)}
            >
              <SelectTrigger className="w-full text-xs bg-surface border-border/80 text-foreground">
                <SelectValue placeholder="Select CSV Column..." />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border text-foreground">
                {!field.required && (
                  <SelectItem value="__ignore__">
                    <span className="text-muted-foreground italic">Ignore Column</span>
                  </SelectItem>
                )}
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>
                    <span className="font-mono text-xs text-foreground">{h}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Live Sample Preview */}
      <div className="rounded-xl border border-border/80 bg-surface/70 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Icon icon="lucide:eye" className="w-4 h-4 text-primary" />
            Live Ingestion Preview (First 3 Normalized Rows)
          </h3>
          <span className="text-[11px] font-mono text-neutral-500">
            {rawRows.length} total rows detected
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="px-3 py-2 w-12 text-center">Row</th>
                <th className="px-3 py-2">QR Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Destination / Payload</th>
                <th className="px-3 py-2">Campaign ID</th>
                <th className="px-3 py-2">Folder ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {previewRows.map((r, i) => (
                <tr key={i} className="hover:bg-neutral-900/30">
                  <td className="px-3 py-2 text-center font-mono text-neutral-500">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2 font-medium text-neutral-200">
                    {r.name || <span className="text-neutral-600 italic">Empty</span>}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-neutral-300">
                      {r.qr_type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-neutral-400 truncate max-w-xs">
                    {r.destination_url || <span className="text-neutral-600 italic">—</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-neutral-400">
                    {r.campaign_id ? (
                      campaigns.find((c) => c.id === r.campaign_id)?.name || r.campaign_id
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-neutral-400">
                    {r.folder_id ? (
                      folders.find((f) => f.id === r.folder_id)?.name || r.folder_id
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
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
          onClick={handleProceed}
          disabled={hasMissingRequired}
          className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 font-medium disabled:opacity-40"
        >
          Validate Rows ({rawRows.length})
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
