"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tag, QrCode, CheckSquare, Users, Sparkles, Compass, Package } from "lucide-react";
import type { CommentReferenceItem } from "@/lib/supabase/types/comments";

interface CommentReferenceCardProps {
  reference: CommentReferenceItem;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  qr_code: QrCode,
  qr: QrCode,
  approval: CheckSquare,
  team: Users,
  member: Users,
  vehicle: QrCode,
  order: Package,
  campaign: Sparkles,
  route: Compass,
};

export function CommentReferenceCard({
  reference,
  className = "",
}: CommentReferenceCardProps) {
  const refType = reference.referencedType || reference.type || "qr_code";
  const refCode = reference.referencedRef || reference.publicRef || reference.idRef || "REF";
  const refTitle = reference.referencedTitle || reference.title;
  const refState = reference.referencedState || reference.state;
  const Icon = TYPE_ICONS[refType] || Tag;

  const content = (
    <div
      className={`flex items-center justify-between gap-3 p-2 rounded-md border border-border/50 bg-background hover:bg-muted/30 transition-colors text-xs font-mono group ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              {refType.replace("_", " ")}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="font-bold text-foreground truncate">
              {refCode}
            </span>
            {refState && (
              <Badge
                variant="outline"
                className="text-[8px] font-mono px-1 py-0 h-3.5 border-border uppercase"
              >
                {refState}
              </Badge>
            )}
          </div>
          {refTitle && (
            <p className="text-[11px] text-muted-foreground font-sans truncate max-w-xs">
              {refTitle}
            </p>
          )}
        </div>
      </div>

      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-60 group-hover:opacity-100" />
    </div>
  );

  if (reference.url) {
    return (
      <Link href={reference.url} target="_blank" rel="noreferrer" className="block max-w-sm">
        {content}
      </Link>
    );
  }

  return <div className="max-w-sm">{content}</div>;
}
