"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface LandingPagesEmptyProps {
  orgSlug: string;
}

export function LandingPagesEmpty({ orgSlug }: LandingPagesEmptyProps) {
  return (
    <div className="w-full min-h-[440px] rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 flex flex-col items-center justify-center text-center">
      {/* Signature Animated QR Monogram 'L' */}
      <div className="mb-6">
        <QrEmptyMonogram letter="L" size="lg" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Build the moment after the scan.
      </h2>

      <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
        Create a mobile-first destination designed specifically for QR traffic. Compose sections, connect QR codes, and measure real scan→page→action conversions.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Link href={`/${orgSlug}/landing-pages/new`}>
            <NxtqrIcon icon="solar:add-circle-bold" size={18} />
            <span>Create Landing Page</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href={`/${orgSlug}/landing-pages/new?browse=templates`}>
            <NxtqrIcon icon="solar:widget-2-bold" size={18} />
            <span>Explore Starter Layouts</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
