import * as React from "react";
import { Cpu, Plus, GitFork, Smartphone, Globe, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function QoraBrainPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Acme Corp", href: `/${orgSlug}` },
          { label: "Qora Brain" },
        ]}
        title="Qora Brain Routing Engine"
        description="Configure context-aware dynamic routing rules based on visitor device, country, time of day, and campaign UTMs."
        badge={
          <span className="text-xs font-semibold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-0.5 rounded-full border border-primary/25">
            Active Engine
          </span>
        }
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>New Routing Rule</span>
          </Button>
        }
      />

      {/* Visual Rule Builder Preview Card */}
      <div className="space-y-4">
        <div className="rounded-xl border border-primary/30 bg-surface p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Global Summer Campaign Router
                </h3>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target: qora.to/summer26 • Priority: 1 (Highest)
              </p>
            </div>
            <span className="text-xs font-mono text-primary font-medium">
              41,890 requests routed
            </span>
          </div>

          {/* Rule Flow Visualization */}
          <div className="space-y-3">
            {/* Condition 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated/60 text-xs">
              <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 w-fit">
                IF
              </span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Device</span>
                <span className="text-muted-foreground">=</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Mobile (iOS / Android)</span>
              </div>
              <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                AND
              </span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Country</span>
                <span className="text-muted-foreground">=</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">India (IN)</span>
              </div>
              <div className="sm:ml-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">/mobile-app-store-india</span>
              </div>
            </div>

            {/* Condition 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated/60 text-xs">
              <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 w-fit">
                ELSE IF
              </span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Time of Day</span>
                <span className="text-muted-foreground">=</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">After 8:00 PM EST</span>
              </div>
              <div className="sm:ml-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">/evening-support-portal</span>
              </div>
            </div>

            {/* Fallback */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/30 text-xs">
              <span className="font-bold text-muted-foreground px-2 py-0.5 rounded bg-muted w-fit">
                OTHERWISE
              </span>
              <span className="text-muted-foreground">Default Fallback URL</span>
              <div className="sm:ml-auto flex items-center gap-2 text-foreground font-mono text-xs">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span>https://acme.com/summer-promo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
