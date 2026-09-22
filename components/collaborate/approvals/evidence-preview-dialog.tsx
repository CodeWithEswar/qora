"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ApprovalEvidenceItem } from "@/lib/supabase/types/approvals";
import { FileText, Image as ImageIcon, Download, ExternalLink } from "lucide-react";

interface EvidencePreviewDialogProps {
  evidence: ApprovalEvidenceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidencePreviewDialog({
  evidence,
  isOpen,
  onClose,
}: EvidencePreviewDialogProps) {
  if (!evidence) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl font-mono text-xs">
        <DialogHeader>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            EVIDENCE / PREVIEW
          </div>
          <DialogTitle className="text-base font-sans font-semibold text-foreground">
            {evidence.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Uploaded by {evidence.uploadedByName} on {new Date(evidence.uploadedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {/* Preview viewport */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-6 flex flex-col items-center justify-center min-h-[220px] text-center space-y-3">
          {evidence.fileType === "IMAGE" ? (
            <div className="flex flex-col items-center space-y-2">
              <ImageIcon className="w-10 h-10 text-primary/70" />
              <p className="text-xs text-muted-foreground">Verified QR / Asset Photographic Proof</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <FileText className="w-10 h-10 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Authoritative Governance Document</p>
            </div>
          )}

          <div className="text-[11px] text-muted-foreground">
            {evidence.sizeBytes ? `${(evidence.sizeBytes / 1024).toFixed(1)} KB` : "Reference Object"} · Secure Storage
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          {evidence.url && (
            <a href={evidence.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <ExternalLink className="w-3 h-3" />
                <span>Open Secure Source</span>
              </Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
