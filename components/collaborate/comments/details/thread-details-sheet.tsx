"use client";

import * as React from "react";
import { formatDate, formatDateTime } from "@/lib/utils/date-format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  Tag,
  CheckSquare,
  Users,
  Clock,
  Paperclip,
  Bookmark,
  Activity,
  CheckCircle2,
} from "lucide-react";
import type { ThreadDetail } from "@/lib/supabase/types/comments";

interface ThreadDetailsSheetProps {
  thread: ThreadDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThreadDetailsSheet({
  thread,
  open,
  onOpenChange,
}: ThreadDetailsSheetProps) {
  if (!thread) return null;

  const isResolved = thread.state === "RESOLVED";

  // Gather unique references across thread and all comments
  const allReferences = [
    ...(thread.references || []),
    ...thread.comments.flatMap((c) => c.references || []),
  ];
  // Deduplicate by referencedRef
  const uniqueReferences = Array.from(
    new Map(allReferences.map((r) => [r.referencedRef || r.publicRef, r])).values()
  );

  // Gather unique attachments
  const allAttachments = thread.comments.flatMap((c) => c.attachments);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-background text-foreground font-mono text-xs">
        <div className="p-6 space-y-6">
          {/* Header */}
          <SheetHeader className="space-y-1 text-left">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <span>THREAD</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-[#CC785C] font-semibold">{thread.publicId}</span>
            </div>
            <SheetTitle className="text-base font-bold font-sans">
              {thread.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground font-sans">
              Operational discussion attached to {thread.contextType.replace("_", " ")}.
            </SheetDescription>
          </SheetHeader>

          <Separator className="bg-border/60" />

          {/* Context Object Info */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Context Object
            </span>
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {thread.contextType.replace("_", " ")}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-border uppercase font-mono"
                >
                  {thread.contextState}
                </Badge>
              </div>
              <p className="text-sm font-bold text-foreground font-mono">
                {thread.contextRef}
              </p>
              <p className="text-xs text-muted-foreground font-sans">
                {thread.contextTitle}
              </p>
            </div>
          </div>

          {/* Thread Lifecycle Visual (Signature Concept 161) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Lifecycle Stage
            </span>
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#CC785C]" />
                <span>CREATED</span>
              </div>
              <div className="h-[1px] w-6 bg-border" />
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#CC785C]" />
                <span>ACTIVE</span>
              </div>
              <div className="h-[1px] w-6 bg-border" />
              <div
                className={`flex items-center gap-1.5 font-semibold ${
                  isResolved ? "text-[#5DB872]" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isResolved ? "bg-[#5DB872]" : "border border-border"
                  }`}
                />
                <span>RESOLVED</span>
              </div>
            </div>
          </div>

          {/* Meta Properties */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border/60 bg-card">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block">
                Created
              </span>
              <p className="font-semibold text-foreground text-xs pt-0.5">
                {formatDate(thread.createdAt)}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                by {thread.createdBy.name}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block">
                Last Activity
              </span>
              <p className="font-semibold text-foreground text-xs pt-0.5">
                {formatDateTime(thread.lastActivityAt)}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Participants ({thread.participants.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {thread.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-background"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold shrink-0">
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground font-sans truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {p.email}
                      </p>
                    </div>
                  </div>
                  {(p.roleName || p.role) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground uppercase shrink-0">
                      {p.roleName || p.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Referenced Objects */}
          {uniqueReferences.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Connected References ({uniqueReferences.length})
              </span>
              <div className="space-y-1.5">
                {uniqueReferences.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-2 rounded-md border border-border/40 bg-background flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-[#CC785C]" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">
                            {ref.referencedRef || ref.publicRef || ref.idRef}
                          </span>
                          <span className="text-[9px] uppercase text-muted-foreground">
                            ({(ref.referencedType || ref.type || "qr").replace("_", " ")})
                          </span>
                        </div>
                        {(ref.referencedTitle || ref.title) && (
                          <p className="text-[11px] text-muted-foreground font-sans truncate">
                            {ref.referencedTitle || ref.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {allAttachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Attachments ({allAttachments.length})
              </span>
              <div className="space-y-1.5">
                {allAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 rounded-md border border-border/40 bg-background flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-[#5DB8A6] shrink-0" />
                      <span className="truncate font-sans">{att.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {(att.sizeBytes / 1024).toFixed(0)} KB
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
