"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ApprovalEvidenceItem } from "@/lib/supabase/types/approvals";
import { EvidencePreviewDialog } from "./evidence-preview-dialog";
import { FileText, Image as ImageIcon, ArrowRight } from "lucide-react";

interface EvidenceRailProps {
  items: ApprovalEvidenceItem[];
  className?: string;
}

export function EvidenceRail({ items, className }: EvidenceRailProps) {
  const [previewingItem, setPreviewingItem] = React.useState<ApprovalEvidenceItem | null>(null);

  const formatCount = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className={cn("space-y-2 text-xs font-mono", className)}>
      <div className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center justify-between">
        <span>EVIDENCE / {formatCount(items.length)}</span>
        <span className="text-[9px] text-muted-foreground">SUPPORTING ATTACHMENTS</span>
      </div>

      {items.length === 0 ? (
        <div className="p-3 rounded border border-border/60 text-muted-foreground text-center text-xs">
          No external evidence files attached to this request.
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-card/40 hover:bg-card transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {formatCount(idx + 1)}
                </span>
                <div className="p-1.5 rounded bg-muted/60 text-muted-foreground">
                  {item.fileType === "IMAGE" ? (
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.fileType} · {item.sizeBytes ? `${(item.sizeBytes / 1024).toFixed(0)} KB` : "Document"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewingItem(item)}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 shrink-0 ml-2 focus:outline-none cursor-pointer"
              >
                <span>Preview</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <EvidencePreviewDialog
        evidence={previewingItem}
        isOpen={Boolean(previewingItem)}
        onClose={() => setPreviewingItem(null)}
      />
    </div>
  );
}
