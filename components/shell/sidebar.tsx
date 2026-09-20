"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { NxtqrLogo } from "@/components/brand/nxtqr-logo";
import { OrgSwitcher } from "@/components/shell/org-switcher";
import { UserMenu } from "@/components/shell/user-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NAVIGATION_SECTIONS, BOTTOM_NAV_ITEMS, NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  orgSlug: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({
  orgSlug,
  isCollapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (!pathname) return false;
    const targetHref = item.href(orgSlug);
    if (item.pathSegment === "") {
      return pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`;
    }
    return pathname.startsWith(targetHref);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out select-none z-20 shrink-0 no-scrollbar",
          isCollapsed ? "w-[68px]" : "w-[240px]",
          className
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Top Header: NXTQR Logo & Org Switcher */}
        <div className={cn("flex flex-col border-b border-sidebar-border transition-all", isCollapsed ? "p-2 gap-2 items-center" : "p-3 gap-3")}>
          <div className={cn("flex items-center w-full", isCollapsed ? "flex-col gap-2 justify-center" : "justify-between px-1 py-1")}>
            <Link
              href={`/${orgSlug}`}
              className={cn(
                "flex items-center gap-2 overflow-hidden rounded-md transition-colors",
                isCollapsed && "justify-center p-1 hover:bg-sidebar-hover"
              )}
              title="NXTQR"
            >
              <NxtqrLogo size={isCollapsed ? 26 : 22} showText={!isCollapsed} />
            </Link>

            <button
              onClick={onToggleCollapse}
              className={cn(
                "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-hover transition-colors hidden md:flex items-center justify-center",
                isCollapsed ? "w-8 h-8 mx-auto" : ""
              )}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          <OrgSwitcher currentOrgSlug={orgSlug} isCollapsed={isCollapsed} />
        </div>

        {/* Middle: Navigation Sections (Scrollable) */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden space-y-3 no-scrollbar",
            isCollapsed ? "p-1.5" : "p-2.5"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {NAVIGATION_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed ? (
                <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                  {section.title}
                </div>
              ) : (
                <div className="h-px bg-sidebar-border my-2 mx-auto w-6" />
              )}

              {section.items.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                const href = item.href(orgSlug);

                const buttonContent = (
                  <Link
                    href={href}
                    className={cn(
                      "group flex items-center rounded-lg text-xs font-medium transition-colors",
                      isCollapsed
                        ? "justify-center h-9 w-9 mx-auto p-0"
                        : "gap-2.5 px-2.5 py-1.5 w-full",
                      active
                        ? "bg-sidebar-active text-sidebar-active-foreground font-semibold border border-primary/20 shadow-xs"
                        : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary stroke-[2.2]" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full font-semibold tracking-tight",
                              item.badgeVariant === "indigo" || item.badgeVariant === "default"
                                ? "bg-primary text-white"
                                : item.badgeVariant === "success"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.title}>
                      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12}>
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-1.5 opacity-80 text-[10px]">({item.badge})</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.title}>{buttonContent}</div>;
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: Plan Quota Widget & User Profile */}
        <div className="p-2.5 border-t border-sidebar-border bg-sidebar space-y-2">
          {!isCollapsed && (
            <div className="rounded-md border border-sidebar-border bg-sidebar-hover/80 p-2.5 text-xs">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Sparkles className="h-3 w-3 fill-primary" />
                  Pro Workspace
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">42/100 QRs</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full sunset-stripe transition-all"
                  style={{ width: "42%" }}
                />
              </div>
            </div>
          )}

          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = item.href(orgSlug);

            const content = (
              <Link
                href={href}
                className={cn(
                  "group flex items-center rounded-lg text-xs font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors",
                  isCollapsed ? "justify-center h-9 w-9 mx-auto p-0" : "gap-2.5 px-2.5 py-1.5 w-full"
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={item.title}>{content}</div>;
          })}

          <div className="pt-1 border-t border-sidebar-border">
            <UserMenu orgSlug={orgSlug} isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
