"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquarePlus, QrCode, CheckSquare, Users, Tag, AlertTriangle, FileText, Sparkles, Compass, Package } from "lucide-react";
import type { ThreadContextType } from "@/lib/supabase/types/comments";

interface StartDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateThread: (payload: {
    contextType: ThreadContextType;
    contextId: string;
    contextRef: string;
    contextTitle?: string;
    contextState?: string;
    title: string;
    initialComment?: string;
  }) => Promise<boolean>;
}

const CONTEXT_OPTIONS: { value: ThreadContextType; label: string; icon: React.ElementType }[] = [
  { value: "qr_code", label: "QR Identity", icon: QrCode },
  { value: "campaign", label: "Campaign", icon: Sparkles },
  { value: "route", label: "Smart Route", icon: Compass },
  { value: "approval", label: "Approval Request", icon: CheckSquare },
  { value: "team", label: "Team", icon: Users },
  { value: "member", label: "Member", icon: Users },
  { value: "order", label: "Batch & Print Order", icon: Package },
  { value: "status_incident", label: "Status Incident", icon: AlertTriangle },
  { value: "journal_article", label: "Release Note", icon: FileText },
];

export function StartDiscussionDialog({
  open,
  onOpenChange,
  onCreateThread,
}: StartDiscussionDialogProps) {
  const [contextType, setContextType] = React.useState<ThreadContextType>("qr_code");
  const [contextRef, setContextRef] = React.useState("");
  const [contextTitle, setContextTitle] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [initialComment, setInitialComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextRef.trim() || !title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onCreateThread({
        contextType,
        contextId: contextRef.trim(),
        contextRef: contextRef.trim().toUpperCase(),
        contextTitle: contextTitle.trim() || undefined,
        contextState: "ACTIVE",
        title: title.trim(),
        initialComment: initialComment.trim() || undefined,
      });

      if (success) {
        setContextRef("");
        setContextTitle("");
        setTitle("");
        setInitialComment("");
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border text-xs font-mono">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-[#CC785C]" />
            <span>Start Contextual Discussion</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Every discussion must attach to an authorized NXTQR object. Conversations never float without context.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          {/* Object Type */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Attach to NXTQR Object
            </Label>
            <Select
              value={contextType}
              onValueChange={(val) => setContextType(val as ThreadContextType)}
            >
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue placeholder="Select context" />
              </SelectTrigger>
              <SelectContent className="text-xs font-mono">
                {CONTEXT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Object Reference & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono text-muted-foreground uppercase">
                Object Identifier / Code
              </Label>
              <Input
                value={contextRef}
                onChange={(e) => setContextRef(e.target.value)}
                placeholder="e.g. QR-7F3K-9021"
                className="h-8 text-xs font-mono uppercase"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono text-muted-foreground uppercase">
                Object Label / Subtitle
              </Label>
              <Input
                value={contextTitle}
                onChange={(e) => setContextTitle(e.target.value)}
                placeholder="e.g. Summer Promo Dynamic QR"
                className="h-8 text-xs font-sans"
              />
            </div>
          </div>

          {/* Thread Title */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Discussion Topic / Purpose
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Replacement condition review"
              className="h-8 text-xs font-sans font-medium"
              required
            />
          </div>

          {/* Initial Operational Note */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Initial Operational Note (optional)
            </Label>
            <Textarea
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              placeholder="Provide background context or what needs verification..."
              rows={3}
              className="text-xs font-sans resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!contextRef.trim() || !title.trim() || isSubmitting}
              className="h-8 text-xs font-mono bg-[#CC785C] hover:bg-[#CC785C]/90 text-white"
            >
              {isSubmitting ? "Starting…" : "Start Discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
