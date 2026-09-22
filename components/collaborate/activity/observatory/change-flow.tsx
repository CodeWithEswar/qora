"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChangeFlowLink } from "@/lib/supabase/types/activity";
import { GitBranch, ArrowRight } from "lucide-react";

interface ChangeFlowProps {
  links: ChangeFlowLink[];
  className?: string;
}

export function ChangeFlow({ links, className }: ChangeFlowProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Change Flow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            <span>04 / CHANGE FLOW</span>
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Verified operational milestone transitions
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          Proven Sequential Links
        </span>
      </div>

      {links.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          No sequential lifecycle transitions recorded in this period.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {links.map((link) => (
            <div
              key={`${link.source}-${link.target}`}
              className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col justify-between space-y-2 hover:border-[#FA520F]/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-foreground/10 uppercase">
                    {link.source}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FA520F] shrink-0" />
                  <span className="px-1.5 py-0.5 rounded bg-[#FA520F]/15 text-[#FA520F] uppercase">
                    {link.target}
                  </span>
                </div>
                <span className="text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                  {link.count}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans truncate">
                {link.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
