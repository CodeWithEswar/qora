"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RecentSignalItem {
  id: string;
  qrName: string;
  countryCode: string;
  region: string;
  deviceType: string;
  osName: string;
  browserName: string;
  destinationUrl: string;
  hourBucket: string;
}

interface RecentSignalStreamProps {
  signals: RecentSignalItem[];
  className?: string;
}

export function RecentSignalStream({ signals = [], className }: RecentSignalStreamProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500/80" />
            <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
              Recent Scan Signals
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            PERSISTED TELEMETRY
          </span>
        </div>

        <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {signals.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No recent scan signals captured in this window.
            </div>
          ) : (
            signals.slice(0, 10).map((signal) => {
              const date = new Date(signal.hourBucket);
              const timeString = date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              });

              return (
                <div
                  key={signal.id}
                  className="p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shrink-0">
                      {signal.countryCode}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate text-[11px]">
                        {signal.qrName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="capitalize">{signal.deviceType}</span>
                        <span>·</span>
                        <span>{signal.osName}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-muted-foreground shrink-0 tabular-nums">
                    {timeString} UTC
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Bounded to latest 25 recorded edge events</span>
        <span>UTC semantics</span>
      </div>
    </div>
  );
}
