"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActorResourceCell } from "@/lib/supabase/types/activity";

interface ActorResourceMatrixProps {
  cells: ActorResourceCell[];
  onSelectActor?: (actorId: string) => void;
  className?: string;
}

export function ActorResourceMatrix({
  cells,
  onSelectActor,
  className,
}: ActorResourceMatrixProps) {
  // Extract distinct actors
  const actors = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; initials: string; total: number }>();
    cells.forEach((c) => {
      const existing = map.get(c.actorId) || {
        id: c.actorId,
        name: c.actorName,
        initials: c.actorInitials,
        total: 0,
      };
      existing.total += c.count;
      map.set(c.actorId, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [cells]);

  // Extract distinct resource types
  const resourceTypes = React.useMemo(() => {
    const set = new Set<string>();
    cells.forEach((c) => set.add(c.resourceType));
    return Array.from(set).slice(0, 6);
  }, [cells]);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Actor × Resource Matrix"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            05 / ACTOR × RESOURCE MATRIX
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Collaboration distribution across operational domains (no rankings)
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {actors.length} Contributors
        </span>
      </div>

      {actors.length === 0 || resourceTypes.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          No actor-resource interactions recorded in this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase">
                <th className="py-2 pr-4 font-bold">Member</th>
                {resourceTypes.map((rt) => (
                  <th key={rt} className="py-2 px-2 text-center font-bold">
                    {rt.replace(/_/g, " ").toUpperCase()}
                  </th>
                ))}
                <th className="py-2 pl-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {actors.map((actor) => (
                <tr
                  key={actor.id}
                  onClick={() => onSelectActor?.(actor.id)}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    onSelectActor && "cursor-pointer"
                  )}
                >
                  <td className="py-2.5 pr-4 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-muted border border-border/80 flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                      {actor.initials}
                    </div>
                    <span className="font-sans font-semibold text-foreground truncate max-w-[140px]">
                      {actor.name}
                    </span>
                  </td>
                  {resourceTypes.map((rt) => {
                    const match = cells.find(
                      (c) => c.actorId === actor.id && c.resourceType === rt
                    );
                    const count = match ? match.count : 0;
                    return (
                      <td key={rt} className="py-2.5 px-2 text-center">
                        {count > 0 ? (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-foreground/10 text-foreground font-mono font-bold text-[10px]">
                            {count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 font-mono">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2.5 pl-2 text-right font-bold font-mono text-[#FA520F]">
                    {actor.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
