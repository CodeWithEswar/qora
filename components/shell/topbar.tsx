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
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { UserMenu } from "@/components/shell/user-menu";
import { BRAND } from "@/lib/brand";

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
    const orgLabel = orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1).replace(/-/g, " ");
    if (!pathname) return [{ label: orgLabel, href: `/${orgSlug}` }];
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: orgLabel, href: `/${orgSlug}` }];

    if (segments.length > 1) {
      const pageSegment = segments[1];
      const pageTitles: Record<string, string> = {
        qr: "QR Codes",
        campaigns: "Campaigns",
        analytics: "NXTQR Analytics",
        routes: "NXTQR Routes",
        brain: "NXTQR Routes",
        guardian: "NXTQR Guardian",
        experiments: "Experiments",
        members: "NXTQR Teams",
        teams: "Teams",
        approvals: "Approvals",
        brand: "Brand Kits",
        developers: "NXTQR Developers",
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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/95 backdrop-blur-xs px-3 sm:px-6 transition-colors">
      {/* Left side: Mobile Hamburger + Breadcrumb trail */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer select-none shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Dynamic Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                )}
                {isLast ? (
                  <span className="font-medium text-foreground truncate max-w-[110px] sm:max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors truncate max-w-[90px] sm:max-w-[140px] hidden sm:inline-block"
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
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Global Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="inline-flex h-8 w-8 sm:w-auto items-center justify-center sm:justify-start gap-2 rounded-lg border border-border bg-surface hover:bg-surface-hover px-0 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          title="Search (⌘K)"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Search {BRAND.name}...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Primary CTA: Create QR */}
        <Link
          href={`/${orgSlug}/qr/studio`}
          className="inline-flex h-8 w-8 sm:w-auto items-center justify-center gap-1.5 rounded-lg font-medium text-xs bg-primary hover:bg-[#cc3a05] text-white shadow-xs transition-colors shrink-0 px-0 sm:px-3"
          title="Create QR"
          aria-label="Create QR"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Create QR</span>
        </Link>

        {/* Vertical Divider */}
        <div className="hidden sm:block h-4 w-px bg-border/60 mx-0.5 shrink-0" />

        {/* Notifications Popover */}
        <NotificationsMenu />

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Documentation / Help Trigger */}
        <a
          href={BRAND.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors shrink-0"
          title="Documentation"
          aria-label="Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </a>

        {/* User Menu Trigger */}
        <UserMenu orgSlug={orgSlug} isCollapsed={true} side="bottom" align="end" />
      </div>
    </header>
  );
}
