"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { parseBulkCsv } from "@/lib/domains/bulk-qr/parser";
import { RawParsedSource } from "@/lib/domains/bulk-qr/types";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";

interface SourceStepProps {
  onParsedSource: (source: RawParsedSource) => void;
  onSwitchToManual: () => void;
  maxRowsAllowed?: number;
}

export function SourceStep({
  onParsedSource,
  onSwitchToManual,
  maxRowsAllowed = 500,
}: SourceStepProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Invalid file format", {
        description: "Only standard CSV files (.csv) are supported for bulk QR ingestion.",
      });
      return;
    }

    setIsParsing(true);
    try {
      const text = await file.text();
      const parsed = parseBulkCsv(text, {
        fileName: file.name,
        fileSize: file.size,
        maxRows: maxRowsAllowed,
      });

      toast.success("CSV Ingestion Complete", {
        description: `Parsed ${parsed.totalRows} rows with ${parsed.headers.length} detected columns.`,
      });

      onParsedSource(parsed);
    } catch (err: any) {
      toast.error("CSV Ingestion Failed", {
        description: err.message || "Failed to parse file. Please verify CSV format and retry.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("/api/v1/bulk/template", "_blank");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Zone Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 transition-all duration-300 text-center flex flex-col items-center justify-center gap-6 shadow-xl backdrop-blur-md ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-[0_0_30px_rgba(250,82,15,0.15)]"
            : "border-border/80 bg-surface/60 hover:border-primary/50 hover:bg-surface/80 hover:shadow-2xl"
        }`}
      >
        {/* Subtle QR-Module Corner Marks */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br-sm pointer-events-none" />

        {/* Signature Animated QR Monogram with Ambient Glow */}
        <div className="relative group/monogram select-none">
          <div className="absolute -inset-4 rounded-3xl bg-primary/15 blur-xl opacity-60 group-hover/monogram:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative p-4 sm:p-5 rounded-3xl bg-surface/90 border border-border/80 shadow-md backdrop-blur-sm transition-transform duration-300 group-hover/monogram:scale-105">
            <QrEmptyMonogram letter="B" size="lg" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2 max-w-md">
          <h3 className="font-serif text-xl sm:text-2xl text-foreground font-bold tracking-tight">
            Ingest Structured CSV Document
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Drag and drop your spreadsheet export, or click below to choose a file. Supports standard RFC 4180 CSV with up to {maxRowsAllowed} rows per batch.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFile(e.target.files[0]);
              }
            }}
          />

          <Button
            type="button"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="h-10 sm:h-11 px-6 text-xs sm:text-sm font-semibold gap-2 shadow-[0_0_20px_rgba(250,82,15,0.25)] bg-primary hover:bg-[#CC3A05] text-white transition-all cursor-pointer"
          >
            <Icon icon="solar:file-check-linear" className="w-4 h-4" />
            <span>{isParsing ? "Ingesting..." : "Choose CSV File"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onSwitchToManual}
            className="h-10 sm:h-11 px-5 text-xs sm:text-sm border-border/80 bg-surface/80 hover:bg-muted text-foreground gap-2 cursor-pointer shadow-xs transition-all hover:border-primary/40"
          >
            <Icon icon="solar:pen-new-square-linear" className="w-4 h-4 text-muted-foreground" />
            <span>Manual Grid Entry</span>
          </Button>
        </div>

        {/* Bottom Helper Info */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:shield-check-bold" className="w-3.5 h-3.5 text-emerald-500" />
            <span>Formula sanitization active</span>
          </div>
          <span className="opacity-40">&middot;</span>
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:database-linear" className="w-3.5 h-3.5 text-primary" />
            <span>Max {maxRowsAllowed} records</span>
          </div>
          <span className="opacity-40">&middot;</span>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Icon icon="solar:download-minimalistic-linear" className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}
