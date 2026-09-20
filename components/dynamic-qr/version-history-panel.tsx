"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StoredQrVersion } from "@/lib/domains/qr-store";
import { formatDateTime } from "@/lib/utils";

interface VersionHistoryPanelProps {
  versions: StoredQrVersion[];
  currentPublishedRevision: number;
  onRestoreVersion: (versionId: string) => Promise<void>;
}

export function VersionHistoryPanel({
  versions,
  currentPublishedRevision,
  onRestoreVersion,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = React.useState<StoredQrVersion | null>(null);
  const [isRestoring, setIsRestoring] = React.useState(false);

  const handleConfirmRestore = async () => {
    if (!selectedVersion || isRestoring) return;
    try {
      setIsRestoring(true);
      await onRestoreVersion(selectedVersion.id);
      setSelectedVersion(null);
    } catch {
      // Handled by parent toast
    } finally {
      setIsRestoring(false);
    }
  };

  if (!versions || versions.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40">
        <Icon icon="hugeicons:clock-01" className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-foreground">No Published Versions Yet</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          When you publish this Dynamic QR, an immutable version checkpoint will be recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Immutable Version History</h3>
          <p className="text-xs text-muted-foreground">
            Authoritative revision checkpoints with zero-downtime rollback capability.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {versions.length} {versions.length === 1 ? "Revision" : "Revisions"}
        </Badge>
      </div>

      <div className="divide-y divide-border/60 rounded-2xl border border-border bg-card/60 overflow-hidden shadow-xs">
        {versions.map((ver) => {
          const isCurrent = ver.versionNumber === currentPublishedRevision;
          const formattedDate = formatDateTime(ver.createdAt * 1000, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const contentRecord = ver.content as Record<string, unknown> | undefined;
          const targetUrl = (contentRecord?.url as string) || ver.destinationUrl || "";

          return (
            <div
              key={ver.id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-foreground">
                    REV {ver.versionNumber}
                  </span>
                  {isCurrent ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      <Icon icon="hugeicons:checkmark-circle-02" className="w-3 h-3 mr-1" />
                      Live Published
                    </Badge>
                  ) : null}
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                    <Icon icon="hugeicons:calendar-03" className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                <div className="font-mono text-xs text-foreground/90 truncate break-all" title={targetUrl}>
                  {targetUrl || "No destination recorded"}
                </div>

                <div className="text-[11px] text-muted-foreground italic">
                  &ldquo;{ver.changeSummary || "Published to Edge"}&rdquo;
                </div>
              </div>

              {!isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVersion(ver)}
                  className="gap-1.5 text-xs shrink-0 hover:border-primary/50"
                >
                  <Icon icon="hugeicons:rotate-left" className="w-3.5 h-3.5" />
                  <span>Restore as Draft</span>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Restore Confirmation AlertDialog */}
      <AlertDialog open={Boolean(selectedVersion)} onOpenChange={(open) => !open && setSelectedVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon icon="hugeicons:rotate-left" className="w-5 h-5 text-primary" />
              <span>Restore Revision {selectedVersion?.versionNumber} as Draft?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs">
              <p>
                Restoring this revision will load its destination (<strong className="font-mono text-foreground">{((selectedVersion?.content as Record<string, unknown> | undefined)?.url as string) || selectedVersion?.destinationUrl}</strong>) into your working draft.
              </p>
              <p className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-muted-foreground">
                <strong>Safety Guarantee</strong>: This will NOT alter published live scans or overwrite history. It will appear as an unpublished draft ready for review.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={isRestoring}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRestoring ? "Restoring..." : "Restore as Draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
