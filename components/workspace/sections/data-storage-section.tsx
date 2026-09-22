"use client";

import * as React from "react";
import { HardDrive, Download, FileText, QrCode, Palette, FileArchive, ShieldCheck, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface DataStorageSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onOpenExportDialog: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function DataStorageSection({
  overview,
  onOpenExportDialog,
}: DataStorageSectionProps) {
  const { storage, stats, userPermissions } = overview;
  const total = storage.totalBytes;

  const filesPct = total > 0 ? (storage.byCategory.files / total) * 100 : 0;
  const qrPct = total > 0 ? (storage.byCategory.qrAssets / total) * 100 : 0;
  const brandPct = total > 0 ? (storage.byCategory.brandAssets / total) * 100 : 0;
  const exportsPct = total > 0 ? (storage.byCategory.exports / total) * 100 : 0;

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold font-display">Data & Storage Composition</CardTitle>
          </div>
          {userPermissions.canExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenExportDialog}
              className="h-8 gap-1.5 text-xs border-border/80 hover:bg-surface"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Export workspace data</span>
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">
          Real-time relational and binary storage breakdown stored across authoritative Supabase infrastructure.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Storage Summary */}
        <div className="p-4 rounded-xl border border-border/60 bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Total Binary Storage Utilized
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {formatBytes(storage.totalBytes)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                across {storage.fileCount} persistent object{storage.fileCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-background/60 border border-border text-muted-foreground">
              <Database className="h-3 w-3 text-emerald-500" />
              <span>SUPABASE STORAGE</span>
            </span>
          </div>
        </div>

        {/* Signature Feature: Storage Composition Segmented Rail */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground font-display">
              STORAGE COMPOSITION RAIL
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Exact category distribution
            </span>
          </div>

          {/* Segmented Bar */}
          <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden flex p-0.5 gap-0.5 border border-border/60">
            {filesPct > 0 && (
              <div
                style={{ width: `${filesPct}%` }}
                className="h-full rounded-full bg-blue-500 transition-all"
                title={`Files: ${formatBytes(storage.byCategory.files)} (${filesPct.toFixed(1)}%)`}
              />
            )}
            {qrPct > 0 && (
              <div
                style={{ width: `${qrPct}%` }}
                className="h-full rounded-full bg-primary transition-all"
                title={`QR Assets: ${formatBytes(storage.byCategory.qrAssets)} (${qrPct.toFixed(1)}%)`}
              />
            )}
            {brandPct > 0 && (
              <div
                style={{ width: `${brandPct}%` }}
                className="h-full rounded-full bg-amber-500 transition-all"
                title={`Brand Assets: ${formatBytes(storage.byCategory.brandAssets)} (${brandPct.toFixed(1)}%)`}
              />
            )}
            {exportsPct > 0 && (
              <div
                style={{ width: `${exportsPct}%` }}
                className="h-full rounded-full bg-emerald-500 transition-all"
                title={`Exports: ${formatBytes(storage.byCategory.exports)} (${exportsPct.toFixed(1)}%)`}
              />
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-500">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase font-semibold">Files & Docs</span>
              </div>
              <span className="font-bold text-foreground block">
                {formatBytes(storage.byCategory.files)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {filesPct.toFixed(1)}% of total
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center gap-1.5 text-primary">
                <QrCode className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase font-semibold">QR Assets</span>
              </div>
              <span className="font-bold text-foreground block">
                {formatBytes(storage.byCategory.qrAssets)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {qrPct.toFixed(1)}% of total
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Palette className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase font-semibold">Brand Assets</span>
              </div>
              <span className="font-bold text-foreground block">
                {formatBytes(storage.byCategory.brandAssets)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {brandPct.toFixed(1)}% of total
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <FileArchive className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase font-semibold">Exports & Logs</span>
              </div>
              <span className="font-bold text-foreground block">
                {formatBytes(storage.byCategory.exports)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {exportsPct.toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Security / Non-Fake Quota Notice */}
        <div className="p-3 rounded-lg bg-surface/30 border border-border/50 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-medium text-foreground block">
              Authoritative Storage Architecture
            </span>
            <p className="text-[11px] leading-relaxed">
              Storage quotas and retention policies scale with your active commercial plan. No artificial limits or fictitious capacity meters are displayed. All binary blobs are encrypted at rest with private signed URL access policies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
