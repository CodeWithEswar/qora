import * as React from "react";
import { KeyRound, Plus, Copy, Shield } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function APIKeysPage({
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
          { label: "Developers" },
          { label: "API Keys" },
        ]}
        title="API Keys & Developer Tokens"
        description="Programmatically create dynamic QR codes, fetch scan analytics, and integrate with Cloudflare Workers."
        actions={
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Secret Key</span>
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Active API Keys</span>
          <span className="text-xs text-muted-foreground">1 key active</span>
        </div>

        <div className="p-4 flex items-center justify-between text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Production Backend Service</span>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              qora_live_9f83••••••••••••••••34a1
            </p>
            <p className="text-[11px] text-muted-foreground">
              Scopes: <span className="font-mono">qr:read, qr:write, analytics:read</span> • Created: Aug 12, 2026
            </p>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Key</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
