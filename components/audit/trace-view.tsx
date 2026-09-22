"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { AuditEvidenceRecord } from "@nxtqr/contracts";

interface TraceViewProps {
  events: AuditEvidenceRecord[];
  onInspectEvent: (event: AuditEvidenceRecord) => void;
}

export function TraceView({ events, onInspectEvent }: TraceViewProps) {
  // Group events by correlation ID or request ID
  const groupedTraces = React.useMemo(() => {
    const map = new Map<string, AuditEvidenceRecord[]>();
    for (const e of events) {
      const key = e.request?.correlationId || e.request?.requestId || "standalone";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([traceId, traceEvents]) => ({
      traceId,
      isCorrelated: traceId !== "standalone" && traceEvents.length > 1,
      events: traceEvents.sort((a, b) => a.timestamp - b.timestamp),
    }));
  }, [events]);

  return (
    <div className="space-y-6">
      {groupedTraces.map((group) => (
        <div
          key={group.traceId}
          className="rounded-xl border border-white/[0.08] bg-[#161616] p-5 space-y-4"
        >
          {/* Trace Group Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <Icon
                icon={group.isCorrelated ? "solar:route-bold" : "solar:point-on-map-bold"}
                className={`w-4 h-4 ${group.isCorrelated ? "text-[#FA520F]" : "text-[#85827B]"}`}
              />
              <span className="font-mono font-semibold text-[#F7F4EC]">
                {group.isCorrelated ? `TRACE: ${group.traceId}` : "STANDALONE OPERATIONS"}
              </span>
              {group.isCorrelated && (
                <span className="text-[10px] font-mono text-[#FA520F] bg-[#FA520F]/10 px-1.5 py-0.2 rounded">
                  {group.events.length} correlated events
                </span>
              )}
            </div>

            <span className="text-[11px] text-[#85827B] font-mono">
              {new Date(group.events[0].occurredAt).toLocaleString()}
            </span>
          </div>

          {/* Connected Event Pipeline */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
            {group.events.map((e) => (
              <div
                key={e.id}
                onClick={() => onInspectEvent(e)}
                className="group relative flex items-start gap-3 p-3 rounded-lg border border-white/[0.04] bg-[#191919] hover:border-[#FA520F]/40 hover:bg-[#1E1713] cursor-pointer transition-all"
              >
                {/* Bullet Node */}
                <div className="absolute -left-[29px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-[#161616] bg-[#FA520F]" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#F7F4EC] group-hover:text-white truncate">
                      {e.actionLabel}
                    </span>
                    <span className="text-[10px] font-mono text-[#85827B]">
                      {new Date(e.occurredAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#B8B5AD] mt-0.5 line-clamp-1">
                    {e.summary}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[#85827B]">
                    <span>Actor: {e.actor.name}</span>
                    <span>•</span>
                    <span>Target: {e.target.name}</span>
                    <span>•</span>
                    <span
                      className={
                        e.result === "success"
                          ? "text-emerald-400"
                          : e.result === "denied"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }
                    >
                      {e.result.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
