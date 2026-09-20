"use client";

import * as React from "react";
import {
  Activity,
  QrCode,
  CheckCircle2,
  Users,
  Building2,
  Share2,
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityEventEntry } from "@nxtqr/contracts";
import { formatDate } from "@/lib/utils";

interface ActivityStreamProps {
  orgSlug: string;
  initialEvents?: ActivityEventEntry[];
}

export function ActivityStream({ orgSlug, initialEvents = [] }: ActivityStreamProps) {
  const [events] = React.useState<ActivityEventEntry[]>(initialEvents);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "QR_PUBLISHED":
      case "QR_CREATED":
        return <QrCode className="h-3.5 w-3.5 text-primary" />;
      case "APPROVAL_APPROVED":
      case "APPROVAL_REQUESTED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "MEMBER_JOINED":
      case "MEMBER_INVITED":
        return <Users className="h-3.5 w-3.5 text-blue-400" />;
      case "COMMENT_ADDED":
      case "COMMENT_RESOLVED":
        return <MessageSquare className="h-3.5 w-3.5 text-amber-400" />;
      case "SHARE_LINK_CREATED":
        return <Share2 className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return formatDate(timestamp);
  };

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8">
            <EmptyState
              preset="activity"
              className="border-none bg-transparent"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-border/60">
          {events.map((evt) => (
            <div key={evt.id} className="relative flex items-start gap-3 group">
              {/* Timeline Node */}
              <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border group-hover:border-primary transition-colors">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              </div>

              {/* Event Content */}
              <div className="flex-1 p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-muted/60 border border-border/40">
                      {getActionIcon(evt.action)}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {evt.actorName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatTimestamp(evt.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {evt.formattedText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
