"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApprovalSummary, ImpactRadiusCategory } from "@/lib/supabase/types/approvals";
import { Layers, Search, ExternalLink, ShieldAlert } from "lucide-react";

interface ImpactResourcesSheetProps {
  approval: ApprovalSummary | null;
  isOpen: boolean;
  onClose: () => void;
  organizationSlug: string;
}

export function ImpactResourcesSheet({
  approval,
  isOpen,
  onClose,
  organizationSlug,
}: ImpactResourcesSheetProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  if (!approval) return null;

  const categories: ImpactRadiusCategory[] = approval.impactRadius || [];
  const allResources = categories.flatMap((c) =>
    (c.resources || []).map((r) => ({ ...r, categoryLabel: c.label }))
  );

  const filteredResources = allResources.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg font-mono text-xs flex flex-col justify-between bg-card/95 backdrop-blur-md border-l border-border p-6"
      >
        <div className="space-y-5 flex-1 overflow-y-auto">
          <SheetHeader className="text-left space-y-1">
            <div className="text-[10px] text-primary uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Layers className="w-3 h-3" />
              DOWNSTREAM IMPACT RADIUS
            </div>
            <SheetTitle className="text-base font-sans font-semibold text-foreground">
              Impact Radius for {approval.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Revision {approval.targetRevisionNumber} will directly affect the following connected resources once published.
            </SheetDescription>
          </SheetHeader>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search affected resources..."
              className="pl-9 h-8 text-xs font-mono bg-background/50 border-border/70"
            />
          </div>

          {/* Impact list */}
          {allResources.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-border/80 space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                ISOLATED REVISION
              </div>
              <p className="text-xs text-muted-foreground">
                NO DOWNSTREAM RESOURCE RELATIONSHIPS FOUND
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex justify-between">
                <span>Affected Resources ({filteredResources.length})</span>
                <span>Category</span>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {res.name}
                        </span>
                        {res.status && (
                          <Badge variant="outline" className="text-[9px] font-mono uppercase px-1.5 py-0">
                            {res.status}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {res.relationship || res.type}
                      </span>
                    </div>

                    {res.href ? (
                      <Link href={res.href} target="_blank" className="shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/60 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
