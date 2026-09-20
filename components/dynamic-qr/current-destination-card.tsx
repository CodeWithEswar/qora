"use client";

import * as React from "react";
import { Globe, Edit3, ExternalLink, Calendar, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CurrentDestinationCardProps {
  publishedDestination: string;
  publishedRevision: number;
  updatedAt: string;
  ownerName?: string;
  onEditClick: () => void;
}

export function CurrentDestinationCard({
  publishedDestination,
  publishedRevision,
  updatedAt,
  ownerName,
  onEditClick,
}: CurrentDestinationCardProps) {
  const formattedDate = React.useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(updatedAt));
    } catch {
      return "Recently";
    }
  }, [updatedAt]);

  return (
    <div className="flex flex-col justify-between w-full h-full p-6 bg-card/80 dark:bg-card/50 rounded-2xl border border-border shadow-xs backdrop-blur-xs">
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Current Destination
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            Default Route
          </Badge>
        </div>

        {/* Primary Destination Display */}
        <div className="mt-5">
          <div className="text-xs text-muted-foreground mb-1">Resolves to</div>
          <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80 break-all font-mono text-sm font-semibold text-foreground flex items-start justify-between gap-2">
            <span className="select-all">
              {publishedDestination || "https://example.com"}
            </span>
            {publishedDestination && (
              <a
                href={publishedDestination}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors shrink-0 pt-0.5"
                title="Test destination URL"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Metadata Details */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-background/60 border border-border/50">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Edge Status
            </div>
            <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Revision {publishedRevision} Live</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-background/60 border border-border/50">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Last Published
            </div>
            <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span suppressHydrationWarning>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground">
          Edits save to draft before edge deployment.
        </span>
        <Button
          onClick={onEditClick}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Destination</span>
        </Button>
      </div>
    </div>
  );
}
