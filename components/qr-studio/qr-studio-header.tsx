import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  Download,
  Send,
  Save,
  Maximize2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type AutosaveStatus = "saved" | "saving" | "unsaved" | "error";

interface QrStudioHeaderProps {
  orgSlug: string;
  qrName: string;
  onQrNameChange: (name: string) => void;
  status: string; // 'DRAFT' | 'ACTIVE' | 'PAUSED'
  autosaveStatus: AutosaveStatus;
  lastSavedAt: string | null;
  versionNumber: number;
  isDirty: boolean;
  onOpenPreview: () => void;
  onOpenVersions: () => void;
  onOpenExport: (format?: "svg" | "png" | "pdf") => void;
  onSaveVersion: () => void;
  onOpenPublish: () => void;
  isPublishing?: boolean;
  isSavingVersion?: boolean;
}

export function QrStudioHeader({
  orgSlug,
  qrName,
  onQrNameChange,
  status,
  autosaveStatus,
  lastSavedAt,
  versionNumber,
  isDirty,
  onOpenPreview,
  onOpenVersions,
  onOpenExport,
  onSaveVersion,
  onOpenPublish,
  isPublishing = false,
  isSavingVersion = false,
}: QrStudioHeaderProps) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(qrName);

  React.useEffect(() => {
    setNameDraft(qrName);
  }, [qrName]);

  const commitName = () => {
    setIsEditingName(false);
    if (nameDraft.trim()) {
      onQrNameChange(nameDraft.trim());
    } else {
      setNameDraft(qrName);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5 sm:px-6 transition-colors">
      {/* Left: Back Link, Name & Status Badges */}
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
          <Link href={`/${orgSlug}/qr`}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">QR Codes</span>
          </Link>
        </Button>

        <div className="h-4 w-px bg-border/80 hidden sm:block" />

        {/* Editable Name */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingName ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") {
                  setNameDraft(qrName);
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="h-7 px-2 text-sm font-semibold text-foreground bg-surface border border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-60"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="group flex items-center gap-1.5 text-left text-sm font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[280px]"
              title="Click to rename QR"
            >
              <span className="truncate">{qrName || "Untitled QR"}</span>
              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </button>
          )}

          <Badge
            variant={status === "ACTIVE" ? "default" : "secondary"}
            className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 shrink-0"
          >
            {status}
          </Badge>
        </div>

        {/* Version Pill */}
        <button
          onClick={onOpenVersions}
          className="hidden md:inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          title="View Version History"
        >
          <span>v{versionNumber}</span>
          <span className="text-[10px] text-muted-foreground/60">•</span>
          <span className="text-[10px] font-sans">Draft</span>
        </button>

        {/* Real Autosave Status Indicator (Rule 7) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
          {autosaveStatus === "saving" && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving draft…</span>
            </span>
          )}
          {autosaveStatus === "saved" && lastSavedAt && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Saved {lastSavedAt}</span>
            </span>
          )}
          {autosaveStatus === "unsaved" && (
            <span className="inline-flex items-center gap-1 text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Unsaved edits</span>
            </span>
          )}
          {autosaveStatus === "error" && (
            <span className="inline-flex items-center gap-1 text-rose-500">
              <AlertCircle className="h-3 w-3" />
              <span>Save failed</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions Cluster */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Fullscreen Preview */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreview}
          className="h-8 gap-1.5 text-xs hidden sm:inline-flex"
          title="Full Preview Modal"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Preview</span>
        </Button>

        {/* Version History Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenVersions}
          className="h-8 gap-1.5 text-xs"
          title="Version Checkpoints"
        >
          <History className="h-3.5 w-3.5" />
          <span className="hidden md:inline">History</span>
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuItem onClick={() => onOpenExport("svg")} className="cursor-pointer">
              Vector SVG (Lossless)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenExport("png")} className="cursor-pointer">
              Raster PNG (High Res)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenExport("pdf")} className="cursor-pointer">
              Print PDF (Vector Preset)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onOpenExport()} className="cursor-pointer font-medium text-primary">
              All Export Options…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save Version Checkpoint */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveVersion}
          disabled={isSavingVersion}
          className="h-8 gap-1.5 text-xs hidden sm:inline-flex"
          title="Create an immutable version checkpoint"
        >
          {isSavingVersion ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Version</span>
        </Button>

        {/* Primary CTA: Publish & Deploy */}
        <Button
          size="sm"
          onClick={onOpenPublish}
          disabled={isPublishing}
          className="h-8 gap-1.5 text-xs font-medium bg-primary hover:bg-[#cc3a05] text-white shadow-xs"
        >
          {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          <span>Publish</span>
        </Button>
      </div>
    </header>
  );
}
