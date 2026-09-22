"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Search } from "lucide-react";

interface PermissionExplorerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roleName: string;
  capabilities: string[];
}

export function PermissionExplorerDialog({
  isOpen,
  onClose,
  roleName,
  capabilities,
}: PermissionExplorerDialogProps) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return capabilities;
    const q = query.toLowerCase();
    return capabilities.filter((c) => c.toLowerCase().includes(q));
  }, [capabilities, query]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 font-mono text-xs">
        <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            ACCESS / PERMISSIONS EXPLORER
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {roleName} Authority Scope
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Granular operational capabilities enabled for this role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter capabilities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-surface font-mono"
            />
          </div>

          {/* Capabilities List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground italic">
                No matching capabilities found.
              </div>
            ) : (
              filtered.map((cap) => (
                <div
                  key={cap}
                  className="flex items-center gap-2 p-2 rounded-md bg-surface border border-border/70 text-foreground"
                >
                  <NxtqrIcon name="permission" size={13} className="text-primary shrink-0" />
                  <span className="text-xs font-medium truncate">{cap}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
