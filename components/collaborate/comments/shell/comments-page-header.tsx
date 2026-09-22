"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

interface CommentsPageHeaderProps {
  onStartDiscussion: () => void;
  canCreate?: boolean;
}

export function CommentsPageHeader({
  onStartDiscussion,
  canCreate = true,
}: CommentsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
          <span>COLLABORATE</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-semibold">COMMENTS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
          Comments
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Discussions attached to the work your organization is building.
        </p>
      </div>

      {canCreate && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onStartDiscussion}
            className="h-8 px-3 text-xs bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-medium shadow-xs gap-1.5"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>Start discussion</span>
          </Button>
        </div>
      )}
    </div>
  );
}
