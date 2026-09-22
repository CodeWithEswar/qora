"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditEvidenceRecord } from "@nxtqr/contracts";
import { toast } from "sonner";

interface EvidenceStreamProps {
  events: AuditEvidenceRecord[];
  onInspectEvent: (event: AuditEvidenceRecord) => void;
  onInvestigateEvent: (event: AuditEvidenceRecord) => void;
  onFilterActor?: (actorId: string) => void;
  onFilterTarget?: (targetType: string, targetId: string) => void;
}

export function EvidenceStream({
  events,
  onInspectEvent,
  onInvestigateEvent,
  onFilterActor,
  onFilterTarget,
}: EvidenceStreamProps) {
  const copyEventId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success("Event ID copied.");
  };

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const timeStr = new Date(event.occurredAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const dateStr = new Date(event.occurredAt).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        const isSuccess = event.result === "success";
        const isFailed = event.result === "failed";
        const isDenied = event.result === "denied";

        return (
          <div
            key={event.id}
            onClick={() => onInspectEvent(event)}
            className="group relative rounded-xl border border-white/[0.08] bg-[#161616] p-4 sm:p-5 hover:border-[#FA520F]/40 hover:bg-[#1A1A1A] transition-all cursor-pointer space-y-3.5"
          >
            {/* Top Bar: Time, Fingerprint, Status & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[#85827B]">
                  {dateStr} · {timeStr}
                </span>

                {/* Fingerprint: [ACTOR] ━ [ACTION] ━ [TARGET] ━ [RESULT] */}
                <div className="inline-flex items-center gap-1 font-mono text-[10px] text-[#B8B5AD] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  <span className="text-[#F7F4EC] uppercase font-semibold">
                    {event.actor.type}
                  </span>
                  <span>━</span>
                  <span className="text-[#FA520F] uppercase truncate max-w-[140px]">
                    {event.action}
                  </span>
                  <span>━</span>
                  <span className="text-[#B8B5AD] uppercase truncate max-w-[100px]">
                    {event.target.type}
                  </span>
                  <span>━</span>
                  <span
                    className={
                      isSuccess
                        ? "text-emerald-400 uppercase font-semibold"
                        : isDenied
                        ? "text-amber-400 uppercase font-semibold"
                        : "text-rose-400 uppercase font-semibold"
                    }
                  >
                    {event.result}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => copyEventId(event.id, e)}
                  title="Copy Event ID"
                  className="text-[10px] font-mono text-[#85827B] hover:text-[#F7F4EC] h-7 px-2"
                >
                  <Icon icon="solar:copy-bold" className="w-3 h-3 mr-1" />
                  {event.id.substring(0, 8)}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInvestigateEvent(event);
                  }}
                  className="border-white/[0.08] bg-[#191919] hover:bg-[#222222] hover:border-[#FA520F]/40 text-xs text-[#F7F4EC] h-7 gap-1"
                >
                  <Icon icon="solar:magnifer-linear" className="w-3 h-3 text-[#FFB83E]" />
                  <span>Investigate</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => onInspectEvent(event)}
                  className="bg-[#FA520F]/15 text-[#FA520F] hover:bg-[#FA520F] hover:text-white text-xs h-7 gap-1"
                >
                  <span>Inspect</span>
                  <Icon icon="solar:alt-arrow-right-bold" className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Human Readable Summary */}
            <div className="text-sm font-semibold text-[#F7F4EC] group-hover:text-white leading-snug">
              {event.summary}
            </div>

            {/* Actor -> Action -> Target -> Result Breadcrumb Corridor */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono text-[#B8B5AD]">
              {/* Actor */}
              <div className="flex items-center gap-1.5 bg-[#121212] px-2 py-1 rounded border border-white/[0.04]">
                <Icon
                  icon={
                    event.actor.type === "api_key"
                      ? "solar:key-minimalistic-square-bold"
                      : event.actor.type === "system"
                      ? "solar:server-square-bold"
                      : "solar:user-bold"
                  }
                  className="w-3.5 h-3.5 text-[#FA520F]"
                />
                <span className="text-[#F7F4EC] truncate max-w-[120px]">
                  {event.actor.name}
                </span>
              </div>

              <span className="text-[#85827B]">──►</span>

              {/* Action */}
              <div className="flex items-center gap-1.5 bg-[#121212] px-2 py-1 rounded border border-white/[0.04]">
                <Icon icon="solar:route-bold" className="w-3.5 h-3.5 text-[#FFB83E]" />
                <span className="text-[#F7F4EC]">{event.actionLabel}</span>
              </div>

              <span className="text-[#85827B]">──►</span>

              {/* Target */}
              <div className="flex items-center gap-1.5 bg-[#121212] px-2 py-1 rounded border border-white/[0.04]">
                <Icon icon="solar:box-minimalistic-bold" className="w-3.5 h-3.5 text-[#FFD06A]" />
                <span className="text-[#F7F4EC] truncate max-w-[140px]">
                  {event.target.name}
                </span>
              </div>

              <span className="text-[#85827B]">──►</span>

              {/* Result */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded border ${
                  isSuccess
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isDenied
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                <Icon
                  icon={
                    isSuccess
                      ? "solar:check-circle-bold"
                      : isDenied
                      ? "solar:shield-warning-bold"
                      : "solar:close-circle-bold"
                  }
                  className="w-3.5 h-3.5"
                />
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  {event.result}
                </span>
              </div>

              {/* Changes badge if present */}
              {event.changes.length > 0 && (
                <div className="ml-auto inline-flex items-center gap-1 text-[10px] text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20 font-sans">
                  <Icon icon="solar:git-commit-bold" className="w-3 h-3" />
                  <span>{event.changes.length} fields modified</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
