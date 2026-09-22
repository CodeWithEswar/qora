"use client";

import * as React from "react";
import { Eye, Building2, Users, ExternalLink, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface IdentityPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview: WorkspaceControlPlaneOverview;
}

export function IdentityPreviewDialog({
  open,
  onOpenChange,
  overview,
}: IdentityPreviewDialogProps) {
  const { identity, owner } = overview;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border/80 p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <DialogTitle className="text-base font-bold font-display">
              Workspace Identity Preview
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Review how <strong>{identity.name}</strong> is presented across navigation surfaces, shared invitations, and ownership labels.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sidebar" className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-3 h-8 text-xs">
            <TabsTrigger value="sidebar" className="text-xs">
              Sidebar
            </TabsTrigger>
            <TabsTrigger value="invitation" className="text-xs">
              Invitation Card
            </TabsTrigger>
            <TabsTrigger value="ownership" className="text-xs">
              Resource Badge
            </TabsTrigger>
          </TabsList>

          {/* 1. Sidebar Switcher Preview */}
          <TabsContent value="sidebar" className="space-y-3 pt-3">
            <p className="text-[11px] text-muted-foreground">
              Rendered at the top of the application sidebar for active team navigation:
            </p>
            <div className="p-4 rounded-xl border border-border bg-sidebar max-w-xs mx-auto shadow-sm">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-hover border border-sidebar-border">
                <div className="h-8 w-8 rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                  {identity.logoUrl ? (
                    <img src={identity.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-xs font-bold">{initials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-sidebar-foreground truncate block">
                    {identity.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground block truncate">
                    nxtqr.vercel.app/{identity.slug}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 2. Invitation Card Preview */}
          <TabsContent value="invitation" className="space-y-3 pt-3">
            <p className="text-[11px] text-muted-foreground">
              Displayed to new team members upon opening email or link invitations:
            </p>
            <div className="p-5 rounded-xl border border-border bg-surface/50 max-w-sm mx-auto shadow-sm text-center space-y-3">
              <div className="h-12 w-12 rounded-xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center mx-auto shadow-xs">
                {identity.logoUrl ? (
                  <img src={identity.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-mono text-base font-bold">{initials}</span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground font-display">
                  Join {identity.name} on NXTQR
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {owner.displayName} has invited you to collaborate in this workspace.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded text-xs font-medium bg-primary text-white">
                  Accept Invitation
                </span>
              </div>
            </div>
          </TabsContent>

          {/* 3. Resource Ownership Badge Preview */}
          <TabsContent value="ownership" className="space-y-3 pt-3">
            <p className="text-[11px] text-muted-foreground">
              Attached to published QR codes, exported reports, and campaign logs:
            </p>
            <div className="p-4 rounded-xl border border-border bg-background max-w-sm mx-auto shadow-xs space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-surface/60 border border-border/50">
                <span className="text-muted-foreground">TENANT SCOPE</span>
                <span className="text-foreground font-bold">{identity.slug}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface/60 border border-border/50">
                <span className="text-muted-foreground">BASE ROUTE</span>
                <span className="text-primary font-bold">https://nxtqr.vercel.app/s/...</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
