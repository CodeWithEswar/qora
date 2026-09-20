"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RESOLVER_CONFIG } from "@nxtqr/config";

export function PlatformDefaultDomainCard() {
  const defaultHost = RESOLVER_CONFIG.defaultHost;
  const resolverPrefix = `${RESOLVER_CONFIG.shortUrlBase}${RESOLVER_CONFIG.resolverPath}/`;

  const handleCopyPrefix = () => {
    navigator.clipboard.writeText(resolverPrefix);
    toast.success("Copied default resolver URL prefix to clipboard");
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/90 text-foreground p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Card Header & Badge row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Icon icon="solar:shield-check-bold" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Platform Default Domain
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE AT EDGE
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                {defaultHost}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                Platform Infrastructure
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPrefix}
            className="h-8 text-xs gap-1.5 border-border bg-surface hover:bg-surface/80 text-foreground cursor-pointer"
          >
            <Icon icon="solar:copy-linear" className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Copy Resolver URL</span>
          </Button>
        </div>
      </div>

      {/* Architectural Description */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <p className="md:col-span-8 text-xs text-muted-foreground leading-relaxed">
          The default global resolver domain for all dynamic QR codes. If a QR code does not have an active customer-owned custom domain assigned, it resolves deterministically through this platform hostname at the Cloudflare edge.
        </p>
        <div className="md:col-span-4 flex md:justify-end">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-muted/60 border border-border/80 px-2.5 py-1 rounded-md">
            <Icon icon="solar:lock-bold" className="w-3.5 h-3.5 text-amber-500" />
            <span>Immutable Platform Core</span>
          </div>
        </div>
      </div>

      {/* Technical Specifications Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">Resolver Prefix</span>
          <span className="text-xs font-mono font-semibold text-foreground truncate block mt-0.5">
            /s/&lt;slug&gt;
          </span>
        </div>
        <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">TLS Certificate</span>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 truncate block mt-0.5">
            Auto-Renewed Edge
          </span>
        </div>
        <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">Edge Cache</span>
          <span className="text-xs font-mono font-semibold text-[#FA520F] truncate block mt-0.5">
            Global KV Snapshot
          </span>
        </div>
        <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">Ownership Scope</span>
          <span className="text-xs font-mono font-semibold text-foreground truncate block mt-0.5">
            NXTQR Platform
          </span>
        </div>
      </div>
    </div>
  );
}
