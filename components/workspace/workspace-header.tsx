"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Copy,
  ExternalLink,
  Shield,
  CreditCard,
  History,
  Archive,
  Search,
  Eye,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface WorkspaceHeaderProps {
  overview: WorkspaceControlPlaneOverview;
  onOpenSearch: () => void;
  onOpenIdentityPreview: () => void;
  onOpenArchive: () => void;
}

export function WorkspaceHeader({
  overview,
  onOpenSearch,
  onOpenIdentityPreview,
  onOpenArchive,
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const orgSlug = overview.identity.slug;

  const handleCopyLink = () => {
    const url = `https://nxtqr.vercel.app/${orgSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Workspace link copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-3 pb-6 border-b border-border/60">
      {/* Breadcrumb & Scope */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="uppercase tracking-wider font-mono text-[10px] text-muted-foreground/80">
          Organization
        </span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">Workspace</span>
        <span className="text-muted-foreground/40">•</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          CONTROL PLANE
        </span>
      </div>

      {/* Main Title & Action Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5 font-display">
            <span>Workspace</span>
            {overview.identity.archivedAt && (
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                ARCHIVED
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Configure identity, defaults and operating rules for your NXTQR organization.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSearch}
            className="h-8 gap-2 text-xs border-border/80 bg-background/50 hover:bg-surface text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Find a setting...</span>
            <kbd className="ml-1 text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded border border-border text-muted-foreground/70">
              ⌘K
            </kbd>
          </Button>

          {/* Identity Preview Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenIdentityPreview}
            className="h-8 gap-1.5 text-xs border-border/80 hover:bg-surface"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Preview identity</span>
          </Button>

          {/* More Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-border/80 hover:bg-surface"
                title="More workspace actions"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleCopyLink} className="gap-2 text-xs cursor-pointer">
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy workspace URL</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/${orgSlug}/billing`)}
                className="gap-2 text-xs cursor-pointer"
              >
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Open Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/${orgSlug}/settings/permissions`)}
                className="gap-2 text-xs cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Roles & Permissions</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/${orgSlug}/audit`)}
                className="gap-2 text-xs cursor-pointer"
              >
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span>View Audit Logs</span>
              </DropdownMenuItem>
              {overview.userPermissions.isOwner && !overview.identity.archivedAt && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onOpenArchive}
                    className="gap-2 text-xs text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>Archive workspace</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
