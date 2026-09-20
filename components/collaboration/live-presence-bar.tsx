"use client";

import * as React from "react";
import { Users, Lock, Eye, Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PresenceParticipant } from "@nxtqr/contracts";

interface LivePresenceBarProps {
  participants?: PresenceParticipant[];
  activeEditorId?: string | null;
  currentUserId?: string;
}

export function LivePresenceBar({
  participants = [],
  activeEditorId = null,
  currentUserId = "usr_current",
}: LivePresenceBarProps) {
  if (participants.length === 0) {
    return null;
  }

  const otherParticipants = participants.filter((p) => p.userId !== currentUserId);
  const activeEditor = participants.find((p) => p.userId === activeEditorId);
  const isLockedByOther = Boolean(activeEditorId && activeEditorId !== currentUserId);

  return (
    <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-lg bg-muted/20 border border-border/50 text-xs">
      {/* Presence Avatars */}
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] text-muted-foreground font-medium">Live Collaborators:</span>

        <TooltipProvider delayDuration={150}>
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {participants.map((p) => (
              <Tooltip key={p.connectionId}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-6 w-6 border-2 border-card ring-1 ring-border cursor-pointer">
                      <AvatarImage src={p.avatarUrl} />
                      <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                        {p.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {p.isEditing && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500 ring-1 ring-card">
                        <Edit3 className="h-1.5 w-1.5 text-white" />
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <div className="font-semibold">{p.displayName}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {p.isEditing ? "Actively editing..." : "Viewing"}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Editing / Concurrency Status Banner */}
      {isLockedByOther && activeEditor && (
        <Badge variant="outline" className="gap-1.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border-amber-500/20">
          <Lock className="h-3 w-3" />
          <span>{activeEditor.displayName} is currently editing</span>
        </Badge>
      )}
    </div>
  );
}
