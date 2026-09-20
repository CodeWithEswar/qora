"use client";

import * as React from "react";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import { evaluateScanability, CANONICAL_QR_DESIGN_DEFAULTS, QrDesignV1 } from "@nxtqr/qr-core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

interface PublishBrandKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kit: BrandKitDetailV1 | null;
  onPublish: (kitId: string, changeSummary: string) => Promise<void>;
}

export function PublishBrandKitDialog({
  open,
  onOpenChange,
  kit,
  onPublish,
}: PublishBrandKitDialogProps) {
  const [changeSummary, setChangeSummary] = React.useState("");
  const [isPublishing, setIsPublishing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setChangeSummary("");
    }
  }, [open]);

  // Pre-flight scanability diagnostics on all QR presets
  const preflightResults = React.useMemo(() => {
    if (!kit || !kit.qrPresets) return { passed: 0, warnings: 0, blockers: 0 };
    let passed = 0;
    let warnings = 0;
    let blockers = 0;

    for (const preset of kit.qrPresets) {
      try {
        const fullDesign: QrDesignV1 = {
          ...CANONICAL_QR_DESIGN_DEFAULTS,
          ...(preset.design as Partial<QrDesignV1>),
        };
        const result = evaluateScanability(
          "https://nxtqr.vercel.app/preview/publish",
          fullDesign
        );
        if (result.status === "pass") passed++;
        else if (result.status === "warning") warnings++;
        else if (result.status === "blocking") blockers++;
      } catch {
        // treat unexpected error as warning
        warnings++;
      }
    }

    return { passed, warnings, blockers };
  }, [kit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kit) return;
    if (!changeSummary.trim()) {
      toast.error("Please enter a brief summary of the changes in this revision");
      return;
    }

    setIsPublishing(true);
    try {
      await onPublish(kit.id, changeSummary.trim());
      toast.success(`Published Revision ${kit.publishedRevision + 1} successfully.`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish Brand Kit revision");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!kit) return null;

  const nextRevision = (kit.publishedRevision || 1) + 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 space-y-4">
        <DialogHeader className="text-left space-y-1 pr-10 sm:pr-12">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FA520F] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>IMMUTABLE REVISION PIPELINE</span>
          </div>
          <DialogTitle className="text-lg font-bold font-display text-foreground">
            Publish Revision {nextRevision}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Commits an immutable, tamper-evident revision snapshot to the authoritative database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Revision Badge Transition */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-surface/50">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Target Version</span>
              <p className="text-[11px] text-muted-foreground font-mono">
                {kit.name} — Workspace Authority
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <Badge variant="outline" className="border-border">
                Rev {kit.publishedRevision}
              </Badge>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <Badge className="bg-[#FA520F] text-white border-[#FA520F]">
                Rev {nextRevision}
              </Badge>
            </div>
          </div>

          {/* Pre-flight Scanability Diagnostic Card */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-surface/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#FA520F]" />
                <span>Pre-flight Scanability Verification</span>
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {kit.qrPresets.length} presets evaluated
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                  {preflightResults.passed}
                </span>
                <span className="text-muted-foreground">Optimal Pass</span>
              </div>
              <div className="p-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-center">
                <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 block">
                  {preflightResults.warnings}
                </span>
                <span className="text-muted-foreground">Warnings</span>
              </div>
              <div className="p-2 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
                <span className="text-base font-bold font-mono text-red-600 dark:text-red-400 block">
                  {preflightResults.blockers}
                </span>
                <span className="text-muted-foreground">Blockers</span>
              </div>
            </div>

            {preflightResults.blockers > 0 && (
              <div className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>One or more QR presets have severe contrast or collision blockers.</span>
              </div>
            )}
          </div>

          {/* Change Summary Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Revision Change Summary <span className="text-[#FA520F]">*</span>
            </label>
            <Textarea
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g. Updated primary orange token to #FA520F, added monochrome logo mark, validated scannability."
              rows={3}
              className="text-xs bg-surface border-border"
              autoFocus
            />
            <span className="text-[10px] text-muted-foreground">
              This note will be permanently recorded in the immutable revision log.
            </span>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPublishing || !changeSummary.trim()}
              size="sm"
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
            >
              {isPublishing ? "Publishing..." : `Publish Revision ${nextRevision}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
