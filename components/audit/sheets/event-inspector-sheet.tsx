"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditEvidenceRecord } from "@nxtqr/contracts";
import { toast } from "sonner";

interface EventInspectorSheetProps {
  event: AuditEvidenceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onInvestigate: (event: AuditEvidenceRecord) => void;
  onViewActorHistory: (actorId: string, actorName: string) => void;
  onViewTargetHistory: (targetType: string, targetId: string, targetName: string) => void;
  onViewTrace?: (correlationId: string) => void;
}

export function EventInspectorSheet({
  event,
  isOpen,
  onClose,
  onInvestigate,
  onViewActorHistory,
  onViewTargetHistory,
  onViewTrace,
}: EventInspectorSheetProps) {
  const [diffViewMode, setDiffViewMode] = React.useState<"structured" | "json">("structured");

  if (!event) return null;

  const copyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied.`);
  };

  const isSuccess = event.result === "success";
  const isDenied = event.result === "denied";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl bg-[#141414] border-l border-white/[0.08] text-[#F7F4EC] p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="text-left space-y-2 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-[#FA520F]/30 bg-[#FA520F]/10 text-[#FA520F] text-[10px] font-mono uppercase"
            >
              {event.category}
            </Badge>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : isDenied
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
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
              <span>{event.result}</span>
            </span>
          </div>

          <SheetTitle className="text-xl font-bold text-[#F7F4EC]">
            {event.actionLabel}
          </SheetTitle>

          <SheetDescription className="text-xs font-mono text-[#85827B]">
            {new Date(event.occurredAt).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "medium",
            })}
          </SheetDescription>
        </SheetHeader>

        {/* Primary Corridor: Actor -> Action -> Target -> Result */}
        <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#181818] space-y-2 text-xs font-mono">
          <div className="text-[10px] uppercase text-[#85827B] font-semibold">
            FORENSIC TRAVERSAL
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[#B8B5AD]">
            <span className="text-[#FA520F] font-semibold">{event.actor.name}</span>
            <span className="text-[#85827B]">──►</span>
            <span className="text-[#F7F4EC]">{event.actionLabel}</span>
            <span className="text-[#85827B]">──►</span>
            <span className="text-[#FFD06A]">{event.target.name}</span>
            <span className="text-[#85827B]">──►</span>
            <span className={isSuccess ? "text-emerald-400" : "text-rose-400"}>
              {event.result.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-[#85827B] font-semibold">
            SUMMARY EXPLANATION
          </div>
          <p className="text-xs text-[#F7F4EC] leading-relaxed p-3 rounded-lg border border-white/[0.06] bg-[#181818]">
            {event.summary}
          </p>
        </div>

        {/* Changeset Diff Section */}
        {event.changes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#85827B] font-semibold">
                CHANGESET DIFF ({event.changes.length} fields)
              </span>

              <div className="inline-flex rounded-md border border-white/[0.08] bg-[#121212] p-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setDiffViewMode("structured")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    diffViewMode === "structured"
                      ? "bg-[#FA520F] text-white font-bold"
                      : "text-[#85827B] hover:text-[#F7F4EC]"
                  }`}
                >
                  STRUCTURED
                </button>
                <button
                  onClick={() => setDiffViewMode("json")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    diffViewMode === "json"
                      ? "bg-[#FA520F] text-white font-bold"
                      : "text-[#85827B] hover:text-[#F7F4EC]"
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>

            {diffViewMode === "structured" ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {event.changes.map((c) => (
                  <div
                    key={c.field}
                    className="p-2.5 rounded-lg border border-white/[0.06] bg-[#181818] space-y-1 text-xs font-mono"
                  >
                    <div className="text-[#85827B] text-[10px] uppercase font-semibold">
                      {c.field}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04]">
                      <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 truncate">
                        <span className="text-[9px] uppercase text-rose-400/70 block">Before</span>
                        {JSON.stringify(c.before) || "none"}
                      </div>
                      <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 truncate">
                        <span className="text-[9px] uppercase text-emerald-400/70 block">After</span>
                        {JSON.stringify(c.after) || "none"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="p-3 rounded-lg border border-white/[0.06] bg-[#121212] font-mono text-[11px] text-[#B8B5AD] max-h-60 overflow-auto scrollbar-thin select-all">
                {JSON.stringify(event.changes, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Authorization Proof if captured */}
        {event.authorization && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#85827B] font-semibold">
              AUTHORIZATION EVIDENCE
            </span>
            <div className="p-3 rounded-lg border border-white/[0.06] bg-[#181818] text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#85827B]">Permission:</span>
                <span className="text-[#FA520F] font-semibold">
                  {event.authorization.permission || event.action}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#85827B]">Decision:</span>
                <span className="text-emerald-400 font-semibold uppercase">
                  {event.authorization.decision}
                </span>
              </div>
              {event.authorization.role && (
                <div className="flex items-center justify-between">
                  <span className="text-[#85827B]">Actor Role:</span>
                  <span className="text-[#F7F4EC]">{event.authorization.role}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Forensic Context & IDs */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-[#85827B] font-semibold">
            IDENTIFIERS & CONTEXT
          </span>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-[#181818] text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#85827B]">Event ID:</span>
              <button
                onClick={() => copyText(event.id, "Event ID")}
                className="text-[#F7F4EC] hover:text-[#FA520F] flex items-center gap-1"
              >
                <span className="truncate max-w-[180px]">{event.id}</span>
                <Icon icon="solar:copy-bold" className="w-3 h-3 text-[#85827B]" />
              </button>
            </div>

            {event.request?.requestId && (
              <div className="flex items-center justify-between">
                <span className="text-[#85827B]">Request ID:</span>
                <button
                  onClick={() => copyText(event.request!.requestId!, "Request ID")}
                  className="text-[#F7F4EC] hover:text-[#FA520F] flex items-center gap-1"
                >
                  <span className="truncate max-w-[180px]">{event.request.requestId}</span>
                  <Icon icon="solar:copy-bold" className="w-3 h-3 text-[#85827B]" />
                </button>
              </div>
            )}

            {event.request?.correlationId && (
              <div className="flex items-center justify-between">
                <span className="text-[#85827B]">Correlation ID:</span>
                <button
                  onClick={() => copyText(event.request!.correlationId!, "Correlation ID")}
                  className="text-[#F7F4EC] hover:text-[#FA520F] flex items-center gap-1"
                >
                  <span className="truncate max-w-[180px]">{event.request.correlationId}</span>
                  <Icon icon="solar:copy-bold" className="w-3 h-3 text-[#85827B]" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[#85827B]">Source:</span>
              <span className="text-[#F7F4EC]">{event.source}</span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInvestigate(event)}
            className="border-white/[0.1] bg-[#181818] hover:bg-[#202020] text-xs text-[#F7F4EC] gap-1.5"
          >
            <Icon icon="solar:magnifer-linear" className="w-3.5 h-3.5 text-[#FFB83E]" />
            <span>Investigate Event</span>
          </Button>

          {event.actor.id && event.actor.id !== "system" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewActorHistory(event.actor.id, event.actor.name)}
              className="border-white/[0.1] bg-[#181818] hover:bg-[#202020] text-xs text-[#F7F4EC] gap-1.5"
            >
              <Icon icon="solar:user-bold" className="w-3.5 h-3.5 text-[#FA520F]" />
              <span>Actor History</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTargetHistory(event.target.type, event.target.id, event.target.name)}
              className="border-white/[0.1] bg-[#181818] hover:bg-[#202020] text-xs text-[#F7F4EC] gap-1.5"
            >
              <Icon icon="solar:box-minimalistic-bold" className="w-3.5 h-3.5 text-[#FFD06A]" />
              <span>Target History</span>
            </Button>
          )}

          {event.request?.correlationId && onViewTrace && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTrace(event.request!.correlationId!)}
              className="col-span-2 border-white/[0.1] bg-[#181818] hover:bg-[#202020] text-xs text-[#F7F4EC] gap-1.5"
            >
              <Icon icon="solar:route-bold" className="w-3.5 h-3.5 text-[#FA520F]" />
              <span>View Correlated Trace ({event.correlationCount ?? 0} other events)</span>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
