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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, Tag, QrCode, CheckSquare, Users, FileText, Sparkles, Compass, Package } from "lucide-react";
import type { CommentReferenceItem } from "@/lib/supabase/types/comments";

interface ReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReference: (ref: Omit<CommentReferenceItem, "id">) => void;
}

const SUPPORTED_TYPES = [
  { value: "qr_code", label: "QR Identity", icon: QrCode },
  { value: "campaign", label: "Campaign", icon: Sparkles },
  { value: "route", label: "Smart Route", icon: Compass },
  { value: "approval", label: "Approval Request", icon: CheckSquare },
  { value: "team", label: "Team", icon: Users },
  { value: "member", label: "Member", icon: Users },
  { value: "order", label: "Batch & Print Order", icon: Package },
];

export function ReferenceDialog({
  open,
  onOpenChange,
  onAddReference,
}: ReferenceDialogProps) {
  const [selectedType, setSelectedType] = React.useState<string>("qr_code");
  const [refId, setRefId] = React.useState("");
  const [title, setTitle] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;

    onAddReference({
      referencedType: selectedType,
      referencedId: refId.trim(),
      referencedRef: refId.trim().toUpperCase(),
      referencedTitle: title.trim() || undefined,
      referencedState: "ACTIVE",
    });

    setRefId("");
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border text-xs font-mono">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#CC785C]" />
            <span>Add Object Reference</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Connect an authorized NXTQR domain object to your comment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Object Type
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="text-xs font-mono">
                {SUPPORTED_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Identifier / Reference code
            </Label>
            <Input
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
              placeholder="e.g. QR-7F3K-9021 or APR-91KM"
              className="h-8 text-xs font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Display Label (optional)
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Replacement QR verification"
              className="h-8 text-xs font-sans"
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
              className="h-8 text-xs font-mono bg-[#CC785C] hover:bg-[#CC785C]/90 text-white"
              disabled={!refId.trim()}
            >
              Attach Reference
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
