"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { LandingPageVersionResponseV1 } from "@nxtqr/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VersionTimelineProps {
  pageId: string;
  versions: LandingPageVersionResponseV1[];
  orgSlug: string;
}

export function VersionTimeline({
  pageId,
  versions,
  orgSlug,
}: VersionTimelineProps) {
  const router = useRouter();
  const [restoringVersion, setRestoringVersion] = useState<LandingPageVersionResponseV1 | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!restoringVersion) return;

    setIsRestoring(true);
    try {
      toast.loading(`Restoring Version ${restoringVersion.versionNumber}...`, { id: "restore-ver" });

      const res = await fetch(
        `/api/v1/landing-pages/${pageId}/versions/${restoringVersion.id}/restore`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to restore version snapshot");
      }

      const { data } = await res.json();
      toast.success("Snapshot restored into new draft", {
        id: "restore-ver",
        description: `Draft revision ${data.newDraftVersion} created. Historical records remained immutable.`,
      });

      setRestoringVersion(null);
      router.push(`/${orgSlug}/landing-pages/${pageId}/edit`);
    } catch (err: any) {
      toast.error("Restore failed", { id: "restore-ver", description: err.message });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Immutable Version History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every publication snapshot is permanently preserved and tamper-evident.
          </p>
        </div>

        <Badge variant="outline" className="font-mono text-xs">
          {versions.length} Revision{versions.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {versions.length === 0 ? (
        <div className="py-8 border border-dashed rounded-xl p-4 text-center text-muted-foreground">
          <NxtqrIcon icon="solar:history-linear" size={24} className="mx-auto mb-1.5 opacity-50" />
          <p className="text-xs font-semibold text-foreground">No published versions yet</p>
          <p className="text-[11px] mt-0.5">
            This page is currently a draft. Use Destination Studio to publish your first immutable version.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {versions.map((ver) => {
            const isLive = ver.isLive;

            return (
              <div key={ver.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={cn(
                    "absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 transition-transform group-hover:scale-125",
                    isLive
                      ? "bg-emerald-500 border-background ring-4 ring-emerald-500/20"
                      : "bg-muted-foreground/40 border-background"
                  )}
                />

                <div className="rounded-xl border border-border/40 bg-muted/10 p-3.5 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-foreground">
                        Version {ver.versionNumber}
                      </span>

                      {isLive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-mono px-1.5 py-0">
                          LIVE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] uppercase font-mono px-1.5 py-0">
                          ARCHIVED SNAPSHOT
                        </Badge>
                      )}

                      <span suppressHydrationWarning className="text-[11px] text-muted-foreground font-mono">
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1.5 italic">
                      &quot;{ver.changeSummary}&quot;
                    </p>
                  </div>

                  {!isLive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoringVersion(ver)}
                      className="h-7 text-xs font-medium gap-1 shrink-0"
                    >
                      <NxtqrIcon icon="solar:restart-linear" size={13} />
                      <span>Restore to Draft</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog to Restore Historical Snapshot */}
      <AlertDialog
        open={Boolean(restoringVersion)}
        onOpenChange={(open) => !open && setRestoringVersion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <NxtqrIcon icon="solar:restart-bold" className="text-primary" size={20} />
              <span>Restore Version {restoringVersion?.versionNumber}?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2 text-xs leading-relaxed">
              <p>
                This will copy the historical document from Version {restoringVersion?.versionNumber} into a <strong>NEW working draft</strong>.
              </p>
              <p className="text-muted-foreground">
                <strong>History Invariant:</strong> The original Version {restoringVersion?.versionNumber} snapshot will remain completely immutable and preserved in your audit history.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRestore();
              }}
              disabled={isRestoring}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {isRestoring ? "Restoring..." : "Restore Snapshot"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
