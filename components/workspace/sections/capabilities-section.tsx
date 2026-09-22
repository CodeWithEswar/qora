"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, Lock, ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface CapabilitiesSectionProps {
  overview: WorkspaceControlPlaneOverview;
}

export function CapabilitiesSection({ overview }: CapabilitiesSectionProps) {
  const { identity, capabilities } = overview;

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold font-display">Capabilities & Commercial Entitlements</CardTitle>
          </div>
          <Link
            href={`/${identity.slug}/billing`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            <span>Open Billing</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">
          Plan limits, feature entitlements, and operational quotas derived from your authoritative {identity.billingPlan} subscription.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Plan Strip */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Current Subscription Tier
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-primary">
                {identity.billingPlan} TIER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Billing and invoice history managed through the dedicated NXTQR Billing portal.
            </p>
          </div>

          <Link href={`/${identity.slug}/billing`}>
            <Button size="sm" className="gap-1.5 text-xs h-8">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Manage Subscription</span>
            </Button>
          </Link>
        </div>

        {/* Signature Feature: Workspace Capability Map */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground font-display">
              WORKSPACE CAPABILITY PROJECTION
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Evaluated by EntitlementService
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {capabilities.map((cap) => (
              <div
                key={cap.key}
                className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  cap.enabled
                    ? "border-border/60 bg-surface/30"
                    : "border-border/40 bg-background/40 opacity-75"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {cap.enabled ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-foreground truncate">
                      {cap.title}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {cap.description}
                  </p>

                  {cap.limit && (
                    <span className="inline-block text-[10px] font-mono text-muted-foreground pt-0.5">
                      Quota: <strong className="text-foreground">{String(cap.limit)}</strong>
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  {cap.enabled ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ENABLED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border/60">
                      Requires {cap.requiredTier || "Upgrade"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
