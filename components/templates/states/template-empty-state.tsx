"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { EmptyState } from "@/components/empty-state";

interface TemplateEmptyStateProps {
  orgSlug: string;
}

export function TemplateEmptyState({ orgSlug }: TemplateEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-card/60 via-background to-card/40 p-8 sm:p-14 text-center max-w-2xl mx-auto my-8">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <EmptyState
        preset="templates"
        variant="page"
        action={{
          label: "Create First Template",
          href: `/${orgSlug}/templates/forge`,
        }}
        secondaryAction={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs gap-1.5 border-border/80 hover:bg-muted cursor-pointer shadow-xs"
          >
            <Link href={`/${orgSlug}/brand`}>
              <Icon icon="tabler:palette" className="h-3.5 w-3.5 text-primary" />
              <span>Open Brand Kits</span>
            </Link>
          </Button>
        }
        className="py-0 relative z-10"
      />
    </div>
  );
}
