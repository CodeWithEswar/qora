"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface RoutingRuleSummaryItem {
  id: string;
  name: string;
  priority: number;
  destinationUrl: string;
  conditionSummary?: string;
}

export interface RoutingSummaryProps {
  orgSlug: string;
  qrId: string;
  routingRuleCount: number;
  rules?: RoutingRuleSummaryItem[];
  defaultDestination: string;
  className?: string;
}

export function RoutingSummary({
  orgSlug,
  qrId,
  routingRuleCount,
  rules = [],
  defaultDestination,
  className,
}: RoutingSummaryProps) {
  const cleanDefaultHost = React.useMemo(() => {
    try {
      if (!defaultDestination) return "Default destination";
      const u = new URL(
        defaultDestination.startsWith("http") ? defaultDestination : `https://${defaultDestination}`
      );
      return u.hostname;
    } catch {
      return defaultDestination.replace(/^https?:\/\//, "").split("/")[0] || "Default";
    }
  }, [defaultDestination]);

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4",
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Icon icon="hugeicons:route-01" className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Routing Engine
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-wide uppercase border-border"
          >
            {routingRuleCount > 0
              ? `${routingRuleCount} Active Rule${routingRuleCount === 1 ? "" : "s"}`
              : "Default Only"}
          </Badge>
        </div>

        {/* Content */}
        <div className="mt-3 space-y-3">
          {routingRuleCount === 0 || rules.length === 0 ? (
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                All eligible scans currently resolve directly to the default destination without conditional branching.
              </p>

              {/* Minimal Linear Flow Visual */}
              <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border/60 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">SCAN</span>
                  <Icon icon="hugeicons:arrow-right-01" className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-primary font-semibold">DEFAULT</span>
                  <Icon icon="hugeicons:arrow-right-01" className="w-3 h-3 text-muted-foreground/60" />
                  <span className="font-semibold text-foreground truncate max-w-[140px]">
                    {cleanDefaultHost}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 h-4 shrink-0 font-mono">
                  Direct
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Active Rule Priorities
              </div>
              <div className="space-y-1.5">
                {rules.slice(0, 3).map((r, idx) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-lg bg-surface-elevated/50 border border-border/60 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-[10px]">
                          0{idx + 1}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {r.name}
                        </span>
                      </div>
                      {r.conditionSummary && (
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {r.conditionSummary}
                        </div>
                      )}
                    </div>
                    <Icon icon="hugeicons:arrow-right-01" className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>
                ))}
                <div className="p-2 rounded-lg bg-surface-elevated/30 border border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Fallthrough:</span>
                  <span className="text-foreground truncate max-w-[140px]">
                    {cleanDefaultHost}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Button to QR Brain */}
      <div className="pt-3 border-t border-border/60">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs bg-surface border-border hover:bg-muted gap-1.5 font-medium"
        >
          <Link href={`/${orgSlug}/qr/${qrId}/brain`}>
            <Icon icon="hugeicons:git-fork" className="w-3.5 h-3.5 text-primary" />
            <span>Manage Routing Rules</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
