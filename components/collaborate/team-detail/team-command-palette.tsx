"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  Link2,
  Shield,
  CheckSquare,
  Activity,
  UserPlus,
  PlusCircle,
  Settings,
  Trash2,
  Copy,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { TeamViewTab } from "./team-navigation";

interface TeamCommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectView: (view: TeamViewTab) => void;
  onAddMembers: () => void;
  onConnectWork: () => void;
  onEditTeam: () => void;
  onDeleteTeam: () => void;
}

interface CommandItemDef {
  id: string;
  label: string;
  category: "navigation" | "operations" | "settings";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  destructive?: boolean;
}

export function TeamCommandPalette({
  isOpen,
  onOpenChange,
  onSelectView,
  onAddMembers,
  onConnectWork,
  onEditTeam,
  onDeleteTeam,
}: TeamCommandPaletteProps) {
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onOpenChange]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Team link copied to clipboard");
    }
    onOpenChange(false);
  };

  const commands: CommandItemDef[] = React.useMemo(() => [
    {
      id: "nav-overview",
      label: "Go to Overview Canvas",
      category: "navigation",
      icon: LayoutDashboard,
      action: () => {
        onSelectView("overview");
        onOpenChange(false);
      },
    },
    {
      id: "nav-people",
      label: "Go to Team People Directory",
      category: "navigation",
      icon: Users,
      action: () => {
        onSelectView("people");
        onOpenChange(false);
      },
    },
    {
      id: "nav-work",
      label: "Go to Connected Work",
      category: "navigation",
      icon: Link2,
      action: () => {
        onSelectView("work");
        onOpenChange(false);
      },
    },
    {
      id: "nav-access",
      label: "Go to Access & Governance",
      category: "navigation",
      icon: Shield,
      action: () => {
        onSelectView("access");
        onOpenChange(false);
      },
    },
    {
      id: "nav-approvals",
      label: "Go to Team Approvals",
      category: "navigation",
      icon: CheckSquare,
      action: () => {
        onSelectView("approvals");
        onOpenChange(false);
      },
    },
    {
      id: "nav-activity",
      label: "Go to Team Activity",
      category: "navigation",
      icon: Activity,
      action: () => {
        onSelectView("activity");
        onOpenChange(false);
      },
    },
    {
      id: "op-add-member",
      label: "Add Workspace Members to Team",
      category: "operations",
      icon: UserPlus,
      action: () => {
        onAddMembers();
        onOpenChange(false);
      },
    },
    {
      id: "op-connect-work",
      label: "Connect Work (QRs, Campaigns, Brand Kits)",
      category: "operations",
      icon: PlusCircle,
      action: () => {
        onConnectWork();
        onOpenChange(false);
      },
    },
    {
      id: "op-copy-link",
      label: "Copy Team Route Link",
      category: "operations",
      icon: Copy,
      action: handleCopyLink,
    },
    {
      id: "set-edit",
      label: "Edit Team Settings",
      category: "settings",
      icon: Settings,
      action: () => {
        onEditTeam();
        onOpenChange(false);
      },
    },
    {
      id: "set-delete",
      label: "Delete Team...",
      category: "settings",
      icon: Trash2,
      action: () => {
        onDeleteTeam();
        onOpenChange(false);
      },
      destructive: true,
    },
  ], [onSelectView, onAddMembers, onConnectWork, onEditTeam, onDeleteTeam, onOpenChange]);

  const filteredCommands = React.useMemo(() => {
    if (!search.trim()) return commands;
    const q = search.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, search]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-lg border border-border/80 bg-background shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Team Operations Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/80 bg-surface/40">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to team operation..."
            className="border-0 focus-visible:ring-0 text-xs h-11 bg-transparent px-0"
            autoFocus
          />
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/30 font-sans text-xs">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              No matching team commands.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={cmd.action}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors cursor-pointer group ${
                      cmd.destructive
                        ? "hover:bg-rose-500/10 text-rose-500"
                        : "hover:bg-surface-hover text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${cmd.destructive ? "text-rose-500" : "text-muted-foreground group-hover:text-primary"}`} />
                      <span className="text-xs font-medium">{cmd.label}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground/60">
                      {cmd.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
