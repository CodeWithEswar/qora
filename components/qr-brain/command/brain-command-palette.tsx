"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface BrainCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRule: () => void;
  onOpenSimulator: () => void;
  onOpenConflicts: () => void;
  onOpenPublish: () => void;
  onOpenSignal: () => void;
  onSelectDefault: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  category: "Actions" | "Diagnostics" | "Navigation";
  perform: () => void;
}

export function BrainCommandPalette({
  open,
  onOpenChange,
  onAddRule,
  onOpenSimulator,
  onOpenConflicts,
  onOpenPublish,
  onOpenSignal,
  onSelectDefault,
}: BrainCommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const commands: CommandItem[] = React.useMemo(() => [
    {
      id: "add-rule",
      label: "Add New Conditional Rule",
      icon: "solar:add-circle-bold",
      category: "Actions",
      shortcut: "N",
      perform: onAddRule,
    },
    {
      id: "publish",
      label: "Review & Publish Routing Policy",
      icon: "solar:cloud-upload-bold",
      category: "Actions",
      shortcut: "⌘↵",
      perform: onOpenPublish,
    },
    {
      id: "simulate",
      label: "Open Scan Simulator & Decision Trace",
      icon: "solar:play-bold",
      category: "Diagnostics",
      shortcut: "S",
      perform: onOpenSimulator,
    },
    {
      id: "conflicts",
      label: "Open Conflict Lens & Static Analysis",
      icon: "solar:shield-warning-bold",
      category: "Diagnostics",
      shortcut: "C",
      perform: onOpenConflicts,
    },
    {
      id: "signal",
      label: "View Real-time Routing Signal & Scans",
      icon: "solar:chart-2-bold",
      category: "Diagnostics",
      perform: onOpenSignal,
    },
    {
      id: "default-route",
      label: "Inspect Default Fallthrough Route",
      icon: "solar:flag-bold",
      category: "Navigation",
      perform: onSelectDefault,
    },
  ], [onAddRule, onOpenPublish, onOpenSimulator, onOpenConflicts, onOpenSignal, onSelectDefault]);

  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Keyboard navigation
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        cmd.perform();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 bg-card dark:bg-[#141414] border-border text-xs font-mono text-foreground select-none overflow-hidden gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border/70 bg-muted/40 dark:bg-[#171717]">
          <NxtqrIcon icon="solar:magnifer-linear" size={16} className="text-muted-foreground ml-1" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search actions... (Esc to close)"
            className="h-7 border-none bg-transparent shadow-none focus-visible:ring-0 text-xs font-mono text-foreground placeholder:text-muted-foreground/60"
            autoFocus
          />
        </div>

        {/* Command list */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              No matching commands found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.perform();
                    onOpenChange(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <NxtqrIcon
                      icon={cmd.icon}
                      size={15}
                      className={isSelected ? "text-primary" : "text-muted-foreground"}
                    />
                    <span className={cn("text-xs font-medium truncate", isSelected ? "text-primary font-semibold" : "text-foreground")}>
                      {cmd.label}
                    </span>
                  </div>

                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/60 dark:bg-black/40 border border-border text-muted-foreground">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-border/60 bg-muted/40 dark:bg-black/30 text-[10px] text-muted-foreground/70 flex items-center justify-between">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span>Decision Studio Palette</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
