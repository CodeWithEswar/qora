"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrResponseV1 } from "@nxtqr/contracts";
import { renderQrSvg, CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import {
  ExternalLink,
  Edit,
  Download,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  Copy,
  Check,
  Activity,
  ArrowRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { cleanDomainFromUrl, QrTypeIcon } from "@/components/icons/qr-type-icon";

export interface QrInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qr: QrResponseV1 | null;
  orgSlug: string;
  onEdit: (qr: QrResponseV1) => void;
  onDownload: (qr: QrResponseV1) => void;
  onPauseResume: (qr: QrResponseV1) => void;
  onArchive: (qr: QrResponseV1) => void;
  onDelete: (qr: QrResponseV1) => void;
}

export function QrInspectorSheet({
  open,
  onOpenChange,
  qr,
  orgSlug,
  onEdit,
  onDownload,
  onPauseResume,
  onArchive,
  onDelete,
}: QrInspectorSheetProps) {
  const [copied, setCopied] = React.useState(false);
  const [copiedDest, setCopiedDest] = React.useState(false);

  const publicUrl = qr?.scanUrl || (qr?.slug ? `https://nxtqr.vercel.app/s/${qr.slug}` : "");
  const isPaused = qr?.status === "PAUSED";
  const isActive = qr?.status === "ACTIVE";

  const svgMarkup = React.useMemo(() => {
    if (!publicUrl) return null;
    try {
      const qrDesign = {
        ...CANONICAL_QR_DESIGN_DEFAULTS,
        ...(qr?.design || {}),
        errorCorrection: (qr?.design?.errorCorrection || "M") as any,
        quietZone: qr?.design?.quietZone !== undefined ? qr.design.quietZone : 2,
      };
      return renderQrSvg({
        content: publicUrl,
        design: qrDesign,
        moduleSize: 8,
      });
    } catch {
      return null;
    }
  }, [publicUrl, qr?.design]);

  const handleCopyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("QR URL copied", { description: publicUrl });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleCopyDestUrl = async () => {
    if (!qr?.destinationUrl) return;
    try {
      await navigator.clipboard.writeText(qr.destinationUrl);
      setCopiedDest(true);
      toast.success("Destination URL copied", { description: qr.destinationUrl });
      setTimeout(() => setCopiedDest(false), 2000);
    } catch {
      toast.error("Failed to copy destination URL");
    }
  };

  const domainInfo = React.useMemo(() => {
    return qr?.destinationUrl ? cleanDomainFromUrl(qr.destinationUrl) : null;
  }, [qr?.destinationUrl]);

  if (!qr) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg flex flex-col justify-between p-0 bg-white dark:bg-[#151515] border-l border-border/80 h-full overflow-hidden"
      >
        {/* Scrollable Inspector Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header with dedicated right clearance for the close icon */}
          <SheetHeader className="text-left space-y-1.5 border-b border-border/60 pb-4 pr-10 sm:pr-12">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                OPERATIONAL INSPECTOR
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium",
                  isActive && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                  isPaused && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                  !isActive && !isPaused && "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-border"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-emerald-600 dark:bg-emerald-400" : isPaused ? "bg-amber-500" : "bg-neutral-400"
                  )}
                />
                {qr.status}
              </span>
            </div>
            <SheetTitle className="font-serif text-lg sm:text-xl tracking-tight text-foreground break-words">
              {qr.name || "Untitled QR"}
            </SheetTitle>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-mono">
              <span>ID: {qr.id}</span>
              <span className="text-muted-foreground/40 hidden xs:inline">&middot;</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                title="Open scan resolver link in new tab"
              >
                <span>/s/{qr.slug}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
              </a>
            </div>
          </SheetHeader>

          {/* NXTQR Vertical Signal Flow Diagram */}
          <div className="rounded-xl border border-border/70 bg-neutral-50/70 dark:bg-[#181818]/70 p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary" />
              <span>Routing Signal Flow</span>
            </div>

            {/* Node 1: QR Identity */}
            <div className="flex items-start gap-3 bg-white dark:bg-[#121212] p-2.5 sm:p-3 rounded-lg border border-border/60 shadow-2xs">
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg border border-border/60 bg-white dark:bg-[#161616] p-1 flex items-center justify-center overflow-hidden">
                {svgMarkup ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:block rounded-md overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">QR</span>
                )}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground truncate" title={qr.name}>
                  {qr.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {qr.mode === "dynamic" ? "Dynamic Routing" : "Static Resolution"}
                </div>
                <div className="pt-0.5 min-w-0 flex items-center gap-1.5 flex-wrap">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-colors cursor-pointer text-[11px] font-medium max-w-full"
                    title="Simulate / Test Inbound Scan"
                  >
                    <span className="font-mono truncate">/s/{qr.slug}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-70 group-hover:opacity-100" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copy public scan link"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Signal Arrow Down */}
            <div className="flex justify-center -my-2">
              <span className="h-4 w-[1px] bg-primary/40" />
            </div>

            {/* Node 2: Destination */}
            <div className="bg-white dark:bg-[#121212] p-2.5 sm:p-3 rounded-lg border border-border/60 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                  Target Destination
                </span>
                {qr.destinationUrl && (
                  <a
                    href={qr.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs inline-flex items-center gap-1 font-medium shrink-0 px-1 py-0.5 rounded hover:bg-primary/5 transition-colors"
                  >
                    <span>Visit</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 pt-0.5 min-w-0">
                {domainInfo && (
                  <div className="h-5 w-5 shrink-0 rounded-xs border border-border/70 bg-neutral-100/70 dark:bg-[#1a1a1a] flex items-center justify-center p-0.5 overflow-hidden shadow-3xs">
                    <QrTypeIcon
                      type={domainInfo.brandKey || qr.type || "url"}
                      domain={domainInfo.cleanDomain}
                      faviconUrl={domainInfo.faviconUrl}
                      size={13}
                      tone="brand"
                    />
                  </div>
                )}
                <div className="font-mono text-xs text-foreground truncate min-w-0 flex-1" title={qr.destinationUrl}>
                  {qr.destinationUrl || "No destination configured"}
                </div>
                {qr.destinationUrl && (
                  <button
                    type="button"
                    onClick={handleCopyDestUrl}
                    className="text-muted-foreground hover:text-foreground p-1 shrink-0 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Copy destination URL"
                  >
                    {copiedDest ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Signal Arrow Down */}
            <div className="flex justify-center -my-2">
              <span className="h-4 w-[1px] bg-primary/40" />
            </div>

            {/* Node 3: Telemetry & Status */}
            <div className="bg-white dark:bg-[#121212] p-2.5 sm:p-3 rounded-lg border border-border/60 shadow-2xs flex items-center justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-muted-foreground truncate">
                  Scan Telemetry
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-foreground mt-0.5 truncate">
                  {(qr.scans || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">total scans</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">
                  Unique Scans
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-foreground mt-0.5">
                  {(qr.uniqueScans || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-2 sm:space-y-3 pt-1">
            <span className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
              Metadata & Ownership
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs border border-border/70 rounded-xl p-3 sm:p-3.5 bg-white dark:bg-[#121212]">
              <div className="min-w-0">
                <div className="text-muted-foreground text-[11px]">Campaign</div>
                <div className="font-medium text-foreground mt-0.5 truncate" title={qr.campaignName || undefined}>
                  {qr.campaignName || "—"}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-muted-foreground text-[11px]">Owner</div>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <Avatar className="h-4 w-4 shrink-0">
                    {qr.ownerAvatarUrl && <AvatarImage src={qr.ownerAvatarUrl} />}
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                      {(qr.ownerName || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground truncate" title={qr.ownerName || undefined}>
                    {qr.ownerName || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-muted-foreground text-[11px]">Created</div>
                <div className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                  {formatDate(qr.createdAt)}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-muted-foreground text-[11px]">Last Updated</div>
                <div className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                  {formatDate(qr.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer - Fixed & Responsive */}
        <SheetFooter className="p-3 sm:p-4 border-t border-border/80 bg-neutral-50/60 dark:bg-[#111111]/60 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2 shrink-0">
          <div className="grid grid-cols-2 xs:flex xs:items-center gap-1.5 w-full xs:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPauseResume(qr)}
              className="h-9 sm:h-8 text-xs gap-1.5 justify-center"
            >
              {isPaused ? <PlayCircle className="h-3.5 w-3.5 text-emerald-600" /> : <PauseCircle className="h-3.5 w-3.5 text-amber-500" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(qr)}
              className="h-9 sm:h-8 text-xs gap-1.5 justify-center"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Export</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full xs:w-auto">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full xs:w-auto h-9 sm:h-8 text-xs gap-1.5 justify-center border-primary/30 text-primary hover:bg-primary/5"
            >
              <Link href={`/${orgSlug}/qr/${qr.id}`}>
                <Zap className="h-3.5 w-3.5" />
                <span>Dynamic Control</span>
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="w-full xs:w-auto h-9 sm:h-8 text-xs gap-1.5 bg-primary hover:bg-[#cc3a05] text-white justify-center shadow-xs"
            >
              <Link href={`/${orgSlug}/qr/studio?id=${qr.id}`}>
                <Edit className="h-3.5 w-3.5" />
                <span>Studio</span>
              </Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
