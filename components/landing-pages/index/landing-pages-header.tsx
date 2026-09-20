"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface LandingPagesHeaderProps {
  orgSlug: string;
}

export function LandingPagesHeader({ orgSlug }: LandingPagesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/40">
      <div>
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Landing Pages</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Landing Pages
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Build mobile-first destinations designed for the moment after a scan.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button asChild className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Link href={`/${orgSlug}/landing-pages/new`}>
            <NxtqrIcon icon="solar:add-circle-bold" size={18} />
            <span>Create Landing Page</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
