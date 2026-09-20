"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Copy, Check, ExternalLink, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResolverStatusRailProps {
  slug: string;
  host: string;
  publishedRevision: number;
  publishedDestination: string;
  hasUnpublishedChanges: boolean;
  status: string;
}

export function ResolverStatusRail({
  slug,
  host,
  publishedRevision,
  publishedDestination,
  hasUnpublishedChanges,
  status,
}: ResolverStatusRailProps) {
  const [copied, setCopied] = React.useState(false);

  const fullShortUrl = `https://${host}/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("QR URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const cleanDest = publishedDestination
    ? publishedDestination.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "Unset";

  return (
    <div className="w-full bg-card/70 border border-border/80 rounded-xl p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Step 1: Identity */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
              Identity
            </span>
            <code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono font-medium">
              /{slug}
            </code>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Copy Short URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />

        {/* Step 2: Published Revision */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
            Published
          </span>
          <Badge variant="outline" className="font-mono text-[11px] font-normal border-border bg-background">
            Revision {publishedRevision}
          </Badge>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />

        {/* Step 3: Edge Snapshot */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
            Edge
          </span>
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>Snapshot V1</span>
          </div>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />

        {/* Step 4: Destination */}
        <div className="flex items-center gap-2 max-w-[280px]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold shrink-0">
            Destination
          </span>
          <span className="font-mono text-foreground truncate max-w-[180px]" title={publishedDestination}>
            {cleanDest}
          </span>
          {publishedDestination && (
            <a
              href={publishedDestination}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              title="Open Destination"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Unpublished pill */}
        {hasUnpublishedChanges && (
          <Badge className="bg-[#FFA110] text-black hover:bg-[#FFA110]/90 text-[10px] font-medium animate-pulse ml-auto">
            Draft Pending
          </Badge>
        )}
      </div>
    </div>
  );
}
