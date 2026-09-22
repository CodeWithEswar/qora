"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ImpactRadiusCategory } from "@/lib/supabase/types/approvals";
import { cn } from "@/lib/utils";
import { Layers, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";

interface ImpactRadiusProps {
  categories?: ImpactRadiusCategory[];
  onOpenCategorySheet?: (cat: ImpactRadiusCategory) => void;
  className?: string;
}

export function ImpactRadius({
  categories = [],
  onOpenCategorySheet,
  className,
}: ImpactRadiusProps) {
  const totalAffected = categories.reduce((acc, cur) => acc + (cur.count || 0), 0);

  return (
    <div className={cn("p-5 rounded-xl border border-border/70 bg-card/40 space-y-4 font-mono", className)}>
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="space-y-1">
          <div className="text-[10px] text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            DOWNSTREAM IMPACT RADIUS
          </div>
          <p className="text-xs text-muted-foreground font-sans">
            Factual downstream resources that will be updated or affected upon publication.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Total Affected</span>
          <div className="text-sm font-bold text-foreground">
            {totalAffected} {totalAffected === 1 ? "Resource" : "Resources"}
          </div>
        </div>
      </div>

      {categories.length === 0 || totalAffected === 0 ? (
        <div className="p-6 rounded-lg border border-dashed border-border/80 text-center space-y-1.5">
          <ShieldAlert className="w-6 h-6 mx-auto text-muted-foreground/60" />
          <div className="text-xs font-semibold text-foreground">
            NO DOWNSTREAM RESOURCE RELATIONSHIPS FOUND
          </div>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto font-sans">
            This revision is self-contained. Approving and publishing will not alter external QR codes or attached assets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.category}
              onClick={() => onOpenCategorySheet?.(cat)}
              className="p-3.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all flex flex-col justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground font-sans group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {cat.count}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground font-sans line-clamp-2">
                {cat.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-primary">
                <span>Inspect resources</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
