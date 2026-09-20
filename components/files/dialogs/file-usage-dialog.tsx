"use client";

import React, { useState, useEffect } from "react";
import type { FileSummaryV1, FileUsageV1 } from "@nxtqr/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FileUsageDialogProps {
  file: FileSummaryV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
}

export function FileUsageDialog({
  file,
  open,
  onOpenChange,
  orgSlug,
}: FileUsageDialogProps) {
  const [usages, setUsages] = useState<FileUsageV1[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file || !open) {
      setUsages([]);
      return;
    }

    let isMounted = true;
    const fetchUsages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/organizations/${orgSlug}/files/${file.id}/usages`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            const usageList = Array.isArray(json.data)
              ? json.data
              : Array.isArray(json.data?.usages)
              ? json.data.usages
              : [];
            setUsages(usageList);
          }
        }
      } catch (err) {
        console.error("Failed to load file usages:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUsages();
    return () => {
      isMounted = false;
    };
  }, [file?.id, open, orgSlug]);

  if (!file) return null;

  const safeUsages = Array.isArray(usages) ? usages : [];

  // Group usages by resource type
  const grouped = safeUsages.reduce<Record<string, FileUsageV1[]>>((acc, curr) => {
    acc[curr.resourceType] = acc[curr.resourceType] || [];
    acc[curr.resourceType].push(curr);
    return acc;
  }, {});

  const getResourceHref = (type: string, id: string) => {
    switch (type) {
      case "QR_ASSET":
        return `/${orgSlug}/qr/${id}`;
      case "LANDING_PAGE":
        return `/${orgSlug}/landing-pages/${id}/edit`;
      case "CAMPAIGN":
        return `/${orgSlug}/campaigns/${id}`;
      case "BRAND_KIT":
        return `/${orgSlug}/brand`;
      default:
        return "#";
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "QR_ASSET":
        return "solar:qr-code-bold";
      case "LANDING_PAGE":
        return "solar:window-frame-bold";
      case "CAMPAIGN":
        return "solar:flag-bold";
      case "BRAND_KIT":
        return "solar:palette-bold";
      default:
        return "solar:widget-bold";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl border-border bg-surface p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FA520F]/15 flex items-center justify-center text-[#FA520F]">
              <NxtqrIcon icon="solar:link-circle-bold" size={16} />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Connected Experiences
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {safeUsages.length > 0
              ? `Asset "${file.name}" is currently referenced by ${safeUsages.length} active resource${safeUsages.length === 1 ? "" : "s"}.`
              : `Asset "${file.name}" is not currently referenced by any active resource.`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto space-y-4 py-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-6 h-6 border-2 border-[#FA520F] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs">Querying asset relationships...</span>
            </div>
          ) : safeUsages.length === 0 ? (
            <div className="py-10 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-4">
              <NxtqrIcon
                icon="solar:link-broken-linear"
                size={28}
                className="text-muted-foreground/60 mx-auto mb-2"
              />
              <p className="text-xs font-medium text-foreground">Not currently in use</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                This asset is free from active dependencies and can be safely archived or removed.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                  {category.replace("_", " ")} ({items.length})
                </h4>
                <div className="space-y-1.5">
                  {items.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                          <NxtqrIcon icon={getResourceIcon(usage.resourceType)} size={15} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate block">
                            {usage.resourceName || usage.resourceId}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Role: {usage.usageRole}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {usage.usageRole}
                        </Badge>
                        <Link href={getResourceHref(usage.resourceType, usage.resourceId)}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer">
                            <span>Open</span>
                            <NxtqrIcon icon="solar:arrow-right-up-linear" size={13} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
