"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditEvidenceRecord } from "@nxtqr/contracts";

interface InvestigationCanvasProps {
  event: AuditEvidenceRecord;
  onExit: () => void;
  onSelectEvent: (event: AuditEvidenceRecord) => void;
  orgSlug: string;
}

export function InvestigationCanvas({
  event,
  onExit,
  onSelectEvent,
  orgSlug,
}: InvestigationCanvasProps) {
  const [context, setContext] = React.useState<{
    previousEvents: AuditEvidenceRecord[];
    nextEvents: AuditEvidenceRecord[];
    sameActorEvents: AuditEvidenceRecord[];
    sameTargetEvents: AuditEvidenceRecord[];
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function loadContext() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/organizations/${orgSlug}/audit/${event.id}/investigate`);
        const data = await res.json();
        if (mounted && res.ok && data.data?.investigation) {
          setContext(data.data.investigation);
        }
      } catch (err) {
        console.error("Failed to load investigation context:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadContext();
    return () => {
      mounted = false;
    };
  }, [event.id, orgSlug]);

  return (
    <div className="rounded-xl border border-[#FA520F]/30 bg-[#141414] p-5 sm:p-6 space-y-6 shadow-xl shadow-[#FA520F]/5">
      {/* Investigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FA520F]/15 border border-[#FA520F]/30 flex items-center justify-center text-[#FA520F]">
            <Icon icon="solar:magnifer-linear" className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F7F4EC]">
                Investigation Workspace
              </h3>
              <Badge className="bg-[#FA520F] text-white text-[10px] font-mono">
                PINNED EVENT
              </Badge>
            </div>
            <p className="text-xs text-[#85827B]">
              Reconstructing forensic timeline, preceding/succeeding mutations, and entity relationships.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExit}
          className="border-white/[0.1] bg-[#191919] hover:bg-[#202020] text-xs text-[#F7F4EC] h-8 gap-1.5"
        >
          <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
          <span>Exit Investigation</span>
        </Button>
      </div>

      {/* 3-Column Investigative Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Context & Chronological Sequence */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase text-[#85827B] border-b border-white/[0.06] pb-2">
            <span>Chronological Sequence</span>
            <Icon icon="solar:history-bold" className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-3">
            {/* Preceding Events */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#85827B] uppercase block">
                Preceding Mutations
              </span>
              {context?.previousEvents && context.previousEvents.length > 0 ? (
                context.previousEvents.map((pe) => (
                  <button
                    key={pe.id}
                    onClick={() => onSelectEvent(pe)}
                    className="w-full text-left p-2.5 rounded-lg border border-white/[0.06] bg-[#181818] hover:border-white/[0.16] transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#F7F4EC] truncate">{pe.actionLabel}</span>
                      <span className="font-mono text-[10px] text-[#85827B]">
                        {new Date(pe.occurredAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#85827B] truncate">{pe.actor.name} → {pe.target.name}</p>
                  </button>
                ))
              ) : (
                <p className="text-[11px] text-[#85827B] italic">No preceding events in range.</p>
              )}
            </div>

            {/* Pinned Marker */}
            <div className="p-3 rounded-lg border border-[#FA520F] bg-[#1F1713] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#FA520F] font-bold font-mono text-[10px]">
                <Icon icon="solar:pin-bold" className="w-3 h-3" />
                <span>ACTIVE FOCUS</span>
              </div>
              <div className="font-semibold text-[#F7F4EC]">{event.actionLabel}</div>
              <div className="text-[11px] text-[#85827B] font-mono">
                {new Date(event.occurredAt).toLocaleTimeString()}
              </div>
            </div>

            {/* Succeeding Events */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#85827B] uppercase block">
                Succeeding Mutations
              </span>
              {context?.nextEvents && context.nextEvents.length > 0 ? (
                context.nextEvents.map((ne) => (
                  <button
                    key={ne.id}
                    onClick={() => onSelectEvent(ne)}
                    className="w-full text-left p-2.5 rounded-lg border border-white/[0.06] bg-[#181818] hover:border-white/[0.16] transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#F7F4EC] truncate">{ne.actionLabel}</span>
                      <span className="font-mono text-[10px] text-[#85827B]">
                        {new Date(ne.occurredAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#85827B] truncate">{ne.actor.name} → {ne.target.name}</p>
                  </button>
                ))
              ) : (
                <p className="text-[11px] text-[#85827B] italic">No succeeding events in range.</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Selected Evidence & Changeset Diff */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase text-[#85827B] border-b border-white/[0.06] pb-2">
            <span>Evidence & Changeset</span>
            <Icon icon="solar:git-commit-bold" className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#181818] space-y-2">
              <div className="text-xs font-semibold text-[#F7F4EC]">
                {event.summary}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#85827B]">
                <span>ID: {event.id}</span>
                <span className="text-emerald-400 font-bold uppercase">{event.result}</span>
              </div>
            </div>

            {/* Changeset Diff Box */}
            {event.changes.length > 0 ? (
              <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#181818] space-y-2.5">
                <span className="text-[10px] font-mono text-[#FA520F] uppercase font-semibold">
                  Field Modifications
                </span>
                <div className="space-y-2">
                  {event.changes.map((c) => (
                    <div key={c.field} className="text-xs font-mono p-2 rounded bg-[#121212] border border-white/[0.04] space-y-1">
                      <div className="text-[#85827B] text-[10px] uppercase">{c.field}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 truncate max-w-[120px]">{JSON.stringify(c.before) || "none"}</span>
                        <span className="text-[#85827B]">──►</span>
                        <span className="text-emerald-400 truncate max-w-[120px]">{JSON.stringify(c.after) || "none"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-white/[0.06] text-center text-xs text-[#85827B]">
                No state diff recorded for this operation.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Correlated Entity Relationships */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase text-[#85827B] border-b border-white/[0.06] pb-2">
            <span>Entity Relationships</span>
            <Icon icon="solar:users-group-two-rounded-bold" className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-4">
            {/* Same Actor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#85827B] uppercase">
                <span>Same Actor ({event.actor.name})</span>
                <span>{context?.sameActorEvents?.length ?? 0}</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {context?.sameActorEvents && context.sameActorEvents.length > 0 ? (
                  context.sameActorEvents.map((sa) => (
                    <button
                      key={sa.id}
                      onClick={() => onSelectEvent(sa)}
                      className="w-full text-left p-2 rounded border border-white/[0.04] bg-[#181818] hover:border-white/[0.12] text-xs truncate block"
                    >
                      <span className="font-semibold text-[#F7F4EC]">{sa.actionLabel}</span>
                      <span className="text-[10px] font-mono text-[#85827B] ml-2">
                        {new Date(sa.occurredAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-[#85827B] italic">No other actions by this actor.</p>
                )}
              </div>
            </div>

            {/* Same Target */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#85827B] uppercase">
                <span>Same Target ({event.target.name})</span>
                <span>{context?.sameTargetEvents?.length ?? 0}</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {context?.sameTargetEvents && context.sameTargetEvents.length > 0 ? (
                  context.sameTargetEvents.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => onSelectEvent(st)}
                      className="w-full text-left p-2 rounded border border-white/[0.04] bg-[#181818] hover:border-white/[0.12] text-xs truncate block"
                    >
                      <span className="font-semibold text-[#F7F4EC]">{st.actionLabel}</span>
                      <span className="text-[10px] font-mono text-[#85827B] ml-2">
                        {new Date(st.occurredAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-[#85827B] italic">No other actions on this resource.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
