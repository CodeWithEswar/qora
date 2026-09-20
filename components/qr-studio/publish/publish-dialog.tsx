import * as React from "react";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  ExternalLink,
  GitCommit,
  Radio,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScanabilityResultV1 } from "@nxtqr/qr-core";

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrName: string;
  slug: string;
  destinationUrl: string;
  isDynamic: boolean;
  scanability: ScanabilityResultV1;
  onConfirmPublish: (changeSummary: string) => Promise<void>;
  isPublishing: boolean;
}

const PRESET_SUMMARIES = [
  "Design & style update",
  "Destination URL change",
  "Campaign launch release",
  "Print-ready artwork update",
];

export function PublishDialog({
  isOpen,
  onClose,
  qrName,
  slug,
  destinationUrl,
  isDynamic,
  scanability,
  onConfirmPublish,
  isPublishing,
}: PublishDialogProps) {
  const [changeSummary, setChangeSummary] = React.useState("Published design & destination update");
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const isBlocked = scanability.status === "blocking" || scanability.blockersCount > 0;
  const hasWarnings = scanability.status === "warning" || scanability.recommendationsCount > 0;
  const isHttpUrl = destinationUrl?.startsWith("http://") || destinationUrl?.startsWith("https://");

  const handleCopyUrl = async () => {
    if (!destinationUrl) return;
    try {
      await navigator.clipboard.writeText(destinationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handlePublish = async () => {
    if (isBlocked) return;
    await onConfirmPublish(changeSummary.trim() || "Published revision");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-xl p-0 border border-border bg-surface rounded-2xl shadow-2xl flex flex-col gap-0 max-h-[calc(100vh-3rem)] overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/70 shrink-0 bg-surface text-left pr-12 sm:pr-14">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Zap className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
              Publish QR to Production
            </DialogTitle>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Edge Live</span>
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed max-w-xl">
            Deploy instant redirect routing to global edge resolvers with immutable version tracking.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 py-4 space-y-4 text-xs min-w-0 overflow-y-auto max-h-[62vh] pr-4 sm:pr-6">
          {/* Target Routing Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated/40 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                  Asset
                </span>
                <p className="font-semibold text-foreground text-sm truncate min-w-0 mt-0.5">
                  {qrName || "Untitled QR"}
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] shrink-0 max-w-[180px] truncate bg-surface px-2 py-0.5">
                {slug}
              </Badge>
            </div>

            {/* Live Destination Box with Copy & External Link */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-primary" />
                  <span>Live Destination Target</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Instant KV Sync
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface border border-border/80 min-w-0 shadow-xs">
                <div className="min-w-0 flex-1">
                  <p
                    className="font-mono text-[11px] text-foreground truncate select-all leading-tight"
                    title={destinationUrl}
                  >
                    {destinationUrl || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Copy URL to clipboard"
                  >
                    {copiedUrl ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {isHttpUrl && (
                    <a
                      href={destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Open destination in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Edge Resolver Details */}
            {isDynamic && (
              <div className="pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-muted-foreground min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Radio className="h-3 w-3 text-primary" />
                  <span>Edge Resolver Key</span>
                </div>
                <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 truncate max-w-full sm:max-w-[260px]">
                  qr:v1:global:{slug}
                </span>
              </div>
            )}
          </div>

          {/* Pre-Publish Scanability Gating */}
          {isBlocked ? (
            /* BLOCKING STATE UI */
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/5 text-destructive space-y-2.5 min-w-0">
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>PUBLICATION BLOCKED</span>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">
                {scanability.summary || "One or more critical scanability invariants are violated."}
              </p>
              <div className="space-y-1.5 pt-1 min-w-0">
                {scanability.findings
                  .filter((f) => f.blocking || f.severity === "blocking")
                  .map((f) => (
                    <div
                      key={f.id}
                      className="text-[11px] bg-surface p-2.5 rounded-lg border border-destructive/25 font-mono break-words leading-relaxed"
                    >
                      <span className="font-bold text-destructive">■! {f.title}: </span>
                      <span className="text-muted-foreground">{f.remediation}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : hasWarnings ? (
            /* WARNING REVIEW UI (Allow Publish Anyway) */
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-700 dark:text-amber-400 min-w-0">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Scanability Advisory ({scanability.recommendationsCount} Recommendations)
                  </span>
                </div>
                {scanability.score !== undefined && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 shrink-0">
                    {scanability.score} / 100
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Deployment is permitted, but minor contrast or margin optimizations are recommended for faster low-light scanning.
              </p>
              <div className="space-y-1.5 pt-1 min-w-0">
                {scanability.findings
                  .filter((f) => f.severity === "warning" || f.severity === "notice")
                  .map((f) => (
                    <div
                      key={f.id}
                      className="text-[11px] text-muted-foreground p-2 rounded-lg bg-surface/80 border border-amber-500/20 break-words"
                    >
                      <strong className="text-foreground">△ {f.title}:</strong> {f.description}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* ALL PASS STATE */
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-xs truncate">Pre-Flight Verification Passed</span>
                </div>
                {scanability.score !== undefined && (
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shrink-0">
                    {scanability.score} / 100 Quality Score
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Zero optical blockers detected. Optical contrast ratio, quiet zone boundaries, and module density meet ISO 18004 scanning standards.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Contrast: Optimal
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Quiet Zone: Clear
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Edge KV: Ready
                </span>
              </div>
            </div>
          )}

          {/* Change Summary Input & Quick Presets */}
          {!isBlocked && (
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Revision Changelog Note</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Optional</span>
              </div>
              <Input
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="e.g. Updated destination link for summer campaign"
                className="h-9 text-xs rounded-lg bg-surface border-border focus-visible:ring-primary shadow-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {PRESET_SUMMARIES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setChangeSummary(preset)}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-surface hover:bg-surface-hover hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Edge Propagation Consequence Notice */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-surface-elevated/40 flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed min-w-0">
            <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <strong className="text-foreground font-semibold">Instant Edge Propagation:</strong> Publishing activates this routing configuration immediately across global edge resolvers. Existing physical prints will resolve to this new destination. Previous releases remain immutable in version history.
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-6 pt-3 border-t border-border/70 bg-surface-elevated/30 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-center sm:justify-start">
            <Zap className="h-3 w-3 text-primary shrink-0" />
            <span>High-Availability Zero-Downtime Rollout</span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isPublishing}
              className="h-9 text-xs w-full sm:w-auto cursor-pointer"
            >
              {isBlocked ? "Back to Editor" : "Cancel"}
            </Button>

            {isBlocked ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="h-9 text-xs font-medium w-full sm:w-auto cursor-pointer"
              >
                Fix Configuration
              </Button>
            ) : hasWarnings ? (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing}
                className="h-9 px-4 gap-2 text-xs font-semibold bg-primary hover:bg-[#cc3a05] text-white shadow-xs transition-colors w-full sm:w-auto cursor-pointer"
              >
                {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Publish Anyway</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing}
                className="h-9 px-4 gap-2 text-xs font-semibold bg-primary hover:bg-[#cc3a05] text-white shadow-xs transition-colors w-full sm:w-auto cursor-pointer"
              >
                {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Deploy to Production</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
