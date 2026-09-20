"use client";

import * as React from "react";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn, formatDateTime } from "@/lib/utils";

export interface CampaignActivityItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actorName: string;
  actorEmail?: string;
  actorAvatarUrl?: string;
}

export interface CampaignActivityProps {
  items: CampaignActivityItem[];
  isLoading?: boolean;
  className?: string;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: string; category: "campaign" | "qr" | "routing" }
> = {
  "campaign.created": {
    label: "Campaign created",
    icon: "solar:flag-bold",
    category: "campaign",
  },
  "campaign.updated": {
    label: "Campaign updated",
    icon: "solar:pen-2-bold",
    category: "campaign",
  },
  "campaign.archived": {
    label: "Campaign archived",
    icon: "solar:archive-down-bold",
    category: "campaign",
  },
  "campaign.deleted": {
    label: "Campaign deleted",
    icon: "solar:trash-bin-trash-bold",
    category: "campaign",
  },
  "campaign.qr_added": {
    label: "QR codes assigned",
    icon: "solar:add-circle-bold",
    category: "qr",
  },
  "campaign.qr_removed": {
    label: "QR code detached",
    icon: "solar:link-broken-minimalistic-bold",
    category: "qr",
  },
  "routing.updated": {
    label: "Routing rule modified",
    icon: "solar:tuning-bold",
    category: "routing",
  },
};

export function CampaignActivity({
  items,
  isLoading = false,
  className,
}: CampaignActivityProps) {
  const [activeFilter, setActiveFilter] = React.useState<"all" | "campaign" | "qr" | "routing">("all");

  const filteredItems = React.useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => {
      const config = ACTION_CONFIG[item.action];
      return config?.category === activeFilter;
    });
  }, [items, activeFilter]);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface p-4 sm:p-5 shadow-2xs space-y-4",
        className
      )}
    >
      {/* Header and Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
            <NxtqrIcon icon="solar:history-bold" size={12} />
            <span>Audit Trail</span>
          </div>
          <h2 className="text-sm font-bold text-foreground mt-0.5">
            Campaign Activity Stream
          </h2>
        </div>

        <div className="flex items-center border border-border rounded-lg p-0.5 bg-surface-elevated/50 text-[11px] font-mono">
          {(
            [
              { id: "all", label: "All" },
              { id: "campaign", label: "Campaign" },
              { id: "qr", label: "QR Assets" },
              { id: "routing", label: "Routing" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                activeFilter === tab.id
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <NxtqrIcon icon="solar:restart-linear" size={14} className="animate-spin text-primary" />
          <span>Loading activity stream…</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground bg-surface/40 rounded-lg border border-dashed border-border/60">
          No activity recorded for this category yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((event) => {
            const config = ACTION_CONFIG[event.action] || {
              label: event.action,
              icon: "solar:clock-circle-bold",
              category: "campaign" as const,
            };

            return (
              <div
                key={event.id}
                className="flex items-start gap-3 text-xs p-3 rounded-xl bg-surface-elevated/40 border border-border/50 transition-colors hover:bg-muted/20"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                  <NxtqrIcon icon={config.icon} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {config.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                      {formatDateTime(event.createdAt, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    by <span className="font-medium text-foreground">{event.actorName}</span>
                    {event.metadata?.name ? (
                      <span> &mdash; &ldquo;{String(event.metadata.name)}&rdquo;</span>
                    ) : null}
                    {event.metadata?.qrCount !== undefined ? (
                      <span> ({String(event.metadata.qrCount)} QR assets)</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
