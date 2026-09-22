"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import { ROLE_CAPABILITIES } from "@/lib/supabase/types/members";

interface RolePayload {
  id?: string;
  name: string;
  code: string;
  description?: string | null;
  capabilities?: string[];
}

interface AccessDiffProps {
  currentRole: RolePayload;
  proposedRole: RolePayload;
  isLastOwnerWarning?: boolean;
  className?: string;
}

/**
 * NXTQR Access Diff — Signature Interaction #3
 * Visual side-by-side tree comparison showing:
 * CURRENT authority tree vs. PROPOSED authority tree
 * with factual GAINING (+), UNCHANGED (•), and LOSING (-) capability diff rails.
 */
export function AccessDiff({
  currentRole,
  proposedRole,
  isLastOwnerWarning = false,
  className,
}: AccessDiffProps) {
  const currentCode = (currentRole.code || "VIEWER").toUpperCase();
  const proposedCode = (proposedRole.code || "VIEWER").toUpperCase();

  const currentCaps =
    currentRole.capabilities && currentRole.capabilities.length > 0
      ? currentRole.capabilities
      : ROLE_CAPABILITIES[currentCode] || ["View QR Assets & Drafts"];

  const proposedCaps =
    proposedRole.capabilities && proposedRole.capabilities.length > 0
      ? proposedRole.capabilities
      : ROLE_CAPABILITIES[proposedCode] || ["View QR Assets & Drafts"];

  const gaining = proposedCaps.filter((c) => !currentCaps.includes(c));
  const losing = currentCaps.filter((c) => !proposedCaps.includes(c));
  const unchanged = currentCaps.filter((c) => proposedCaps.includes(c));

  return (
    <div className={cn("space-y-4 font-mono text-xs select-none", className)}>
      {/* Safeguard Warning Callout if sole owner */}
      {isLastOwnerWarning && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold uppercase tracking-wider block">
              OWNERSHIP SAFEGUARD ACTIVE
            </span>
            This member is the only active Workspace Owner. Demoting this role will lock out organization administration. Transfer ownership first.
          </div>
        </div>
      )}

      {/* Side-by-side Tree Rails */}
      <div className="rounded-xl border border-border/80 bg-surface/70 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
            ACCESS DIFF / ROLE AUTHORITY
          </span>
          <span className="text-[10px] text-muted-foreground">
            {currentRole.name} → {proposedRole.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CURRENT TREE */}
          <div className="p-3 rounded-lg border border-border/70 bg-surface/50 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase pb-1 border-b border-border/40 font-semibold">
              <span>CURRENT</span>
              <span className="text-muted-foreground/80">ACTIVE</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
                <span className="font-bold text-foreground uppercase tracking-tight text-xs">
                  {currentRole.name}
                </span>
              </div>

              {/* Branching Rail */}
              <div className="relative pl-3 ml-1 border-l border-border/70 space-y-1.5 pt-1.5">
                {currentCaps.map((cap, idx) => {
                  const isLost = losing.includes(cap);
                  return (
                    <div
                      key={cap}
                      className={cn(
                        "flex items-center justify-between text-[11px] gap-2",
                        isLost
                          ? "text-rose-600 dark:text-rose-400 line-through opacity-80"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-border/90 select-none">
                          {idx === currentCaps.length - 1 ? "└──" : "├──"}
                        </span>
                        <span className="truncate">{cap}</span>
                      </div>
                      {isLost && (
                        <span className="text-[10px] font-bold text-rose-500 shrink-0">
                          -
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PROPOSED TREE */}
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-primary uppercase pb-1 border-b border-primary/20 font-semibold">
              <span>PROPOSED</span>
              <span className="text-primary/80">PREVIEW</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-bold text-primary uppercase tracking-tight text-xs">
                  {proposedRole.name}
                </span>
              </div>

              {/* Branching Rail */}
              <div className="relative pl-3 ml-1 border-l border-primary/30 space-y-1.5 pt-1.5">
                {proposedCaps.map((cap, idx) => {
                  const isGained = gaining.includes(cap);
                  return (
                    <div
                      key={cap}
                      className={cn(
                        "flex items-center justify-between text-[11px] gap-2",
                        isGained
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-foreground/80"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-primary/40 select-none">
                          {idx === proposedCaps.length - 1 ? "└──" : "├──"}
                        </span>
                        <span className="truncate">{cap}</span>
                      </div>
                      {isGained && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded border border-emerald-500/20 shrink-0">
                          +
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Metric Summary Rails */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* GAINING */}
        <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>GAINING / {gaining.length.toString().padStart(2, "0")}</span>
            <span>+</span>
          </div>
          {gaining.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">None</p>
          ) : (
            <div className="space-y-0.5">
              {gaining.map((g) => (
                <div key={g} className="text-[10px] text-emerald-700 dark:text-emerald-300 truncate">
                  + {g}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UNCHANGED */}
        <div className="p-2.5 rounded-lg border border-border/80 bg-surface/60 space-y-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
            <span>UNCHANGED / {unchanged.length.toString().padStart(2, "0")}</span>
            <span>•</span>
          </div>
          {unchanged.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">None</p>
          ) : (
            <div className="space-y-0.5">
              {unchanged.map((u) => (
                <div key={u} className="text-[10px] text-muted-foreground truncate">
                  • {u}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOSING */}
        <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>LOSING / {losing.length.toString().padStart(2, "0")}</span>
            <span>-</span>
          </div>
          {losing.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">None</p>
          ) : (
            <div className="space-y-0.5">
              {losing.map((l) => (
                <div key={l} className="text-[10px] text-rose-700 dark:text-rose-300 truncate">
                  - {l}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
