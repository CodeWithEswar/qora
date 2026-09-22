"use client";

import * as React from "react";
import type { ParticipantItem } from "@/lib/supabase/types/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParticipantPreviewProps {
  participants: ParticipantItem[];
  maxCount?: number;
  className?: string;
}

export function ParticipantPreview({
  participants,
  maxCount = 4,
  className,
}: ParticipantPreviewProps) {
  const visible = participants.slice(0, maxCount);
  const remaining = participants.length - maxCount;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center -space-x-1.5">
        {visible.map((p) => (
          <Tooltip key={p.id}>
            <TooltipTrigger asChild>
              <Avatar className="h-5 w-5 ring-1 ring-background text-[9px] font-mono">
                {p.avatarUrl && <AvatarImage src={p.avatarUrl} alt={p.name} />}
                <AvatarFallback className="bg-muted text-foreground font-semibold">
                  {p.initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              {p.name}
            </TooltipContent>
          </Tooltip>
        ))}

        {remaining > 0 && (
          <div className="h-5 px-1 rounded-full bg-muted/80 ring-1 ring-background text-[9px] font-mono text-muted-foreground flex items-center justify-center font-medium">
            +{remaining}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
