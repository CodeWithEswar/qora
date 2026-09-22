"use client";

import * as React from "react";
import { Image as ImageIcon, Upload, Trash2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface IdentitySettingsSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onOpenLogoDialog: () => void;
  onRemoveLogo: () => Promise<void>;
  onOpenIdentityPreview: () => void;
  isSaving: boolean;
}

export function IdentitySettingsSection({
  overview,
  onOpenLogoDialog,
  onRemoveLogo,
  onOpenIdentityPreview,
  isSaving,
}: IdentitySettingsSectionProps) {
  const { identity, userPermissions } = overview;

  const initials = React.useMemo(() => {
    return identity.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "WS";
  }, [identity.name]);

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold font-display">Identity & Visual Assets</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenIdentityPreview}
            className="h-7 gap-1 text-[11px] border-border/80"
          >
            <Eye className="h-3 w-3" />
            <span>Preview all surfaces</span>
          </Button>
        </div>
        <CardDescription className="text-xs">
          Manage workspace logo mark, platform monograms, and examine how your organization appears across NXTQR.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Workspace Logo Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-surface/30">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-xl border border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
              {identity.logoUrl ? (
                <img
                  src={identity.logoUrl}
                  alt={identity.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-lg font-bold text-foreground">
                    {initials}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/60 tracking-wider">
                    DEFAULT
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground block">
                Primary Workspace Mark
              </span>
              <p className="text-[11px] text-muted-foreground max-w-sm">
                Recommended 256×256px square image. PNG, JPEG, SVG or WebP up to 5MB.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  Status: {identity.logoUrl ? "Custom Logo Active" : "Generated Monogram Fallback"}
                </span>
              </div>
            </div>
          </div>

          {userPermissions.canUpdate && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenLogoDialog}
                disabled={isSaving}
                className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{identity.logoUrl ? "Replace logo" : "Upload logo"}</span>
              </Button>

              {identity.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemoveLogo}
                  disabled={isSaving}
                  className="gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  title="Remove custom logo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Remove</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Live Surface Previews Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground font-display">
              Surface Rendering Preview
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Real application projection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Sidebar Lockup */}
            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
                Sidebar Switcher
              </span>
              <div className="flex items-center gap-2.5 p-2 rounded-md bg-surface/60 border border-border/40">
                <div className="h-6 w-6 rounded border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                  {identity.logoUrl ? (
                    <img src={identity.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-[10px] font-bold">{initials[0]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground truncate block leading-tight">
                    {identity.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground block truncate">
                    {identity.billingPlan} Plan
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Invitation Badge */}
            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
                Invitation Card
              </span>
              <div className="flex items-center gap-2 p-2 rounded-md bg-surface/60 border border-border/40">
                <div className="h-6 w-6 rounded border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                  {identity.logoUrl ? (
                    <img src={identity.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-[10px] font-bold">{initials[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-foreground truncate block leading-tight">
                    Invited to <strong className="font-semibold">{identity.name}</strong>
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    nxtqr.vercel.app
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Resource Ownership Label */}
            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
                Resource Ownership
              </span>
              <div className="p-2 rounded-md bg-surface/60 border border-border/40 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-muted-foreground truncate">
                  org:<span className="text-foreground font-semibold">{identity.slug}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
