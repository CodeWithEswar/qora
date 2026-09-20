"use client";

import * as React from "react";
import { FlaskConical, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExperimentVariantStat {
  name: string;
  destinationUrl: string;
  trafficWeight: number;
  scans: number;
  conversions: number;
  conversionRate: number;
}

export interface ExperimentStat {
  experimentId: string;
  name: string;
  status: string;
  variants: ExperimentVariantStat[];
}

interface ExperimentSplitFieldProps {
  experiments?: ExperimentStat[];
  orgSlug?: string;
  className?: string;
}

export function ExperimentSplitField({
  experiments = [],
  orgSlug,
  className,
}: ExperimentSplitFieldProps) {
  const hasExperiments = experiments.length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
                A/B Destination Experiments
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real traffic weight allocation and conversion comparison across variants
            </p>
          </div>

          {orgSlug && (
            <Button variant="outline" size="sm" asChild className="h-7 text-xs border-border bg-card hover:bg-muted text-foreground gap-1 shadow-xs">
              <Link href={`/${orgSlug}/experiments`}>
                <span>Manage Experiments</span>
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {!hasExperiments ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                No Active A/B Split Experiments
              </p>
              <span className="text-[11px] block">
                Create destination experiments in QR Studio or Routes to test target URLs.
              </span>
            </div>
          ) : (
            experiments.map((exp) => (
              <div
                key={exp.experimentId}
                className="p-4 rounded-xl border border-border bg-muted/40 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{exp.name}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase font-semibold">
                    {exp.status}
                  </span>
                </div>

                {/* Variants List */}
                <div className="space-y-2 font-mono text-xs">
                  {exp.variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-card/80 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block text-[11px]">
                          {variant.name} ({variant.trafficWeight}% weight)
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate block max-w-[240px]">
                          {variant.destinationUrl}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">SCANS</span>
                          <span className="font-bold text-foreground tabular-nums">
                            {variant.scans.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">CONV RATE</span>
                          <span className="font-bold text-emerald-500 tabular-nums">
                            {variant.conversionRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Deterministic Variant Assignment</span>
        <span>Honest Conversion Tracking</span>
      </div>
    </div>
  );
}
