"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ActivityProjection, EventInspectorDetail } from "@/lib/supabase/types/activity";
import { ArrowUpRight, Clock, User, Layers, GitBranch, ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils/date-format";

interface EventInspectorSheetProps {
  event: ActivityProjection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
}

export function EventInspectorSheet({
  event,
  open,
  onOpenChange,
  orgSlug,
}: EventInspectorSheetProps) {
  const [detail, setDetail] = React.useState<EventInspectorDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && event?.id) {
      setIsLoading(true);
      fetch(`/api/v1/organizations/${orgSlug}/activity/${event.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setDetail(res.data);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setDetail(null);
    }
  }, [open, event, orgSlug]);

  if (!event) return null;

  const getResourceUrl = () => {
    switch (event.resource.type) {
      case "qr":
      case "qr_code":
        return `/${orgSlug}/qrs`;
      case "approval":
        return `/${orgSlug}/collaborate/approvals`;
      case "comment":
      case "collaboration_thread":
        return `/${orgSlug}/collaborate/comments`;
      case "team":
        return `/${orgSlug}/teams`;
      case "campaign":
        return `/${orgSlug}/campaigns`;
      default:
        return `/${orgSlug}`;
    }
  };

  const occurredFormatted = formatDateTime(event.occurredAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-background text-foreground font-mono text-xs select-none">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-1 text-left">
            <div className="text-[10px] uppercase tracking-widest text-[#FA520F] flex items-center gap-1.5 font-bold">
              <span>EVENT INSPECTOR</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground">{event.id.substring(0, 8)}</span>
            </div>
            <SheetTitle className="text-base font-bold font-sans">
              {event.actor.name} {event.verb} {event.resource.name}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground font-sans">
              Verified operational action recorded in organization activity ledger.
            </SheetDescription>
          </SheetHeader>

          <Separator className="bg-border/60" />

          {/* SECTION 1: EVENT METADATA */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              01 / EVENT RECORD
            </span>
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#FA520F]">
                  {event.category}
                </span>
                <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0 h-4 border-border/80">
                  {event.action}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span>{occurredFormatted}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACTOR */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              02 / ACTOR
            </span>
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-muted border border-border/80 flex items-center justify-center text-xs font-bold text-foreground">
                  {event.actor.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground font-sans">{event.actor.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {event.actor.isSystem ? "System Automated" : event.actor.email || "Authorized Member"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RESOURCE */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              03 / RESOURCE OBJECT
            </span>
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-foreground">
                  {event.resource.type.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-bold text-[#FA520F]">
                  {event.resource.ref}
                </span>
              </div>
              <p className="text-xs font-bold text-foreground font-sans truncate">
                {event.resource.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full h-7 text-xs font-mono justify-between text-foreground border-border/80 hover:border-[#FA520F]/50"
              >
                <Link href={getResourceUrl()}>
                  <span>Open Resource</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* SECTION 4: CHANGE SUMMARY (Structured Before/After) */}
          {event.changeSummary && event.changeSummary.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                04 / CHANGE SUMMARY
              </span>
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
                {event.changeSummary.map((cs) => (
                  <div key={cs.field} className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {cs.field}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-1.5 rounded bg-muted/50 border border-border/50 truncate">
                        <span className="text-[9px] text-muted-foreground/70 block uppercase">Previous</span>
                        <span className="text-muted-foreground line-through">
                          {String(cs.before ?? "None")}
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-[#FA520F]/10 border border-[#FA520F]/30 truncate">
                        <span className="text-[9px] text-[#FA520F] block uppercase font-bold">New</span>
                        <span className="text-foreground font-semibold">
                          {String(cs.after ?? "None")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: EVENT CHAIN (Related events for this resource) */}
          {detail?.eventChain && detail.eventChain.length > 1 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#FA520F]" />
                <span>05 / EVENT CHAIN</span>
              </span>
              <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
                {detail.eventChain.map((ce, idx) => (
                  <div key={ce.id} className="flex items-center justify-between text-[11px] pb-1 border-b border-border/40 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-foreground block">{ce.label}</span>
                      <span className="text-[10px] text-muted-foreground">by {ce.actorName}</span>
                    </div>
                    <span suppressHydrationWarning className="text-[10px] text-muted-foreground/80 font-mono">
                      {new Date(ce.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
