"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, CheckCheck, MessageSquare, Shield, Mail, Activity, Settings, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationNavTabsProps {
  orgSlug: string;
  activeTab?: string;
  pendingInvitesCount?: number;
}

export function OrganizationNavTabs({
  orgSlug,
  activeTab,
  pendingInvitesCount = 0,
}: OrganizationNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      href: `/${orgSlug}/members?tab=overview`,
      icon: LayoutGrid,
    },
    {
      id: "members",
      label: "Members",
      href: `/${orgSlug}/members`,
      icon: Users,
    },
    {
      id: "teams",
      label: "Teams",
      href: `/${orgSlug}/teams`,
      icon: Building2,
    },
    {
      id: "approvals",
      label: "Approvals",
      href: `/${orgSlug}/approvals`,
      icon: CheckCheck,
    },
    {
      id: "comments",
      label: "Comments",
      href: `/${orgSlug}/comments`,
      icon: MessageSquare,
    },
    {
      id: "roles",
      label: "Roles & Permissions",
      href: `/${orgSlug}/settings/permissions`,
      icon: Shield,
    },
    {
      id: "invitations",
      label: "Invitations",
      href: `/${orgSlug}/invitations`,
      icon: Mail,
      badge: pendingInvitesCount > 0 ? pendingInvitesCount : undefined,
    },
    {
      id: "activity",
      label: "Activity",
      href: `/${orgSlug}/activity`,
      icon: Activity,
    },
    {
      id: "settings",
      label: "Workspace",
      href: `/${orgSlug}/settings/workspace`,
      icon: Settings,
    },
  ];

  return (
    <div className="border-b border-border/70 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      <nav className="flex items-center space-x-1 min-w-max pb-px touch-pan-x" aria-label="Organization sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (!activeTab && tab.id === "members" && pathname === `/${orgSlug}/members`) ||
            (tab.id === "teams" && pathname.includes(`/${orgSlug}/teams`)) ||
            (tab.id === "approvals" && pathname.includes(`/${orgSlug}/approvals`)) ||
            (tab.id === "comments" && pathname.includes(`/${orgSlug}/comments`)) ||
            (tab.id === "roles" && (pathname.includes(`/${orgSlug}/settings/permissions`) || pathname.includes(`/${orgSlug}/roles`))) ||
            (tab.id === "invitations" && pathname.includes(`/${orgSlug}/invitations`)) ||
            (tab.id === "activity" && pathname.includes(`/${orgSlug}/activity`)) ||
            (tab.id === "settings" && pathname.includes(`/${orgSlug}/settings/workspace`));

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "group flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all select-none",
                isActive
                  ? "border-primary text-foreground font-semibold bg-surface/40"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-primary/10 text-primary font-semibold">
                  {tab.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
