"use client";

import * as React from "react";
import Link from "next/link";
import { Zap, Plus, Play, MoreHorizontal, FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface RoutesPageHeaderProps {
  orgSlug: string;
  onOpenConfigureDialog: () => void;
  onOpenTestRouteDialog: () => void;
  onExportConfiguration: () => void;
}

export function RoutesPageHeader({
  orgSlug,
  onOpenConfigureDialog,
  onOpenTestRouteDialog,
  onExportConfiguration,
}: RoutesPageHeaderProps) {
  return (
    <header className="space-y-3">
      {/* Breadcrumb row */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href={`/${orgSlug}`}
          className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        >
          Workspace
        </Link>
        <span className="opacity-60">/</span>
        <span className="text-foreground font-medium">NXTQR Routes</span>
      </nav>

      {/* Main title & Actions row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              NXTQR Routes
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/30 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(250,82,15,0.15)]">
              <Zap className="h-3 w-3 fill-[#FA520F]" />
              Edge Dynamic QR Brain
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Route every scan to the right destination with deterministic edge policies.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenTestRouteDialog}
            className="h-9 gap-1.5 text-xs font-medium border-border/80 bg-background hover:bg-muted text-foreground hover:text-[#FA520F] transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Test Route</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onOpenConfigureDialog}
            className="h-9 gap-1.5 text-xs font-medium bg-[#FA520F] hover:bg-[#d9440a] text-white shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Configure QR Brain</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#161619] border-white/10 text-[#F7F4EC]">
              <DropdownMenuItem
                onClick={onExportConfiguration}
                className="gap-2 text-xs focus:bg-white/5 focus:text-[#F7F4EC] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#B8B5AD]" />
                <span>Export Routing Config (JSON)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="gap-2 text-xs focus:bg-white/5 focus:text-[#F7F4EC] cursor-pointer"
              >
                <Link
                  href="https://github.com/CodeWithEswar/qora/blob/main/docs/routing-engine.md"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <FileText className="h-3.5 w-3.5 text-[#B8B5AD]" />
                  <span>Routing Documentation</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-[#85827B]" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => toast.info("Edge Routing operates with zero network delay directly via Cloudflare KV & Workers.")}
                className="gap-2 text-xs focus:bg-white/5 text-[#85827B] cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-[#FA520F]" />
                <span>Engine: Deterministic v1</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
