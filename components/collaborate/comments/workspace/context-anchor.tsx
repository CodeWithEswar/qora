"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, QrCode, CheckSquare, Users, FileText, AlertTriangle, ShieldCheck, Tag, Sparkles, Compass, Package } from "lucide-react";
import type { ThreadContextType } from "@/lib/supabase/types/comments";

interface ContextAnchorProps {
  contextType: ThreadContextType;
  contextRef: string;
  contextTitle: string;
  contextState: string;
  contextUrl?: string;
  className?: string;
}

const CONTEXT_ICONS: Record<string, React.ElementType> = {
  qr: QrCode,
  qr_code: QrCode,
  approval: CheckSquare,
  team: Users,
  member: Users,
  vehicle: QrCode,
  order: Package,
  campaign: Sparkles,
  route: Compass,
  incident: AlertTriangle,
  status_incident: AlertTriangle,
  journal: FileText,
  journal_article: FileText,
};

const CONTEXT_LABELS: Record<string, string> = {
  qr: "QR IDENTITY",
  qr_code: "QR IDENTITY",
  approval: "APPROVAL",
  team: "TEAM",
  member: "MEMBER",
  vehicle: "QR IDENTITY",
  order: "BATCH ORDER",
  campaign: "CAMPAIGN",
  route: "SMART ROUTE",
  incident: "STATUS INCIDENT",
  status_incident: "STATUS INCIDENT",
  journal: "RELEASE NOTE",
  journal_article: "RELEASE NOTE",
};

export function ContextAnchor({
  contextType,
  contextRef,
  contextTitle,
  contextState,
  contextUrl,
  className = "",
}: ContextAnchorProps) {
  const Icon = CONTEXT_ICONS[contextType] || QrCode;
  const label = CONTEXT_LABELS[contextType] || contextType.toUpperCase();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/20 border border-border/40 rounded-lg ${className}`}
      aria-label={`Context: ${label} ${contextRef}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-background border border-border/50 text-[#CC785C] shadow-2xs shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">
              {label}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {contextRef}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-mono px-1.5 py-0 h-4 border-[#5DB872]/30 text-[#5DB872] bg-[#5DB872]/10 uppercase"
            >
              {contextState}
            </Badge>
          </div>
          <p className="text-xs font-medium text-foreground/80 truncate max-w-md">
            {contextTitle}
          </p>
        </div>
      </div>

      {contextUrl && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1.5 self-start sm:self-center"
        >
          <Link href={contextUrl} target="_blank" rel="noreferrer">
            <span>Open {label.toLowerCase()}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}
