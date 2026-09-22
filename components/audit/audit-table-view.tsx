"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { AuditEvidenceRecord } from "@nxtqr/contracts";

interface AuditTableViewProps {
  events: AuditEvidenceRecord[];
  onInspectEvent: (event: AuditEvidenceRecord) => void;
}

export function AuditTableView({
  events,
  onInspectEvent,
}: AuditTableViewProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#161616] overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[840px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#191919] text-[11px] font-mono text-[#85827B] uppercase">
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Actor</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Target Resource</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold text-center">Result</th>
              <th className="py-3 px-4 font-semibold">Source</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {events.map((event) => {
              const timeStr = new Date(event.occurredAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              const isSuccess = event.result === "success";
              const isDenied = event.result === "denied";

              return (
                <tr
                  key={event.id}
                  onClick={() => onInspectEvent(event)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors text-xs"
                >
                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#85827B] whitespace-nowrap">
                    {timeStr}
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#232323] border border-white/[0.08] flex items-center justify-center font-bold text-[10px] text-[#FA520F] shrink-0">
                        {event.actor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[#F7F4EC] truncate max-w-[120px]">
                          {event.actor.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#85827B]">
                          {event.actor.type}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#F7F4EC]">
                      {event.actionLabel}
                    </div>
                    <div className="font-mono text-[10px] text-[#FA520F] truncate max-w-[160px]">
                      {event.action}
                    </div>
                  </td>

                  {/* Target */}
                  <td className="py-3 px-4">
                    <div className="text-[#F7F4EC] truncate max-w-[140px]">
                      {event.target.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#85827B] uppercase">
                      {event.target.type}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className="border-white/[0.1] bg-white/[0.04] text-[#B8B5AD] text-[10px] font-mono uppercase"
                    >
                      {event.category}
                    </Badge>
                  </td>

                  {/* Result */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isSuccess
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : isDenied
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {event.result}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#85827B]">
                    {event.source}
                  </td>

                  {/* Inspect Action */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-[#FA520F] hover:underline inline-flex items-center gap-1 font-medium text-xs">
                      Inspect
                      <Icon icon="solar:alt-arrow-right-bold" className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
