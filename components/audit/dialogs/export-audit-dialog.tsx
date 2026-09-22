"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ExportAuditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  currentRange: string;
  currentLens: string;
}

export function ExportAuditDialog({
  isOpen,
  onClose,
  orgSlug,
  currentRange,
  currentLens,
}: ExportAuditDialogProps) {
  const [format, setFormat] = React.useState<"csv" | "json">("csv");
  const [range, setRange] = React.useState(currentRange || "30d");
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("Audit export started...");

    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/audit/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          range,
          lens: currentLens !== "all" ? currentLens : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate export");
      }

      const blob = await res.blob();
      const filename =
        res.headers.get("Content-Disposition")?.split('filename="')?.[1]?.replace('"', "") ||
        `nxtqr-audit-evidence.${format}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Audit export downloaded.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Audit export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#151515] border-white/[0.08] text-[#F7F4EC] p-6 space-y-5">
        <DialogHeader className="space-y-1.5 text-left border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:download-square-bold" className="w-5 h-5 text-[#FA520F]" />
            <DialogTitle className="text-lg font-bold text-[#F7F4EC]">
              Export Audit Evidence
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#B8B5AD]">
            Generate an immutable compliance export. Sensitive tokens and secret hashes are automatically redacted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Format */}
          <div className="space-y-1.5">
            <label className="font-mono text-[#85827B] uppercase font-semibold text-[10px]">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === "csv"
                    ? "border-[#FA520F] bg-[#1F1713] ring-1 ring-[#FA520F]/50"
                    : "border-white/[0.08] bg-[#191919] hover:bg-[#202020]"
                }`}
              >
                <div className="font-bold text-[#F7F4EC]">CSV Spreadsheet</div>
                <div className="text-[10px] text-[#85827B] mt-0.5">
                  Best for Excel, Numbers, and table compliance audits.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === "json"
                    ? "border-[#FA520F] bg-[#1F1713] ring-1 ring-[#FA520F]/50"
                    : "border-white/[0.08] bg-[#191919] hover:bg-[#202020]"
                }`}
              >
                <div className="font-bold text-[#F7F4EC]">Structured JSON</div>
                <div className="text-[10px] text-[#85827B] mt-0.5">
                  Complete before/after changesets and authorization traces.
                </div>
              </button>
            </div>
          </div>

          {/* Time Range */}
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

          {/* Redaction Guarantee Notice */}
          <div className="p-3 rounded-lg border border-white/[0.06] bg-[#181818] space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <Icon icon="solar:shield-check-bold" className="w-3.5 h-3.5" />
              <span>Sanitization & Redaction Guaranteed</span>
            </div>
            <p className="text-[11px] text-[#85827B] leading-relaxed">
              Passwords, session cookies, webhook signing secrets, and API key hashes are permanently excluded from the export artifact.
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-[#85827B] hover:text-[#F7F4EC]"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[#FA520F] text-white hover:bg-[#E04505] text-xs gap-1.5"
          >
            {isExporting ? (
              <>
                <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Icon icon="solar:download-bold" className="w-3.5 h-3.5" />
                <span>Download Evidence ({format.toUpperCase()})</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
