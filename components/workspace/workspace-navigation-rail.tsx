"use client";

import * as React from "react";
import {
  Settings,
  Image as ImageIcon,
  Palette,
  QrCode,
  Users,
  Bell,
  HardDrive,
  Globe,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceSectionItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isDestructive?: boolean;
}

export const WORKSPACE_SECTIONS: WorkspaceSectionItem[] = [
  {
    id: "general",
    label: "General Settings",
    shortLabel: "General",
    icon: Settings,
    description: "Name, slug, description, timezone and locale",
  },
  {
    id: "identity",
    label: "Identity & Logo",
    shortLabel: "Identity",
    icon: ImageIcon,
    description: "Logo, monograms, and preview surfaces",
  },
  {
    id: "brand",
    label: "Brand Defaults",
    shortLabel: "Brand",
    icon: Palette,
    description: "Default Brand Kit and resource propagation",
  },
  {
    id: "qr",
    label: "QR Defaults",
    shortLabel: "QR Defaults",
    icon: QrCode,
    description: "Error correction, geometry, and quiet zone",
  },
  {
    id: "collaboration",
    label: "Collaboration & Roles",
    shortLabel: "Collaboration",
    icon: Users,
    description: "Default role, invitations, and sharing policy",
  },
  {
    id: "notifications",
    label: "Notifications",
    shortLabel: "Notifications",
    icon: Bell,
    description: "Organization channels and security alerts",
  },
  {
    id: "storage",
    label: "Data & Storage",
    shortLabel: "Data & Storage",
    icon: HardDrive,
    description: "Storage composition and sanitized data export",
  },
  {
    id: "domains",
    label: "Domains & Infrastructure",
    shortLabel: "Domains",
    icon: Globe,
    description: "Default host and custom domains summary",
  },
  {
    id: "capabilities",
    label: "Capabilities & Plan",
    shortLabel: "Capabilities",
    icon: Sparkles,
    description: "Commercial tier features and entitlement quotas",
  },
  {
    id: "lifecycle",
    label: "Lifecycle & Danger Zone",
    shortLabel: "Danger Zone",
    icon: AlertTriangle,
    description: "Transfer ownership, archive, or delete workspace",
    isDestructive: true,
  },
];

interface WorkspaceNavigationRailProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  className?: string;
}

export function WorkspaceNavigationRail({
  activeSection,
  onSelectSection,
  className,
}: WorkspaceNavigationRailProps) {
  return (
    <nav className={cn("flex flex-col space-y-1 select-none", className)} aria-label="Workspace settings navigation">
      <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80">
        Configuration Navigator
      </div>

      {WORKSPACE_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={cn(
              "group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer relative",
              isActive
                ? section.isDestructive
                  ? "bg-destructive/10 text-destructive font-semibold border border-destructive/20"
                  : "bg-surface text-foreground font-semibold border border-primary/25 shadow-2xs"
                : section.isDestructive
                ? "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
            )}
          >
            {/* Active Rail Indicator Line */}
            {isActive && (
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r",
                  section.isDestructive ? "bg-destructive" : "bg-primary"
                )}
              />
            )}

            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                isActive
                  ? section.isDestructive
                    ? "text-destructive"
                    : "text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />

            <span className="truncate flex-1">{section.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
