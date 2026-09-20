"use client";

import * as React from "react";
import Link from "next/link";
import { FlaskConical, Plus, GitCompare, MoreHorizontal, Download, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ExperimentsPageHeaderProps {
  orgSlug: string;
  onOpenCreateDialog: () => void;
  onOpenCompareDialog: () => void;
  onExportExperiments: () => void;
  hasExperiments: boolean;
}

export function ExperimentsPageHeader({
  orgSlug,
  onOpenCreateDialog,
  onOpenCompareDialog,
  onExportExperiments,
  hasExperiments,
}: ExperimentsPageHeaderProps) {
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
        <span className="opacity-60">Intelligence</span>
        <span className="opacity-60">/</span>
        <span className="text-foreground font-medium">Experiments</span>
      </nav>

      {/* Main title & Actions row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Experiments
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(250,82,15,0.15)]">
              <FlaskConical className="h-3 w-3" />
              A/B Routing Lab
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Test destinations and routing experiences using controlled QR traffic.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCompareDialog}
            disabled={!hasExperiments}
            className="h-9 gap-1.5 text-xs font-medium border-border bg-card hover:bg-muted text-foreground hover:text-primary transition-colors"
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>Compare</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onOpenCreateDialog}
            className="h-9 gap-1.5 text-xs font-medium bg-primary hover:bg-[#cc3a05] text-white shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Experiment</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground shadow-md">
              <DropdownMenuItem
                onClick={onExportExperiments}
                disabled={!hasExperiments}
                className="gap-2 text-xs focus:bg-muted cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Export Experiments (JSON)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="gap-2 text-xs focus:bg-muted cursor-pointer"
              >
                <Link
                  href="https://github.com/CodeWithEswar/qora/blob/main/docs/routing-engine.md"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Experimentation Guide</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => toast.info("Experiments use deterministic weighted routing without blocking edge redirects.")}
                className="gap-2 text-xs focus:bg-muted text-muted-foreground cursor-pointer"
              >
                <FlaskConical className="h-3.5 w-3.5 text-primary" />
                <span>Deterministic Traffic Split</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
