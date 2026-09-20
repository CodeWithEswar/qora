"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  QrCode,
  FolderTree,
  Folder,
  GitFork,
  BarChart3,
  ShieldCheck,
  UserPlus,
  Plus,
  ArrowRight,
  Settings,
  CreditCard,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface CommandPaletteProps {
  orgSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Actions" | "Navigation" | "QR Codes" | "Campaigns";
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette({ orgSlug, isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = React.useMemo(() => {
    const list: CommandItem[] = [
      // Quick Actions
      {
        id: "act-create-qr",
        title: "Create New QR Code",
        subtitle: "Launch NXTQR Studio editor",
        category: "Actions",
        icon: Plus,
        action: () => router.push(`/${orgSlug}/qr/studio`),
      },
      {
        id: "act-create-campaign",
        title: "Create Campaign",
        subtitle: "Group QR codes under a marketing initiative",
        category: "Actions",
        icon: FolderTree,
        action: () => router.push(`/${orgSlug}/campaigns`),
      },
      {
        id: "act-invite-member",
        title: "Invite Team Member",
        subtitle: "Add collaborators with role permissions",
        category: "Actions",
        icon: UserPlus,
        action: () => router.push(`/${orgSlug}/members`),
      },
      // Navigation
      {
        id: "nav-folders",
        title: "Open Folders",
        subtitle: "Organize and curate QR assets into dedicated spaces",
        category: "Navigation",
        icon: Folder,
        action: () => router.push(`/${orgSlug}/folders`),
      },
      {
        id: "nav-routes",
        title: "Open NXTQR Routes",
        subtitle: "Route every scan to the right destination",
        category: "Navigation",
        icon: GitFork,
        action: () => router.push(`/${orgSlug}/routes`),
      },
      {
        id: "nav-analytics",
        title: "Open NXTQR Analytics",
        subtitle: "Deep-dive scan metrics & audience intelligence",
        category: "Navigation",
        icon: BarChart3,
        action: () => router.push(`/${orgSlug}/analytics`),
      },
      {
        id: "nav-guardian",
        title: "Open NXTQR Guardian",
        subtitle: "Destination uptime and broken link monitor",
        category: "Navigation",
        icon: ShieldCheck,
        action: () => router.push(`/${orgSlug}/guardian`),
      },
      {
        id: "nav-billing",
        title: "Manage Billing & Plan",
        subtitle: "Invoices, usage limits, and upgrades",
        category: "Navigation",
        icon: CreditCard,
        action: () => router.push(`/${orgSlug}/billing`),
      },
      {
        id: "nav-settings",
        title: "Workspace Settings",
        subtitle: "General workspace configuration",
        category: "Navigation",
        icon: Settings,
        action: () => router.push(`/${orgSlug}/settings`),
      },
    ];

    if (!query.trim()) return list;

    const lower = query.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [query, orgSlug, router]);

  const categories = ["Actions", "Navigation", "QR Codes", "Campaigns"] as const;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border border-border shadow-2xl bg-surface">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface-elevated/40">
          <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Type a command or search ${BRAND.name}...`}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-4 px-2 flex items-center justify-center">
              <EmptyState
                preset="search"
                title={`No results for "${query}"`}
                description="Try another command or clear your search term."
                variant="filtered"
                action={{
                  label: "Clear search",
                  onClick: () => setQuery(""),
                }}
              />
            </div>
          ) : (
            categories.map((category) => {
              const catItems = items.filter((item) => item.category === category);
              if (catItems.length === 0) return null;

              return (
                <div key={category} className="mb-2 last:mb-0">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {catItems.map((item) => {
                      const itemGlobalIndex = items.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            item.action();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer text-xs transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-surface-hover"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs",
                                isSelected
                                  ? "border-primary/30 bg-primary/20 text-primary"
                                  : "border-border bg-surface text-muted-foreground"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate">{item.title}</span>
                              {item.subtitle && (
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity",
                              isSelected && "opacity-100 text-primary"
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-surface-elevated/40 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-muted px-1 rounded border border-border">↑</kbd>{" "}
              <kbd className="font-mono bg-muted px-1 rounded border border-border">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-muted px-1.5 rounded border border-border">↵</kbd> to select
            </span>
          </div>
          <span>{BRAND.name} Global Search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
