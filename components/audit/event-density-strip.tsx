"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { AuditDensityPoint } from "@nxtqr/contracts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventDensityStripProps {
  density: AuditDensityPoint[];
  onSelectBucket?: (bucketTime: string) => void;
}

export function EventDensityStrip({
  density,
  onSelectBucket,
}: EventDensityStripProps) {
  const maxCount = React.useMemo(() => {
    return Math.max(1, ...density.map((d) => d.count));
  }, [density]);

  const totalEvents = React.useMemo(() => {
    return density.reduce((acc, d) => acc + d.count, 0);
  }, [density]);

  if (density.length === 0) return null;

  const firstDate = new Date(density[0].timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const lastDate = new Date(
    density[density.length - 1].timestamp
  ).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="border-b border-white/[0.08] bg-[#141414] px-6 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#85827B]">
          <div className="flex items-center gap-1.5 font-semibold tracking-wider uppercase">
            <Icon icon="solar:chart-2-bold" className="w-3.5 h-3.5 text-[#FA520F]" />
            <span>TEMPORAL EVENT DENSITY ({totalEvents} events)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{firstDate}</span>
            <span>━━━━</span>
            <span>{lastDate} (NOW)</span>
          </div>
        </div>

        {/* Horizontal Density Rail */}
        <div className="grid grid-cols-12 gap-1.5 h-6 items-end">
          {density.map((bucket, i) => {
            const heightPercent = bucket.count > 0 ? Math.max(15, (bucket.count / maxCount) * 100) : 0;
            const hasActivity = bucket.count > 0;

            const timeLabel = new Date(bucket.timestamp).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Tooltip key={bucket.timeBucket || i}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectBucket?.(bucket.timeBucket)}
                    className="w-full h-full flex items-end group focus:outline-hidden"
                  >
                    <div
                      className={`w-full rounded-xs transition-all duration-200 ${
                        hasActivity
                          ? "bg-[#FA520F]/70 group-hover:bg-[#FA520F] group-hover:shadow-xs group-hover:shadow-[#FA520F]/30"
                          : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                      }`}
                      style={{
                        height: hasActivity ? `${heightPercent}%` : "3px",
                      }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E1E1E] text-xs text-[#F7F4EC] border-white/10 p-2 space-y-1">
                  <div className="font-semibold">{timeLabel}</div>
                  <div className="font-mono text-[10px] text-[#FA520F]">
                    {bucket.count} {bucket.count === 1 ? "audit record" : "audit records"}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
