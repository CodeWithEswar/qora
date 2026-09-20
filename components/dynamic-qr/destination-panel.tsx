"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface DestinationPanelProps {
  publishedDestination: string;
  draftDestination?: string;
  hasUnpublishedChanges: boolean;
  publishedRevision: number;
  updatedAt: string;
  fallbackUrl?: string;
  routingRuleCount?: number;
  onEditDestination: () => void;
  onReviewChanges?: () => void;
  className?: string;
}

export function DestinationPanel({
  publishedDestination,
  draftDestination,
  hasUnpublishedChanges,
  publishedRevision,
  updatedAt,
  fallbackUrl,
  routingRuleCount = 0,
  onEditDestination,
  onReviewChanges,
  className,
}: DestinationPanelProps) {
  const [copied, setCopied] = React.useState(false);

  // Parse host and path
  const parsedPublished = React.useMemo(() => {
    if (!publishedDestination) return { host: "No destination", path: "" };
    try {
      const u = new URL(
        publishedDestination.startsWith("http")
          ? publishedDestination
          : `https://${publishedDestination}`
      );
      return { host: u.hostname, path: u.pathname + u.search + u.hash };
    } catch {
      return { host: publishedDestination, path: "" };
    }
  }, [publishedDestination]);

  const parsedDraft = React.useMemo(() => {
    if (!draftDestination) return null;
    try {
      const u = new URL(
        draftDestination.startsWith("http")
          ? draftDestination
          : `https://${draftDestination}`
      );
      return { host: u.hostname, path: u.pathname + u.search + u.hash };
    } catch {
      return { host: draftDestination, path: "" };
    }
  }, [draftDestination]);

  const handleCopyDestination = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Destination URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy URL");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Icon icon="hugeicons:link-square-02" className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Destination
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-wide uppercase border-border"
          >
            {routingRuleCount > 0 ? "Routed Default" : "Default Route"}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Where eligible scans resolve. Updates take effect immediately at the edge once published.
        </p>

        {/* Current Published Destination Card */}
        <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {hasUnpublishedChanges ? "Published Destination" : "Current Destination"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopyDestination(publishedDestination)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Copy Destination URL"
                aria-label="Copy destination URL"
              >
                <Icon
                  icon={copied ? "hugeicons:tick-02" : "hugeicons:copy-01"}
                  className="w-3.5 h-3.5"
                />
              </button>
              {publishedDestination && (
                <a
                  href={publishedDestination.startsWith("http") ? publishedDestination : `https://${publishedDestination}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Open in new tab"
                  aria-label="Open destination in new tab"
                >
                  <Icon icon="hugeicons:arrow-up-right-01" className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="text-xs font-mono break-all leading-snug">
            <span className="font-bold text-foreground">{parsedPublished.host}</span>
            <span className="text-muted-foreground">{parsedPublished.path || "/"}</span>
          </div>
        </div>

        {/* Draft Destination Card (Rendered only when unpublished changes exist) */}
        {hasUnpublishedChanges && parsedDraft && (
          <div className="p-3.5 rounded-xl bg-primary/[0.04] border border-primary/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                <Icon icon="hugeicons:edit-02" className="w-3.5 h-3.5" />
                <span>Draft Destination</span>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-mono uppercase h-4 px-1.5">
                Unpublished
              </Badge>
            </div>

            <div className="text-xs font-mono break-all leading-snug">
              <span className="font-bold text-foreground">{parsedDraft.host}</span>
              <span className="text-muted-foreground">{parsedDraft.path || "/"}</span>
            </div>
          </div>
        )}

        {/* Fallback Destination (if configured in D1) */}
        {fallbackUrl && (
          <div className="p-3 rounded-lg bg-surface-elevated/40 border border-border/50 text-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
              Fallback Destination
            </div>
            <div className="font-mono text-foreground truncate">{fallbackUrl}</div>
          </div>
        )}

        {/* Metadata Grid: Revision & Last Published */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Published Revision
            </div>
            <div className="font-bold text-foreground mt-0.5">
              Rev {publishedRevision}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-border/50">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Last Published
            </div>
            <div className="font-medium text-foreground mt-0.5 truncate">
              {new Date(updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="space-y-2 pt-4 border-t border-border/60">
        {hasUnpublishedChanges && onReviewChanges ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={onReviewChanges}
              size="sm"
              className="flex-1 h-9 text-xs bg-primary hover:bg-[#CC3A05] text-white font-semibold gap-1.5 shadow-xs"
            >
              <Icon icon="hugeicons:rocket" className="w-3.5 h-3.5" />
              <span>Review & Publish</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEditDestination}
              className="h-9 px-3 text-xs bg-surface border-border"
            >
              <Icon icon="hugeicons:edit-02" className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={onEditDestination}
            size="sm"
            className="w-full h-9 text-xs bg-primary hover:bg-[#CC3A05] text-white font-semibold gap-2 shadow-xs"
          >
            <Icon icon="hugeicons:edit-02" className="w-3.5 h-3.5" />
            <span>Edit Destination</span>
          </Button>
        )}
      </div>
    </div>
  );
}
