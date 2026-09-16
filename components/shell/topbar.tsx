"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Plus,
  Search,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { UserMenu } from "@/components/shell/user-menu";

interface TopbarProps {
  orgSlug: string;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export function Topbar({
  orgSlug,
  onOpenMobileMenu,
  onOpenCommandPalette,
}: TopbarProps) {
  const pathname = usePathname();

  const breadcrumbs = React.useMemo(() => {
    if (!pathname) return [{ label: "Acme Corp", href: `/${orgSlug}` }];
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Acme Corp", href: `/${orgSlug}` }];

    if (segments.length > 1) {
      const pageSegment = segments[1];
      const pageTitles: Record<string, string> = {
        qr: "QR Codes",
        campaigns: "Campaigns",
        analytics: "Analytics",
        brain: "Qora Brain",
        guardian: "Qora Guardian",
        experiments: "Experiments",
        members: "Members",
        teams: "Teams",
        approvals: "Approvals",
        brand: "Brand Kits",
        developers: "Developers",
        billing: "Billing",
        settings: "Settings",
        templates: "Templates",
        folders: "Folders",
      };

      crumbs.push({
        label: pageTitles[pageSegment] || pageSegment.toUpperCase(),
        href: `/${orgSlug}/${pageSegment}`,
      });

      if (segments.length > 2) {
        crumbs.push({
          label: segments[2].charAt(0).toUpperCase() + segments[2].slice(1),
          href: pathname,
        });
      }
    } else {
      crumbs.push({ label: "Overview", href: `/${orgSlug}` });
    }

    return crumbs;
  }, [pathname, orgSlug]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/95 backdrop-blur-xs px-4 sm:px-6 transition-colors">
      {/* Left side: Mobile Hamburger + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="iconSm"
          onClick={onOpenMobileMenu}
          className="md:hidden text-muted-foreground hover:text-foreground"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Dynamic Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                )}
                {isLast ? (
                  <span className="font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors truncate max-w-[120px] hidden sm:inline-block"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side: Global Search, Quick Action, Alerts, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 rounded-md border border-border bg-surface-hover/70 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-[#c7c7c7] dark:hover:border-[#3f3f46] hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary select-none cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search Qora...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Primary CTA: Create QR (Mistral Saturated Orange) */}
        <Button
          size="sm"
          asChild
          className="h-8 gap-1.5 shadow-2xs font-medium text-xs px-3.5 bg-primary hover:bg-[#cc3a05] text-white"
        >
          <Link href={`/${orgSlug}/qr/studio`}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Create QR</span>
          </Link>
        </Button>

        <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

        {/* Notifications Popover */}
        <NotificationsMenu />

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Documentation / Help Trigger */}
        <Button
          variant="ghost"
          size="iconSm"
          asChild
          className="hidden sm:flex text-muted-foreground hover:text-foreground"
          title="Documentation"
        >
          <a href="https://docs.qora.io" target="_blank" rel="noopener noreferrer">
            <HelpCircle className="h-4 w-4" />
          </a>
        </Button>

        {/* User Menu Trigger */}
        <div className="ml-1">
          <UserMenu orgSlug={orgSlug} isCollapsed={true} />
        </div>
      </div>
    </header>
  );
}
