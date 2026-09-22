"use client";

import * as React from "react";
import { Search, Settings, Image as ImageIcon, Palette, QrCode, Users, Bell, HardDrive, Globe, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WORKSPACE_SECTIONS } from "../workspace-navigation-rail";

interface WorkspaceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSection: (sectionId: string) => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  sectionId: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: "ws-name", title: "Workspace Name", category: "General", keywords: ["name", "rename", "title"], sectionId: "general", icon: Settings },
  { id: "ws-slug", title: "Workspace URL Slug", category: "General", keywords: ["slug", "url", "domain", "path"], sectionId: "general", icon: Settings },
  { id: "ws-tz", title: "Timezone & Locale", category: "General", keywords: ["timezone", "locale", "utc", "region", "clock"], sectionId: "general", icon: Settings },
  { id: "ws-desc", title: "Workspace Description", category: "General", keywords: ["description", "about", "bio"], sectionId: "general", icon: Settings },
  { id: "ws-logo", title: "Workspace Logo & Mark", category: "Identity", keywords: ["logo", "avatar", "icon", "mark", "image"], sectionId: "identity", icon: ImageIcon },
  { id: "ws-identity-prev", title: "Identity Surface Preview", category: "Identity", keywords: ["preview", "sidebar", "switcher", "invitation"], sectionId: "identity", icon: ImageIcon },
  { id: "ws-brand-kit", title: "Default Brand Kit", category: "Brand Defaults", keywords: ["brand", "kit", "palette", "colors", "tokens"], sectionId: "brand", icon: Palette },
  { id: "ws-brand-prop", title: "Brand Propagation Preview", category: "Brand Defaults", keywords: ["propagation", "inherit", "templates"], sectionId: "brand", icon: Palette },
  { id: "ws-qr-ec", title: "QR Error Correction Level", category: "QR Defaults", keywords: ["error correction", "ec", "recovery", "qr"], sectionId: "qr", icon: QrCode },
  { id: "ws-qr-qz", title: "QR Quiet Zone Margin", category: "QR Defaults", keywords: ["quiet zone", "margin", "padding", "border"], sectionId: "qr", icon: QrCode },
  { id: "ws-qr-style", title: "QR Matrix Dot Style", category: "QR Defaults", keywords: ["dots", "squares", "rounded", "diamond", "geometry"], sectionId: "qr", icon: QrCode },
  { id: "ws-qr-scan", title: "Scanability Diagnostics", category: "QR Defaults", keywords: ["scanability", "diagnostics", "contrast", "scanner"], sectionId: "qr", icon: QrCode },
  { id: "ws-role-def", title: "Default Member Role", category: "Collaboration", keywords: ["role", "member", "admin", "viewer", "rbac"], sectionId: "collaboration", icon: Users },
  { id: "ws-invite-pol", title: "Invitation Authority Policy", category: "Collaboration", keywords: ["invitations", "invite", "members"], sectionId: "collaboration", icon: Users },
  { id: "ws-approval", title: "Mandatory Publishing Approval", category: "Collaboration", keywords: ["approval", "publish", "review", "workflow"], sectionId: "collaboration", icon: Users },
  { id: "ws-sharing", title: "External Share Links", category: "Collaboration", keywords: ["share", "external", "public", "links"], sectionId: "collaboration", icon: Users },
  { id: "ws-notif-ch", title: "Notification Channels", category: "Notifications", keywords: ["notifications", "email", "in-app", "alerts", "digest"], sectionId: "notifications", icon: Bell },
  { id: "ws-storage", title: "Storage Composition Rail", category: "Data & Storage", keywords: ["storage", "files", "bytes", "usage", "quota"], sectionId: "storage", icon: HardDrive },
  { id: "ws-export", title: "Export Workspace Data", category: "Data & Storage", keywords: ["export", "download", "json", "backup"], sectionId: "storage", icon: HardDrive },
  { id: "ws-domains", title: "Custom Domains Summary", category: "Domains", keywords: ["domains", "vanity", "host", "dns", "edge"], sectionId: "domains", icon: Globe },
  { id: "ws-caps", title: "Commercial Capabilities", category: "Capabilities", keywords: ["capabilities", "plan", "pro", "business", "limits", "entitlements"], sectionId: "capabilities", icon: Sparkles },
  { id: "ws-transfer", title: "Transfer Ownership", category: "Lifecycle", keywords: ["transfer", "owner", "ownership"], sectionId: "lifecycle", icon: AlertTriangle },
  { id: "ws-archive", title: "Archive Workspace", category: "Lifecycle", keywords: ["archive", "deactivate", "readonly"], sectionId: "lifecycle", icon: AlertTriangle },
  { id: "ws-delete", title: "Delete Workspace", category: "Lifecycle", keywords: ["delete", "destroy", "remove", "danger"], sectionId: "lifecycle", icon: AlertTriangle },
];

export function WorkspaceSearchDialog({
  open,
  onOpenChange,
  onSelectSection,
}: WorkspaceSearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return SEARCH_ITEMS.slice(0, 10);

    return SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
  }, [query]);

  const handleSelect = (sectionId: string) => {
    onSelectSection(sectionId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 border-border/80 overflow-hidden shadow-xl">
        {/* Search Header */}
        <div className="flex items-center px-3.5 border-b border-border/60 bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspace settings, policies & defaults..."
            className="h-12 border-0 bg-transparent text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded border border-border text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              No matching workspace settings found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.sectionId)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-surface transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground truncate block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
