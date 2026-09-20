"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildResolverKvKey } from "@nxtqr/contracts";
import { toast } from "sonner";

export interface ResolverInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  host: string;
  publishedRevision: number;
  publishedDestination: string;
  routingRuleCount: number;
  status: string;
}

export function ResolverInspectorSheet({
  open,
  onOpenChange,
  slug,
  host,
  publishedRevision,
  publishedDestination,
  routingRuleCount,
  status,
}: ResolverInspectorSheetProps) {
  const [copiedKey, setCopiedKey] = React.useState(false);

  const canonicalKvKey = buildResolverKvKey({ host, slug });

  const handleCopyKvKey = async () => {
    try {
      await navigator.clipboard.writeText(canonicalKvKey);
      setCopiedKey(true);
      toast.success("KV key copied");
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      toast.error("Failed to copy KV key");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 font-mono text-base">
            <Icon icon="hugeicons:terminal" className="w-4 h-4 text-primary" />
            <span>Edge Resolver Inspector</span>
          </SheetTitle>
          <SheetDescription className="text-xs">
            Direct operational telemetry and distributed KV snapshot metadata for this Dynamic QR.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6 text-xs">
          {/* Section 1: Resolver Namespace & Identity */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              01. Resolver Identity
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Host / Domain:</span>
                <span className="font-semibold text-foreground">{host}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Short Slug:</span>
                <span className="font-semibold text-primary">/s/{slug}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Lifecycle State:</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  {status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Section 2: Canonical Cache Key */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              02. Edge Resolver Cache Key
            </div>
            <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-2">
              <code className="font-mono text-[11px] text-foreground select-all break-all">
                {canonicalKvKey}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleCopyKvKey}
                aria-label="Copy cache key"
              >
                <Icon
                  icon={copiedKey ? "hugeicons:tick-02" : "hugeicons:copy-01"}
                  className="w-3.5 h-3.5"
                />
              </Button>
            </div>
          </div>

          {/* Section 3: Published Snapshot Contract */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              03. Snapshot Contract V1
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Published Revision:</span>
                <span className="font-semibold text-foreground">Revision {publishedRevision}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Contract Version:</span>
                <span className="font-semibold text-foreground">QrResolverSnapshotV1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Routing Rules:</span>
                <span className="font-semibold text-foreground">{routingRuleCount} rules</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Default Target:</span>
                <span className="font-semibold text-foreground truncate max-w-[200px]" title={publishedDestination}>
                  {publishedDestination}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Resolution Architecture Pipeline */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              04. Edge Resolution Flow
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-start gap-2.5">
                <Icon icon="hugeicons:cpu" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Hot Path: Edge Memory Cache</div>
                  <div className="text-muted-foreground text-[11px]">
                    Distributed key-value lookup directly at the global edge point-of-presence.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Icon icon="hugeicons:database" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Cold Path: Database Fallback & Auto-Repair</div>
                  <div className="text-muted-foreground text-[11px]">
                    On cache miss, queries authoritative relational store and syncs edge cache asynchronously.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Icon icon="hugeicons:route-01" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Telemetry: Durable Event Queue</div>
                  <div className="text-muted-foreground text-[11px]">
                    Asynchronous ScanEventV1 pipeline. Redirects never wait for analytics writes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
