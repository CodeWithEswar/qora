"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TeamMarkProps {
  name: string;
  id?: string;
  size?: number; // pixel size
  className?: string;
}

/**
 * Deterministic hash algorithm (djb2) to compute grid modules from team identity
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * NXTQR Deterministic Team Mark
 * Generates a repeatable 5x5 QR-module matrix with corner markers derived from the team name and ID.
 * NO Math.random() is ever used.
 */
export function TeamMark({ name, id = "", size = 32, className }: TeamMarkProps) {
  const cleanName = name.trim() || "Team";
  const initial = cleanName.charAt(0).toUpperCase();
  const seed = `${cleanName}:${id}`;
  const hash = hashString(seed);

  // Generate 5x5 grid (25 cells)
  // Corners always have fixed finder patterns for QR aesthetic
  const grid = React.useMemo(() => {
    const cells: boolean[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        // Finder modules at corners: (0,0), (0,4), (4,0)
        const isCorner =
          (r === 0 && (c === 0 || c === 1 || c === 3 || c === 4)) ||
          (r === 1 && (c === 0 || c === 4)) ||
          (r === 3 && (c === 0 || c === 1)) ||
          (r === 4 && (c === 0 || c === 1));

        if (isCorner) {
          cells.push(true);
        } else if (r === 2 && c === 2) {
          // Center module always active for monogram anchor
          cells.push(true);
        } else {
          // Deterministic bit from hash shifted by cell index
          const bit = (hash >> (r * 5 + c)) & 1;
          cells.push(bit === 1);
        }
      }
    }
    return cells;
  }, [hash]);

  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        "relative rounded-lg p-1 bg-surface border border-border/80 flex items-center justify-center shrink-0 select-none overflow-hidden group shadow-2xs",
        className
      )}
    >
      {/* 5x5 Module Grid */}
      <div className="grid grid-cols-5 gap-[1.5px] w-full h-full opacity-60 group-hover:opacity-85 transition-opacity">
        {grid.map((active, i) => (
          <span
            key={i}
            className={cn(
              "rounded-[1px] transition-colors",
              active ? "bg-primary/80 dark:bg-primary/90" : "bg-muted/40"
            )}
          />
        ))}
      </div>

      {/* Centered Initial Monogram Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          style={{ fontSize: Math.max(10, Math.floor(size * 0.42)) }}
          className="font-mono font-bold leading-none text-foreground bg-surface/90 px-1 py-0.5 rounded shadow-xs border border-border/60"
        >
          {initial}
        </span>
      </div>
    </div>
  );
}
