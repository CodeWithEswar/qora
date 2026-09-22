"use client";

import * as React from "react";
import {
  AlertTriangle,
  UserCheck,
  Archive,
  Trash2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface LifecycleDangerSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onOpenTransferOwnership: () => void;
  onOpenArchiveDialog: () => void;
  onOpenDeleteDialog: () => void;
}

export function LifecycleDangerSection({
  overview,
  onOpenTransferOwnership,
  onOpenArchiveDialog,
  onOpenDeleteDialog,
}: LifecycleDangerSectionProps) {
  const { identity, owner, userPermissions, stats } = overview;

  const ownerInitials = React.useMemo(() => {
    return owner.displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OW";
  }, [owner.displayName]);

  return (
    <Card className="border-destructive/30 bg-destructive/[0.02] shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <CardTitle className="text-base font-bold font-display text-destructive">
            Lifecycle & Destructive Operations
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          High-friction governance actions for transferring workspace ownership, archiving active workflows, or permanently destroying workspace resources.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Ownership Card */}
        <div className="p-4 rounded-xl border border-border/70 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              {owner.avatarUrl && <AvatarImage src={owner.avatarUrl} alt={owner.displayName} />}
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-mono font-bold">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
                Authoritative Workspace Owner
              </span>
              <span className="text-sm font-bold text-foreground block font-display">
                {owner.displayName}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {owner.email || "Primary Account Holder"}
              </span>
            </div>
          </div>

          {userPermissions.canTransferOwnership && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTransferOwnership}
              className="gap-1.5 text-xs h-8 border-border/80 hover:bg-surface shrink-0"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Transfer ownership</span>
            </Button>
          )}
        </div>

        {/* 2. Archive Workspace Card */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-foreground">
                Archive Workspace
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground max-w-md leading-relaxed">
              Puts this workspace into read-only mode. Active QR edge redirects remain online, but drafts cannot be edited and invitations are paused.
            </p>
          </div>

          {userPermissions.isOwner && !identity.archivedAt && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenArchiveDialog}
              className="gap-1.5 text-xs h-8 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shrink-0"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive workspace</span>
            </Button>
          )}
        </div>

        {/* 3. Delete Workspace Zone */}
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">
                  Delete This Organization Workspace
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-lg leading-relaxed">
                Permanently deletes <strong>{identity.name}</strong> and all linked resources.
                All <strong>{stats.qrCount} dynamic QR codes</strong> will immediately stop resolving and return HTTP 404. This action is irreversible.
              </p>
            </div>

            {userPermissions.isOwner ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onOpenDeleteDialog}
                className="gap-1.5 text-xs h-8 shrink-0 font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete workspace...</span>
              </Button>
            ) : (
              <span className="text-[11px] font-mono text-muted-foreground/80 self-center">
                Owner permission required
              </span>
            )}
          </div>

          {/* Signature Feature: Live Deletion Impact Graph */}
          <div className="p-3.5 rounded-lg border border-destructive/20 bg-background/60 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-destructive text-[11px]">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>DELETION IMPACT GRAPH (REAL ASSET COUNTS)</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Permanent deletion</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded border border-border/40 bg-surface/30">
                <span className="text-muted-foreground block text-[9px] uppercase">QR Codes</span>
                <span className="font-bold text-foreground">{stats.qrCount}</span>
              </div>
              <div className="p-2 rounded border border-border/40 bg-surface/30">
                <span className="text-muted-foreground block text-[9px] uppercase">Campaigns</span>
                <span className="font-bold text-foreground">{stats.campaignCount}</span>
              </div>
              <div className="p-2 rounded border border-border/40 bg-surface/30">
                <span className="text-muted-foreground block text-[9px] uppercase">Custom Domains</span>
                <span className="font-bold text-foreground">{stats.domainCount}</span>
              </div>
              <div className="p-2 rounded border border-border/40 bg-surface/30">
                <span className="text-muted-foreground block text-[9px] uppercase">Binary Files</span>
                <span className="font-bold text-foreground">{stats.fileCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
