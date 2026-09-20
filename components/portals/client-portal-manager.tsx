"use client";

import * as React from "react";
import {
  Globe,
  Plus,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Check,
  FolderTree,
  BarChart3,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ClientPortal } from "@nxtqr/contracts";

interface ClientPortalManagerProps {
  orgSlug: string;
  initialPortals?: ClientPortal[];
}

export function ClientPortalManager({ orgSlug, initialPortals = [] }: ClientPortalManagerProps) {
  const [portals, setPortals] = React.useState<ClientPortal[]>(initialPortals);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newPortalName, setNewPortalName] = React.useState("");
  const [newPortalSlug, setNewPortalSlug] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCreatePortal = () => {
    if (!newPortalName.trim() || !newPortalSlug.trim()) return;

    const newPortal: ClientPortal = {
      id: `portal_${Date.now()}`,
      organizationId: orgSlug,
      name: newPortalName.trim(),
      slug: newPortalSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      status: "ACTIVE",
      brandingConfig: {
        companyName: newPortalName.trim(),
      },
      resourcesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPortals((prev) => [newPortal, ...prev]);
    setNewPortalName("");
    setNewPortalSlug("");
    setIsCreateOpen(false);
  };

  const copyPortalUrl = (portalSlug: string, portalId: string) => {
    const url = `${window.location.origin}/p/${portalSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(portalId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="border-border/60 bg-muted/10">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">Strict Allowlist Isolation</div>
              <div className="text-[11px] text-muted-foreground">
                External clients see only granted campaigns and reports. Internal comments, approvals, audit logs, and billing are completely isolated.
              </div>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2 text-xs shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Client Portal</span>
          </Button>
        </CardContent>
      </Card>

      {/* Portals List / Empty State */}
      {portals.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8">
            <EmptyState
              preset="portals"
              onAction={() => setIsCreateOpen(true)}
              className="border-none bg-transparent"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portals.map((portal) => (
            <Card key={portal.id} className="border-border/60">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary shrink-0" />
                      <span>{portal.name}</span>
                    </CardTitle>
                    <CardDescription className="text-xs font-mono mt-0.5">
                      /p/{portal.slug}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  >
                    {portal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{portal.resourcesCount} allowlisted items</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyPortalUrl(portal.slug, portal.id)}
                    className="h-7 text-xs gap-1.5"
                  >
                    {copiedId === portal.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Share Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Portal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Client Portal</DialogTitle>
            <DialogDescription className="text-xs">
              Provision a branded, password-ready external view for agency clients or partners.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Client / Portal Name</label>
              <Input
                placeholder="e.g. Enterprise Partner Portal"
                value={newPortalName}
                onChange={(e) => {
                  setNewPortalName(e.target.value);
                  if (!newPortalSlug) {
                    setNewPortalSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }
                }}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">URL Path</label>
              <div className="flex items-center">
                <span className="h-9 px-3 flex items-center bg-muted/40 border border-r-0 border-input rounded-l-md text-xs text-muted-foreground font-mono">
                  /p/
                </span>
                <Input
                  placeholder="enterprise-portal"
                  value={newPortalSlug}
                  onChange={(e) => setNewPortalSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className="rounded-l-none h-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreatePortal}
              disabled={!newPortalName.trim() || !newPortalSlug.trim()}
              className="text-xs"
            >
              Provision Portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
