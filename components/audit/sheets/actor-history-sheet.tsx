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
import { AuditEvidenceRecord } from "@nxtqr/contracts";

interface ActorHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  actorId: string;
  actorName: string;
  orgSlug: string;
  onSelectEvent: (event: AuditEvidenceRecord) => void;
}

export function ActorHistorySheet({
  isOpen,
  onClose,
  actorId,
  actorName,
  orgSlug,
  onSelectEvent,
}: ActorHistorySheetProps) {
  const [history, setHistory] = React.useState<AuditEvidenceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && actorId) {
      let mounted = true;
      async function loadHistory() {
        setIsLoading(true);
        try {
          const res = await fetch(
            `/api/v1/organizations/${orgSlug}/audit?actorId=${actorId}&limit=50`
          );
          const data = await res.json();
          if (mounted && res.ok && data.data?.events) {
            setHistory(data.data.events);
          }
        } catch (err) {
          console.error("Failed to load actor history:", err);
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
      loadHistory();
      return () => {
        mounted = false;
      };
    }
  }, [isOpen, actorId, orgSlug]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-[#141414] border-l border-white/[0.08] text-[#F7F4EC] p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="text-left space-y-2 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FA520F] uppercase">
            <Icon icon="solar:user-bold" className="w-4 h-4" />
            <span>Actor Historical Evidence</span>
          </div>
          <SheetTitle className="text-lg font-bold text-[#F7F4EC]">
            {actorName}
          </SheetTitle>
          <SheetDescription className="text-xs font-mono text-[#85827B]">
            Tenant actions recorded for identity {actorId}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-12 text-center space-y-2">
            <Icon icon="solar:restart-bold" className="w-6 h-6 animate-spin text-[#FA520F] mx-auto" />
            <p className="text-xs text-[#85827B]">Retrieving actor activity...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelectEvent(e)}
                className="w-full text-left p-3 rounded-lg border border-white/[0.06] bg-[#181818] hover:border-[#FA520F]/40 hover:bg-[#1E1713] transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F7F4EC]">{e.actionLabel}</span>
                  <span className="font-mono text-[10px] text-[#85827B]">
                    {new Date(e.occurredAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-[#85827B] line-clamp-1">{e.summary}</p>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#85827B] border-t border-white/[0.04]">
                  <span>Target: {e.target.name}</span>
                  <span className={e.result === "success" ? "text-emerald-400" : "text-rose-400"}>
                    {e.result.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-white/[0.08] rounded-lg text-xs text-[#85827B]">
            No other audit events recorded for this actor.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
