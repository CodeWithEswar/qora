"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface QrActivityEventItem {
  id: string;
  action: string;
  createdAt: string;
  actorName: string;
  actorEmail?: string;
  actorAvatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface RecentActivityProps {
  items: QrActivityEventItem[];
  orgSlug: string;
  className?: string;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: string; dotClass: string }
> = {
  "qr.created": {
    label: "QR Created",
    icon: "hugeicons:plus-sign",
    dotClass: "bg-muted-foreground",
  },
  "qr.updated": {
    label: "Configuration Updated",
    icon: "hugeicons:edit-02",
    dotClass: "bg-primary",
  },
  "destination.updated": {
    label: "Destination Saved as Draft",
    icon: "hugeicons:edit-02",
    dotClass: "bg-primary",
  },
  "qr.published": {
    label: "Changes Published to Edge",
    icon: "hugeicons:rocket",
    dotClass: "bg-emerald-500",
  },
  "qr.paused": {
    label: "QR Paused",
    icon: "hugeicons:pause",
    dotClass: "bg-amber-500",
  },
  "qr.resumed": {
    label: "QR Resumed",
    icon: "hugeicons:play",
    dotClass: "bg-emerald-500",
  },
  "qr.archived": {
    label: "QR Archived",
    icon: "hugeicons:archive",
    dotClass: "bg-rose-500",
  },
};

export function RecentActivity({ items = [], className }: RecentActivityProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4",
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Icon icon="hugeicons:time-quarter-past" className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Recent Activity
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {items.length} Event{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Content */}
        <div className="mt-4">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent activity recorded.
            </div>
          ) : (
            <div className="relative pl-4 space-y-4 border-l border-border/60 my-1">
              {items.slice(0, 5).map((item) => {
                const conf = ACTION_CONFIG[item.action] || {
                  label: item.action.replace(/_/g, " "),
                  icon: "hugeicons:activity-01",
                  dotClass: "bg-muted-foreground",
                };

                const dateDisplay = new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={item.id} className="relative group/event">
                    {/* Timeline Node Dot */}
                    <div
                      className={cn(
                        "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-surface",
                        conf.dotClass
                      )}
                    />

                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        <span>{conf.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground font-normal">
                          {dateDisplay}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        By <span className="text-foreground">{item.actorName || "Workspace Member"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Verified audit log.</span>
      </div>
    </div>
  );
}
